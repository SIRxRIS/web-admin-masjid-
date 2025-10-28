import { prisma } from "@/lib/prisma";
import { getCloudflareRangeVisitors } from "@/lib/services/cloudflare/analytics";

export async function syncDailyVisitorData() {
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  const yesterdayUTC = new Date(todayUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  try {
    const cloudflareData = await getCloudflareRangeVisitors(
      yesterdayUTC.toISOString(),
      todayUTC.toISOString()
    );

    const visitorCount = cloudflareData.visitors || 0;

    const upsertedData = await prisma.dailyVisitorData.upsert({
      where: { date: yesterdayUTC },
      update: { visitors: visitorCount },
      create: {
        date: yesterdayUTC,
        visitors: visitorCount,
      },
    });

    console.log(`[Daily Visitor Sync] Successfully synced ${visitorCount} visitors for ${yesterdayUTC.toISOString()}`);
    return upsertedData;
  } catch (error) {
    console.error("[Daily Visitor Sync] Error syncing visitor data:", error);
    throw error;
  }
}

export async function getMonthlyVisitorsFromDatabase(year: number, month: number): Promise<number> {
  try {
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));

    if (!prisma.dailyVisitorData) {
      console.warn("[getMonthlyVisitorsFromDatabase] dailyVisitorData model not found in Prisma client");
      return 0;
    }

    const results = await prisma.dailyVisitorData.aggregate({
      where: {
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: {
        visitors: true,
      },
    });

    return results._sum.visitors || 0;
  } catch (error) {
    console.error("[getMonthlyVisitorsFromDatabase] Error:", error);
    return 0;
  }
}

export async function getPreviousMonthVisitorsFromDatabase(): Promise<number> {
  const today = new Date();
  const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
  const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

  return getMonthlyVisitorsFromDatabase(prevYear, prevMonth + 1);
}

export async function getDailyVisitorData(date: Date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return prisma.dailyVisitorData.findUnique({
    where: { date: normalizedDate },
  });
}
