import apiClient from "@/lib/axios";
import { isAxiosError } from "axios";

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
}

export interface CheckoutInput {
  cartId: string;
  shippingAddress: ShippingAddress;
}

// 1. طلب دفع نقدي (Cash Order)
export async function createCashOrderApi({ cartId, shippingAddress }: CheckoutInput) {
  try {
    const { data } = await apiClient.post(`/orders/${cartId}`, {
      shippingAddress,
    });
    return data;
  } catch (error) {
    const msg = isAxiosError(error) ? error.response?.data : error;
    console.error("❌ Cash Order Error:", msg);
    throw error;
  }
}

// 2. طلب دفع أونلاين (Online Payment)
export async function createOnlineOrderApi({ cartId, shippingAddress }: CheckoutInput) {
  try {
    // نقوم بإرسال رابط الموقع الحالي ليعود المستخدم إليه بعد الدفع
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data } = await apiClient.post(
      `/orders/checkout-session/${cartId}?url=${origin}`,
      {
        shippingAddress,
      }
    );
    return data; // سيعيد رابط (URL) لبوابة الدفع
  } catch (error) {
    console.error("❌ Online Order Error:", error);
    throw error;
  }
}