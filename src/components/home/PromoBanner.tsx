import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/app";

export default function PromoBanner() {
  return (
    <section className="relative rounded-[2rem] overflow-hidden bg-[#5C3D23]">
      {/* تأثير النقاط الخلفي (Dot Texture) */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", 
          backgroundSize: "24px 24px" 
        }} 
      />
      
      {/* كرات إضاءة خافتة (Glow Blobs) */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-[#C49A6C] rounded-full opacity-20 translate-x-1/4 -translate-y-1/4 blur-3xl pointer-events-none" />

      <div className="relative px-8 py-12 md:px-16 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <span className="inline-block text-[#C49A6C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Limited Time Offer
          </span>
          <h3 className="font-display text-3xl md:text-5xl font-light text-[#F5EFE6] leading-tight">
            Up to <em className="italic font-normal text-[#C49A6C]">40% off</em> 
            <br className="hidden md:block" /> on Home Essentials
          </h3>
          <p className="text-[#F5EFE6]/60 text-sm md:text-base mt-4 font-light max-w-md">
            Elevate your space with our premium collection. Valid for the next 24 hours only.
          </p>
        </div>

        <Link
          href={`${ROUTES.products}?sort=-priceAfterDiscount`}
          className="group shrink-0 flex items-center gap-3 bg-[#F5EFE6] text-[#5C3D23] font-bold text-sm px-8 py-4 rounded-full hover:bg-[#C49A6C] hover:text-[#F5EFE6] transition-all duration-300 shadow-xl active:scale-95"
        >
          Explore the Sale 
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}