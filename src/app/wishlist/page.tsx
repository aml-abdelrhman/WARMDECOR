"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";

import {
  getWishlistApi,
  removeFromWishlistApi,
  addToCartApi,
} from "@/features/cart/cart.api";
import ProductCard from "@/components/ui/ProductCard";
import { QUERY_KEYS, ROUTES } from "@/constants/app";
import { isAppError } from "@/lib/axios";
import type { Product } from "@/types";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-[2rem] border border-[#C49A6C]/10 overflow-hidden bg-white">
          <div className="aspect-[4/5] bg-[#FAF7F2]" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-20 bg-[#FAF7F2] rounded-full" />
            <div className="h-4 w-full bg-[#FAF7F2] rounded-full" />
            <div className="h-5 w-24 bg-[#FAF7F2] rounded-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const qc = useQueryClient();

  // جلب البيانات
  const { data: wishlistData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: getWishlistApi,
  });

  // مسح عنصر
  const { mutate: removeItem, variables: removingId } = useMutation({
    mutationFn: (productId: string) => removeFromWishlistApi(productId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.wishlist });
      toast.success("Removed from your collection.");
    },
    onError: (e: unknown) =>
      toast.error(isAppError(e) ? e.message : "Failed to remove."),
  });

  // نقل للسلة
  const { mutate: moveToCart, variables: movingId } = useMutation({
    mutationFn: async (product: Product) => {
      await addToCartApi(product._id);
      await removeFromWishlistApi(product._id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.wishlist });
      toast.success("Added to your shopping bag!");
    },
    onError: (e: unknown) =>
      toast.error(isAppError(e) ? e.message : "Failed to move item."),
  });

  const products = wishlistData?.data ?? [];
  const wishlistedIds = new Set(products.map((p) => p._id));

  // ── Empty state ──
  if (!isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-[#FAF7F2] border border-[#C49A6C]/20 flex items-center justify-center mx-auto mb-8 relative">
            <Heart className="w-10 h-10 text-[#C49A6C]/30" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#C49A6C] rounded-full border-4 border-white" />
          </div>
          <h2 className="font-serif text-3xl font-light text-[#4A3427] mb-3">
            Your Wishlist is <span className="italic">Empty</span>
          </h2>
          <p className="text-[#8C7A6B] text-sm mb-10 leading-relaxed">
            It looks like you haven&apos;t saved any treasures yet. Explore our collection and find something special.
          </p>
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-3 bg-[#4A3427] text-[#FAF7F2] font-medium text-sm px-8 py-4 rounded-full hover:bg-[#5C3D23] transition-all shadow-lg shadow-brown/10"
          >
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      {/* Hero Header */}
      <div className="bg-[#FAF7F2] border-b border-[#C49A6C]/10 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-[#C49A6C] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                <Link href="/" className="hover:text-[#4A3427]">Home</Link>
                <span>/</span>
                <span>Wishlist</span>
              </nav>
              <h1 className="font-serif text-5xl md:text-6xl text-[#4A3427] tracking-tighter">
                My <span className="italic text-[#C49A6C]">Collection</span>
              </h1>
              <p className="text-[#8C7A6B] mt-4 font-light">
                You have <span className="font-semibold text-[#C49A6C]">{products.length}</span> curated items saved.
              </p>
            </div>

            {products.length > 0 && (
              <button
                onClick={() => products.forEach((p) => moveToCart(p))}
                className="flex items-center gap-3 bg-white border border-[#C49A6C]/30 text-[#4A3427] px-8 py-4 rounded-full text-sm font-bold hover:bg-[#4A3427] hover:text-white transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Move All To Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <WishlistSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <div
                key={product._id}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Loading overlay */}
                {(removingId === product._id || (typeof movingId === 'object' && movingId?._id === product._id)) && (
                  <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#C49A6C] border-t-transparent animate-spin" />
                  </div>
                )}

                {/* Card Container - Adding custom styles for a premium look */}
                <div className="relative bg-white rounded-[2rem] border border-[#C49A6C]/10 overflow-hidden hover:shadow-[0_20px_50px_rgba(196,154,108,0.1)] transition-all duration-500">
                  <ProductCard
                    product={product}
                    isWishlisted={wishlistedIds.has(product._id)}
                    onAddToCart={(p) => moveToCart(p)}
                    onToggleWish={(p) => removeItem(p._id)}
                  />

                  {/* Elegant Remove Button Overriding Default */}
                  <button
                    onClick={() => removeItem(product._id)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#C49A6C]/20 flex items-center justify-center text-[#8C7A6B] hover:text-[#E5484D] hover:scale-110 transition-all duration-300"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Call to Action */}
        {!isLoading && products.length > 0 && (
          <div className="mt-20 text-center py-12 border-t border-[#C49A6C]/10">
            <p className="text-[#8C7A6B] mb-6 italic">Looking for something else?</p>
            <Link 
              href={ROUTES.products}
              className="text-[#4A3427] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:gap-4 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Browsing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}