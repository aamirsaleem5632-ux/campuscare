"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import type { Complaint, Status } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import Spinner from "@/components/Spinner";
import Toast from "@/components/Toast";

const statusColor: Record<Status, string> = { Pending: "#f59e0b", "In Progress": "#2f6fed", Resolved: "#10b981" };

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function Donut({ data, total }: { data: { label: Status; value: number }[]; total: number }) {
  const r = 40, C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        {total > 0 && data.map((d) => {
          const len = (d.value / total) * C;
          const el = <circle key={d.label} cx="50" cy="50" r={r} fill="none" stroke={statusColor[d.label]} strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: statusColor[d.label] }} />
            {d.label}: <b>{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [stat, setStat] = useState("");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [saving, setSaving] = useState(false);
  const [triage, setTriage] = useState<Record<string, string> | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [report, setReport] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [toast, setToast] = useState<{ m: string; t: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/complaints", { cache: "no-store" });
      if (res.status === 401) return router.push("/admin/login");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load complaints.");
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) =>
      (!cat || r.category === cat) && (!stat || r.status === stat) &&
      (!s || [r.id, r.title, r.student_name, r.location, r.department].some((v) => v.toLowerCase().includes(s)))
    );
  }, [rows, q, cat, stat]);

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length])) as Record<Status, number>;
    const byCat = CATEGORIES.map((c) => ({ label: c, value: rows.filter((r) => r.category === c).length }));
    return { byStatus, byCat, max: Math.max(1, ...byCat.map((c) => c.value)) };
  }, [rows]);

  async function updateStatus(id: string, status: Status) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
      setRows((rs) => rs.map((r) => (r.id === id ? data : r)));
      setSelected(data);
      setToast({ m: `Status updated to ${status}.`, t: "success" });
    } catch (e) {
      setToast({ m: e instanceof Error ? e.message : "Update failed.", t: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function runTriage(id: string) {
    setTriageLoading(true);
    setTriage(null);
    try {
      const res = await fetch("/api/admin/ai/triage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI triage failed.");
      setTriage(data);
    } catch (e) {
      setToast({ m: e instanceof Error ? e.message : "AI triage failed.", t: "error" });
    } finally {
      setTriageLoading(false);
    }
  }

  async function runReport() {
    setReportLoading(true);
    try {
      const res = await fetch("/api/admin/ai/report", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI report failed.");
      setReport(data.report);
    } catch (e) {
      setToast({ m: e instanceof Error ? e.message : "AI report failed.", t: "error" });
    } finally {
      setReportLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={load}>Refresh</button>
          <button className="btn-secondary" onClick={logout}>Log out</button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total complaints" value={rows.length} tone="text-slate-900" />
        <StatCard label="Pending" value={counts.byStatus.Pending} tone="text-amber-600" />
        <StatCard label="In progress" value={counts.byStatus["In Progress"]} tone="text-blue-600" />
        <StatCard label="Resolved" value={counts.byStatus.Resolved} tone="text-emerald-600" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Complaints by status</h2>
          <Donut total={rows.length} data={STATUSES.map((s) => ({ label: s, value: counts.byStatus[s] }))} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Complaints by category</h2>
          <ul className="space-y-3">
            {counts.byCat.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0">{c.label}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(c.value / counts.max) * 100}%` }} />
                </div>
                <b className="w-8 text-right">{c.value}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">✨ AI insights</h2>
          <button className="btn-secondary" onClick={runReport} disabled={reportLoading || rows.length === 0}>
            {reportLoading && <Spinner />} Generate report
          </button>
        </div>
        {report
          ? <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{report}</p>
          : <p className="mt-2 text-sm text-slate-500">Generate a Gemini-written summary of hotspots, backlog and recommended actions from your real complaint data.</p>}
      </section>

      <section className="card overflow-hidden">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-3">
          <input className="input" placeholder="Search ID, title, student, location…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input" value={stat} onChange={(e) => setStat(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>{["ID", "Title", "Category", "Student", "Date", "Status", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500"><Spinner className="mr-2 h-4 w-4" />Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No complaints found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.student_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right"><button className="font-semibold text-brand-600 hover:underline" onClick={() => { setTriage(null); setSelected(r); }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/50 p-4" onClick={() => setSelected(null)}>
          <div className="card max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-slate-500">{selected.id}</p>
                <h2 className="text-xl font-bold">{selected.title}</h2>
              </div>
              <button aria-label="Close" className="text-2xl leading-none text-slate-400 hover:text-slate-700" onClick={() => setSelected(null)}>×</button>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Student</dt><dd className="font-medium">{selected.student_name}</dd></div>
              <div><dt className="text-slate-500">Department</dt><dd className="font-medium">{selected.department}</dd></div>
              <div><dt className="text-slate-500">Location</dt><dd className="font-medium">{selected.location}</dd></div>
              <div><dt className="text-slate-500">Category</dt><dd className="font-medium">{selected.category}</dd></div>
              <div><dt className="text-slate-500">Submitted</dt><dd className="font-medium">{new Date(selected.created_at).toLocaleString()}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><StatusBadge status={selected.status} /></dd></div>
            </dl>
            <p className="whitespace-pre-wrap text-sm">{selected.description}</p>
            {selected.image_urls.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {selected.image_urls.map((u) => (
                  <a key={u} href={u} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="Complaint" className="h-28 w-28 rounded-lg border object-cover" />
                  </a>
                ))}
              </div>
            )}
            <div className="rounded-xl bg-brand-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-900">✨ AI triage</p>
                <button className="btn-secondary" onClick={() => runTriage(selected.id)} disabled={triageLoading}>
                  {triageLoading && <Spinner />} {triage ? "Re-run" : "Analyse"}
                </button>
              </div>
              {triage && (
                <dl className="mt-3 space-y-1 text-sm">
                  <div><dt className="inline font-medium">Priority: </dt><dd className="inline">{triage.priority}</dd></div>
                  <div><dt className="inline font-medium">Summary: </dt><dd className="inline">{triage.summary}</dd></div>
                  <div><dt className="inline font-medium">Suggested action: </dt><dd className="inline">{triage.suggested_action}</dd></div>
                  <div><dt className="inline font-medium">Why: </dt><dd className="inline">{triage.reason}</dd></div>
                </dl>
              )}
            </div>
            <div>
              <p className="label">Update status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} disabled={saving || selected.status === s} onClick={() => updateStatus(selected.id, s)}
                    className={selected.status === s ? "btn-primary" : "btn-secondary"}>
                    {saving && selected.status !== s ? <Spinner /> : null}{s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}
    </div>
  );
}
