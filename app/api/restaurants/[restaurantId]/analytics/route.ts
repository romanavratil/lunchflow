import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { restaurantId } = await params;

  // Verify ownership
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, userId: session.user.id },
    select: { id: true },
  });
  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();

  // Today — UTC window
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);

  // This week — last 7 days
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  weekStart.setUTCHours(0, 0, 0, 0);

  // This month — last 30 days
  const monthStart = new Date(now);
  monthStart.setUTCDate(monthStart.getUTCDate() - 29);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [todayCount, weekCount, monthCount, last30Events] = await Promise.all([
    prisma.widgetEvent.count({
      where: { restaurantId, type: "open", createdAt: { gte: todayStart } },
    }),
    prisma.widgetEvent.count({
      where: { restaurantId, type: "open", createdAt: { gte: weekStart } },
    }),
    prisma.widgetEvent.count({
      where: { restaurantId, type: "open", createdAt: { gte: monthStart } },
    }),
    // Raw events for last 30 days to build the daily chart
    prisma.widgetEvent.findMany({
      where: { restaurantId, type: "open", createdAt: { gte: monthStart } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Bucket events by day (YYYY-MM-DD in UTC)
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(monthStart);
    d.setUTCDate(d.getUTCDate() + i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const e of last30Events) {
    const key = e.createdAt.toISOString().slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  return NextResponse.json({ todayCount, weekCount, monthCount, daily });
}
