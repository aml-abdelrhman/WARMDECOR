import apiClient from "@/lib/axios";
import type { CartResponse, WishlistResponse } from "@/types";

// ───────────────── CART ─────────────────

export const getCartApi = async (): Promise<CartResponse> => {
  const { data } = await apiClient.get("/cart");
  return data;
};

export const addToCartApi = async (productId: string): Promise<CartResponse> => {
  const { data } = await apiClient.post("/cart", { productId });
  return data;
};

export const updateCartItemApi = async (
  itemId: string,
  count: number
): Promise<CartResponse> => {
  const { data } = await apiClient.put(`/cart/${itemId}`, { count });
  return data;
};

export const removeCartItemApi = async (
  itemId: string
): Promise<CartResponse> => {
  const { data } = await apiClient.delete(`/cart/${itemId}`);
  return data;
};

export const clearCartApi = async (): Promise<{ message: string }> => {
  const { data } = await apiClient.delete("/cart");
  return data;
};

// ───────────────── WISHLIST ─────────────────

export const getWishlistApi = async (): Promise<WishlistResponse> => {
  const { data } = await apiClient.get("/wishlist");
  return data;
};

export const addToWishlistApi = async (
  productId: string
): Promise<WishlistResponse> => {
  const { data } = await apiClient.post("/wishlist", { productId });
  return data;
};

export const removeFromWishlistApi = async (
  productId: string
): Promise<WishlistResponse> => {
  const { data } = await apiClient.delete(`/wishlist/${productId}`);
  return data;
};