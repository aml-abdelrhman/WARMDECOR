"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Loader2,
  Tag,
  ArrowLeft,
} from "lucide-react";

import { getCartApi } from "@/features/cart/cart.api";
import { useProductActions } from "@/hooks/use-product-actions";
import { QUERY_KEYS, ROUTES, IMAGE_FALLBACK_URL } from "@/constants/app";
import { formatPrice, cn, clamp } from "@/lib/utils";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex gap-4 bg-white rounded-[2rem] p-5 border border-[#C49A6C]/10"
        >
          <div className="w-24 h-24 rounded-2xl bg-[#FAF7F2] shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-4 w-2/3 bg-[#FAF7F2] rounded-full" />
            <div className="h-3 w-1/4 bg-[#FAF7F2] rounded-full" />
            <div className="h-5 w-20 bg-[#FAF7F2] rounded-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Cart Item Row ─────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onUpdate,
  onRemove,
  updating,
}: {
  item: { product: { _id: string; title: string; imageCover?: string; category?: { name: string } }; price: number; count: number };
  onUpdate: (id: string, count: number) => void;
  onRemove: (id: string) => void;
  updating: boolean;
}) {
  const subtotal = item.price * item.count;

  return (
    <div
      className={cn(
        "flex gap-5 bg-white rounded-[2rem] p-5 border border-[#C49A6C]/10",
        "hover:shadow-[0_15px_40px_rgba(196,154,108,0.08)] transition-all duration-300",
        updating && "opacity-50 pointer-events-none"
      )}
    >
      {/* Image Container */}
      <Link href={ROUTES.product(item.product._id)} className="shrink-0">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#C49A6C]/5">
          <Image
            src={item.product.imageCover ?? IMAGE_FALLBACK_URL}
            alt={item.product.title}
            fill
            sizes="96px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Product Info & Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <Link
              href={ROUTES.product(item.product._id)}
              className="text-base font-serif text-[#4A3427] hover:text-[#C49A6C] transition-colors line-clamp-1 italic"
            >
              {item.product.title}
            </Link>
            <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#C49A6C] mt-1">
              {item.product.category?.name || "Premium Selection"}
            </p>
          </div>
          <button
            onClick={() => onRemove(item.product._id)}
            className="text-[#8C7A6B]/40 hover:text-[#E5484D] transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Custom Modern Quantity Controls */}
          <div className="flex items-center bg-[#FAF7F2] rounded-full p-1 border border-[#C49A6C]/10">
            <button
              onClick={() => onUpdate(item.product._id, clamp(item.count - 1, 1, 99))}
              disabled={item.count <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#4A3427] hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-[#4A3427]">
              {item.count}
            </span>
            <button
              onClick={() => onUpdate(item.product._id, clamp(item.count + 1, 1, 99))}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#4A3427] hover:bg-white hover:shadow-sm transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="font-serif text-[#4A3427] text-lg font-light">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────────────────

export default function CartPage() {
  const { data: cart, isLoading } = useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: getCartApi,
  });

  const { updateCartItem, removeCartItem, clearCart } = useProductActions();

  const items = cart?.data?.products ?? [];
  const itemCount = cart?.numOfCartItems ?? 0;
  const total = cart?.data?.totalCartPrice ?? 0;
  const discountedTotal = cart?.data?.totalPriceAfterDiscount;
  const hasDiscount = discountedTotal !== undefined && discountedTotal < total;
  const displayTotal = hasDiscount ? discountedTotal! : total;

  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-[2rem] bg-[#FAF7F2] border border-[#C49A6C]/20 flex items-center justify-center mx-auto mb-8 shadow-sm rotate-3">
            <ShoppingCart className="w-10 h-10 text-[#C49A6C]/40" />
          </div>
          <h2 className="font-serif text-3xl text-[#4A3427] mb-3">
            Your Cart is <span className="italic">Empty</span>
          </h2>
          <p className="text-[#8C7A6B] text-sm mb-10 leading-relaxed">
            Discover our latest collections and start adding items to your bag.
          </p>
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-3 bg-[#4A3427] text-[#FAF7F2] font-medium text-sm px-10 py-4 rounded-full hover:bg-[#5C3D23] transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Premium Header Section */}
      <div className="bg-[#FAF7F2] border-b border-[#C49A6C]/10 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#C49A6C] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                <span>Shop</span>
                <span className="w-1 h-1 rounded-full bg-[#C49A6C]" />
                <span>Your Selection</span>
              </div>
              <h1 className="font-serif text-5xl text-[#4A3427] tracking-tighter">
                Shopping <span className="italic text-[#C49A6C]">Bag</span>
              </h1>
              <p className="text-[#8C7A6B] mt-4 font-light italic">
                {itemCount} curated {itemCount === 1 ? "piece" : "pieces"} waiting for you.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={() => clearCart.mutate()}
                disabled={clearCart.isPending}
                className="group flex items-center gap-2 text-xs font-bold text-[#8C7A6B] hover:text-[#E5484D] transition-colors disabled:opacity-50"
              >
                {clearCart.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 group-hover:shake" />
                )}
                <span>Clear Entire Bag</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* ── Items List ── */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <CartSkeleton />
            ) : (
              items.map((item, i) => (
                <div key={item._id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <CartItemRow
                    item={item}
                    updating={
                      updateCartItem.isPending &&
                      updateCartItem.variables?.productId === item.product._id
                    }
                    onUpdate={(productId, count) =>
                      updateCartItem.mutate({ productId, count })
                    }
                    onRemove={(productId) => removeCartItem.mutate(productId)}
                  />
                </div>
              ))
            )}

            <Link 
              href={ROUTES.products}
              className="inline-flex items-center gap-2 text-[#C49A6C] font-bold text-xs uppercase tracking-widest mt-4 hover:gap-4 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Curating
            </Link>
          </div>

          {/* ── Order Summary (The Sticky Receipt) ── */}
          <div className="lg:sticky lg:top-10">
            <div className="bg-white rounded-[2.5rem] border border-[#C49A6C]/10 p-8 shadow-[0_30px_60px_-15px_rgba(196,154,108,0.12)]">
              <h2 className="font-serif text-2xl text-[#4A3427] mb-8 italic border-b border-[#FAF7F2] pb-4">
                Summary
              </h2>

              <div className="space-y-5 text-sm">
                <div className="flex justify-between text-[#8C7A6B]">
                  <span className="font-light">Subtotal</span>
                  <span className="font-serif text-[#4A3427] text-base">
                    {formatPrice(total)}
                  </span>
                </div>

                {hasDiscount && (
                  <div className="flex justify-between text-[#C49A6C] bg-[#FAF7F2] p-3 rounded-2xl">
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                      <Tag className="w-3.5 h-3.5" />
                      Privilege Discount
                    </span>
                    <span className="font-serif">
                      -{formatPrice(total - discountedTotal!)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#8C7A6B]">
                  <span className="font-light">Shipping</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C49A6C]">
                    Complimentary
                  </span>
                </div>

                <div className="pt-8 mt-2 border-t border-[#FAF7F2] flex justify-between items-baseline">
                  <span className="font-serif text-xl text-[#4A3427]">Total</span>
                  <div className="text-right">
                    <span className="block font-serif text-3xl text-[#4A3427]">
                      {formatPrice(displayTotal)}
                    </span>
                    <p className="text-[10px] text-[#8C7A6B] mt-1 italic">Tax included</p>
                  </div>
                </div>
              </div>

              <Link
                href={ROUTES.checkout}
                className="
                  mt-10 w-full flex items-center justify-center gap-3
                  bg-[#4A3427] text-[#FAF7F2] font-bold text-sm uppercase tracking-[0.15em]
                  py-5 rounded-full shadow-lg shadow-brown/20
                  hover:bg-[#5C3D23] hover:-translate-y-1 transition-all duration-300
                "
              >
                Checkout Securely
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-6 flex justify-center items-center gap-4 opacity-30 grayscale scale-75">
                 {/* Placeholders for payment icons */}
                 <div className="w-8 h-5 bg-[#8C7A6B] rounded-sm" />
                 <div className="w-8 h-5 bg-[#8C7A6B] rounded-sm" />
                 <div className="w-8 h-5 bg-[#8C7A6B] rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}