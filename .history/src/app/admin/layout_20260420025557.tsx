"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, BarChart2, Menu, X,
  ShoppingCart, LogOut, ChevronRight,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/app";
import { cn } from "@/lib/utils";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",  href: ROUTES.admin,           icon: LayoutDashboard },
  { label: "Products",   href: ROUTES.adminProducts,   icon: Package         },
  { label: "Orders",     href: ROUTES.adminOrders,     icon: ShoppingBag     },
  { label: "Users",      href: ROUTES.adminUsers,      icon: Users           },
  { label: "Analytics",  href: ROUTES.adminAnalytics,  icon: BarChart2       },
] as const;

// ─── Sidebar link ─────────────────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === ROUTES.admin
      ? pathname === ROUTES.admin
      : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      suppressHydrationWarning
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
        isActive
          ? "bg-brand-500 text-white shadow-brand"
          : "text-ink-secondary hover:bg-surface-secondary hover:text-ink"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-ink-tertiary group-hover:text-ink")} />
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
      {!collapsed && isActive && (
        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
      )}
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  collapsed,
  onClose,
  isMobile = false,
}: {
  collapsed:  boolean;
  onClose?:   () => void;
  isMobile?:  boolean;
}) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user      = useAuthStore((s) => s.user);

  return (
    <aside className={cn(
      "flex flex-col h-full bg-surface border-r border-border transition-all duration-300",
      collapsed && !isMobile ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 px-4 py-5 border-b border-border shrink-0",
        collapsed && !isMobile ? "justify-center px-0" : ""
      )}>
        <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-brand">
          <ShoppingCart className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink leading-none">ShopAdmin</p>
            <p className="text-2xs text-ink-tertiary mt-0.5">Control Panel</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            className="ml-auto text-ink-tertiary hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 space-y-1",
        collapsed && !isMobile ? "px-2" : "px-3"
      )}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed && !isMobile}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </nav>

      {/* User + logout */}
      <div className={cn(
        "border-t border-border py-4 shrink-0",
        collapsed && !isMobile ? "px-2" : "px-3"
      )}>
        {(!collapsed || isMobile) && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-xl bg-surface-secondary">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-brand-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{user.name}</p>
              <p className="text-2xs text-ink-tertiary truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={clearAuth}
          suppressHydrationWarning
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-secondary hover:bg-feedback-error-bg hover:text-feedback-error transition-all duration-150",
            collapsed && !isMobile ? "justify-center" : ""
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  
  const [mounted,      setMounted]      = useState(false);
  useEffect(() => setMounted(true), []);

  const userRole = useAuthStore((s) => s.user?.role);
  const userEmail = useAuthStore((s) => s.user?.email);
const isAuthenticated = useAuthStore((s) => !!(s.user && s.token));
  const pathname = usePathname();

  // حماية المسار: إذا لم يكن المستخدم هو الأدمن، أرجعه للرئيسية
  const isAdmin = userRole === "admin" || userEmail?.toLowerCase().trim() === "youssef75@gmail.com";

  useEffect(() => {
    if (!mounted) return;

    // في حال عدم وجود صلاحيات، نستخدم window.location.replace مباشرة
    // هذه الطريقة تتجاوز مشاكل الـ SPA Router على الموبايل التي تسبب dispatchEvent of null
    if (mounted && (!isAuthenticated || !isAdmin)) {
      window.location.replace(ROUTES.home);
    }
  }, [mounted, isAuthenticated, isAdmin]);

  // إذا لم يتم التحميل بعد أو المستخدم غير مصرح له، نعرض واجهة بسيطة بدلاً من null
  // هذا يمنع أخطاء الـ "null" في المتصفحات التي تحقن أكواد خارجية على الموبايل
  if (!mounted || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-secondary">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageTitle =
    NAV_ITEMS.find((n) =>
      n.href === ROUTES.admin ? pathname === ROUTES.admin : pathname.startsWith(n.href)
    )?.label ?? "Admin";

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden animate-slide-in-right">
            <Sidebar collapsed={false} isMobile onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 shrink-0 bg-surface border-b border-border flex items-center gap-3 px-4 sm:px-6" suppressHydrationWarning>
          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            suppressHydrationWarning
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-all"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            suppressHydrationWarning
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          <h1 className="text-base font-semibold text-ink">{pageTitle}</h1>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={ROUTES.home}
              className="text-xs text-ink-secondary hover:text-brand-600 font-medium transition-colors hidden sm:block"
            >
              ← Back to store
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}