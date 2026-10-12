import type { Status } from "@/lib/types";

const styles: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  "In Progress": "bg-blue-100 text-blue-800 ring-blue-200",
  Resolved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
}
