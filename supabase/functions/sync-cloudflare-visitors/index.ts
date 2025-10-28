// supabase/functions/sync-cloudflare-visitors/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN")!;
const cloudflareZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID")!;
const cloudflareHostname = Deno.env.get("CLOUDFLARE_TARGET_HOSTNAME") || "masjidjawahiruzzarqa.siraf.my.id";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

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

function getYesterdayDateRange() {
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  const yesterdayUTC = new Date(todayUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  return {
    since: yesterdayUTC.toISOString(),
    until: todayUTC.toISOString(),
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

async function getCloudflareVisitors(since: string, until: string): Promise<number> {
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
      zoneTag: cloudflareZoneId,
      hostname: cloudflareHostname,
      since,
      until,
    },
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cloudflareApiToken}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error ${response.status}`);
    }

    const data = (await response.json()) as CloudflareGraphQLResponse;

    if (data.errors && data.errors.length > 0) {
      console.warn("Cloudflare GraphQL errors:", data.errors);
      return 0;
    }

    return extractVisitors(data);
  } catch (error) {
    console.error("Error fetching from Cloudflare:", error);
    return 0;
  }
}

serve(async (req: Request) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("authorization");
  const expectedToken = Deno.env.get("CRON_SECRET");

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { since, until } = getYesterdayDateRange();
    const visitorCount = await getCloudflareVisitors(since, until);
    
    const dateToStore = new Date(since);
    const dateString = dateToStore.toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data, error } = await supabase.from("daily_visitor_data").upsert(
      {
        date: dateString,
        visitors: visitorCount,
        updatedAt: now,
      },
      { onConflict: "date" }
    );

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Successfully synced ${visitorCount} visitors for ${dateString}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily visitor data synced successfully",
        visitors: visitorCount,
        date: dateString,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in sync-cloudflare-visitors function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
