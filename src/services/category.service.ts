import { axiosInstance } from '@/lib/axios';
import type { Category, CategoryDto, ReorderCategoriesDto } from '@/schemas/category.schema';

export const categoryService = {
  getAll: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: Category[]; message: string }>(`/stores/${storeId}/categories`),

  create: (storeId: number, data: CategoryDto) =>
    axiosInstance.post<{ success: boolean; data: Category; message: string }>(`/stores/${storeId}/categories`, data),

  update: (storeId: number, catId: number, data: CategoryDto) =>
    axiosInstance.put<{ success: boolean; data: Category; message: string }>(`/stores/${storeId}/categories/${catId}`, data),

  delete: (storeId: number, catId: number) =>
    axiosInstance.delete<{ success: boolean; data: Category; message: string }>(`/stores/${storeId}/categories/${catId}`),

  reorder: (storeId: number, data: ReorderCategoriesDto) =>
    axiosInstance.post<{ success: boolean; message: string }>(`/stores/${storeId}/categories/reorder`, data),
};
