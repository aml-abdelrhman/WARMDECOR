import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  addToWishlistApi,
  removeFromWishlistApi,
} from "@/features/cart/cart.api";

import {
  deleteProductApi,
  updateProductApi,
} from "@/features/products/products.api";

import { isAppError } from "@/lib/axios";

export function useProductActions() {
  const queryClient = useQueryClient();

  // ─── CART ─────────────────────────

  const addToCart = useMutation({
    mutationFn: (productId: string) => addToCartApi(productId),
    onSuccess: () => {
      toast.success("Added to cart successfully!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) =>
      toast.error(isAppError(err) ? err.message : "Failed to add to cart"),
  });

  const updateCartItem = useMutation({
    mutationFn: ({ productId, count }: { productId: string; count: number }) =>
      updateCartItemApi(productId, count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) =>
      toast.error(isAppError(err) ? err.message : "Failed to update cart"),
  });

  const removeCartItem = useMutation({
    mutationFn: (productId: string) => removeCartItemApi(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed");
    },
    onError: (err) =>
      toast.error(isAppError(err) ? err.message : "Failed to remove item"),
  });

  const clearCart = useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared");
    },
    onError: (err) =>
      toast.error(isAppError(err) ? err.message : "Failed to clear cart"),
  });

  // ─── WISHLIST ──────────────────────

  const toggleWishlist = useMutation({
    mutationFn: async ({
      id,
      isWishlisted,
    }: {
      id: string;
      isWishlisted: boolean;
    }) => {
      return isWishlisted ? removeFromWishlistApi(id) : addToWishlistApi(id);
    },
    onSuccess: () => {
      toast.success("Wishlist updated");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (err) =>
      toast.error(isAppError(err) ? err.message : "Request failed"),
  });

  // ─── ADMIN ─────────────────────────

  const deleteProduct = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("Could not delete product"),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateProductApi(id, data),
    onSuccess: () => {
      toast.success("Product updated");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  return {
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    toggleWishlist,
    deleteProduct,
    updateProduct,
  };
}