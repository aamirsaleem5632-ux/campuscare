"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/submit", label: "Report Issue" },
  { href: "/track", label: "Track Complaint" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">C</span>
          CampusCare
        </Link>
        <nav className="hidden gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100 md:hidden">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-slate-100 px-4 pb-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">{l.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
