"use client";

import Link from "next/link";
import { 
  ShoppingBag, Mail, Phone, MapPin, 
  Globe, MessageCircle, Send, ArrowRight,
  ShieldCheck, Truck, RotateCcw
} from "lucide-react";
import { ROUTES } from "@/constants/app";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F5EFE6] border-t border-[#EDE4D8]">
      {/* ─── Newsletter Section ─── */}
      <div className="border-b border-[#EDE4D8]">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative bg-[#5C3D23] rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C49A6C] opacity-10 blur-[80px] -mr-20 -mt-20" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                  Join the <em className="italic font-serif">Aesthetic</em> Club
                </h3>
                <p className="text-[#F5EFE6]/70 text-sm max-w-md">
                  Subscribe to receive exclusive offers, decor tips, and first access to new collections.
                </p>
              </div>
              <form className="w-full max-w-md flex gap-2">
                <input 
                  type="email" 
                  suppressHydrationWarning
                  placeholder="your@email.com"
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#C49A6C] transition-all"
                />
                <button 
                  suppressHydrationWarning
                  className="bg-[#C49A6C] text-[#5C3D23] px-6 py-4 rounded-2xl font-bold hover:bg-white transition-all active:scale-95"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Content ─── */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href={ROUTES.home} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#5C3D23] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-[#F5EFE6]" strokeWidth={2} />
              </div>
              <span className="font-display text-2xl font-black text-[#5C3D23] tracking-tight">
                WARM<span className="text-[#C49A6C]">DECOR</span>
              </span>
            </Link>
            <p className="text-[#7B5235]/70 text-sm leading-relaxed max-w-xs">
              Elevating your living space with curated minimalist pieces that blend timeless elegance with modern comfort.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageCircle, Send].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full border border-[#C49A6C]/20 flex items-center justify-center text-[#5C3D23] hover:bg-[#5C3D23] hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-[#5C3D23] font-bold text-sm uppercase tracking-widest mb-6">Collections</h4>
            <ul className="space-y-4">
              {[
                { label: "New Arrivals", href: ROUTES.products },
                { label: "Best Sellers", href: `${ROUTES.products}?sort=-sold` },
                { label: "Limited Edition", href: ROUTES.products },
                { label: "Winter Sale", href: ROUTES.products },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[#7B5235]/70 hover:text-[#C49A6C] text-sm transition-colors flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-[#5C3D23] font-bold text-sm uppercase tracking-widest mb-6">Experience</h4>
            <ul className="space-y-4">
              {["Track Order", "Shipping Policy", "Return & Exchange", "Privacy Policy"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-[#7B5235]/70 hover:text-[#C49A6C] text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-[#5C3D23] font-bold text-sm uppercase tracking-widest mb-6">Visit Our Studio</h4>
            <ul className="space-y-5">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#C49A6C] shrink-0" />
                <span className="text-sm text-[#7B5235]/70">123 Design District, Cairo, Egypt</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-[#C49A6C] shrink-0" />
                <span className="text-sm text-[#7B5235]/70">+20 123 456 789</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-[#C49A6C] shrink-0" />
                <span className="text-sm text-[#7B5235]/70">hello@warmdecor.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="pt-8 border-t border-[#EDE4D8] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[#7B5235]/50 font-medium" suppressHydrationWarning>
            © {currentYear} WARMDECOR Boutique. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <div className="flex items-center gap-1">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Secure Payment</span>
             </div>
             <div className="flex items-center gap-1">
               <Truck className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Express Shipping</span>
             </div>
             <div className="flex items-center gap-1">
               <RotateCcw className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Easy Returns</span>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-[#5C3D23]/5 rounded border border-[#EDE4D8]" />
            <div className="w-8 h-5 bg-[#5C3D23]/5 rounded border border-[#EDE4D8]" />
            <div className="w-8 h-5 bg-[#5C3D23]/5 rounded border border-[#EDE4D8]" />
          </div>
        </div>
      </div>
    </footer>
  );
}