import "server-only";

const DEFAULT_HOSTNAME = "masjidjawahiruzzarqa.siraf.my.id";
const MAX_CHUNK_SECONDS = 86400; // 24 hours per request
const MAX_LOOKBACK_SECONDS = 691200; // 8 days Cloudflare limit

interface MonthRange {
  since: string;
  until: string;
}

interface CloudflareGraphQLResponse {
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequestsAdaptiveGroups?: Array<{
          sum?: {
            visits?: number | null;
          } | null;
        }> | null;
      }> | null;
    };
  };
  errors?: Array<{ message?: string } | Record<string, any>>;
}

function getHostname(hostname?: string | null) {
  return hostname || process.env.CLOUDFLARE_TARGET_HOSTNAME || DEFAULT_HOSTNAME;
}

function getMonthDateRange(year: number, month: number): MonthRange {
  const sinceDate = new Date(Date.UTC(year, month - 1, 1));
  const untilDate = new Date(Date.UTC(year, month, 1));
  return {
    since: sinceDate.toISOString(),
    until: untilDate.toISOString(),
  };
}

function extractVisitors(response: CloudflareGraphQLResponse): number {
  const groups = response.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups;
  if (!groups || groups.length === 0) {
    return 0;
  }
  return groups.reduce((total, group) => {
    const visits = group.sum?.visits ?? 0;
    return total + (typeof visits === "number" ? visits : 0);
  }, 0);
}

function chunkRange(range: MonthRange): MonthRange[] {
  const ranges: MonthRange[] = [];
  const maxChunkMs = MAX_CHUNK_SECONDS * 1000;
  const start = new Date(range.since);
  let end = new Date(range.until);
  const now = new Date();
  const earliestAllowed = new Date(now.getTime() - MAX_LOOKBACK_SECONDS * 1000);
  const latestAllowed = now;

  if (end > latestAllowed) {
    end = latestAllowed;
  }

  if (end <= earliestAllowed) {
    return ranges;
  }

  let cursor = start < earliestAllowed ? new Date(earliestAllowed) : new Date(start);

  while (cursor < end) {
    const nextTime = Math.min(cursor.getTime() + maxChunkMs, end.getTime());
    const next = new Date(nextTime);

    if (next.getTime() === cursor.getTime()) {
      break; // safety to avoid infinite loops
    }

    ranges.push({ since: cursor.toISOString(), until: next.toISOString() });
    cursor = next;
  }

  return ranges;
}

async function requestCloudflareDashboard(range: MonthRange, hostname?: string | null) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId) {
    throw new Error("Cloudflare credentials are not configured");
  }
  const targetHostname = getHostname(hostname);
  const endpoint = "https://api.cloudflare.com/client/v4/graphql";
  const query = `
    query($zoneTag: String!, $hostname: String!, $since: Time!, $until: Time!) {
      viewer {
        zones(filter: {zoneTag: $zoneTag}) {
          httpRequestsAdaptiveGroups(
            limit: 5000,
            filter: {
              datetime_geq: $since,
              datetime_lt: $until,
              clientRequestHTTPHost: $hostname
            }
          ) {
            sum {
              visits
            }
          }
        }
      }
    }
  `;
  const body = JSON.stringify({
    query,
    variables: {
      zoneTag: zoneId,
      hostname: targetHostname,
      since: range.since,
      until: range.until,
    },
  });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudflare API error ${response.status}: ${text}`);
  }
  const data = (await response.json()) as CloudflareGraphQLResponse;

  if (!data?.data?.viewer?.zones) {
    console.warn("Cloudflare GraphQL response missing expected data structure", data);
  }

  if (data.errors && data.errors.length > 0) {
    // Check if the error is related to data age limitation
    const isDataAgeLimitError = data.errors.some(error => 
      typeof error.message === 'string' && 
      error.message.includes('cannot request data older than')
    );
    
    if (isDataAgeLimitError) {
      console.warn("Cloudflare data age limit exceeded, returning empty result", { errors: data.errors });
      // Return empty data structure instead of throwing error
      return {
        data: {
          viewer: {
            zones: [{
              httpRequestsAdaptiveGroups: []
            }]
          }
        }
      };
    } else {
      // For other types of errors, log but don't throw
      console.error(`Cloudflare GraphQL error: ${JSON.stringify(data.errors)}`);
      // Return empty data structure
      return {
        data: {
          viewer: {
            zones: [{
              httpRequestsAdaptiveGroups: []
            }]
          }
        }
      };
    }
  }
  return data;
}

export async function getCloudflareMonthlyVisitors(year: number, month: number, hostname?: string | null) {
  const range = getMonthDateRange(year, month);
  const chunkedRanges = chunkRange(range);

  if (chunkedRanges.length === 0) {
    console.warn("No valid Cloudflare time ranges available for monthly visitors", { range });
    return {
      visitors: 0,
      range,
      raw: null,
    };
  }

  let visitors = 0;
  let lastResponse: CloudflareGraphQLResponse | null = null;

  for (const chunk of chunkedRanges) {
    try {
      const data = await requestCloudflareDashboard(chunk, hostname);
      visitors += extractVisitors(data);
      lastResponse = data;
    } catch (error) {
      console.error("Failed to fetch Cloudflare visitors chunk", { chunk, error });
      // Don't throw the error, just log it and continue with 0 visitors for this chunk
      // This prevents the entire dashboard from failing due to Cloudflare analytics issues
    }
  }

  return {
    visitors,
    range,
    raw: lastResponse,
  };
}

export async function getCloudflareRangeVisitors(since: string, until: string, hostname?: string | null) {
  const requestedRange: MonthRange = { since, until };
  const chunkedRanges = chunkRange(requestedRange);

  if (chunkedRanges.length === 0) {
    console.warn("No valid Cloudflare time ranges available for requested visitors range", { since, until });
    return {
      visitors: 0,
      raw: null,
    };
  }

  let visitors = 0;
  let lastResponse: CloudflareGraphQLResponse | null = null;

  for (const chunk of chunkedRanges) {
    try {
      const data = await requestCloudflareDashboard(chunk, hostname);
      visitors += extractVisitors(data);
      lastResponse = data;
    } catch (error) {
      console.error("Failed to fetch Cloudflare visitors for range", { chunk, error });
      // Continue with next chunk instead of failing the entire request
    }
  }

  return {
    visitors,
    raw: lastResponse,
  };
}
