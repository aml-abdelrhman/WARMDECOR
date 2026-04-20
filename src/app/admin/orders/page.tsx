"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Search, Trash2, ChevronDown,
  CheckCircle2, Clock, Truck, XCircle, ShoppingBag,
} from "lucide-react";

import { useAdminStore } from "@/store/admin.store";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
  color: string;
  bg:    string;
  ring:  string;
  Icon:  React.ElementType;
}[] = [
  { value: "pending",    label: "Pending",    color: "text-feedback-warning", bg: "bg-feedback-warning-bg", ring: "ring-feedback-warning", Icon: Clock        },
  { value: "processing", label: "Processing", color: "text-feedback-info",    bg: "bg-feedback-info-bg",    ring: "ring-feedback-info",    Icon: Clock        },
  { value: "shipped",    label: "Shipped",    color: "text-feedback-info",    bg: "bg-feedback-info-bg",    ring: "ring-feedback-info",    Icon: Truck        },
  { value: "delivered",  label: "Delivered",  color: "text-feedback-success", bg: "bg-feedback-success-bg", ring: "ring-feedback-success", Icon: CheckCircle2 },
  { value: "cancelled",  label: "Cancelled",  color: "text-feedback-error",   bg: "bg-feedback-error-bg",   ring: "ring-feedback-error",   Icon: XCircle      },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg  = STATUS_OPTIONS.find((s) => s.value === status)!;
  const Icon = cfg.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Status dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  orderId,
  current,
  onUpdate,
}: {
  orderId:  string;
  current:  OrderStatus;
  onUpdate: (id: string, s: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
      >
        <StatusBadge status={current} />
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-surface border border-border rounded-xl shadow-hard py-1 min-w-[140px] animate-scale-in">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.Icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onUpdate(orderId, opt.value);
                    toast.success(`Order marked as ${opt.label}.`);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-surface-secondary transition-colors",
                    current === opt.value ? "text-brand-600 bg-brand-50" : "text-ink-secondary"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", opt.color)} />
                  {opt.label}
                  {current === opt.value && <span className="ml-auto text-brand-500">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose:   () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl shadow-hard border border-border w-full max-w-sm p-6 animate-scale-in">
        <div className="w-12 h-12 rounded-2xl bg-feedback-error-bg flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-feedback-error" />
        </div>
        <h3 className="font-display text-lg font-bold text-ink text-center mb-1">Delete order?</h3>
        <p className="text-sm text-ink-secondary text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-ink-secondary hover:bg-surface-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); toast.success("Order deleted."); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-feedback-error text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const orders            = useAdminStore((s) => s.orders);
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);
  const deleteOrder       = useAdminStore((s) => s.deleteOrder);

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<OrderStatus | "all">("all");
  const [deletingId,    setDeletingId]    = useState<string | undefined>();

  // ── Filter ──

  const filtered = orders
    .filter((o) => {
      const matchSearch =
        o.user.name.toLowerCase().includes(search.toLowerCase()) ||
        o.user.email.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // ── Summary counts ──

  const counts = STATUS_OPTIONS.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.value] = orders.filter((o) => o.status === s.value).length;
      return acc;
    },
    {}
  );

  return (
    <>
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            {filtered.length} of {orders.length} orders
          </p>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              statusFilter === "all"
                ? "bg-brand-500 border-brand-500 text-white shadow-brand"
                : "bg-surface border-border text-ink-secondary hover:border-brand-400"
            )}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map((s) => {
            const Icon = s.Icon;
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5",
                  statusFilter === s.value
                    ? cn("border-transparent text-white shadow-sm", s.bg.replace("bg-", "bg-"), "bg-opacity-100", s.color.replace("text-", "bg-").replace("feedback-", "feedback-"))
                    : "bg-surface border-border text-ink-secondary hover:border-brand-400",
                  statusFilter === s.value && s.value === "delivered"  && "bg-feedback-success text-white border-feedback-success",
                  statusFilter === s.value && s.value === "pending"    && "bg-feedback-warning text-white border-feedback-warning",
                  statusFilter === s.value && s.value === "processing" && "bg-feedback-info    text-white border-feedback-info",
                  statusFilter === s.value && s.value === "shipped"    && "bg-feedback-info    text-white border-feedback-info",
                  statusFilter === s.value && s.value === "cancelled"  && "bg-feedback-error   text-white border-feedback-error",
                )}
              >
                <Icon className="w-3 h-3" />
                {s.label} ({counts[s.value] ?? 0})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or ID…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-ink placeholder:text-ink-disabled outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary hidden lg:table-cell">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-ink-secondary">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary hidden md:table-cell">Payment</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink-tertiary text-sm">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-secondary transition-colors">
                      {/* Order ID + date */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-ink">
                          #{order.id.toUpperCase()}
                        </div>
                        <div className="text-xs text-ink-tertiary mt-0.5">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      {/* Customer */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-brand-700">
                              {order.user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-ink truncate max-w-[120px]">
                              {order.user.name}
                            </div>
                            <div className="text-2xs text-ink-tertiary truncate max-w-[120px]">
                              {order.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Items */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="space-y-0.5">
                          {order.products.slice(0, 2).map((p, i) => (
                            <div key={i} className="text-xs text-ink-secondary truncate max-w-[160px]">
                              {p.quantity}× {p.title}
                            </div>
                          ))}
                          {order.products.length > 2 && (
                            <div className="text-2xs text-ink-tertiary">
                              +{order.products.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Total */}
                      <td className="px-4 py-3 text-right font-bold text-ink">
                        {formatPrice(order.totalPrice)}
                      </td>
                      {/* Status dropdown */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <StatusDropdown
                            orderId={order.id}
                            current={order.status}
                            onUpdate={updateOrderStatus}
                          />
                        </div>
                      </td>
                      {/* Payment */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={cn(
                          "text-xs font-semibold capitalize px-2 py-0.5 rounded-full",
                          order.paymentMethod === "card"
                            ? "bg-feedback-info-bg text-feedback-info"
                            : "bg-surface-tertiary text-ink-secondary"
                        )}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      {/* Delete */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeletingId(order.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center ml-auto text-ink-tertiary hover:text-feedback-error hover:bg-feedback-error-bg transition-all"
                          aria-label="Delete order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deletingId && (
        <DeleteConfirm
          onConfirm={() => deleteOrder(deletingId)}
          onClose={() => setDeletingId(undefined)}
        />
      )}
    </>
  );
}