"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) return setError("Enter the admin password.");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="text-sm text-slate-500">Authorized staff only.</p>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label" htmlFor="pw">Password</label>
          <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading && <Spinner />} Sign in</button>
      </form>
    </div>
  );
}
