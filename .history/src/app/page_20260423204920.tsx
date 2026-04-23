"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
} from "lucide-react";

import { getProductsApi } from "@/features/products/products.api";
import { QUERY_KEYS, ROUTES } from "@/constants/app";
import { getWishlistApi, getCartApi } from "@/features/cart/cart.api";
import { useAuthStore } from "@/store/auth.store";
import { useProductActions } from "@/hooks/use-product-actions";
import { Hero } from "@/components/home/hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductSwiper } from "@/components/home/ProductSwiper";
import PromoBanner from "@/components/home/PromoBanner";
import ReviewsPage from "@/components/home/reviews";
import StoryStrip from "@/app/story/page";
import toast from "react-hot-toast";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { user, token } = useAuthStore((s) => ({ user: s.user, token: s.token }));
  const isAuthenticated = !!(user && token);

  // منطق العمليات (Cart & Wishlist)
  const { addToCart, toggleWishlist } = useProductActions();

  // جلب بيانات المفضلة والسلة للمستخدم
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistApi,
    enabled: isAuthenticated,
  });

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartApi,
    enabled: isAuthenticated,
  });

  // استخراج معرفات المنتجات بشكل مرن
  const wishlistedIds = useMemo(() => {
    const data = wishlistData?.data || (Array.isArray(wishlistData) ? wishlistData : []);
    return new Set(
      data.map((item: any) => item.product?._id || item._id || (typeof item === 'string' ? item : '')).filter(Boolean)
    );
  }, [wishlistData]);

  const cartIds = useMemo(() => {
    const productsArray = cartData?.data?.products || cartData?.products || [];
    return new Set(
      productsArray.map((item: any) => 
        typeof item.product === 'string' ? item.product : (item.product?._id || item._id || '')
      ).filter(Boolean)
    );
  }, [cartData]);

  const handleAddToCart = useCallback((product: any) => {
    if (!isAuthenticated) {
      router.push(ROUTES.login);
      return;
    }
    const pid = product._id || product.id;
    if (cartIds.has(pid)) {
      toast.error("Product is already in your cart!");
      return;
    }
    addToCart.mutate(pid, {
      onSuccess: () => toast.success("Added to cart successfully!"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to add to cart.")
    });
  }, [isAuthenticated, cartIds, addToCart, router]);

  const handleToggleWish = useCallback((product: any) => {
    if (!isAuthenticated) {
      router.push(ROUTES.login);
      return;
    }
    const pid = product._id || product.id;
    const isWishlisted = wishlistedIds.has(pid);
    toggleWishlist.mutate({ id: pid, isWishlisted }, {
      onSuccess: () => toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
    });
  }, [isAuthenticated, wishlistedIds, toggleWishlist, router]);

  const { data: bestSellers, isLoading: loadingBest } = useQuery({
    queryKey: QUERY_KEYS.products({ sort: "-sold", limit: 8 }),
    queryFn:  () => getProductsApi({ sort: "-sold", limit: 8 }),
  });

  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: QUERY_KEYS.products({ sort: "-createdAt", limit: 4 }),
    queryFn:  () => getProductsApi({ sort: "-createdAt", limit: 4 }),
  });

  const { data: topRated, isLoading: loadingRated } = useQuery({
    queryKey: QUERY_KEYS.products({ sort: "-ratingsAverage", limit: 4 }),
    queryFn:  () => getProductsApi({ sort: "-ratingsAverage", limit: 4 }),
  });

  return (
    <div className="bg-[#f9f5f0] min-h-screen">
      <Hero />
      <TrustBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        
        {/* Best Sellers */}
        <ProductSwiper
          title="Best Sellers"
          sub="What everyone's buying right now"
          href={`${ROUTES.products}?sort=-sold`}
          products={bestSellers?.data}
          isLoading={loadingBest}
          onAddToCart={handleAddToCart}
          onToggleWish={handleToggleWish}
          wishlistedIds={wishlistedIds}
        />

        {/* Promo banner */}
        <PromoBanner />

        {/* New Arrivals + Top Rated side by side */}
        <div className="space-y-14">
          <ProductSwiper
            title="New Arrivals"
            sub="Fresh drops this week"
            href={`${ROUTES.products}?sort=-createdAt`}
            products={newArrivals?.data}
            isLoading={loadingNew}
            slidesPerView={4}
            onAddToCart={handleAddToCart}
            onToggleWish={handleToggleWish}
            wishlistedIds={wishlistedIds}
          />
          <ProductSwiper
            title="Top Rated"
            sub="Loved by our community"
            href={`${ROUTES.products}?sort=-ratingsAverage`}
            products={topRated?.data}
            isLoading={loadingRated}
            slidesPerView={4}
            onAddToCart={handleAddToCart}
            onToggleWish={handleToggleWish}
            wishlistedIds={wishlistedIds}
          />
        </div>

        {/* Story Strip */}
        <StoryStrip />

        {/* CTA Footer */}
        <section className="text-center py-6">
          <h2 className="font-display text-3xl font-bold text-[#5C3D23] mb-2">
            Ready to explore more?
          </h2>
          <p className="text-[#5C3D23]/60 text-sm mb-6 max-w-sm mx-auto">
            Thousands of products waiting for you — new deals added daily.
          </p>
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-2 bg-[#5C3D23] text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:bg-[#7b5235] active:scale-[0.98] transition-all"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
          <ReviewsPage />
        </section>
      </div>
    </div>
  );
}