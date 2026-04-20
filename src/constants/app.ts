// ─── API ──────────────────────────────────────────────────────────────────────

export const API_BASE_URL = "https://ecommerce.routemisr.com/api/v1" as const;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const TOKEN_COOKIE_KEY = "ec_token" as const;
export const USER_COOKIE_KEY  = "ec_user"  as const;
export const COOKIE_EXPIRES_DAYS = 7;

// ─── React Query Keys ─────────────────────────────────────────────────────────
// Centralised so refetches, invalidations and cache reads are always in sync.

export const QUERY_KEYS = {
  // Auth
  currentUser: ["currentUser"] as const,

  // Products
  products:       (params?: Record<string, unknown>) =>
    params ? (["products", params] as const) : (["products"] as const),
  product:        (id: string) => ["product", id] as const,
  categories:     ["categories"] as const,
  productsByCategory: (category: string) =>
    ["products", "category", category] as const,

  // Cart
  cart: ["cart"] as const,

  // Wishlist
  wishlist: ["wishlist"] as const,
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE   = 10;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  home:           "/",
  products:       "/products",
  product:        (id: string) => `/products/${id}`,
  cart:           "/cart",
  wishlist:       "/wishlist",
  checkout:       "/checkout",
  orders:         "/orders",
  profile:        "/profile",

  // Auth
  login:          "/auth/login",
  register:       "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword:  "/auth/reset-password",

  // Admin
  admin:                "/admin",
  adminProducts:        "/admin/products",
  adminOrders:          "/admin/orders",
  adminUsers:           "/admin/users",
  adminAnalytics:       "/admin/analytics",
} as const;

// ─── UI ───────────────────────────────────────────────────────────────────────

export const TOAST_DURATION = 3000;

export const BREAKPOINTS = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  "2xl": 1536,
} as const;

// ─── Limits ───────────────────────────────────────────────────────────────────

export const MAX_CART_QUANTITY     = 99;
export const MIN_SEARCH_CHARS      = 2;
export const SEARCH_DEBOUNCE_MS    = 400;
export const IMAGE_FALLBACK_URL    = "/images/placeholder-product.svg";