import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { aiErrorResponse, generateJSON } from "@/lib/gemini";

export const runtime = "nodejs";

const SYSTEM = `You are a campus facilities triage assistant. Return ONLY JSON:
{"priority": "Low"|"Medium"|"High"|"Urgent", "summary": one sentence, "suggested_action": 1-2 sentences for the maintenance team, "reason": short reason for the priority}.
Urgent = safety risk (sparks, burning smell, exposed wiring, water near electricity) or an entire class/exam blocked. High = blocks teaching or many users. Medium = inconvenience. Low = cosmetic.`;

export async function POST(req: Request) {
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Complaint ID is required." }, { status: 400 });
  const { data, error } = await getAdminClient().from("complaints").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
  try {
    const out = await generateJSON<Record<string, string>>(
      SYSTEM,
      `Category: ${data.category}\nLocation: ${data.location}\nDepartment: ${data.department}\nTitle: ${data.title}\nDescription: ${data.description}\nPictures attached: ${data.image_urls.length}`
    );
    return NextResponse.json(out);
  } catch (err) {
    const { status, body } = aiErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
