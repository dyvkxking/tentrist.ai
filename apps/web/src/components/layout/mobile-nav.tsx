"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronDown,
  LogOut,
  CreditCard,
  Compass,
  Shield,
  Users,
  Zap,
  AlertTriangle,
  FileText,
  Vote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const mainNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Nodes", href: "/nodes", icon: Server },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    children: [
      { label: "Top Up", href: "/billing/topup", icon: CreditCard },
      { label: "Credits", href: "/billing/credits", icon: CreditCard },
      { label: "Transactions", href: "/billing/transactions", icon: CreditCard },
      { label: "Invoices", href: "/billing/invoices", icon: FileText },
    ],
  },
  { label: "Explore", href: "/explore", icon: Compass },
];

const secondaryNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  {
    label: "Admin",
    href: "/admin",
    icon: Shield,
    children: [
      { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
      { label: "Nodes", href: "/admin/nodes", icon: Server },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
      { label: "Contracts", href: "/admin/contracts", icon: FileText },
      { label: "Governance", href: "/admin/governance", icon: Vote },
      { label: "Slashing", href: "/admin/slashing", icon: Zap },
    ],
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.has(item.href);

              if (hasChildren) {
                return (
                  <div key={item.href}>
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-indicator-active/10 text-indicator-active"
                          : "text-foreground-muted hover:bg-bg-base hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l border-hairline pl-3">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                pathname === child.href
                                  ? "bg-indicator-active/10 text-indicator-active"
                                  : "text-foreground-muted hover:bg-bg-base hover:text-foreground"
                              )}
                            >
                              <ChildIcon className="h-4 w-4" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

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
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.has(item.href);

              if (hasChildren) {
                return (
                  <div key={item.href}>
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-indicator-active/10 text-indicator-active"
                          : "text-foreground-muted hover:bg-bg-base hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l border-hairline pl-3">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                pathname === child.href
                                  ? "bg-indicator-active/10 text-indicator-active"
                                  : "text-foreground-muted hover:bg-bg-base hover:text-foreground"
                              )}
                            >
                              <ChildIcon className="h-4 w-4" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

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

        {/* Footer with logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-hairline space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indicator-slashed hover:bg-indicator-slashed/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
          <div className="text-xs text-foreground-muted pt-1">
            Tentrist v1.0.0
          </div>
        </div>
      </div>
    </>
  );
}
