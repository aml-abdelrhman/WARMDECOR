"use client";

import { useQuery } from "@tanstack/react-query";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectCoverflow } from "swiper/modules";
import { apiClient } from "@/lib/axios";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/effect-coverflow";

const getAllReviews = async () => {
  const { data } = await apiClient.get("/reviews");
  return data.data;
};

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
 queryKey: ["all-reviews"],
    queryFn: getAllReviews,
  });

  if (isLoading) return <ReviewsSkeleton />;

  return (
    <div className="bg-[#FDFCFB] py-12 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - Compact Version */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-[#4A3427] mb-2">
            What Our <span className="italic text-[#C49A6C]">Guests</span> Say
          </h2>
          <div className="w-16 h-[2px] bg-[#C49A6C] mx-auto" />
        </div>

        <div className="relative px-2 md:px-10">
          <Swiper
            modules={[Navigation, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            loop={true}
            coverflowEffect={{
              rotate: 0,
              stretch: -20, // تداخل بسيط لجعل الشكل متراص
              depth: 150,   // زيادة العمق لتصغير الجوانب أكتر
              modifier: 1,
              slideShadows: false,
            }}
            autoplay={{ delay: 5000 }}
            navigation={{
              prevEl: ".btn-prev",
              nextEl: ".btn-next",
            }}
            className="!pb-12 !pt-5"
          >
            {reviews?.map((item: { rating: number; review: string; name?: string }, i: number) => (
              <SwiperSlide key={i} className="max-w-[320px] md:max-w-[450px]">
                {({ isActive }) => (
                  <div 
                    className={cn(
                      "transition-all duration-500 p-8 md:p-10 rounded-[2.5rem] border flex flex-col justify-between h-[380px]",
                      isActive 
                        ? "bg-white border-[#C49A6C]/30 shadow-[0_25px_50px_-12px_rgba(196,154,108,0.2)] scale-105" 
                        : "bg-gray-50/50 border-transparent scale-90 opacity-50 blur-[1px]"
                    )}
                  >
                    <div>
                      <Quote className={cn(
                        "w-10 h-10 mb-4 transition-colors",
                        isActive ? "text-[#C49A6C]/20" : "text-gray-200"
                      )} />
                      
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className={cn("w-3.5 h-3.5", s < item.rating ? "fill-[#C49A6C] text-[#C49A6C]" : "text-gray-200")} />
                        ))}
                      </div>

                      <p className={cn(
                        "text-lg leading-relaxed font-light line-clamp-5",
                        isActive ? "text-[#5C3D23]" : "text-gray-400"
                      )}>
                        &quot;{item.review}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C49A6C]/20 flex items-center justify-center font-bold text-[#C49A6C] text-xs">
                        {item.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-xs uppercase tracking-widest text-[#4A3427]">Verified Review</p>
                        <p className="text-[10px] text-[#C49A6C]">Luxury Experience</p>
                      </div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Minimalist Navigation Buttons - Fixed Position */}
          <button className="btn-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-[#C49A6C] hover:bg-[#C49A6C] hover:text-white transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="btn-next absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-[#C49A6C] hover:bg-[#C49A6C] hover:text-white transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="py-20 flex justify-center gap-4 bg-[#FDFCFB]">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={cn("h-[380px] w-[350px] rounded-[2.5rem] bg-gray-100 animate-pulse", i !== 1 && "scale-90 opacity-40")} />
      ))}
    </div>
  );
}