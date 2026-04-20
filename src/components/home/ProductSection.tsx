import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductSectionProps {
  title: string;
  sub?: string;
  href?: string;
  products?: Product[];
  isLoading?: boolean;
  columns?: number;
}

function SectionHeader({
  title,
  sub,
  href,
  linkLabel = "View all",
}: {
  title: string;
  sub?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#5c3d23] tracking-tight">
          {title}
        </h2>
        {sub && <p className="text-sm text-[#7b5235]/70 mt-1">{sub}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-semibold text-[#7b5235] hover:text-[#5c3d23] transition-colors shrink-0 ml-4"
        >
          {linkLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-[#ede4d8] overflow-hidden bg-[#f5efe6] animate-pulse">
          <div className="aspect-square bg-[#ede4d8]/50 animate-pulse" />
          <div className="p-3.5 space-y-2.5">
            <div className="h-2.5 w-16 bg-[#ede4d8] rounded-full" />
            <div className="h-3.5 w-full bg-[#ede4d8] rounded-full" />
            <div className="h-4 w-20 bg-[#ede4d8] rounded-full mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductSection({
  title,
  sub,
  href,
  products,
  isLoading,
  columns = 4,
}: ProductSectionProps) {
  return (
    <section>
      <SectionHeader title={title} sub={sub} href={href} />
      {isLoading ? (
        <ProductSkeleton count={columns} />
      ) : (
        <div className={cn("grid gap-5", columns === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2")}>
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}