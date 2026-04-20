import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductsPagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
      if (idx > 0 && (arr[idx - 1] as number) < p - 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-center gap-2 mt-10 animate-fade-in">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-9 h-9 rounded-xl border border-[#ede4d8] bg-[#f5efe6] flex items-center justify-center text-[#5c3d23] hover:border-[#c49a6c] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-9 text-center text-sm text-[#c49a6c]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p as number)}
            className={cn(
              "w-9 h-9 rounded-xl text-sm font-semibold border transition-all duration-150",
              page === p
                ? "bg-[#5c3d23] border-[#5c3d23] text-white shadow-md"
                : "bg-[#f5efe6] border-[#ede4d8] text-[#7b5235] hover:border-[#c49a6c]"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-xl border border-[#ede4d8] bg-[#f5efe6] flex items-center justify-center text-[#5c3d23] hover:border-[#c49a6c] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}