import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Star } from "lucide-react";
import { ROUTES } from "@/constants/app";

export function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#5c3d23]">
      {/* 1. الخلفية الفنية (Artistic Background) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* النسيج الشبكي الخفيف */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} 
        />
        {/* التدرجات اللونية الناعمة (Ambient Glow) */}
        <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-[#c49a6c] opacity-20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#3d2918] opacity-40 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full pt-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* المحتوى النصي - يأخذ 7 أعمدة */}
          <div className="lg:col-span-7 z-10">
            {/* التاج العلوي (Premium Badge) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-[#c49a6c] animate-ping" />
              <span className="text-[#c49a6c] text-[10px] font-bold tracking-[0.3em] uppercase">
                New Winter Collection 2024
              </span>
            </div>

            {/* العنوان الرئيسي بمقاسات متكيفة */}
            <h1 className="font-display leading-[0.95] text-white tracking-tight mb-8">
              <span className="block text-[clamp(48px,8vw,90px)] font-extralight tracking-tighter opacity-90">
                Redefining
              </span>
              <span className="block text-[clamp(54px,9vw,100px)] font-serif italic text-[#c49a6c] ml-4 md:ml-12">
                Everyday Elegance
              </span>
            </h1>

            <p className="text-[#f5efe6]/60 text-lg md:text-xl font-light max-w-lg mb-12 leading-relaxed">
              Experience a curated selection of premium electronics and fashion, 
              crafted for those who appreciate the finer things in life.
            </p>

            {/* أزرار التشغيل (CTA Buttons) */}
            <div className="flex flex-wrap items-center gap-6">
              <Link 
                href={ROUTES.products} 
                className="group relative flex items-center gap-3 bg-[#c49a6c] text-[#3d2918] font-bold px-8 py-5 rounded-2xl shadow-2xl hover:bg-white transition-all duration-500 hover:-translate-y-1 active:scale-95"
              >
                <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
                <span className="text-base">Start Exploring</span>
              </Link>

              <Link 
                href="/story" 
                className="group flex items-center gap-2 text-white/80 hover:text-[#c49a6c] transition-colors font-medium underline-offset-8 hover:underline"
              >
                Our Story <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {/* إحصائيات سريعة (Social Proof) */}
            <div className="mt-20 pt-10 border-t border-white/5 flex items-center gap-12">
              <div>
                <p className="text-2xl font-bold text-white">40k+</p>
                <p className="text-[10px] uppercase tracking-widest text-[#c49a6c] font-bold">Active Clients</p>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">4.9/5</p>
                <p className="text-[10px] uppercase tracking-widest text-[#c49a6c] font-bold">Average Rating</p>
              </div>
            </div>
          </div>

          {/* الجزء الجمالي الأيمن (Floating Element) */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative w-full aspect-square border border-white/5 rounded-[4rem] p-8 backdrop-blur-sm overflow-hidden group">
               {/* هنا يمكنك وضع صورة منتج Hero مميزة أو جرافيك تجريدي */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#c49a6c]/20 to-transparent" />
               <Image 
                 src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000" 
                 alt="Featured Product"
                 fill
                 className="object-cover rounded-[3rem] opacity-80 group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
               />
               <div className="absolute bottom-12 right-12 bg-white p-6 rounded-3xl shadow-2xl animate-bounce-slow">
                  <Star className="w-6 h-6 text-[#c49a6c] fill-[#c49a6c]" />
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* مؤشر النزول (Scroll Indicator) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.4em] text-white">Scroll</span>
      </div>
    </section>
  );
}