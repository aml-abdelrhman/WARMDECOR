"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Loader2, User, Mail, Phone,
  Lock, Eye, EyeOff, CheckCircle2, ShieldAlert,
  Pencil, X, Save,
} from "lucide-react";

import {
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "@/features/user/user.api";
import { useAuthStore } from "@/store/auth.store";
import { isAppError } from "@/lib/axios";
import { cn } from "@/lib/utils";

// ─── Query key ────────────────────────────────────────────────────────────────

const PROFILE_KEY = ["profile"] as const;

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ProfileSchema = z.object({
  name:  z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number"),
});

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Required"),
    password:        z.string().min(6, "Min 6 characters"),
    rePassword:      z.string(),
  })
  .refine((d) => d.password === d.rePassword, {
    message: "Passwords do not match",
    path:    ["rePassword"],
  });

type ProfileFormData  = z.infer<typeof ProfileSchema>;
type PasswordFormData = z.infer<typeof PasswordSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-feedback-error animate-fade-in flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full px-3 py-2.5 rounded-xl border bg-surface-secondary text-ink text-sm",
    "placeholder:text-ink-disabled outline-none transition-all duration-150",
    "focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
    hasError
      ? "border-feedback-error ring-1 ring-feedback-error"
      : "border-border"
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const qc         = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const setAuth    = useAuthStore((s) => s.setAuth);
  const storeUser  = useAuthStore((s) => s.user);

  const [editMode,       setEditMode]       = useState(false);
  const [showCurrentPw,  setShowCurrentPw]  = useState(false);
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [showConfirmPw,  setShowConfirmPw]  = useState(false);

  // ── Fetch profile ──

  const { data: profile, isLoading } = useQuery({
    queryKey: PROFILE_KEY,
    queryFn:  getProfileApi,
    // Pre-fill from store while API loads
    placeholderData: storeUser
      ? {
          _id:       storeUser._id,
          name:      storeUser.name,
          email:     storeUser.email,
          phone:     "",
          role:      storeUser.role,
          createdAt: "",
        }
      : undefined,
  });

  // ── Profile form ──

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    values: {
      name:  profile?.name  ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
    },
  });

  // ── Password form ──

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { currentPassword: "", password: "", rePassword: "" },
  });

  // ── Mutations ──

  const { mutate: updateProfile, isPending: savingProfile } = useMutation({
    mutationFn: (payload: UpdateProfileInput) => updateProfileApi(payload),
    onSuccess: (updated) => {
      // Sync Zustand store so Navbar name updates immediately
      if (updated) updateUser({ name: updated.name, email: updated.email });
      void qc.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Profile updated!");
      setEditMode(false);
    },
    onError: (e: unknown) =>
      toast.error(isAppError(e) ? e.message : "Failed to update profile."),
  });

  const { mutate: changePassword, isPending: changingPw } = useMutation({
    mutationFn: (payload: ChangePasswordInput) => changePasswordApi(payload),
    onSuccess: (res) => {
      // API returns a new token after password change — update store
      if (storeUser && res.token) {
        setAuth({ ...storeUser, token: res.token }, res.token);
      }
      passwordForm.reset();
      toast.success("Password changed successfully!");
    },
    onError: (e: unknown) =>
      toast.error(isAppError(e) ? e.message : "Failed to change password."),
  });

  // ── Skeleton ──

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
      </div>
    );
  }

  const initials = (profile?.name ?? "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-surface-secondary py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* ── Page title ── */}
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">
            My Profile
          </h1>
          <p className="text-ink-secondary text-sm mt-1">
            Manage your personal information and security settings.
          </p>
        </div>

        {/* ── Avatar + basic info card ── */}
        <div className="bg-surface rounded-3xl border border-border shadow-soft p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Static Avatar Display */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-brand-100 border-2 border-border shadow-medium flex items-center justify-center">
                {profile?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-brand-700">
                    {initials}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-ink">{profile?.name}</p>
                <p className="text-xs text-ink-tertiary mt-0.5">Profile Photo</p>
              </div>
            </div>

            {/* Info / Edit form */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-ink">Personal Information</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors px-3 py-1.5 rounded-xl hover:bg-brand-50 border border-transparent hover:border-brand-200"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditMode(false); profileForm.reset(); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-ink-tertiary hover:text-ink transition-colors px-3 py-1.5 rounded-xl hover:bg-surface-secondary border border-transparent"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>

              {/* Read-only view */}
              {!editMode ? (
                <div className="space-y-3">
                  {[
                    { icon: User,  label: "Full name", value: profile?.name  },
                    { icon: Mail,  label: "Email",     value: profile?.email },
                    { icon: Phone, label: "Phone",     value: profile?.phone || "—" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-surface-secondary border border-border">
                      <Icon className="w-4 h-4 text-ink-tertiary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-2xs text-ink-tertiary uppercase tracking-wide font-semibold">{label}</p>
                        <p className="text-sm font-medium text-ink truncate">{value}</p>
                      </div>
                    </div>
                  ))}

                  {/* Role badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                      profile?.role === "admin"
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "bg-surface-tertiary text-ink-secondary border border-border"
                    )}>
                      <CheckCircle2 className="w-3 h-3" />
                      {profile?.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </div>
                </div>
              ) : (
                /* Edit form */
                <form
                  onSubmit={profileForm.handleSubmit((d) => {
                    // استخراج الحقول التي تغيرت فقط لتجنب خطأ 400 (duplicate email)
                    const dirtyFields = profileForm.formState.dirtyFields;
                    const updateData: UpdateProfileInput = {};
                    
                    if (dirtyFields.name)  updateData.name  = d.name;
                    if (dirtyFields.phone) updateData.phone = d.phone;
                    // لا ترسل الإيميل إلا لو تغير فعلاً
                    if (dirtyFields.email) updateData.email = d.email;

                    if (Object.keys(updateData).length > 0) {
                      updateProfile(updateData);
                    } else {
                      setEditMode(false);
                    }
                  })}
                  noValidate
                  className="space-y-3"
                >
                  <Field label="Full name" error={profileForm.formState.errors.name?.message}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
                      <input
                        {...profileForm.register("name")}
                        placeholder="Your full name"
                        className={cn(inputCls(!!profileForm.formState.errors.name), "pl-9")}
                      />
                    </div>
                  </Field>

                  <Field label="Email" error={profileForm.formState.errors.email?.message}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
                      <input
                        type="email"
                        {...profileForm.register("email")}
                        placeholder="your@email.com"
                        className={cn(inputCls(!!profileForm.formState.errors.email), "pl-9")}
                      />
                    </div>
                  </Field>

                  <Field label="Phone" error={profileForm.formState.errors.phone?.message}>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
                      <input
                        type="tel"
                        {...profileForm.register("phone")}
                        placeholder="01xxxxxxxxx"
                        className={cn(inputCls(!!profileForm.formState.errors.phone), "pl-9")}
                      />
                    </div>
                  </Field>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white text-sm font-semibold py-3 rounded-xl shadow-brand hover:opacity-90 disabled:opacity-60 transition-all mt-1"
                  >
                    {savingProfile
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      : <><Save className="w-4 h-4" /> Save Changes</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Change password card ── */}
        <div className="bg-surface rounded-3xl border border-border shadow-soft p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Lock className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">Change Password</h2>
              <p className="text-xs text-ink-tertiary">Keep your account secure</p>
            </div>
          </div>

          <form
            onSubmit={passwordForm.handleSubmit((d) => changePassword(d))}
            noValidate
            className="space-y-4"
          >
            {/* Current password */}
            <Field label="Current Password" error={passwordForm.formState.errors.currentPassword?.message}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
                <input
                  type={showCurrentPw ? "text" : "password"}
                  autoComplete="current-password"
                  {...passwordForm.register("currentPassword")}
                  placeholder="Your current password"
                  className={cn(inputCls(!!passwordForm.formState.errors.currentPassword), "pl-9 pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink transition-colors"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New password */}
              <Field label="New Password" error={passwordForm.formState.errors.password?.message}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
                  <input
                    type={showNewPw ? "text" : "password"}
                    autoComplete="new-password"
                    {...passwordForm.register("password")}
                    placeholder="Min. 6 characters"
                    className={cn(inputCls(!!passwordForm.formState.errors.password), "pl-9 pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink transition-colors"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              {/* Confirm password */}
              <Field label="Confirm Password" error={passwordForm.formState.errors.rePassword?.message}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    autoComplete="new-password"
                    {...passwordForm.register("rePassword")}
                    placeholder="Repeat new password"
                    className={cn(inputCls(!!passwordForm.formState.errors.rePassword), "pl-9 pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            </div>

            <button
              type="submit"
              disabled={changingPw}
              className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white text-sm font-semibold py-3 rounded-xl shadow-brand hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {changingPw
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                : <><Lock className="w-4 h-4" /> Update Password</>
              }
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}