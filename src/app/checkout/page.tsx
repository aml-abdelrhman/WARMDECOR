"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  MapPin, Phone, CreditCard,
  Banknote, ArrowRight, Loader2,
  ShieldCheck, Truck, ChevronLeft, Building2
} from "lucide-react";
import Link from "next/link";

import { getCartApi } from "@/features/cart/cart.api";
import { createCashOrderApi, createOnlineOrderApi } from "@/features/checkout/checkout.api";
import { QUERY_KEYS, ROUTES } from "@/constants/app";
import { formatPrice, cn } from "@/lib/utils";
import { isAppError } from "@/lib/axios";

// ─── Schema ──────────────────────────────────────────────────────────────────

const CheckoutSchema = z.object({
  details: z.string().min(5, "Address details are required (min 5 chars)"),
  phone:   z.string().regex(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number"),
  city:    z.string().min(3, "City name is required"),
});

type CheckoutFormData = z.infer<typeof CheckoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  // 1. Fetch Cart
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn:  getCartApi,
  });

  const cartId = cart?.data?._id;
  const total  = cart?.data?.totalCartPrice ?? 0;

  // 2. Form Setup
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutSchema),
  });

  // 3. Mutation for Checkout
  const { mutate: processOrder, isPending } = useMutation({
    mutationFn: async (shippingAddress: CheckoutFormData) => {
      if (!cartId) throw new Error("Cart not found");

      if (paymentMethod === "cash") {
        return createCashOrderApi({ cartId, shippingAddress });
      } else {
        const res = await createOnlineOrderApi({ cartId, shippingAddress });
        if (res.session?.url) {
          window.location.href = res.session.url;
        }
        return res;
      }
    },
    onSuccess: () => {
      if (paymentMethod === "cash") {
        toast.success("Order placed successfully!");
        router.push("/orders"); 
      }
    },
    onError: (e: unknown) => {
      toast.error(isAppError(e) ? e.message : "Failed to process order.");
    },
  });

  if (cartLoading) return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#C49A6C] border-t-transparent animate-spin mb-4" />
      <p className="font-serif italic text-[#4A3427]">Preparing your secure checkout...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <Link href={ROUTES.cart} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C49A6C] hover:text-[#4A3427] transition-colors mb-6 group">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to shopping bag
          </Link>
          <h1 className="text-5xl font-serif text-[#4A3427] tracking-tighter">
            Finalize <span className="italic">Order</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-10">
            {/* Shipping Section */}
            <section className="bg-white rounded-[2.5rem] border border-[#C49A6C]/10 p-10 shadow-[0_20px_50px_rgba(196,154,108,0.05)]">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] flex items-center justify-center border border-[#C49A6C]/10">
                  <MapPin className="w-6 h-6 text-[#C49A6C]" />
                </div>
                <h2 className="text-2xl font-serif text-[#4A3427] italic">Shipping Destination</h2>
              </div>

              <form id="checkout-form" onSubmit={handleSubmit((d) => processOrder(d))} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#C49A6C] uppercase tracking-[0.2em] ml-1">City</label>
                    <div className="relative">
                      <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6B]/50" />
                      <input 
                        {...register("city")}
                        className={cn(
                          "w-full pl-12 pr-5 py-4 rounded-2xl border bg-[#FAF7F2]/50 outline-none transition-all font-medium text-[#4A3427]",
                          errors.city ? "border-red-200 ring-1 ring-red-50" : "border-[#C49A6C]/10 focus:border-[#C49A6C] focus:bg-white focus:ring-4 focus:ring-[#C49A6C]/5"
                        )} 
                        placeholder="e.g. Cairo"
                      />
                    </div>
                    {errors.city && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#C49A6C] uppercase tracking-[0.2em] ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6B]/50" />
                      <input 
                        {...register("phone")}
                        className={cn(
                          "w-full pl-12 pr-5 py-4 rounded-2xl border bg-[#FAF7F2]/50 outline-none transition-all font-medium text-[#4A3427]",
                          errors.phone ? "border-red-200 ring-1 ring-red-50" : "border-[#C49A6C]/10 focus:border-[#C49A6C] focus:bg-white focus:ring-4 focus:ring-[#C49A6C]/5"
                        )} 
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#C49A6C] uppercase tracking-[0.2em] ml-1">Address Details</label>
                  <textarea 
                    {...register("details")}
                    rows={4}
                    className={cn(
                      "w-full px-6 py-4 rounded-3xl border bg-[#FAF7F2]/50 outline-none transition-all resize-none font-medium text-[#4A3427]",
                      errors.details ? "border-red-200 ring-1 ring-red-50" : "border-[#C49A6C]/10 focus:border-[#C49A6C] focus:bg-white focus:ring-4 focus:ring-[#C49A6C]/5"
                    )}
                    placeholder="Street name, building number, apartment..."
                  />
                  {errors.details && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.details.message}</p>}
                </div>
              </form>
            </section>

            {/* Payment Section */}
            <section className="bg-white rounded-[2.5rem] border border-[#C49A6C]/10 p-10 shadow-[0_20px_50px_rgba(196,154,108,0.05)]">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] flex items-center justify-center border border-[#C49A6C]/10">
                  <CreditCard className="w-6 h-6 text-[#C49A6C]" />
                </div>
                <h2 className="text-2xl font-serif text-[#4A3427] italic">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { id: "cash", icon: Banknote, title: "Cash on Delivery", desc: "Pay at your doorstep" },
                  { id: "card", icon: CreditCard, title: "Online Payment", desc: "Secure card checkout" }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as "cash" | "card")}
                    className={cn(
                      "flex items-center gap-5 p-6 rounded-3xl border-2 transition-all text-left group",
                      paymentMethod === method.id 
                        ? "border-[#4A3427] bg-[#FAF7F2] ring-4 ring-[#C49A6C]/5" 
                        : "border-[#FAF7F2] bg-white hover:border-[#C49A6C]/30"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      paymentMethod === method.id ? "bg-[#4A3427] text-white" : "bg-[#FAF7F2] text-[#C49A6C]"
                    )}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-[#4A3427]">{method.title}</p>
                      <p className="text-[11px] text-[#8C7A6B] mt-0.5 uppercase tracking-wider">{method.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Summary Side */}
          <aside className="lg:col-span-5 sticky top-10">
            <div className="bg-[#4A3427] text-[#FAF7F2] rounded-[3rem] p-10 shadow-2xl shadow-brown/30 relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              
              <h3 className="font-serif text-3xl mb-10 italic">Order Review</h3>
              
              <div className="space-y-6 mb-10 border-b border-white/10 pb-10">
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-xs uppercase tracking-widest font-bold">Total Items</span>
                  <span className="font-serif text-lg">{cart?.numOfCartItems}</span>
                </div>
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-xs uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="font-serif text-lg">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest font-bold opacity-60">Shipping</span>
                  <span className="text-[10px] font-bold bg-[#C49A6C] text-[#4A3427] px-3 py-1 rounded-full">COMPLIMENTARY</span>
                </div>
              </div>

              <div className="mb-12">
                <p className="text-[10px] opacity-40 uppercase font-bold tracking-[0.3em] mb-3">Grand Total</p>
                <p className="text-5xl font-serif tracking-tighter">{formatPrice(total)}</p>
              </div>

              <button
                form="checkout-form"
                type="submit"
                disabled={isPending}
                className="w-full group flex items-center justify-center gap-4 bg-[#C49A6C] hover:bg-[#D4AA7C] text-[#4A3427] font-bold py-6 rounded-full transition-all disabled:opacity-50 shadow-xl shadow-black/10"
              >
                {isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-sm">{paymentMethod === "cash" ? "Confirm Order" : "Proceed to Payment"}</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </>
                )}
              </button>

              <div className="mt-10 flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-[#C49A6C] shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed opacity-50 italic">
                  Your purchase is secured with end-to-end encryption. By confirming, you agree to our terms of curated service.
                </p>
              </div>
            </div>

            {/* Delivery Promise */}
            <div className="mt-8 p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#C49A6C]/10 flex gap-5">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <Truck className="w-6 h-6 text-[#C49A6C]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#4A3427] uppercase tracking-wider">Fast-Track Delivery</p>
                <p className="text-xs text-[#8C7A6B] mt-2 leading-relaxed italic">
                  Expect your curated pieces within <span className="font-bold text-[#C49A6C]">24-48 hours</span>.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}