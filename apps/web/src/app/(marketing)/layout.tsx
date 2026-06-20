"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth as useAuthContext } from "@/components/providers/supabase-auth-provider";

const marketingNavItems = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, isLoading } = useAuthContext();

  const isLoggedIn = !isLoading && !!user;

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-hairline bg-bg-base/80 backdrop-blur-xl">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indicator-active/20 border border-indicator-active/30">
              <Zap className="h-4 w-4 text-indicator-active" />
            </div>
            <span className="text-lg font-semibold text-foreground">Tentrist</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {marketingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA — show Dashboard if logged in */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md text-foreground-muted hover:text-foreground hover:bg-zinc-800/50 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md bg-indicator-active text-bg-base hover:bg-indicator-active/90 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md text-foreground-muted hover:text-foreground hover:bg-zinc-800/50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md bg-indicator-active text-bg-base hover:bg-indicator-active/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-foreground-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-hairline bg-bg-surface/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {marketingNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-foreground-muted hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-hairline flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md border border-hairline hover:bg-zinc-800/50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Go to Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md border border-hairline hover:bg-zinc-800/50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md bg-indicator-active text-bg-base hover:bg-indicator-active/90 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-bg-surface/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indicator-active/20 border border-indicator-active/30">
                  <Zap className="h-4 w-4 text-indicator-active" />
                </div>
                <span className="text-lg font-semibold text-foreground">Tentrist</span>
              </Link>
              <p className="text-sm text-foreground-muted">
                Decentralized GPU orchestration with SLA guarantees enforced on-chain.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-hairline flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-foreground-muted">
              © 2024 Tentrist. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono-data text-foreground-muted">
                SYS::ONLINE
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
