"use client";

import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Activity,
  PieChart as PieIcon,
  BarChart as BarIcon,
  LineChart as LineIcon
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

import { useAdminStore } from "@/store/admin.store";
import { formatPrice, cn } from "@/lib/utils";

// ─── مكون فرعي لبطاقات الإحصائيات (KPI Cards) ──────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}
function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft hover:shadow-medium transition-shadow">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-ink-tertiary font-medium">{label}</p>
          <p className="text-2xl font-bold text-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}

const CHART_COLORS = ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

// ─── الصفحة الرئيسية للتحليلات ────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const orders = useAdminStore((s) => s.orders || []);
  const products = useAdminStore((s) => s.products || []);

  // ضمان استقرار المكون في المتصفح قبل رندر المخططات لمنع أخطاء History API على الموبايل
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Assuming `orders` from `useAdminStore` has a `createdAt: string` property
  // and `status: 'delivered' | 'pending' | 'cancelled' | 'shipped'` property
  // for the calculations below.

  // 1. حساب المقاييس المالية (Revenue & AOV)
  const metrics = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");
    const revenue = delivered.reduce((acc, o) => acc + o.totalPrice, 0);
    const aov = orders.length > 0 ? revenue / orders.length : 0;
    
    return {
      revenue,
      aov,
      totalOrders: orders.length,
    };
  }, [orders]);

  // 2. تحليل أداء التصنيفات (Sales by Category)
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    products.forEach((p) => {
      stats[p.category] = (stats[p.category] || 0) + p.sold;
    });
    return Object.entries(stats)
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold);
  }, [products]);

  // 3. مراقبة المخزون (Low Stock Alerts)
  const lowStock = useMemo(() => {
    return products.filter(p => p.quantity < 10).sort((a, b) => a.quantity - b.quantity);
  }, [products]);

  // 4. اتجاه الإيرادات الشهرية
  const revenueTrend = useMemo(() => {
    const monthlyRevenue: Record<string, number> = {};
    const deliveredOrders = orders.filter((o) => o.status === "delivered");

    deliveredOrders.forEach(order => {
      // Assuming order.createdAt is an ISO date string (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ")
      const date = new Date(order.createdAt);
      if (isNaN(date.getTime())) return;
      
      // استخدام مفتاح قابل للفرز برمجياً YYYY-MM لضمان الدقة على كل المتصفحات
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + order.totalPrice;
    });

    return Object.keys(monthlyRevenue).sort().map(key => {
      const [year, month] = key.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1);
      return {
        name: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthlyRevenue[key],
      };
    });
  }, [orders]);

  // 5. توزيع حالة الطلبات
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    orders.forEach(order => { statusCounts[order.status] = (statusCounts[order.status] || 0) + 1; });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // تجنب رندر المخططات أثناء الـ SSR أو قبل الـ Mount لمنع أخطاء التوجيه
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Business Analytics</h1>
        <p className="text-sm text-ink-tertiary">Insights based on current store data</p>
      </div>

      {/* صف المقاييس الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatPrice(metrics.revenue)} icon={DollarSign} color="bg-brand-500" />
        <StatCard label="Avg. Order Value" value={formatPrice(metrics.aov)} icon={TrendingUp} color="bg-blue-500" />
        <StatCard label="Total Orders" value={metrics.totalOrders} icon={ShoppingCart} color="bg-orange-500" />
        <StatCard label="Performance" value="Good" icon={Activity} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مخطط الإيرادات الشهري - "منحنى الرسم البياني" */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <LineIcon className="w-5 h-5 text-brand-500" />
              <h2 className="font-bold text-ink">Revenue Trend</h2>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: unknown) => {
                    return [formatPrice(typeof value === 'number' ? value : 0), "Revenue"];
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* مخطط توزيع المبيعات حسب التصنيف */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <BarIcon className="w-5 h-5 text-brand-500" />
            <h2 className="font-bold text-ink">Sales by Category</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={categoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontWeight: 500, fontSize: 12}} width={100} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="sold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* مخطط حالة الطلبات */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-brand-500" />
            <h2 className="font-bold text-ink">Order Status</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie 
                  data={statusDistribution} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* تنبيهات المخزون المنخفض */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <div className="flex items-center gap-2 mb-6 text-feedback-error">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold">Inventory Alerts</h2>
          </div>

          <div className="space-y-4">
            {lowStock.length > 0 ? (
              lowStock.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-feedback-error-bg/30 border border-feedback-error/10 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-ink truncate">{p.title}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-tertiary">Stock Left:</span>
                    <span className="text-xs font-bold text-feedback-error">{p.quantity} units</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-ink-tertiary py-10">Stock levels are healthy ✨</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}