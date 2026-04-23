"use client";
import React, { useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useProductActions } from "@/hooks/use-product-actions";
import { useAuthStore } from "@/store/auth.store";
import { getWishlistApi, getCartApi } from "@/features/cart/cart.api";
import { ROUTES } from "@/constants/app";
import type { Product } from "@/types";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

interface ProductSwiperProps {
  title: string;
  sub?: string;
  href?: string;
  products?: Product[];
  isLoading?: boolean;
  slidesPerView?: number;
}

export function ProductSwiper({
  title,
  sub,
  href,
  products = [],
  isLoading,
  slidesPerView = 4,
}: ProductSwiperProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user;

  // استدعاء الـ Hook الخاص بالعمليات (Cart & Wishlist)
  const { addToCart, toggleWishlist } = useProductActions();

  // جلب بيانات المفضلة إذا كان المستخدم مسجل دخوله
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistApi,
    enabled: isAuthenticated,
  });

  // جلب بيانات السلة للتحقق من وجود المنتج مسبقاً
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartApi,
    enabled: isAuthenticated,
  });

  // تحويل قائمة المفضلة إلى مصفوفة IDs للتحقق السريع
  const wishlistedIds = useMemo(
    () =>
      new Set(
        wishlistData?.data?.map((item: any) => item.product?._id || item._id) ||
          [],
      ),
    [wishlistData],
  );

  // تحويل قائمة السلة إلى مصفوفة IDs
  const cartIds = useMemo(
    () =>
      new Set(
        cartData?.data?.products?.map((item: any) =>
          typeof item.product === "string" ? item.product : item.product?._id,
        ) || [],
      ),
    [cartData],
  );

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="relative py-4 animate-fade-in">
      {/* Header with Navigation */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#5C3D23] tracking-tight">
            {title}
          </h2>
          {sub && <p className="text-[#7B5235]/60 text-sm mt-2">{sub}</p>}
        </div>

        <div className="flex items-center gap-3">
          {href && (
            <Link
              href={href}
              className="hidden sm:flex items-center gap-2 text-sm font-black text-[#C49A6C] hover:text-[#5C3D23] transition-colors px-4 py-2"
            >
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {/* Custom Arrows */}
          <div className="flex gap-2">
            <button
              ref={prevRef}
              className="w-12 h-12 rounded-full border border-[#C49A6C]/30 flex items-center justify-center text-[#5C3D23] hover:bg-[#5C3D23] hover:text-[#F5EFE6] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              ref={nextRef}
              className="w-12 h-12 rounded-full border border-[#C49A6C]/30 flex items-center justify-center text-[#5C3D23] hover:bg-[#5C3D23] hover:text-[#F5EFE6] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Swiper Container */}
      <div className="relative group">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1.2}
          navigation={{
            // نترك هذه فارغة لأننا نعتمد على الـ refs بالأسفل
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            // @ts-expect-error - ربط المراجع بالأزرار عند بدء التشغيل
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-expect-error - ربط المراجع بالأزرار عند بدء التشغيل
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: slidesPerView },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: true }}
          className="!overflow-visible"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <SwiperSlide key={i}>
                  <div className="rounded-3xl border border-[#EDE4D8] overflow-hidden bg-white animate-pulse">
                    <div className="aspect-square bg-[#F5EFE6]" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 w-2/3 bg-[#F5EFE6] rounded-full" />
                      <div className="h-3 w-full bg-[#F5EFE6] rounded-full" />
                      <div className="h-6 w-20 bg-[#F5EFE6] rounded-full mt-4" />
                    </div>
                  </div>
                </SwiperSlide>
              ))
            : products.map((product) => (
                <SwiperSlide key={product._id}>
                  <div className="transition-transform duration-500 hover:-translate-y-2">
                    <ProductCard
                      product={product}
                      onAddToCart={() => {
                        if (!isAuthenticated) {
                          router.push(ROUTES.login);
                          return;
                        }
                        if (cartIds.has(product._id)) {
                          toast.error("Product is already in your cart!");
                          return;
                        }
                        addToCart.mutate(product._id);
                      }}
                      onToggleWish={() => {
                        if (!isAuthenticated) {
                          router.push(ROUTES.login);
                          return;
                        }
                        toggleWishlist.mutate({
                          id: product._id,
                          isWishlisted: wishlistedIds.has(product._id),
                        });
                      }}
                      isWishlisted={wishlistedIds.has(product._id)}
                    />
                  </div>
                </SwiperSlide>
              ))}
        </Swiper>

        {/* Subtle Gradient Overlays for "Soft" feel */}
        <div className="absolute top-0 -left-4 w-20 h-full bg-gradient-to-r from-[#F9F5F0] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 -right-4 w-20 h-full bg-gradient-to-l from-[#F9F5F0] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Mobile-only See All */}
      {href && (
        <Link
          href={href}
          className="sm:hidden flex items-center justify-center gap-2 text-sm font-bold text-[#5C3D23] bg-white border border-[#EDE4D8] rounded-2xl py-4 mt-8"
        >
          Explore All Collection <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </section>
  );
}
