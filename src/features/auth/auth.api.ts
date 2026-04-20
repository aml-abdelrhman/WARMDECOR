import apiClient from "@/lib/axios";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  AuthResponse,
} from "@/types";

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginApi(payload: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signin", payload);
  return data;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerApi(
  payload: RegisterInput
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/auth/signup",
    payload
  );
  return data;
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPasswordApi(
  payload: ForgotPasswordInput
): Promise<{ message: string; statusMsg: string }> {
  const { data } = await apiClient.post("/auth/forgotPasswords", payload);
  return data;
}

// ─── Verify Reset Code ────────────────────────────────────────────────────────

export async function verifyResetCodeApi(
  resetCode: string
): Promise<{ status: string }> {
  const { data } = await apiClient.post("/auth/verifyResetCode", {
    resetCode,
  });
  return data;
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPasswordApi(
  payload: ResetPasswordInput
): Promise<AuthResponse> {
  const { data } = await apiClient.put<AuthResponse>(
    "/auth/resetPassword",
    payload
  );
  return data;
}