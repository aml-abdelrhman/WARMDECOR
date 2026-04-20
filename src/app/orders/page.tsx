"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Package, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Truck, XCircle,
  CreditCard, Banknote, ShoppingBag,
  MapPin, Loader2,
} from "lucide-react";

import { getUserOrdersApi, getProfileApi, type Order } from "@/features/user/user.api";
import { ROUTES, IMAGE_FALLBACK_URL } from "@/constants/app";
import { formatPrice, formatDate, cn } from "@/lib/utils";

// ─── Query key ────────────────────────────────────────────────────────────────

const ORDERS_KEY = ["userOrders"] as const;

// ─── Status config ────────────────────────────────────────────────────────────

function getOrderStatus(order: Order): {
  label: string;
  color: string;
  bg:    string;
  Icon:  React.ElementType;
} {
  if (order.isDelivered) {
    return { label: "Delivered",   color: "text-green-700", bg: "bg-green-50", Icon: CheckCircle2 };
  }
  if (order.isPaid) {
    return { label: "In Transit",  color: "text-[#C49A6C]",    bg: "bg-[#F9F5F0]",    Icon: Truck        };
  }
  return   { label: "Pending",     color: "text-[#7B5235]", bg: "bg-[#F5EFE6]", Icon: Clock        };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#EDE4D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-[#F5EFE6] rounded-full" />
              <div className="h-2.5 w-20 bg-[#F5EFE6] rounded-full" />
            </div>
            <div className="h-6 w-20 bg-[#F5EFE6] rounded-full" />
          </div>
          <div className="flex gap-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="w-14 h-14 rounded-xl bg-[#F5EFE6] shrink-0" />
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-[#EDE4D8]">
            <div className="h-3 w-24 bg-[#F5EFE6] rounded-full" />
            <div className="h-4 w-20 bg-[#F5EFE6] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Single order card ────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = getOrderStatus(order);
  const StatusIcon = status.Icon;

  const itemCount = order.cartItems.reduce((s, i) => s + i.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#EDE4D8] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">

      {/* ── Header ── */}
      <div className="flex items-start justify-between p-5 gap-4 flex-wrap">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] font-black text-[#5C3D23] bg-[#F5EFE6] px-2 py-0.5 rounded-md border border-[#C49A6C]/20">
              #{order._id.slice(-8).toUpperCase()}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              status.bg, status.color
            )}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#C49A6C]">
            Placed on {formatDate(order.createdAt)}
            {order.isDelivered && order.deliveredAt && (
              <> · Delivered {formatDate(order.deliveredAt)}</>
            )}
          </p>
        </div>

        {/* Total + expand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-base font-black text-[#5C3D23]">
              {formatPrice(order.totalOrderPrice)}
            </p>
            <p className="text-xs text-[#7B5235]/60">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse order" : "Expand order"}
            className="w-9 h-9 rounded-xl border border-[#EDE4D8] flex items-center justify-center text-[#C49A6C] hover:text-[#5C3D23] hover:bg-[#FAF7F2] transition-all"
          >
            {expanded
              ? <ChevronUp   className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* ── Product thumbnails (always visible) ── */}
      <div className="px-5 pb-4 flex items-center gap-2 overflow-x-auto">
        {order.cartItems.slice(0, 5).map((item) => (
          <Link
            key={item._id}
            href={ROUTES.product(item.product._id)}
            className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F9F5F0] border border-[#EDE4D8] shrink-0 hover:border-[#C49A6C] transition-colors"
          >
            <Image
              src={item.product.imageCover ?? IMAGE_FALLBACK_URL}
              alt={item.product.title}
              fill
              sizes="56px"
              className="object-cover"
              onError={() => {}}
            />
            {item.count > 1 && (
              <div className="absolute bottom-0 right-0 bg-[#5C3D23]/80 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-tl-lg">
                ×{item.count}
              </div>
            )}
          </Link>
        ))}
        {order.cartItems.length > 5 && (
          <div className="w-14 h-14 rounded-xl bg-[#F5EFE6] border border-[#EDE4D8] flex items-center justify-center shrink-0 text-xs font-bold text-[#7B5235]">
            +{order.cartItems.length - 5}
          </div>
        )}
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="border-t border-[#EDE4D8] bg-[#FAF7F2]/50 animate-fade-in">

          {/* Items list */}
          <div className="p-5 space-y-3">
            <h3 className="text-[10px] font-black text-[#C49A6C] uppercase tracking-[0.15em]">
              Order Items
            </h3>
            {order.cartItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <Link
                  href={ROUTES.product(item.product._id)}
                  className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-[#EDE4D8] shrink-0 hover:border-[#C49A6C] transition-colors"
                >
                  <Image
                    src={item.product.imageCover ?? IMAGE_FALLBACK_URL}
                    alt={item.product.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    onError={() => {}}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={ROUTES.product(item.product._id)}
                    className="text-sm font-bold text-[#5C3D23] hover:text-[#C49A6C] transition-colors line-clamp-1"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-[10px] text-[#7B5235]/60 uppercase font-bold mt-0.5">
                    {item.product.category?.name}
                    {item.product.brand?.name && ` · ${item.product.brand.name}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[#5C3D23]">
                    {formatPrice(item.price)}
                  </p>
                  <p className="text-xs text-[#7B5235]/60">
                    Qty: {item.count}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary + shipping */}
          <div className="border-t border-[#EDE4D8] p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Shipping address */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-[#C49A6C] uppercase tracking-[0.15em] flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                Shipping Address
              </h3>
              <div className="bg-white rounded-xl border border-[#EDE4D8] p-4 space-y-1 shadow-sm">
                <p className="text-sm font-bold text-[#5C3D23]">{order.shippingAddress.details}</p>
                <p className="text-xs text-[#7B5235]">{order.shippingAddress.city}</p>
                <p className="text-xs text-[#C49A6C] font-mono">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment summary */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-[#C49A6C] uppercase tracking-[0.15em] flex items-center gap-1.5">
                {order.paymentMethodType === "card"
                  ? <CreditCard className="w-3 h-3" />
                  : <Banknote   className="w-3 h-3" />
                }
                Payment
              </h3>
              <div className="bg-white rounded-xl border border-[#EDE4D8] p-4 space-y-2 shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-[#7B5235]/60">Method</span>
                  <span className="font-bold text-[#5C3D23] capitalize">
                    {order.paymentMethodType === "card" ? "Credit Card" : "Cash on Delivery"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#7B5235]/60">Status</span>
                  <span className={cn(
                    "font-bold",
                    order.isPaid ? "text-green-600" : "text-amber-600"
                  )}>
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7B5235]/60">Paid on</span>
                    <span className="text-[#5C3D23] font-bold">{formatDate(order.paidAt)}</span>
                  </div>
                )}
                <div className="border-t border-[#EDE4D8] pt-2 flex justify-between">
                  <span className="text-xs font-bold text-[#7B5235]">Total</span>
                  <span className="text-sm font-black text-[#5C3D23]">
                    {formatPrice(order.totalOrderPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [filter, setFilter] = useState<"all" | "delivered" | "pending">("all");

  // 1. First, fetch the user profile to get the userId
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
  });

  // 2. Then, fetch orders using the userId (dependent query)
  const { data: orders, isLoading: isOrdersLoading, isError } = useQuery<Order[]>({
    queryKey: [...ORDERS_KEY, profile?._id],
    queryFn: () => getUserOrdersApi(profile?._id as string),
    enabled: !!profile?._id, // Only run this query when we have the userId
  });

  const isLoading = isProfileLoading || isOrdersLoading;

  // ── Filter ──

  const filtered = (orders ?? []).filter((o: Order) => {
    if (filter === "delivered") return o.isDelivered;
    if (filter === "pending")   return !o.isDelivered;
    return true;
  });

  const deliveredCount = (orders ?? []).filter((o: Order) => o.isDelivered).length;
  const pendingCount   = (orders ?? []).filter((o: Order) => !o.isDelivered).length;

  // ── Error ──

  if (isError) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#5C3D23] mb-2">Failed to load orders</h2>
          <p className="text-[#7B5235]/60 text-sm">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // ── Empty ──

  if (!isLoading && (orders ?? []).length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-[#EDE4D8] shadow-sm flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-[#C49A6C]/30" />
          </div>
          <h2 className="font-display text-3xl font-bold text-[#5C3D23] mb-3">No orders yet</h2>
          <p className="text-[#7B5235]/60 text-sm mb-8 max-w-xs mx-auto">
            Discover our boutique collection and start your first order today.
          </p>
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-3 bg-[#5C3D23] text-white font-bold text-sm px-10 py-4 rounded-2xl shadow-xl shadow-[#5C3D23]/20 hover:bg-[#3d2918] transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-5xl font-bold text-[#5C3D23] tracking-tighter">
              My <em className="italic font-serif text-[#C49A6C]">Orders</em>
            </h1>
            <p className="text-[#C49A6C] text-xs uppercase font-black tracking-widest mt-2">
              {isLoading ? "Loading…" : `${orders?.length ?? 0} total orders`}
            </p>
          </div>

          {/* Stats chips */}
          {!isLoading && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-black uppercase text-green-700">{deliveredCount} delivered</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5EFE6] rounded-full border border-[#C49A6C]/20">
                <Clock className="w-3 h-3 text-[#7B5235]" />
                <span className="text-[10px] font-black uppercase text-[#7B5235]">{pendingCount} pending</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex bg-white border border-[#EDE4D8] rounded-xl p-1 gap-1 w-fit">
          {([
            { key: "all",       label: `All (${orders?.length ?? 0})` },
            { key: "delivered", label: `Delivered (${deliveredCount})` },
            { key: "pending",   label: `Pending (${pendingCount})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                filter === key
                  ? "bg-[#5C3D23] text-white shadow-lg shadow-[#5C3D23]/20"
                  : "text-[#7B5235]/60 hover:text-[#5C3D23] hover:bg-[#F5EFE6]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {isLoading ? (
          <OrderSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#EDE4D8] animate-fade-in">
            <Loader2 className="w-8 h-8 text-[#C49A6C]/30 mx-auto mb-3 animate-spin" />
            <p className="text-[#7B5235]/60 text-sm font-bold">No orders in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <div
                key={order._id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}