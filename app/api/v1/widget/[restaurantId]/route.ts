import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_WIDGET_CONFIG, WidgetConfig, WidgetData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [menu, announcement] = await Promise.all([
    prisma.dailyMenu.findFirst({
      where: { restaurantId, date: { gte: today }, isPublished: true },
      orderBy: { date: "desc" },
    }),
    prisma.announcement.findFirst({
      where: {
        restaurantId,
        isActive: true,
        OR: [{ startTime: null }, { startTime: { lte: new Date() } }],
        AND: [{ OR: [{ endTime: null }, { endTime: { gte: new Date() } }] }],
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const widgetConfig: WidgetConfig = {
    ...DEFAULT_WIDGET_CONFIG,
    ...(restaurant.widgetConfig as Partial<WidgetConfig>),
  };

  const data: WidgetData = {
    restaurant: {
      name: restaurant.name,
      brandingColor: restaurant.brandingColor,
      logoUrl: restaurant.logoUrl,
    },
    menu: menu
      ? {
          id: menu.id,
          soup: menu.soup,
          soupPrice: menu.soupPrice,
          mains: menu.mains as unknown as NonNullable<WidgetData["menu"]>["mains"],
        }
      : null,
    announcement: announcement
      ? { text: announcement.text, bgColor: announcement.bgColor, textColor: announcement.textColor }
      : null,
    widgetConfig,
  };

  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" },
  });
}
