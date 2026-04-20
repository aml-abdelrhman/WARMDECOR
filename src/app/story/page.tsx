import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { ROUTES } from "@/constants/app";

export default function StoryStrip() {
  return (
    <section className="bg-[#F5EFE6] rounded-[2rem] border border-[#C49A6C]/20 overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* قسم الصورة */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px] overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80"
            alt="Our Philosophy"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          {/* Badge فوق الصورة */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-[#F5EFE6]/90 backdrop-blur-md rounded-full px-5 py-2.5 border border-[#C49A6C]/20 shadow-lg">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#C49A6C] text-[#C49A6C]" />
              ))}
            </div>
            <span className="text-[10px] font-black text-[#5C3D23] uppercase tracking-tighter">
              Premium Quality
            </span>
          </div>
        </div>

        {/* قسم النص */}
        <div className="flex flex-col justify-center p-10 md:p-16">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#C49A6C] mb-6">
            Our Philosophy
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#5C3D23] leading-tight mb-6">
            The Art of <br />
            <em className="italic text-[#C49A6C] font-normal text-4xl md:text-6xl">Minimalist Living</em>
          </h2>
          <p className="text-[#5C3D23]/70 text-sm md:text-base leading-relaxed font-light mb-10 max-w-md">
            We believe that your home should be a sanctuary. Every piece in our collection is 
            meticulously curated to bring balance, warmth, and timeless elegance to your daily life.
          </p>
          
          <Link
            href={ROUTES.products}
            className="self-start flex items-center gap-3 border-b-2 border-[#C49A6C] pb-1 text-[#5C3D23] text-sm font-black hover:text-[#C49A6C] transition-all group"
          >
            Our Full Collection 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}