import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CampusCare — Complaint Management",
  description: "Report and track campus facility issues: computers, projectors, fans, lights and Wi-Fi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CampusCare — Campus Electronic Complaint Management System
        </footer>
      </body>
    </html>
  );
}
