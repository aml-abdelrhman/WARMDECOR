"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { useAdminStore } from "@/store/admin.store";
import { formatPrice, cn } from "@/lib/utils";

// ───────────────────────── KPI CARD ─────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent: string;
  trend?: { positive: boolean; value: number };
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
}: KpiCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-soft p-5 flex flex-col gap-4 hover:shadow-medium transition">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accent)}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.positive
                ? "text-feedback-success bg-feedback-success-bg"
                : "text-feedback-error bg-feedback-error-bg"
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-ink-secondary">{label}</p>
        <p className="text-xs text-ink-tertiary">{sub}</p>
      </div>
    </div>
  );
}

// ───────────────────────── PAGE ─────────────────────────

export default function AdminDashboardPage() {
  const orders = useAdminStore((s) => s.orders);
  const products = useAdminStore((s) => s.products);
  const users = useAdminStore((s) => s.users);

  // ─── STATS ───
  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");

    return {
      totalRevenue: delivered.reduce((a, b) => a + b.totalPrice, 0),
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length,
    };
  }, [orders, products, users]);

  // ─── REVENUE ───
  const revenueData = useMemo(() => {
    const map: Record<string, number> = {};

    orders
      .filter((o) => o.status === "delivered")
      .forEach((o) => {
        const month = new Date(o.createdAt).toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        });

        map[month] = (map[month] ?? 0) + o.totalPrice;
      });

    return Object.entries(map).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, [orders]);

  // ─── STATUS ───
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};

    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [orders]);

  // ─── RECENT + TOP ───
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [orders]
  );

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.sold - a.sold).slice(0, 5),
    [products]
  );

  // ───────────────────────── UI ─────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ─── KPI ROW ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenue" value={formatPrice(stats.totalRevenue)} sub="Delivered orders" icon={TrendingUp} accent="bg-green-500" />
        <KpiCard label="Orders" value={stats.totalOrders} sub="All orders" icon={ShoppingBag} accent="bg-blue-500" />
        <KpiCard label="Products" value={stats.totalProducts} sub="Store items" icon={Package} accent="bg-orange-500" />
        <KpiCard label="Users" value={stats.totalUsers} sub="Customers" icon={Users} accent="bg-purple-500" />
      </div>

      {/* ─── CHARTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue */}
        <div className="lg:col-span-2 bg-surface p-5 rounded-xl border">
          <h2 className="font-bold mb-3">Revenue Overview</h2>

          {revenueData.length === 0 ? (
            <p>No revenue data</p>
          ) : (
            <div className="space-y-2">
              {revenueData.map((d) => (
                <div key={d.month} className="flex justify-between">
                  <span>{d.month}</span>
                  <span>{formatPrice(d.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-surface p-5 rounded-xl border">
          <h2 className="font-bold mb-3">Order Status</h2>

          {statusData.map((s) => (
            <div key={s.status} className="flex justify-between text-sm">
              <span>{s.status}</span>
              <span>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── LISTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent */}
        <div className="bg-surface p-5 rounded-xl border">
          <h2 className="font-bold mb-3">Recent Orders</h2>

          {recentOrders.map((o) => (
            <div key={o.id} className="flex justify-between py-2 border-b">
              <span>{o.user.name}</span>
              <span>{formatPrice(o.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Top */}
        <div className="bg-surface p-5 rounded-xl border">
          <h2 className="font-bold mb-3">Top Products</h2>

          {topProducts.map((p) => (
            <div key={p.id} className="flex justify-between py-2 border-b">
              <span>{p.title}</span>
              <span>{p.sold}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}