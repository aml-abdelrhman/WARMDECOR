import apiClient from "@/lib/axios";
import type {
  Product,
  Category,
  PaginatedApiResponse,
  ApiResponse,
  ProductsQueryParams,
} from "@/types";

// ─── Products List ────────────────────────────────────────────────────────────

export async function getProductsApi(
  params?: ProductsQueryParams
): Promise<PaginatedApiResponse<Product>> {
  const { data } = await apiClient.get<PaginatedApiResponse<Product>>(
    "/products",
    { params }
  );
  return data;
}

// ─── Single Product ───────────────────────────────────────────────────────────

export async function getProductByIdApi(id: string): Promise<Product> {
  const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  return data.data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategoriesApi(): Promise<Category[]> {
  const { data } =
    await apiClient.get<PaginatedApiResponse<Category>>("/categories");
  return data.data;
}

// ─── Products by Category ─────────────────────────────────────────────────────

export async function getProductsByCategoryApi(
  categoryId: string,
  params?: Omit<ProductsQueryParams, "category">
): Promise<PaginatedApiResponse<Product>> {
  const { data } = await apiClient.get<PaginatedApiResponse<Product>>(
    `/products`,
    { params: { ...params, category: categoryId } }
  );
  return data;
}

import api from "@/lib/axios";
import { AdminProduct } from "@/store/admin.store";

export const deleteProductApi = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const updateProductApi = async (id: string, payload: Partial<AdminProduct>) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
};

export const createProductApi = async (payload: Omit<AdminProduct, "id">) => {
  const { data } = await api.post("/products", payload);
  return data;
};