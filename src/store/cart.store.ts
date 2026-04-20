import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminProduct } from "./admin.store";

interface CartItem extends AdminProduct {
  cartQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: AdminProduct) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id);
          if (exists) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, cartQuantity: item.cartQuantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, cartQuantity: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "ec-cart", storage: createJSONStorage(() => localStorage) }
  )
);