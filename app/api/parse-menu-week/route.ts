import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ItemSchema = z.object({
  name:        z.string().catch(""),
  description: z.string().optional().catch(undefined),
  price:       z.union([z.string(), z.number()]).transform(String).catch(""),
  soldOut:     z.boolean().catch(false),
});

const DayMenuSchema = z.object({
  soup:      z.string().nullable().catch(null),
  soupPrice: z.string().nullable().catch(null),
  mains:     z.array(ItemSchema).catch([]),
}).passthrough();

const WeekSchema = z.object({
  monday:    DayMenuSchema.catch({ soup: null, soupPrice: null, mains: [] }).optional(),
  tuesday:   DayMenuSchema.catch({ soup: null, soupPrice: null, mains: [] }).optional(),
  wednesday: DayMenuSchema.catch({ soup: null, soupPrice: null, mains: [] }).optional(),
  thursday:  DayMenuSchema.catch({ soup: null, soupPrice: null, mains: [] }).optional(),
  friday:    DayMenuSchema.catch({ soup: null, soupPrice: null, mains: [] }).optional(),
  saturday:  DayMenuSchema.catch({ soup: null, soupPrice: null, mains: [] }).optional(),
  sunday:    DayMenuSchema.catch({ soup: null, soupPrice: null, mains: [] }).optional(),
}).passthrough();

export type WeeklyParsedMenu = z.infer<typeof WeekSchema>;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a weekly restaurant menu parser. This image shows a menu for multiple days of the week.
Extract the menu for every day that is visible. Days may be labeled in any language (Mon/Monday/Pondělí/Montag etc.).
Return ONLY valid JSON with this exact structure — include only days that are present in the image:
{
  "monday":    { "soup": "soup name or null", "soupPrice": "price or null", "mains": [{ "name": "dish", "description": "short description or empty string", "price": "price", "soldOut": false }] },
  "tuesday":   { "soup": null, "soupPrice": null, "mains": [] },
  "wednesday": { "soup": null, "soupPrice": null, "mains": [] },
  "thursday":  { "soup": null, "soupPrice": null, "mains": [] },
  "friday":    { "soup": null, "soupPrice": null, "mains": [] },
  "saturday":  { "soup": null, "soupPrice": null, "mains": [] },
  "sunday":    { "soup": null, "soupPrice": null, "mains": [] }
}
If a day is not visible, omit it entirely. If no soup section exists for a day, use null. Return no markdown.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 2048,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No response from AI" }, { status: 500 });

    const cleaned = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

    let raw: unknown;
    try {
      raw = JSON.parse(cleaned);
    } catch {
      console.error("parse-menu-week: AI returned non-JSON:", cleaned.slice(0, 300));
      return NextResponse.json({ error: "AI returned invalid JSON — try a clearer photo" }, { status: 422 });
    }

    const validated = WeekSchema.parse(raw);
    return NextResponse.json(validated);
  } catch (err) {
    console.error("parse-menu-week error:", err);
    const msg = err instanceof Error ? err.message : "Failed to parse weekly menu";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
