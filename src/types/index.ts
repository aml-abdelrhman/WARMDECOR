import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

export type ID = string;

// ─────────────────────────────────────────────────────────────────────────────
// API ENVELOPE
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  message: string;
  statusMsg?: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  results:    number;
  totalPages?: number;
  currentPage?: number;
  data:       T[];
  message?:   string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z
  .object({
    name:             z.string().min(3, "Name must be at least 3 characters"),
    email:            z.string().email("Invalid email address"),
    password:         z.string().min(6, "Password must be at least 6 characters"),
    rePassword:       z.string(),
    phone:            z
      .string()
      .regex(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number"),
  })
  .refine((d) => d.password === d.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  email:       z.string().email(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput          = z.infer<typeof LoginSchema>;
export type RegisterInput       = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput  = z.infer<typeof ResetPasswordSchema>;

export interface AuthUser {
  _id:   ID;
  name:  string;
  email: string;
  role:  "user" | "admin";
  token: string;
}

export interface AuthResponse {
  message: string;
  user?:   AuthUser;
  token?:  string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────────────────────────────────────────

export interface Category {
  _id:   ID;
  name:  string;
  slug:  string;
  image: string;
}

export interface SubCategory {
  _id:      ID;
  name:     string;
  slug:     string;
  category: ID;
}

export interface Brand {
  _id:   ID;
  name:  string;
  slug:  string;
  image: string;
}

export interface Product {
  _id:              ID;
  title:            string;
  slug:             string;
  description:      string;
  quantity:         number;
  sold:             number;
  price:            number;
  priceAfterDiscount?: number;
  imageCover:       string;
  images:           string[];
  category:         Category;
  subcategory?:     SubCategory[];
  brand?:           Brand;
  ratingsAverage:   number;
  ratingsQuantity:  number;
  createdAt:        string;
  updatedAt:        string;
}

export interface ProductsQueryParams {
  page?:     number;
  limit?:    number;
  sort?:     string;
  keyword?:  string;
  category?: string;
  brand?:    string;
  "price[gte]"?: number;
  "price[lte]"?: number;
   [key: string]: unknown;

}

// ─────────────────────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────────────────────

export interface CartItem {
  _id:     ID;
  count:   number;
  price:   number;
  product: Product;
}

export interface Cart {
  _id:               ID;
  cartOwner:         ID;
  products:          CartItem[];
  totalCartPrice:    number;
  totalPriceAfterDiscount?: number;
  createdAt:         string;
  updatedAt:         string;
}

export interface CartResponse {
  status:            string;
  numOfCartItems:    number;
  cartId:            ID;
  data:              Cart;
}

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────────────────

export interface WishlistResponse {
  status:  string;
  message: string;
  data:    Product[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN (mock)
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "card";

export interface AdminOrder {
  id:            ID;
  user:          { name: string; email: string };
  products:      Array<{ title: string; quantity: number; price: number }>;
  totalPrice:    number;
  status:        OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt:     string;
}

export interface AdminUser {
  id:        ID;
  name:      string;
  email:     string;
  phone:     string;
  role:      "user" | "admin";
  createdAt: string;
  active:    boolean;
}

export interface DashboardStats {
  totalRevenue:   number;
  totalOrders:    number;
  totalProducts:  number;
  totalUsers:     number;
  revenueChange:  number;
  ordersChange:   number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SortOption =
  | "price"
  | "-price"
  | "ratingsAverage"
  | "-ratingsAverage"
  | "sold"
  | "-sold"
  | "createdAt"
  | "-createdAt";

export type Status = "idle" | "loading" | "success" | "error";

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface SelectOption<T = string> {
  label: string;
  value: T;
}