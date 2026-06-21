import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";

// Font optimization: use variable fonts, preload only used weights
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Viewport and color theme
export const viewport: Viewport = {
  themeColor: "#010102",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
};

// Root metadata - covers all routes unless overridden
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tentrist.ai"),
  title: {
    default: "Tentrist — DePIN GPU Orchestration",
    template: "%s | Tentrist",
  },
  description: "Decentralized SLA-Enforced GPU Orchestration Protocol for AI workloads. Up to 70% cheaper than legacy cloud with enterprise-grade SLAs enforced automatically on-chain.",
  keywords: ["GPU orchestration", "DePIN", "decentralized computing", "AI workloads", "SLA enforcement", "blockchain", "smart contracts", "GPU cloud", "compute marketplace"],
  authors: [{ name: "Tentrist" }],
  creator: "Tentrist",
  publisher: "Tentrist",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Tentrist",
    title: "Tentrist — DePIN GPU Orchestration",
    description: "Decentralized SLA-Enforced GPU Orchestration Protocol for AI workloads. Up to 70% cheaper with enterprise-grade SLAs enforced on-chain.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tentrist — GPU Orchestration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentrist — DePIN GPU Orchestration",
    description: "Decentralized SLA-Enforced GPU Orchestration Protocol. Up to 70% cheaper with enterprise-grade SLAs on-chain.",
    images: ["/og-image.png"],
    creator: "@tentrist",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indicator-active border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-foreground-muted">Loading...</span>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
