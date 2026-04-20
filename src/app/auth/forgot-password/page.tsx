"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  ArrowLeft, ArrowRight, Loader2, Mail,
  KeyRound, ShieldCheck, Lock,
} from "lucide-react";

import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/types";
import {
  forgotPasswordApi,
  verifyResetCodeApi,
  resetPasswordApi,
} from "@/features/auth/auth.api";
import { ROUTES } from "@/constants/app";
import { isAppError } from "@/lib/axios";

// ─── Step 2 schema ────────────────────────────────────────────────────────────

const VerifyCodeSchema = z.object({
  resetCode: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});
type VerifyCodeInput = z.infer<typeof VerifyCodeSchema>;

// ─── Step type ────────────────────────────────────────────────────────────────

type Step = "email" | "verify" | "reset";

const STEP_META: Record<Step, { title: string; subtitle: string; Icon: React.ElementType }> = {
  email:  { title: "Forgot password?",    subtitle: "Enter your email and we'll send a reset code.", Icon: Mail },
  verify: { title: "Check your inbox",    subtitle: "Enter the 6-digit code we sent to your email.", Icon: ShieldCheck },
  reset:  { title: "Set new password",    subtitle: "Choose a strong password for your account.",   Icon: Lock },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const router   = useRouter();
  const [step,   setStep]   = useState<Step>("email");
  const [email,  setEmail]  = useState("");

  // ── Step 1 form ──
  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // ── Step 2 form ──
  const verifyForm = useForm<VerifyCodeInput>({
    resolver: zodResolver(VerifyCodeSchema),
    defaultValues: { resetCode: "" },
  });

  // ── Step 3 form ──
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { email: "", newPassword: "" },
  });

  // ── Mutations ──
  const sendCode = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (_, vars) => {
      setEmail(vars.email);
      resetForm.setValue("email", vars.email);
      toast.success("Reset code sent to your email!");
      setStep("verify");
    },
    onError: (err: unknown) => {
      toast.error(isAppError(err) ? err.message : "Failed to send code.");
    },
  });

  const verifyCode = useMutation({
    mutationFn: (d: VerifyCodeInput) => verifyResetCodeApi(d.resetCode),
    onSuccess: () => {
      toast.success("Code verified!");
      setStep("reset");
    },
    onError: (err: unknown) => {
      toast.error(isAppError(err) ? err.message : "Invalid or expired code.");
    },
  });

  const resetPassword = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      toast.success("Password reset! Please sign in.");
      router.push(ROUTES.login);
    },
    onError: (err: unknown) => {
      toast.error(isAppError(err) ? err.message : "Reset failed. Try again.");
    },
  });

  const { title, subtitle, Icon } = STEP_META[step];

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand mb-4">
            <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-3xl text-ink font-bold tracking-tight text-center">
            {title}
          </h1>
          <p className="text-ink-secondary text-sm mt-1 text-center max-w-xs">
            {subtitle}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {(["email", "verify", "reset"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${step === s
                  ? "bg-brand-500 text-white shadow-brand"
                  : (["email", "verify", "reset"].indexOf(step) > i)
                    ? "bg-feedback-success text-white"
                    : "bg-border text-ink-tertiary"
                }
              `}>
                {i + 1}
              </div>
              {i < 2 && (
                <div className={`w-8 h-0.5 rounded transition-all duration-300 ${
                  ["email", "verify", "reset"].indexOf(step) > i
                    ? "bg-feedback-success"
                    : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-surface rounded-3xl shadow-medium border border-border p-8 space-y-5">

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <form
              onSubmit={emailForm.handleSubmit((v) => sendCode.mutate(v))}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label htmlFor="fe-email" className="text-sm font-medium text-ink-secondary">
                  Email address
                </label>
                <input
                  id="fe-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...emailForm.register("email")}
                  className={`
                    w-full px-4 py-3 rounded-xl border bg-surface-secondary
                    text-ink placeholder:text-ink-disabled text-sm outline-none
                    transition-all duration-150
                    focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                    ${emailForm.formState.errors.email ? "border-feedback-error ring-1 ring-feedback-error" : "border-border"}
                  `}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-feedback-error animate-fade-in">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <SubmitButton loading={sendCode.isPending} label="Send reset code" />
            </form>
          )}

          {/* ── Step 2: Verify Code ── */}
          {step === "verify" && (
            <form
              onSubmit={verifyForm.handleSubmit((v) => verifyCode.mutate(v))}
              noValidate
              className="space-y-4"
            >
              <p className="text-xs text-ink-secondary text-center">
                Code sent to{" "}
                <span className="font-semibold text-ink">{email}</span>
              </p>
              <div className="space-y-1.5">
                <label htmlFor="resetCode" className="text-sm font-medium text-ink-secondary">
                  6-digit code
                </label>
                <input
                  id="resetCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  {...verifyForm.register("resetCode")}
                  className={`
                    w-full px-4 py-3 rounded-xl border bg-surface-secondary
                    text-ink placeholder:text-ink-disabled text-sm outline-none
                    tracking-[0.4em] text-center font-mono
                    transition-all duration-150
                    focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                    ${verifyForm.formState.errors.resetCode ? "border-feedback-error ring-1 ring-feedback-error" : "border-border"}
                  `}
                />
                {verifyForm.formState.errors.resetCode && (
                  <p className="text-xs text-feedback-error animate-fade-in text-center">
                    {verifyForm.formState.errors.resetCode.message}
                  </p>
                )}
              </div>
              <SubmitButton loading={verifyCode.isPending} label="Verify code" />
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-xs text-ink-tertiary hover:text-ink-secondary transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === "reset" && (
            <form
              onSubmit={resetForm.handleSubmit((v) => resetPassword.mutate(v))}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="text-sm font-medium text-ink-secondary">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  {...resetForm.register("newPassword")}
                  className={`
                    w-full px-4 py-3 rounded-xl border bg-surface-secondary
                    text-ink placeholder:text-ink-disabled text-sm outline-none
                    transition-all duration-150
                    focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                    ${resetForm.formState.errors.newPassword ? "border-feedback-error ring-1 ring-feedback-error" : "border-border"}
                  `}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-xs text-feedback-error animate-fade-in">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <SubmitButton loading={resetPassword.isPending} label="Reset password" />
            </form>
          )}

          {/* Back to login */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <Link
              href={ROUTES.login}
              className="text-xs text-ink-tertiary hover:text-brand-600 font-medium flex items-center gap-1 transition-colors"
            >
              <KeyRound className="w-3 h-3" />
              Back to login
            </Link>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared submit button ─────────────────────────────────────────────────────

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        w-full flex items-center justify-center gap-2
        bg-gradient-brand text-white font-semibold text-sm
        py-3.5 rounded-xl shadow-brand
        hover:opacity-90 active:scale-[0.98]
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all duration-150
      "
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Please wait…
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}