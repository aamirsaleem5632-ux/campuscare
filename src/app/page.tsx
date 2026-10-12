import Link from "next/link";

const features = [
  { title: "Report an issue", text: "Computers, projectors, fans, lights and Wi-Fi — describe the problem and attach photos.", href: "/submit" },
  { title: "Track progress", text: "Use your complaint ID to see whether it is Pending, In Progress or Resolved.", href: "/track" },
  { title: "Admin dashboard", text: "Staff review complaints, update statuses and view live statistics.", href: "/admin" },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-14 text-white sm:px-12">
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">Faster fixes for a better campus.</h1>
        <p className="mt-4 max-w-xl text-brand-100">
          CampusCare is the campus electronic complaint management system. Report a faulty facility in minutes and follow it until it is resolved.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/submit" className="btn bg-white text-brand-700 hover:bg-brand-50">Report an issue</Link>
          <Link href="/track" className="btn border border-white/60 text-white hover:bg-white/10">Track a complaint</Link>
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-lg font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{f.text}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand-600">Open →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
