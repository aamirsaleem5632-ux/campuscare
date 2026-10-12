"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ALLOWED_IMAGE_TYPES, CATEGORIES, DEPARTMENTS, MAX_IMAGES } from "@/lib/constants";
import { FieldErrors, validateComplaint } from "@/lib/validation";
import Spinner from "@/components/Spinner";
import Toast from "@/components/Toast";

const empty = { student_name: "", department: "", location: "", category: "", title: "", description: "" };

export default function SubmitPage() {
  const [values, setValues] = useState(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ m: string; t: "success" | "error" } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [done, setDone] = useState<{ id: string; created_at: string } | null>(null);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));
  const cls = (k: keyof FieldErrors) => `input ${errors[k] ? "input-error" : ""}`;

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    e.target.value = "";
  }

  async function suggestWithAI() {
    if (values.description.trim().length < 10) {
      return setToast({ m: "Write a short description first, then use AI.", t: "error" });
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: values.title, description: values.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI suggestion failed.");
      setValues((v) => ({ ...v, category: data.category || v.category, title: data.title || v.title, description: data.description || v.description }));
      setErrors({});
      setToast({ m: "AI suggestions applied — please review them.", t: "success" });
    } catch (err) {
      setToast({ m: err instanceof Error ? err.message : "AI suggestion failed.", t: "error" });
    } finally {
      setAiLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateComplaint(values, files);
    setErrors(errs);
    if (Object.keys(errs).length) return setToast({ m: "Please fix the highlighted fields.", t: "error" });

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("images", f));
      const res = await fetch("/api/complaints", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error || "Submission failed.");
      }
      setDone(data);
      setValues(empty);
      setFiles([]);
      setToast({ m: "Complaint submitted successfully!", t: "success" });
    } catch (err) {
      setToast({ m: err instanceof Error ? err.message : "Submission failed.", t: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card space-y-4 p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-600">✓</div>
          <h1 className="text-2xl font-bold">Complaint submitted</h1>
          <p className="text-slate-600">Save your complaint ID to track progress.</p>
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Complaint ID</p>
            <p className="select-all font-mono text-xl font-bold text-brand-700">{done.id}</p>
            <p className="mt-1 text-xs text-slate-500">Submitted {new Date(done.created_at).toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button className="btn-secondary" onClick={() => navigator.clipboard?.writeText(done.id)}>Copy ID</button>
            <Link href={`/track?id=${done.id}`} className="btn-primary">Track this complaint</Link>
            <button className="btn-secondary" onClick={() => setDone(null)}>Submit another</button>
          </div>
        </div>
        {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}
      </div>
    );
  }

  const Err = ({ k }: { k: keyof FieldErrors }) => (errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold sm:text-3xl">Report an issue</h1>
      <p className="mb-6 mt-1 text-slate-600">Tell us what is wrong and where. Fields marked * are required.</p>
      <form onSubmit={onSubmit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Student name *</label>
          <input id="name" className={cls("student_name")} value={values.student_name} onChange={set("student_name")} />
          <Err k="student_name" />
        </div>
        <div>
          <label className="label" htmlFor="dept">Department *</label>
          <select id="dept" className={cls("department")} value={values.department} onChange={set("department")}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <Err k="department" />
        </div>
        <div>
          <label className="label" htmlFor="loc">Location *</label>
          <input id="loc" placeholder="e.g. Block B, Room 204" className={cls("location")} value={values.location} onChange={set("location")} />
          <Err k="location" />
        </div>
        <div>
          <label className="label" htmlFor="cat">Issue category *</label>
          <select id="cat" className={cls("category")} value={values.category} onChange={set("category")}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Err k="category" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">Title *</label>
          <input id="title" placeholder="Short summary of the problem" className={cls("title")} value={values.title} onChange={set("title")} />
          <Err k="title" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="desc">Detailed description *</label>
          <textarea id="desc" rows={5} className={cls("description")} value={values.description} onChange={set("description")} />
          <div className="mt-2">
            <button type="button" onClick={suggestWithAI} disabled={aiLoading} className="btn-secondary text-brand-700">
              {aiLoading ? <Spinner /> : "✨"} {aiLoading ? "Thinking…" : "Improve with AI (suggest category & title)"}
            </button>
          </div>
          <div className="flex justify-between"><Err k="description" /><span className="ml-auto text-xs text-slate-400">{values.description.length}/2000</span></div>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Pictures (optional, up to {MAX_IMAGES}, 5 MB each)</label>
          <input type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} multiple disabled={files.length >= MAX_IMAGES} onChange={onFiles}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700 hover:file:bg-brand-100" />
          <Err k="images" />
          {previews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Preview ${i + 1}`} className="h-24 w-24 rounded-lg border object-cover" />
                  <button type="button" aria-label="Remove picture" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs text-white">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <button className="btn-primary w-full sm:w-auto" disabled={loading}>
            {loading && <Spinner />} {loading ? "Submitting…" : "Submit complaint"}
          </button>
        </div>
      </form>
      {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}
    </div>
  );
}
