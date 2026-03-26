import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MenuSchema = z.object({
  soup: z.string().nullable().optional(),
  soupPrice: z.string().nullable().optional(),
  mains: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      soldOut: z.boolean().default(false),
    })
  ),
  isPublished: z.boolean().default(false),
  date: z.string().optional(), // ISO date string "YYYY-MM-DD", defaults to today
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const body = await req.json();
  const data = MenuSchema.parse(body);

  const targetDate = data.date ? new Date(data.date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const menu = await prisma.dailyMenu.upsert({
    where: {
      restaurantId_date: {
        restaurantId,
        date: targetDate,
      },
    },
    update: {
      soup: data.soup ?? null,
      soupPrice: data.soupPrice ?? null,
      mains: data.mains,
      isPublished: data.isPublished,
    },
    create: {
      restaurantId,
      date: targetDate,
      soup: data.soup ?? null,
      soupPrice: data.soupPrice ?? null,
      mains: data.mains,
      isPublished: data.isPublished,
    },
  });

  return NextResponse.json(menu);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = from && to
    ? {
        restaurantId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      }
    : { restaurantId };

  const menus = await prisma.dailyMenu.findMany({
    where,
    orderBy: { date: "asc" },
    take: 30,
  });

  return NextResponse.json(menus);
}
