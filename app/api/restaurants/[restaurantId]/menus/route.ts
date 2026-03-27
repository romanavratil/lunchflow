export const dynamic = "force-dynamic";
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

  let targetDate: Date;
  if (data.date) {
    // Parse as local noon to avoid UTC midnight rolling back to previous day in +offset timezones
    const [y, m, day] = data.date.split("-").map(Number);
    targetDate = new Date(y, m - 1, day, 12, 0, 0, 0);
  } else {
    targetDate = new Date();
    targetDate.setHours(12, 0, 0, 0);
  }

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

  function parseLocalDate(s: string): Date {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }

  const where = from && to
    ? {
        restaurantId,
        date: {
          gte: parseLocalDate(from),
          lte: parseLocalDate(to),
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
