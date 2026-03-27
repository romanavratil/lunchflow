export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export async function OPTIONS() {
  return new Response(null, { headers: CORS });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const { type } = await req.json().catch(() => ({ type: "open" }));

  // Fire-and-forget — don't block the widget if DB is slow
  prisma.widgetEvent.create({
    data: { restaurantId, type: type ?? "open" },
  }).catch(() => {});

  return NextResponse.json({ ok: true }, { headers: CORS });
}
