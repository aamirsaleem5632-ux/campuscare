"use client";
import { useEffect } from "react";

export default function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);
  return (
    <div role="status" className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
      {message}
    </div>
  );
}
