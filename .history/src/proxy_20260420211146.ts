import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY, ROUTES } from "@/constants/app";

// ─── Route Groups ─────────────────────────────────────────────────────────────

/** Routes only accessible when NOT authenticated */
const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

/** Routes that require authentication */
const PROTECTED_ROUTES = [
  ROUTES.cart,
  ROUTES.wishlist,
  ROUTES.checkout,
  ROUTES.orders,
  ROUTES.profile,
];

/** Routes that require admin role */
const ADMIN_ROUTES = [ROUTES.admin];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token    = request.cookies.get(TOKEN_COOKIE_KEY)?.value;
  const userRaw  = request.cookies.get(USER_COOKIE_KEY)?.value;

  const isLoggedIn = !!token;

  // Parse role safely
  let role: string | undefined;
  if (userRaw) {
    try {
      const parsed = JSON.parse(userRaw) as { role?: string };
      role = parsed.role;
    } catch {
      role = undefined;
    }
  }

  // ── 1. Authenticated user tries to visit auth pages → redirect home ──
  if (isLoggedIn && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url));
  }

  // ── 2. Unauthenticated user tries to visit protected routes → login ──
  if (!isLoggedIn && isProtectedRoute(pathname)) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Non-admin tries to visit admin routes → home ──
  if (isAdminRoute(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL(ROUTES.home, request.url));
    }
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Exclude static files, images, and Next.js internals from middleware

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts|api).*)",
  ],
};
