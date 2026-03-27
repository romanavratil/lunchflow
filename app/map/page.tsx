import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import BrowseClient from "./BrowseClient";

export const metadata: Metadata = {
  title: "Browse Restaurants — LunchFlow",
  description: "Find local restaurants and see today's lunch menus.",
};

async function getRestaurants() {
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setUTCHours(23, 59, 59, 999);

  return prisma.restaurant.findMany({
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
    orderBy: [
      { menus: { _count: "desc" } },
      { name: "asc" },
    ],
  });
}

export default async function MapPage() {
  const restaurants = await getRestaurants();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <BrowseClient
        restaurants={restaurants as never}
        today={today}
      />
    </>
  );
}
