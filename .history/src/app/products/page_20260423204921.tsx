"use client";
import { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getProductsApi,
  getCategoriesApi,
} from "@/features/products/products.api";
import { getWishlistApi, getCartApi } from "@/features/cart/cart.api";
import ProductCard from "@/components/ui/ProductCard";
import { useProductActions } from "@/hooks/use-product-actions";
import {
  QUERY_KEYS,
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  ROUTES,
} from "@/constants/app";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductsQueryParams, SortOption } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low", value: "price" },
  { label: "Price: High", value: "-price" },
  { label: "Top Rated", value: "-ratingsAverage" },
  { label: "Best Selling", value: "-sold" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-[#ede4d8] overflow-hidden bg-[#f5efe6] animate-pulse">
      <div className="aspect-square bg-shimmer bg-[length:200%_100%] animate-shimmer" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2.5 w-16 bg-[#ede4d8] rounded-full" />
        <div className="h-3.5 w-full bg-[#ede4d8] rounded-full" />
        <div className="h-3.5 w-2/3 bg-[#ede4d8] rounded-full" />
        <div className="h-4 w-20 bg-[#ede4d8] rounded-full mt-3" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f5f0] flex items-center justify-center">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryKeyword = searchParams.get("keyword") || "";
  const { user, token } = useAuthStore((s) => ({ user: s.user, token: s.token }));
  const isAuthenticated = !!(user && token);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("-createdAt");
  const [searchInput, setSearchInput] = useState(queryKeyword);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // استدعاء الـ Hook الخاص بالعمليات (Cart & Wishlist)
  const { addToCart, toggleWishlist } = useProductActions();

  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (debouncedSearch) nextParams.set("keyword", debouncedSearch);
    if (categoryId) nextParams.set("category", categoryId);
    if (sort !== "-createdAt") nextParams.set("sort", sort);
    if (page > 1) nextParams.set("page", page.toString());

    const queryString = nextParams.toString();
    if (queryString !== searchParams.toString()) {
      router.replace(
        `${ROUTES.products}${queryString ? `?${queryString}` : ""}`,
        {
          scroll: false,
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryId, sort, page, router, searchParams]);

  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    const urlCategory = searchParams.get("category") || undefined;

    if (urlKeyword !== searchInput) setSearchInput(urlKeyword);
    if (urlCategory !== categoryId) setCategoryId(urlCategory);
  }, [searchParams, searchInput, categoryId]);

  // Reset page whenever filters change
  const resetPage = useCallback(() => setPage(1), []);

  const params: ProductsQueryParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    sort,
    ...(categoryId && { category: categoryId }),
  };

  // ── Queries ──

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: QUERY_KEYS.products(params),
    queryFn: () => getProductsApi(params),
    placeholderData: (prev) => prev,
  });

  const { data: categories } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategoriesApi,
    staleTime: Infinity,
  });

  // جلب بيانات المفضلة إذا كان المستخدم مسجل دخوله
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistApi,
    enabled: isAuthenticated,
  });

  // جلب بيانات السلة للتحقق من وجود المنتج مسبقاً ومنع التكرار
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartApi,
    enabled: isAuthenticated,
  });

  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const totalPages = productsData?.totalPages ?? 1;

  // ── منطق البحث المحلي (Client-side Search) ──
  const filteredProducts = useMemo(() => {
    const term = searchInput.toLowerCase().trim();
    if (!term) return products;

    return products.filter((product: { title: string; subject?: string }) => {
      const titleMatch = product.title?.toLowerCase().includes(term);
      const subjectMatch = product.subject?.toLowerCase().includes(term);
      return titleMatch || subjectMatch;
    });
  }, [products, searchInput]);

  // تحويل قائمة المفضلة إلى مصفوفة IDs للتحقق السريع
  const wishlistedIds = new Set(
    wishlistData?.data?.map((item: { _id: string; product?: { _id: string } }) => item.product?._id || item._id) || [],
  );

  // تحويل قائمة السلة إلى مصفوفة IDs
  const cartIds = new Set(
    cartData?.data?.products?.map(
      (item: { product: string | { _id: string } }) => typeof item.product === 'string' ? item.product : item.product?._id,
    ) || [],
  );

  // ── Handlers ──

  function handleCategoryChange(id: string | undefined) {
    setCategoryId(id);
    resetPage();
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    resetPage();
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchInput(val);
    resetPage();
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18">
        {/* ── Page Header ── */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl font-bold text-[#5c3d23] tracking-tight">
            All Products
          </h1>
          <p className="text-[#7b5235]/70 text-sm mt-1">
            {productsData?.results !== undefined
              ? `${filteredProducts.length} products found`
              : "Explore our full collection"}
          </p>
        </div>

        {/* ── Search + Filter bar ── */}
        <div
          className="flex items-center gap-3 mb-6 animate-fade-in"
          style={{ animationDelay: "60ms" }}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search products…"
              className="
                w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface
                text-sm text-ink placeholder:text-ink-disabled
                outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                transition-all duration-150
              "
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  resetPage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="
              px-3 py-2.5 rounded-xl border border-[#ede4d8] bg-white
              text-sm text-[#5c3d23] outline-none
              focus:ring-2 focus:ring-[#c49a6c]/20 focus:border-[#c49a6c]
              transition-all duration-150 cursor-pointer
            "
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150",
              showFilters
                ? "bg-[#5c3d23] border-[#5c3d23] text-white"
                : "bg-white border-[#ede4d8] text-[#7b5235] hover:border-[#c49a6c]",
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* ── Category filters ── */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                categoryId === undefined
                  ? "bg-[#5c3d23] border-[#5c3d23] text-white shadow-md"
                  : "bg-white border-[#ede4d8] text-[#7b5235] hover:border-[#c49a6c]",
              )}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat._id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                  categoryId === cat._id
                    ? "bg-[#5c3d23] border-[#5c3d23] text-white shadow-md"
                    : "bg-white border-[#ede4d8] text-[#7b5235] hover:border-[#c49a6c]",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#f5efe6] flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#c49a6c]/50" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#5c3d23] mb-1">
              No products found
            </h3>
            <p className="text-[#7b5235]/70 text-sm">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchInput("");
                setCategoryId(undefined);
                resetPage();
              }}
              className="mt-4 text-sm text-[#7b5235] hover:text-[#5c3d23] font-semibold transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, i) => (
              <div
                key={product._id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={() => {
                    if (!isAuthenticated) {
                      router.push(ROUTES.login);
                      return;
                    }
                    const pid = product._id || (product as any).id;
                    if (cartIds.has(pid)) {
                      toast.error("Product is already in your cart!");
                      return;
                    }
                    addToCart.mutate(pid, {
                      onSuccess: () => toast.success("Added to cart successfully!"),
                      onError: (err: any) => 
                        toast.error(err?.response?.data?.message || "Failed to add to cart.")
                    });
                  }}
                  onToggleWish={() => {
                    if (!isAuthenticated) {
                      router.push(ROUTES.login);
                      return;
                    }
                    const pid = product._id || (product as any).id;
                    const isWishlisted = wishlistedIds.has(pid);
                    toggleWishlist.mutate({
                      id: pid,
                      isWishlisted: isWishlisted,
                    }, {
                      onSuccess: () => toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
                    });
                  }}
                  isWishlisted={wishlistedIds.has(product._id || (product as any).id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 animate-fade-in">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl border border-[#ede4d8] bg-[#f5efe6] flex items-center justify-center text-[#5c3d23] hover:border-[#c49a6c] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (arr[idx - 1] as number) < p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-9 text-center text-sm text-[#c49a6c]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-sm font-semibold border transition-all duration-150",
                      page === p
                        ? "bg-[#5c3d23] border-[#5c3d23] text-white shadow-md"
                        : "bg-[#f5efe6] border-[#ede4d8] text-[#7b5235] hover:border-[#c49a6c]",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl border border-[#ede4d8] bg-[#f5efe6] flex items-center justify-center text-[#5c3d23] hover:border-[#c49a6c] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
