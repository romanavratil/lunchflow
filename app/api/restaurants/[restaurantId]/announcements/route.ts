export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AnnouncementSchema = z.object({
  text: z.string().min(1).max(120),
  bgColor: z.string().default("#f59e0b"),
  textColor: z.string().default("#1a1a1a"),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const body = await req.json();
  const data = AnnouncementSchema.parse(body);

  // Deactivate other active announcements first
  await prisma.announcement.updateMany({
    where: { restaurantId, isActive: true },
    data: { isActive: false },
  });

  const announcement = await prisma.announcement.create({
    data: {
      restaurantId,
      text: data.text,
      bgColor: data.bgColor,
      textColor: data.textColor,
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      isActive: data.isActive,
    },
  });

  return NextResponse.json(announcement);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const announcements = await prisma.announcement.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json(announcements);
}
