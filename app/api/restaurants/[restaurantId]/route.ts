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
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, userId: session.user.id },
    select: { id: true, name: true, brandingColor: true },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { restaurantId } = await params;
  const { name, brandingColor, address, latitude, longitude } = await req.json();

  // Make sure this restaurant belongs to the authenticated user
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, userId: session.user.id },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      ...(name && { name }),
      ...(brandingColor && { brandingColor }),
      ...(address !== undefined && { address: address || null }),
      ...(latitude !== undefined && { latitude: latitude || null }),
      ...(longitude !== undefined && { longitude: longitude || null }),
    },
  });

  return NextResponse.json(updated);
}
