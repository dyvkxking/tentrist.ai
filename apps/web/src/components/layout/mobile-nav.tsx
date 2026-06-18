"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  Server,
  BarChart3,
  Wallet,
  Settings,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Nodes", href: "/nodes", icon: Server },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Wallet", href: "/wallet", icon: Wallet },
];

const secondaryNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-bg-surface border-b border-hairline">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indicator-active/20 rounded-lg flex items-center justify-center">
              <Server className="h-4 w-4 text-indicator-active" />
            </div>
            <span className="font-semibold text-foreground">Tentrist</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-bg-base rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="h-5 w-5 text-foreground-muted" />
            ) : (
              <Menu className="h-5 w-5 text-foreground-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-14 left-0 bottom-0 w-72 z-40 bg-bg-surface border-r border-hairline transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {/* Main navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-indicator-active/10 text-indicator-active"
                      : "text-foreground-muted hover:bg-bg-base hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-hairline my-4" />

          {/* Secondary navigation */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-indicator-active/10 text-indicator-active"
                      : "text-foreground-muted hover:bg-bg-base hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-hairline">
          <div className="text-xs text-foreground-muted">
            Tentrist v1.0.0
          </div>
        </div>
      </div>
    </>
  );
}
