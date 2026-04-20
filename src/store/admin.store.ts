import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminOrder, AdminUser, OrderStatus } from "@/types";

// ─── TYPES ─────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  sold: number;
  category: string;
  brand: string;
  ratingsAverage: number;
  imageCover: string;
  createdAt: string;
  active: boolean;
}

// ─── SEED DATA ─────────────────────────────────────────

// 🟢 PRODUCTS (6)
const SEED_PRODUCTS: AdminProduct[] = [
  { id: "p1", title: "MacBook Pro 14", price: 45000, quantity: 12, sold: 88, category: "Electronics", brand: "Apple", ratingsAverage: 4.9, imageCover: "", createdAt: "2024-01-10", active: true },
  { id: "p2", title: "iPhone 15", price: 35000, quantity: 20, sold: 120, category: "Electronics", brand: "Apple", ratingsAverage: 4.8, imageCover: "", createdAt: "2024-02-01", active: true },
  { id: "p3", title: "Samsung S23", price: 28000, quantity: 15, sold: 90, category: "Electronics", brand: "Samsung", ratingsAverage: 4.7, imageCover: "", createdAt: "2024-02-15", active: true },
  { id: "p4", title: "AirPods Pro", price: 8000, quantity: 30, sold: 200, category: "Accessories", brand: "Apple", ratingsAverage: 4.9, imageCover: "", createdAt: "2024-03-01", active: true },
  { id: "p5", title: "Dell XPS 13", price: 40000, quantity: 10, sold: 50, category: "Electronics", brand: "Dell", ratingsAverage: 4.6, imageCover: "", createdAt: "2024-03-10", active: true },
  { id: "p6", title: "HP Laptop", price: 25000, quantity: 18, sold: 60, category: "Electronics", brand: "HP", ratingsAverage: 4.5, imageCover: "", createdAt: "2024-04-01", active: true },
];

// 🟢 ORDERS (6)
const SEED_ORDERS: AdminOrder[] = [
  { id: "o1", user: { name: "Ahmed", email: "a@test.com" }, products: [{ title: "MacBook", quantity: 1, price: 45000 }], totalPrice: 45000, status: "delivered", paymentMethod: "card", createdAt: "2024-06-01" },
  { id: "o2", user: { name: "Sara", email: "s@test.com" }, products: [{ title: "iPhone", quantity: 1, price: 35000 }], totalPrice: 35000, status: "pending", paymentMethod: "cash", createdAt: "2024-06-02" },
  { id: "o3", user: { name: "Ali", email: "ali@test.com" }, products: [{ title: "Samsung", quantity: 1, price: 28000 }], totalPrice: 28000, status: "shipped", paymentMethod: "card", createdAt: "2024-06-03" },
  { id: "o4", user: { name: "Mona", email: "m@test.com" }, products: [{ title: "AirPods", quantity: 2, price: 16000 }], totalPrice: 16000, status: "delivered", paymentMethod: "card", createdAt: "2024-06-04" },
  { id: "o5", user: { name: "Omar", email: "o@test.com" }, products: [{ title: "Dell", quantity: 1, price: 40000 }], totalPrice: 40000, status: "cancelled", paymentMethod: "cash", createdAt: "2024-06-05" },
  { id: "o6", user: { name: "Laila", email: "l@test.com" }, products: [{ title: "HP", quantity: 1, price: 25000 }], totalPrice: 25000, status: "processing", paymentMethod: "card", createdAt: "2024-06-06" },
];

// 🟢 USERS (6)
const SEED_USERS: AdminUser[] = [
  { id: "u1", name: "Ahmed", email: "a@test.com", phone: "0100", role: "user", createdAt: "2024-01-01", active: true },
  { id: "u2", name: "Sara", email: "s@test.com", phone: "0101", role: "user", createdAt: "2024-01-02", active: true },
  { id: "u3", name: "Ali", email: "ali@test.com", phone: "0102", role: "admin", createdAt: "2024-01-03", active: true },
  { id: "u4", name: "Mona", email: "m@test.com", phone: "0103", role: "user", createdAt: "2024-01-04", active: true },
  { id: "u5", name: "Omar", email: "o@test.com", phone: "0104", role: "user", createdAt: "2024-01-05", active: false },
  { id: "u6", name: "Laila", email: "l@test.com", phone: "0105", role: "user", createdAt: "2024-01-06", active: true },
];

// ─── STATE ─────────────────────────────────────────────

interface AdminState {
  products: AdminProduct[];
  orders: AdminOrder[];
  users: AdminUser[];

  addProduct: (p: Omit<AdminProduct, "id" | "sold" | "createdAt">) => void;
  updateProduct: (id: string, patch: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;

  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  toggleUserActive: (id: string) => void;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: "user" | "admin") => void;
}

// ─── STORE ─────────────────────────────────────────────

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      users: SEED_USERS,

      addProduct: (p) =>
        set((s) => ({
          products: [
            {
              ...p,
              id: `p${Date.now()}`,
              sold: 0,
              createdAt: new Date().toISOString(),
            },
            ...s.products,
          ],
        })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      deleteProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        })),

      toggleProductActive: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
          ),
        })),

      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),

      deleteOrder: (id) =>
        set((s) => ({
          orders: s.orders.filter((o) => o.id !== id),
        })),

      toggleUserActive: (id) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, active: !u.active } : u
          ),
        })),

      deleteUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
        })),

      updateUserRole: (id, role) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, role } : u
          ),
        })),
    }),
    {
      name: "ec-admin",
      storage: createJSONStorage(() => localStorage),
    }
  )
);