import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: "My Restaurant",
        slug: "my-restaurant-" + Date.now(),
        userId: session.user.id,
        brandingColor: "#6366f1",
      },
    });
  }

  return NextResponse.json(restaurant);
}
