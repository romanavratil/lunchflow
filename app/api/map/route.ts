import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setUTCHours(23, 59, 59, 999);

  const restaurants = await prisma.restaurant.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      brandingColor: true,
      widgetConfig: true,
      menus: {
        where: { date: { gte: todayStart, lte: todayEnd }, isPublished: true },
        take: 1,
        select: { id: true, soup: true, soupPrice: true, mains: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(restaurants);
}
