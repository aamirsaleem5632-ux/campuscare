import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { aiErrorResponse, generateText } from "@/lib/gemini";

export const runtime = "nodejs";

const SYSTEM = `You are an analyst writing a short report for a campus facilities manager from real complaint data.
Write plain text (no markdown symbols), under 200 words, with these labelled sections: Overview, Hotspots (categories/locations/departments with most issues), Backlog (pending/in-progress concerns), Recommendations (3 concrete actions). Use only the data given.`;

export async function POST() {
  const { data, error } = await getAdminClient()
    .from("complaints").select("id,category,status,location,department,title,created_at")
    .order("created_at", { ascending: false }).limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data.length) return NextResponse.json({ report: "No complaints yet — nothing to analyse." });

  const tally = (k: "category" | "status" | "location" | "department") =>
    Object.entries(data.reduce<Record<string, number>>((a, r) => ((a[r[k]] = (a[r[k]] ?? 0) + 1), a), {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 8);
  const summary = {
    total: data.length, byStatus: tally("status"), byCategory: tally("category"),
    topLocations: tally("location"), topDepartments: tally("department"),
    oldestOpen: data.filter((r) => r.status !== "Resolved").slice(-5).map((r) => `${r.created_at.slice(0, 10)} ${r.category}: ${r.title}`),
  };
  try {
    return NextResponse.json({ report: await generateText(SYSTEM, JSON.stringify(summary)) });
  } catch (err) {
    const { status, body } = aiErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
