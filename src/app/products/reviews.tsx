"use client";

import { useQuery } from "@tanstack/react-query";
import { Star, Quote, User, Calendar } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

// ─── API Fetching ──────────────────────────────────────────────────────────
interface Review {
  _id: string;
  ratings: number;
  comment: string;
  createdAt: string;
  user?: {
    name?: string;
  };
}

const getAllReviews = async () => {
  const { data } = await axios.get("https://ecommerce.routemisr.com/api/v1/reviews");
  return data.data; // تأكد من مسار البيانات حسب الـ API
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["all-reviews"],
    queryFn: getAllReviews,
  });

  if (isLoading) return <ReviewsSkeleton />;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - تصميم مودرن */}
        <div className="text-center mb-20 space-y-4">
          <h1 className="font-display text-5xl md:text-7xl font-light text-[#5C3D23] tracking-tighter">
            Voices of <em className="italic font-serif">Trust</em>
          </h1>
          <p className="text-[#C49A6C] uppercase tracking-[0.3em] text-xs font-bold">
            Real experiences from our community
          </p>
          <div className="w-24 h-[1px] bg-[#C49A6C]/30 mx-auto mt-8" />
        </div>

        {/* Reviews Grid - تصميم غير تقليدي (Masonry-like) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews?.map((review: Review, i: number) => (
            <div
              key={review._id}
              className={cn(
                "break-inside-avoid group relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#C49A6C]/10",
                i % 2 === 0 ? "bg-[#F5EFE6] border-[#C49A6C]/20" : "bg-white border-[#C49A6C]/10"
              )}
            >
              {/* أيقونة الكوت لتعطي شكل فني */}
              <Quote className="absolute top-6 right-8 w-10 h-10 text-[#C49A6C]/10 group-hover:text-[#C49A6C]/20 transition-colors" />

              {/* النجوم */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={cn(
                      "w-4 h-4",
                      starIndex < review.ratings
                        ? "fill-[#C49A6C] text-[#C49A6C]"
                        : "fill-transparent text-[#C49A6C]/30"
                    )}
                  />
                ))}
              </div>

              {/* نص التقييم */}
              <p className="text-[#5C3D23] text-lg leading-relaxed font-light mb-8 italic">
                &quot;{review.comment}&quot;
              </p>

              {/* بيانات المستخدم */}
              <div className="flex items-center gap-4 pt-6 border-t border-[#C49A6C]/10">
                <div className="w-12 h-12 rounded-full bg-[#5C3D23] flex items-center justify-center text-[#F5EFE6] font-bold text-sm shadow-inner">
                  {review.user?.name?.charAt(0) || <User className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#5C3D23]">
                    {review.user?.name || "Guest User"}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#C49A6C] uppercase font-bold tracking-widest mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function ReviewsSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] p-20 grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 rounded-[2.5rem] bg-[#ede4d8] animate-pulse" />
      ))}
    </div>
  );
}