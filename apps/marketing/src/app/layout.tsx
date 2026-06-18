import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tentrist — DePIN GPU Orchestration",
  description: "Rent or provide decentralized GPU compute with on-chain SLA enforcement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}