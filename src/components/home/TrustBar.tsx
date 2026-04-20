import { Truck, Star, Package, ShieldCheck } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, label: "Free Delivery", sub: "On orders over EGP 500" },
  { icon: Star, label: "Exclusive Picks", sub: "Curated just for you" },
  { icon: Package, label: "Safe Packaging", sub: "Arrives in perfect shape" },
  { icon: ShieldCheck, label: "Highest Quality", sub: "Verified products only" },
] as const;

export function TrustBar() {
  return (
    <section className="bg-[#F5EFE6] border-y border-[#C49A6C]/20 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {TRUST_ITEMS.map(({ icon: Icon, label, sub }, i) => (
            <div 
              key={label} 
              className="flex items-start gap-5 animate-fade-in group" 
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="w-14 h-14 rounded-full border-2 border-[#C49A6C]/30 bg-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:bg-[#C49A6C]/10 group-hover:scale-105 group-hover:border-[#C49A6C]/50">
                <Icon className="w-7 h-7 text-[#5C3D23]" strokeWidth={1.25} />
              </div>

              <div className="flex-1 pt-1.5">
                <p className="text-base font-bold text-[#5C3D23] font-display tracking-tight leading-tight">
                  {label}
                </p>
                <p className="text-sm text-[#C49A6C] mt-1 font-light leading-relaxed">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}