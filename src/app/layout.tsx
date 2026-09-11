import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentinel — Linux Security Audit & Hardening Dashboard",
  description: "Next-generation Linux Security Audit, Safe One-Click Hardening, and Fleet Compliance Dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="solar-amber">
      <body className="min-h-screen bg-[var(--canvas-bg)] text-[var(--text-main)] transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
