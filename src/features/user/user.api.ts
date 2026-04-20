import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  _id:       string;
  name:      string;
  email:     string;
  phone:     string;
  role:      "user" | "admin";
  photo?:    string;
  createdAt: string;
}

export interface UpdateProfileInput {
  name?:  string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  password:        string;
  rePassword:      string;
}

export interface OrderAddress {
  details: string;
  phone:   string;
  city:    string;
}

export interface OrderProduct {
  count:   number;
  _id:     string;
  product: {
    _id:        string;
    title:      string;
    imageCover: string;
    price:      number;
    category:   { name: string };
    brand?:     { name: string };
  };
  price: number;
}

export interface Order {
  _id:                   string;
  cartItems:             OrderProduct[];
  shippingAddress:       OrderAddress;
  totalOrderPrice:       number;
  paymentMethodType:     "cash" | "card";
  isPaid:                boolean;
  paidAt?:               string;
  isDelivered:           boolean;
  deliveredAt?:          string;
  createdAt:             string;
  updatedAt:             string;
  user: {
    _id:   string;
    name:  string;
    email: string;
    phone: string;
  };
}

// ─── Get logged-in user profile ───────────────────────────────────────────────

export async function getProfileApi(): Promise<UserProfile> {
  // ملاحظة: باكيند Route لا يوفر عادة endpoint باسم getMe. 
  // إذا كان متوفراً لديك، تأكد من أن الاستجابة تعيد data.data أو data.user
  const { data } = await apiClient.get<{ data: UserProfile; user?: UserProfile }>("/users/getMe");
  return data.data || data.user!;
}

// ─── Update profile (name / email / phone) ────────────────────────────────────

export async function updateProfileApi(
  payload: UpdateProfileInput
): Promise<UserProfile> {
  try {
    const { data } = await apiClient.put<{ message: string; user: UserProfile }>(
      "/users/updateMe",
      payload
    );
    return data.user;
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    throw error;
  }
}

// ─── Upload profile photo ─────────────────────────────────────────────────────
// Sends multipart/form-data with field name "photo"

export async function uploadProfilePhotoApi(file: File): Promise<UserProfile> {
  const form = new FormData();
  form.append("photo", file);

  const { data } = await apiClient.put<ApiResponse<UserProfile>>(
    "/users/uploadUserPhoto",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}

// ─── Change password ──────────────────────────────────────────────────────────

export async function changePasswordApi(
  payload: ChangePasswordInput
): Promise<{ message: string; token: string }> {
  const { data } = await apiClient.put<{ message: string; token: string }>(
    "/users/changeMyPassword",
    payload
  );
  return data;
}

// ─── Get user orders ──────────────────────────────────────────────────────────

export async function getUserOrdersApi(userId: string): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>(`/orders/user/${userId}`);
  return data;
}