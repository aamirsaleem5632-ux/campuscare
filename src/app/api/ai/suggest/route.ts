import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/constants";
import { aiErrorResponse, generateJSON } from "@/lib/gemini";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const limitPerMinute = () => {
  const n = Math.floor(Number(process.env.AI_SUGGEST_RATE_LIMIT));
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : 8;
};

const SYSTEM = `You help students file facility complaints at a university campus.
Given a rough description, return ONLY JSON: {"category": one of ${JSON.stringify(CATEGORIES)}, "title": a clear title under 90 characters, "description": the description rewritten clearly and politely in 2-5 sentences, keeping every fact the student gave and inventing nothing}.
If the text is unrelated to a facility issue, still choose the closest category.`;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`suggest:${ip}`, limitPerMinute())) {
    return NextResponse.json({ error: "Too many AI requests. Please wait a minute." }, { status: 429 });
  }
  const { description, title } = (await req.json().catch(() => ({}))) as { description?: string; title?: string };
  const text = (description ?? "").trim();
  if (text.length < 10 || text.length > 2000) {
    return NextResponse.json({ error: "Write at least a short description (10+ characters) first." }, { status: 400 });
  }
  try {
    const out = await generateJSON<{ category: string; title: string; description: string }>(
      SYSTEM, `Title: ${(title ?? "").slice(0, 120)}\nDescription: ${text}`
    );
    const category = (CATEGORIES as readonly string[]).includes(out.category) ? out.category : "";
    return NextResponse.json({
      category, title: String(out.title ?? "").slice(0, 120), description: String(out.description ?? "").slice(0, 2000),
    });
  } catch (err) {
    const { status, body } = aiErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
