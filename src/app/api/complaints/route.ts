import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAdminClient } from "@/lib/supabase";
import { validateComplaint } from "@/lib/validation";
import { BUCKET } from "@/lib/constants";

export const runtime = "nodejs";

function newId() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `CC-${d}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const get = (k: string) => String(form.get(k) ?? "");
    const input = {
      student_name: get("student_name"), department: get("department"), location: get("location"),
      category: get("category"), title: get("title"), description: get("description"),
    };
    const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

    const errors = validateComplaint(input, files);
    if (Object.keys(errors).length) return NextResponse.json({ error: "Validation failed", fields: errors }, { status: 400 });

    const db = getAdminClient();
    const id = newId();

    const urls: string[] = [];
    for (const [i, file] of files.entries()) {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${id}/${i + 1}-${randomBytes(4).toString("hex")}.${ext}`;
      const { error } = await db.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
      if (error) throw new Error(`Image upload failed: ${error.message}`);
      urls.push(db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }

    const { data, error } = await db
      .from("complaints")
      .insert({
        id,
        student_name: input.student_name.trim(), department: input.department.trim(),
        location: input.location.trim(), category: input.category,
        title: input.title.trim(), description: input.description.trim(), image_urls: urls,
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ id: data.id, created_at: data.created_at }, { status: 201 });
  } catch (err) {
    console.error("POST /api/complaints", err);
    return NextResponse.json({ error: "Could not submit the complaint. Please try again." }, { status: 500 });
  }
}
