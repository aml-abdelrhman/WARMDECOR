"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types";
import { ROUTES, IMAGE_FALLBACK_URL } from "@/constants/app";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product:       Product;
  isWishlisted?: boolean;
  onAddToCart?:  (product: Product) => void;
  onToggleWish?: (product: Product) => void;
  className?:    string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductCard({
  product,
  isWishlisted = false,
  onAddToCart,
  onToggleWish,
  className,
}: ProductCardProps) {
  const [imgSrc,    setImgSrc]    = useState(product.imageCover ?? IMAGE_FALLBACK_URL);
  const [cartAnim,  setCartAnim]  = useState(false);
  const [wishAnim,  setWishAnim]  = useState(false);

  const hasDiscount =
    product.priceAfterDiscount !== undefined &&
    product.priceAfterDiscount < product.price;

  const discountPct = hasDiscount
    ? Math.round(
        ((product.price - (product.priceAfterDiscount ?? 0)) / product.price) *
          100
      )
    : 0;

  const displayPrice = hasDiscount
    ? product.priceAfterDiscount!
    : product.price;

  // ── Handlers ──

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCartAnim(true);
    setTimeout(() => setCartAnim(false), 600);
    onAddToCart?.(product);
  }

  function handleToggleWish(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWishAnim(true);
    setTimeout(() => setWishAnim(false), 400);
    onToggleWish?.(product);
  }

  return (
    <Link
      href={ROUTES.product(product._id)}
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl border border-[#EDE4D8]",
        "shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        "overflow-hidden",
        className
      )}
    >
      {/* ── Image wrapper ── */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#F9F5F0]">
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgSrc(IMAGE_FALLBACK_URL)}
        />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#5C3D23] text-[#F5EFE6] text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
            -{discountPct}%
          </span>
        )}

        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-2">
          {/* Wishlist */}
          <button
            onClick={handleToggleWish}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shadow-medium",
              "transition-all duration-200 active:scale-90",
              wishAnim && "scale-125",
              isWishlisted
                ? "bg-[#5C3D23] text-white"
                : "bg-white/90 backdrop-blur-sm text-[#7B5235] hover:text-[#5C3D23]"
            )}
          >
            <Heart
              className="w-4 h-4 transition-all"
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Quick add to cart – slides up on hover */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-spring">
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "bg-[#5C3D23] text-white text-sm font-bold",
              "py-3 transition-opacity duration-150",
              "hover:bg-[#7B5235] active:opacity-100",
              cartAnim && "opacity-70"
            )}
          >
            <ShoppingCart className={cn("w-4 h-4", cartAnim && "animate-bounce")} />
            Add to cart
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3.5 gap-1.5">
        {/* Category */}
        {product.category?.name && (
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C49A6C]">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm font-bold text-[#5C3D23] line-clamp-2 leading-snug group-hover:text-[#7B5235] transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-auto pt-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-ink">
            {product.ratingsAverage.toFixed(1)}
          </span>
          <span className="text-2xs text-ink-tertiary">
            ({product.ratingsQuantity})
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-black text-[#5C3D23]">
            {displayPrice.toLocaleString("en-EG", {
              style:    "currency",
              currency: "EGP",
              maximumFractionDigits: 0,
            })}
          </span>
          {hasDiscount && (
            <span className="text-xs text-ink-tertiary line-through">
              {product.price.toLocaleString("en-EG", {
                style:    "currency",
                currency: "EGP",
                maximumFractionDigits: 0,
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}