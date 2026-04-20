"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { getCartApi } from "@/features/cart/cart.api";
import { getWishlistApi } from "@/features/cart/cart.api";
import {
  QUERY_KEYS,
  ROUTES,
} from "@/constants/app";
import { cn } from "@/lib/utils";

// ─── Routes where Navbar is hidden ───────────────────────────────────────────

const HIDDEN_ON = ["/admin", "/auth"];

// ─── User dropdown ────────────────────────────────────────────────────────────

function UserMenu({
  name,
  role,
  onLogout,
}: {
  name: string;
  role: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isAdmin = role === "admin";

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#C49A6C]/10 border border-transparent hover:border-[#C49A6C]/20 transition-all duration-150"
      >
        <div className="w-7 h-7 rounded-full bg-[#5C3D23] flex items-center justify-center">
          <span className="text-xs font-bold text-[#F5EFE6]">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-[#5C3D23] hidden sm:block max-w-[80px] truncate">
          {name.split(" ")[0]}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[#C49A6C] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#F5EFE6] border border-[#C49A6C]/30 rounded-2xl shadow-xl py-1.5 z-50 animate-scale-in">
          {/* User info */}
          <div className="px-4 py-2.5 border-b border-[#C49A6C]/20">
            <p className="text-xs font-bold text-[#5C3D23] truncate">{name}</p>
            <p className="text-2xs text-[#C49A6C] capitalize mt-0.5 font-semibold tracking-wide">
              {role}
            </p>
          </div>

          {!isAdmin && (
            <>
              <Link
                href={ROUTES.profile}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#5C3D23] hover:bg-[#C49A6C]/10 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>

              <Link
                href={ROUTES.orders}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#5C3D23] hover:bg-[#C49A6C]/10 transition-colors"
              >
                <Package className="w-4 h-4" />
                My Orders
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href={ROUTES.admin}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C49A6C] font-bold hover:bg-[#C49A6C]/5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          <div className="border-t border-[#C49A6C]/20 mt-1 pt-1">
            <button
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Icon button with badge ───────────────────────────────────────────────────

function IconBtn({
  href,
  icon: Icon,
  badge,
  label,
}: {
  href: string;
  icon: React.ElementType;
  badge?: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl text-[#5C3D23] hover:bg-[#C49A6C]/10 transition-all duration-150"
    >
      <Icon className="w-5 h-5" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C49A6C] text-[#F5EFE6] text-2xs font-bold rounded-full flex items-center justify-center leading-none">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();

  const isAuthenticated = useAuthStore((s) => !!(s.user && s.token));
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // ── Hide on admin + auth pages ──
  const isHidden = HIDDEN_ON.some((r) => pathname.startsWith(r));

  // ── Fetch badge counts (only when authenticated) ──
  const { data: cartData } = useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: getCartApi,
    enabled: isAuthenticated && !isHidden,
  });

  const { data: wishData } = useQuery({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: getWishlistApi,
    enabled: isAuthenticated && !isHidden,
  });

  if (isHidden) return null;

  const cartCount = cartData?.numOfCartItems ?? 0;
  const wishCount = wishData?.data?.length ?? 0;

  return (
    <>
      <header className="fixed top-0 z-40 w-full bg-[#F5EFE6]/95 backdrop-blur-md border-b border-[#C49A6C]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            {/* ── Logo ── */}
            <Link
              href={ROUTES.home}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#5C3D23] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4 text-[#F5EFE6]" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-black text-[#5C3D23] hidden sm:block tracking-tight">
                WARM<span className="text-[#C49A6C]">DECOR</span>
              </span>
            </Link>

           

            {/* ── Spacer ── */}
            <div className="flex-1" />

            {/* ── Icon buttons (auth only) ── */}
            {isAuthenticated && (
              <>
                <IconBtn
                  href={ROUTES.wishlist}
                  icon={Heart}
                  badge={wishCount}
                  label="Wishlist"
                />
                <IconBtn
                  href={ROUTES.cart}
                  icon={ShoppingCart}
                  badge={cartCount}
                  label="Cart"
                />
              </>
            )}

            {/* ── Auth section ── */}
            {isAuthenticated && user ? (
              <UserMenu
                name={user.name}
                role={user.role}
                onLogout={clearAuth}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={ROUTES.login}
                  className="hidden sm:flex text-sm font-bold text-[#5C3D23] hover:text-[#C49A6C] transition-colors px-3 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href={ROUTES.register}
                  className="text-sm font-bold text-[#F5EFE6] bg-[#C49A6C] px-5 py-2.5 rounded-xl shadow-md hover:bg-[#5C3D23] transition-all active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}

          </div>
        </div>
      </header>
    </>
  );
}
