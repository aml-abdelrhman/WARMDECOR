"use client";

import { useState } from "react";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  Loader2,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";

import { 
  getWishlistApi, 
  getCartApi 
} from "@/features/cart/cart.api";
import { useProductActions } from "@/hooks/use-product-actions";

import {
  getProductByIdApi,
  getProductsApi,
} from "@/features/products/products.api";
import ProductCard from "@/components/ui/ProductCard";
import { QUERY_KEYS, IMAGE_FALLBACK_URL, ROUTES } from "@/constants/app";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice, calcDiscountPct, cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl bg-[#F5EFE6]" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl bg-[#F5EFE6]"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-3 w-24 bg-[#EDE4D8] rounded-full" />
          <div className="h-7 w-3/4 bg-[#EDE4D8] rounded-full" />
          <div className="h-7 w-1/2 bg-[#EDE4D8] rounded-full" />
          <div className="h-4 w-32 bg-[#EDE4D8] rounded-full" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full bg-[#EDE4D8] rounded-full" />
            <div className="h-3 w-5/6 bg-[#EDE4D8] rounded-full" />
            <div className="h-3 w-4/6 bg-[#EDE4D8] rounded-full" />
          </div>
          <div className="h-12 w-full bg-[#F5EFE6] rounded-2xl mt-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Trust badge ──────────────────────────────────────────────────────────────

function TrustBadge({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-[#C49A6C]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#7B5235]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#5C3D23]">{label}</p>
        <p className="text-xs text-[#7B5235]/70">{sub}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist } = useProductActions();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user;

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  // ── Queries ──

  const {
    data: product,
    isLoading: loadingProduct,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: () => getProductByIdApi(id),
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: QUERY_KEYS.productsByCategory(product?.category._id ?? ""),
    queryFn: () =>
      getProductsApi({ category: product!.category._id, limit: 5 }),
    enabled: !!product?.category._id,
    staleTime: 5 * 60 * 1000,
  });
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

  // ── Derived ──

  const images = useMemo(() => 
    product 
      ? [product.imageCover, ...(product.images ?? [])].filter(Boolean)
      : [], 
    [product]
  );

  const hasDiscount =
    product &&
    product.priceAfterDiscount !== undefined &&
    product.priceAfterDiscount < product.price;

  const displayPrice = hasDiscount
    ? product?.priceAfterDiscount!
    : product?.price ?? 0;

  const discountPct = hasDiscount
    ? calcDiscountPct(product!.price, product!.priceAfterDiscount!)
    : 0;

  const wishlistedIds = useMemo(() => 
    new Set(
      wishlistData?.data?.map((item: { _id: string; product?: { _id: string } }) => item.product?._id || item._id) || []
    ), [wishlistData?.data]
  );

  const cartIds = useMemo(() => 
    new Set(
      cartData?.data?.products?.map((item: { product: string | { _id: string } }) => 
        typeof item.product === 'string' ? item.product : item.product?._id
      ) || []
    ), [cartData?.data?.products]
  );

  const relatedProducts = useMemo(() => 
    (relatedData?.data ?? [])
      .filter((p) => p._id !== product?._id)
      .slice(0, 4), [relatedData?.data, product?._id]
  );

  // ── Guards ──

  if (loadingProduct)
    return (
      <div className="min-h-screen bg-[#F9F5F0]">
        <DetailSkeleton />
      </div>
    );

  if (isError || !product)
    return (
      <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <p className="text-2xl font-display font-bold text-[#5C3D23] mb-2">
            Product not found
          </p>
          <p className="text-[#7B5235]/70 text-sm mb-6">
            This product may have been removed.
          </p>
          <Link
            href={ROUTES.products}
            className="text-sm font-semibold text-[#7B5235] hover:text-[#5C3D23] transition-colors"
          >
            ← Back to products
          </Link>
        </div>
      </div>
    );

  // ── Handlers ──

  function handleAddToCart() {
    if (!product) return;
    if (!isAuthenticated) return router.push(ROUTES.login);

    if (cartIds.has(product._id)) {
      return toast.error("Product is already in your cart!");
    }

    addToCart.mutate(product._id);
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Back ── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#7B5235] hover:text-[#5C3D23] transition-colors mb-6 group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
          {/* Left: Gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#EDE4D8] shadow-sm">
              <Image
                src={images[activeImg] ?? IMAGE_FALLBACK_URL}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-opacity duration-300"
                onError={() => {}}
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-feedback-error text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-150",
                      activeImg === i
                        ? "border-[#C49A6C] shadow-md shadow-[#C49A6C]/20"
                        : "border-[#EDE4D8] hover:border-[#C49A6C]",
                    )}
                  >
                    <Image
                      src={src ?? IMAGE_FALLBACK_URL}
                      alt={`${product.title} thumbnail ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-5 pt-1">
            {/* Category + brand */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category?.name && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#C49A6C] bg-[#C49A6C]/10 px-2.5 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
              {product.brand?.name && (
                <span className="text-xs font-medium text-[#7B5235] bg-[#F5EFE6] px-2.5 py-1 rounded-full border border-[#EDE4D8]">
                  {product.brand.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold text-[#5C3D23] leading-snug tracking-tight">
              {product.title}
            </h1>

            {/* Rating + sold */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= Math.round(product.ratingsAverage)
                        ? "fill-[#C49A6C] text-[#C49A6C]"
                        : "fill-[#EDE4D8] text-[#EDE4D8]",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-[#5C3D23]">
                {product.ratingsAverage.toFixed(1)}
              </span>
              <span className="text-sm text-[#7B5235]/60 font-medium">
                ({product.ratingsQuantity} reviews)
              </span>
              <span className="text-sm text-[#7B5235]/40">·</span>
              <span className="text-sm text-[#7B5235]/60 font-medium">
                {product.sold} sold
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-black text-[#5C3D23]">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-[#7B5235]/40 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock */}
            <p
              className={cn(
                "text-sm font-bold flex items-center gap-1.5",
                product.quantity > 0
                  ? "text-feedback-success"
                  : "text-feedback-error",
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  product.quantity > 0
                    ? "bg-feedback-success"
                    : "bg-feedback-error",
                )}
              />
              {product.quantity > 0
                ? `In stock (${product.quantity} available)`
                : "Out of stock"}
            </p>

            {/* Description */}
            <p className="text-sm text-[#7B5235]/80 leading-relaxed border-t border-[#EDE4D8] pt-5">
              {product.description}
            </p>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 pt-1">
              {/* Quantity */}
              <div className="flex items-center border border-[#EDE4D8] rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() =>
                    setQty((q) => clamp(q - 1, 1, product.quantity))
                  }
                  disabled={qty <= 1}
                  className="w-10 h-11 flex items-center justify-center text-[#7B5235] hover:text-[#5C3D23] hover:bg-[#F5EFE6] disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[#5C3D23]">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => clamp(q + 1, 1, product.quantity))
                  }
                  disabled={qty >= product.quantity}
                  className="w-10 h-11 flex items-center justify-center text-[#7B5235] hover:text-[#5C3D23] hover:bg-[#F5EFE6] disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0 || addToCart.isPending}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
                  "bg-[#5C3D23] text-white shadow-lg shadow-[#5C3D23]/20 hover:bg-[#7B5235] active:scale-[0.98]",
                  (product.quantity === 0 || addToCart.isPending) &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                {addToCart.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to cart
                  </>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => {
                  if (!isAuthenticated) return router.push(ROUTES.login);
                  toggleWishlist.mutate({
                    id: product._id,
                    isWishlisted: wishlistedIds.has(product._id),
                  });
                }}
                aria-label="wishlist"
                className={cn(
                  "w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90",
                  wishlistedIds.has(product._id)
                    ? "border-[#5C3D23] bg-[#5C3D23] text-white"
                    : "border-[#EDE4D8] bg-white text-[#7B5235] hover:border-[#C49A6C] hover:text-[#5C3D23]",
                )}
              >
                <Heart
                  className="w-5 h-5"
                  fill={
                    wishlistedIds.has(product._id) ? "currentColor" : "none"
                  }
                />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-[#EDE4D8]">
              <TrustBadge
                icon={Truck}
                label="Free Delivery"
                sub="On orders over EGP 500"
              />
              <TrustBadge
                icon={ShieldCheck}
                label="Secure Payment"
                sub="100% protected checkout"
              />
              <TrustBadge
                icon={Package}
                label="Easy Returns"
                sub="30-day return policy"
              />
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 animate-fade-in">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-[#5C3D23]">
                Related Products
              </h2>
              <Link
                href={`${ROUTES.products}?category=${product.category._id}`}
                className="text-sm text-[#7B5235] hover:text-[#5C3D23] font-bold transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p, i) => (
                <div
                  key={p._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={() => {
                      if (!isAuthenticated) return router.push(ROUTES.login);
                      if (cartIds.has(p._id)) {
                        return toast.error("Product is already in your cart!");
                      }
                      addToCart.mutate(p._id);
                    }}
                    onToggleWish={() => {
                      if (!isAuthenticated) return router.push(ROUTES.login);
                      toggleWishlist.mutate({
                        id: p._id,
                        isWishlisted: wishlistedIds.has(p._id),
                      });
                    }}
                    isWishlisted={wishlistedIds.has(p._id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
