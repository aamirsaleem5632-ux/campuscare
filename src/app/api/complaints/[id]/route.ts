import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clean = decodeURIComponent(id).trim().toUpperCase();
  if (!/^CC-\d{8}-[A-F0-9]{6}$/.test(clean)) {
    return NextResponse.json({ error: "Invalid complaint ID format." }, { status: 400 });
  }
  try {
    const { data, error } = await getAdminClient()
      .from("complaints")
      .select("id, department, location, category, title, description, image_urls, status, created_at, updated_at")
      .eq("id", clean)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: "No complaint found with that ID." }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/complaints/[id]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
