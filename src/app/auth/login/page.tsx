"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

import { LoginSchema, type LoginInput } from "@/types";
import { loginApi } from "@/features/auth/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/app";
import { isAppError } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  // قائمة الأدمن - تأكد أن الإيميل هنا مكتوب بدقة وبدون مسافات
  const ADMIN_EMAILS = ["youssef75@gmail.com"];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      console.log("✅ Login API Response:", data);

      if (data.user && data.token) {
        // تحويل الإيميل المدخل والمخزن لحروف صغيرة وحذف أي مسافات زائدة
        const enteredEmail = data.user.email.toLowerCase().trim();
        
        // التحقق من صلاحية الأدمن
        const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase().trim() === enteredEmail);
        const role = isAdmin ? "admin" : "user";

        console.log("🛠️ Role Detection:", { isAdmin, role, ADMIN_EMAILS, enteredEmail });

        setAuth(
          {
            ...data.user,
            role,
          },
          data.token
        );

        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);

        // التوجيه بناءً على الرول
        if (role === "admin") {
          console.log("🚀 Navigating to /admin");
          router.push("/admin");
        } else {
          router.push(ROUTES.home);
        }
      }
    },
    onError: (err: unknown) => {
      const msg = isAppError(err) ? err.message : "Login failed. Try again.";
      toast.error(msg);
    },
  });

  const onSubmit = (values: LoginInput) => login(values);

  return (
    // الخلفية كريمي فاتح
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[2rem] bg-[#5C3D23] flex items-center justify-center shadow-xl shadow-[#5C3D23]/20 mb-6">
            <ShoppingBag className="w-8 h-8 text-[#F5EFE6]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl text-[#5C3D23] font-light tracking-tighter">
            Welcome <em className="italic font-serif">Back</em>
          </h1>
          <p className="text-[#C49A6C] text-xs uppercase tracking-[0.2em] font-bold mt-2">
            Luxury Shopping Awaits
          </p>
        </div>

        {/* Form Card - تصميم نظيف وبسيط */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#C49A6C]/10 border border-[#C49A6C]/10 p-10">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] ml-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                suppressHydrationWarning
                className={`
                  w-full px-5 py-4 rounded-2xl border bg-[#FAF7F2]
                  text-[#5C3D23] placeholder:text-[#C49A6C]/50 text-sm
                  outline-none transition-all duration-300
                  focus:ring-2 focus:ring-[#C49A6C]/20 focus:border-[#C49A6C]
                  ${errors.email ? "border-red-400" : "border-transparent"}
                `}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C]">
                  Password
                </label>
                <Link href={ROUTES.forgotPassword} className="text-[10px] text-[#5C3D23] hover:underline font-bold uppercase tracking-tighter">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  suppressHydrationWarning
                  className={`
                    w-full px-5 py-4 pr-12 rounded-2xl border bg-[#FAF7F2]
                    text-[#5C3D23] placeholder:text-[#C49A6C]/50 text-sm
                    outline-none transition-all duration-300
                    focus:ring-2 focus:ring-[#C49A6C]/20 focus:border-[#C49A6C]
                    ${errors.password ? "border-red-400" : "border-transparent"}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C49A6C] hover:text-[#5C3D23] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              suppressHydrationWarning
              className="
                w-full flex items-center justify-center gap-3
                bg-[#5C3D23] text-[#F5EFE6] font-bold text-sm
                py-4 rounded-2xl shadow-xl shadow-[#5C3D23]/20
                hover:bg-[#3d2918] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 mt-4
              "
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[#C49A6C]/10" />
            <span className="text-[10px] text-[#C49A6C] font-black tracking-[0.2em]">OR</span>
            <div className="flex-1 h-px bg-[#C49A6C]/10" />
          </div>

          <p className="text-center text-sm text-[#5C3D23]/60">
            New to our boutique?{" "}
            <Link href={ROUTES.register} className="text-[#C49A6C] hover:text-[#5C3D23] font-black transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}