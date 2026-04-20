"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  Eye, EyeOff, User, Mail, 
  Lock, Phone, ArrowRight, 
  Loader2, ShoppingBag 
} from "lucide-react";

import { RegisterSchema, type RegisterInput } from "@/types";
import { registerApi } from "@/features/auth/auth.api";
import { ROUTES } from "@/constants/app";
import { isAppError } from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const { mutate: signUp, isPending } = useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      toast.success("Account created successfully! Please sign in.");
      router.push(ROUTES.login);
    },
    onError: (err: unknown) => {
      const msg = isAppError(err) ? err.message : "Registration failed. Try again.";
      toast.error(msg);
    },
  });

  const onSubmit = (values: RegisterInput) => signUp(values);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[2rem] bg-[#5C3D23] flex items-center justify-center shadow-xl shadow-[#5C3D23]/20 mb-6">
            <ShoppingBag className="w-8 h-8 text-[#F5EFE6]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl text-[#5C3D23] font-light tracking-tighter text-center">
            Create your <em className="italic font-serif text-[#C49A6C]">Boutique</em> Profile
          </h1>
          <p className="text-[#C49A6C] text-xs uppercase tracking-[0.2em] font-bold mt-2">
            Join our exclusive community
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#C49A6C]/10 border border-[#C49A6C]/10 p-10">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C49A6C]/60" />
                <input
                  type="text"
                  placeholder="Youssef Mohamed"
                  {...register("name")}
                  className={`w-full pl-11 pr-5 py-4 rounded-2xl border bg-[#FAF7F2] text-[#5C3D23] placeholder:text-[#C49A6C]/40 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#C49A6C]/20 focus:border-[#C49A6C] ${errors.name ? "border-red-400" : "border-transparent"}`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C49A6C]/60" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`w-full pl-11 pr-5 py-4 rounded-2xl border bg-[#FAF7F2] text-[#5C3D23] placeholder:text-[#C49A6C]/40 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#C49A6C]/20 focus:border-[#C49A6C] ${errors.email ? "border-red-400" : "border-transparent"}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] ml-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C49A6C]/60" />
                  <input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    {...register("phone")}
                    className={`w-full pl-11 pr-5 py-4 rounded-2xl border bg-[#FAF7F2] text-[#5C3D23] placeholder:text-[#C49A6C]/40 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#C49A6C]/20 focus:border-[#C49A6C] ${errors.phone ? "border-red-400" : "border-transparent"}`}
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C49A6C]/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full pl-11 pr-12 py-4 rounded-2xl border bg-[#FAF7F2] text-[#5C3D23] placeholder:text-[#C49A6C]/40 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#C49A6C]/20 focus:border-[#C49A6C] ${errors.password ? "border-red-400" : "border-transparent"}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C49A6C]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.password.message}</p>}
              </div>
            </div>

            {/* Re-Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C49A6C]/60" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("rePassword")}
                  className={`w-full pl-11 pr-5 py-4 rounded-2xl border bg-[#FAF7F2] text-[#5C3D23] placeholder:text-[#C49A6C]/40 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#C49A6C]/20 focus:border-[#C49A6C] ${errors.rePassword ? "border-red-400" : "border-transparent"}`}
                />
              </div>
              {errors.rePassword && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.rePassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 bg-[#5C3D23] text-[#F5EFE6] font-bold text-sm py-4 rounded-2xl shadow-xl shadow-[#5C3D23]/20 hover:bg-[#3d2918] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 mt-6"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Registration <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[#C49A6C]/10" />
            <span className="text-[10px] text-[#C49A6C] font-black tracking-[0.2em]">ALREADY A MEMBER?</span>
            <div className="flex-1 h-px bg-[#C49A6C]/10" />
          </div>

          <p className="text-center text-sm text-[#5C3D23]/60">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="text-[#C49A6C] hover:text-[#5C3D23] font-black transition-colors">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
