import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { STATUSES } from "@/lib/constants";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = (await req.json().catch(() => ({}))) as { status?: string };
  if (!status || !(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const { data, error } = await getAdminClient()
    .from("complaints").update({ status, updated_at: new Date().toISOString() })
    .eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
  return NextResponse.json(data);
}
