import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password, name, restaurantName } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 12);

  const slug = (restaurantName || "my-restaurant")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40) + "-" + Date.now();

  await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      password: hash,
      restaurants: {
        create: {
          name: restaurantName || "My Restaurant",
          slug,
          brandingColor: "#6366f1",
        },
      },
    },
  });

  return NextResponse.json({ success: true });
}
