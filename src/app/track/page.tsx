"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import Spinner from "@/components/Spinner";
import type { Complaint } from "@/lib/types";

type Result = Pick<Complaint, "id" | "department" | "location" | "category" | "title" | "description" | "image_urls" | "status" | "created_at" | "updated_at">;
const steps = ["Pending", "In Progress", "Resolved"] as const;

function Tracker() {
  const params = useSearchParams();
  const [id, setId] = useState(params.get("id") ?? "");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (value: string) => {
    const q = value.trim();
    setResult(null);
    if (!q) return setError("Enter your complaint ID.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const q = params.get("id"); if (q) search(q); }, [params, search]);

  const current = result ? steps.indexOf(result.status) : -1;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold sm:text-3xl">Track your complaint</h1>
      <p className="mb-6 mt-1 text-slate-600">Enter the complaint ID you received after submitting.</p>
      <form onSubmit={(e) => { e.preventDefault(); search(id); }} className="flex flex-col gap-3 sm:flex-row">
        <input className="input font-mono" placeholder="CC-20261012-A1B2C3" value={id} onChange={(e) => setId(e.target.value)} aria-label="Complaint ID" />
        <button className="btn-primary" disabled={loading}>{loading && <Spinner />} Search</button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {result && (
        <div className="card mt-6 space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-slate-500">{result.id}</p>
              <h2 className="text-xl font-bold">{result.title}</h2>
            </div>
            <StatusBadge status={result.status} />
          </div>
          <ol className="flex items-center">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center last:flex-none">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= current ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"}`}>{i + 1}</span>
                <span className="ml-2 hidden text-xs font-medium sm:inline">{s}</span>
                {i < steps.length - 1 && <span className={`mx-2 h-0.5 flex-1 ${i < current ? "bg-brand-600" : "bg-slate-200"}`} />}
              </li>
            ))}
          </ol>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Category</dt><dd className="font-medium">{result.category}</dd></div>
            <div><dt className="text-slate-500">Department</dt><dd className="font-medium">{result.department}</dd></div>
            <div><dt className="text-slate-500">Location</dt><dd className="font-medium">{result.location}</dd></div>
            <div><dt className="text-slate-500">Submitted</dt><dd className="font-medium">{new Date(result.created_at).toLocaleString()}</dd></div>
            <div><dt className="text-slate-500">Last updated</dt><dd className="font-medium">{new Date(result.updated_at).toLocaleString()}</dd></div>
          </dl>
          <div>
            <p className="text-sm text-slate-500">Description</p>
            <p className="whitespace-pre-wrap text-sm">{result.description}</p>
          </div>
          {result.image_urls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {result.image_urls.map((u) => (
                <a key={u} href={u} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="Complaint" className="h-24 w-24 rounded-lg border object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return <Suspense><Tracker /></Suspense>;
}
