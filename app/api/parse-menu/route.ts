import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MenuSchema = z.object({
  soup: z.string().nullable(),
  mains: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      soldOut: z.boolean().default(false),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

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
              text: `You are a menu parser. Analyze this restaurant menu image and extract the items.
Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "soup": "soup name here or null if none",
  "mains": [
    { "name": "dish name", "price": "price as string e.g. $12.50", "soldOut": false }
  ]
}
Extract all visible menu items. If a price is missing, use "Market Price". If no soup section exists, set soup to null.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Strip any accidental markdown code fences
    const cleaned = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const validated = MenuSchema.parse(parsed);

    return NextResponse.json(validated);
  } catch (err) {
    console.error("parse-menu error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 422 });
    }
    return NextResponse.json({ error: "Failed to parse menu" }, { status: 500 });
  }
}
