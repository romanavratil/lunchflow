export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_WIDGET_CONFIG, WidgetConfig } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const config = { ...DEFAULT_WIDGET_CONFIG, ...(restaurant.widgetConfig as Partial<WidgetConfig>) };
  return NextResponse.json(config);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const body: Partial<WidgetConfig> = await req.json();

  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { widgetConfig: body },
  });

  const config = { ...DEFAULT_WIDGET_CONFIG, ...(restaurant.widgetConfig as Partial<WidgetConfig>) };
  return NextResponse.json(config);
}
