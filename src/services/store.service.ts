import { axiosInstance } from '@/lib/axios';
import type { Store, StoreDto, StoreCreateDto, StoreModule } from '@/schemas/store.schema';

export const storeService = {
  getAll: (userId: number) =>
    axiosInstance.get<{ success: boolean; data: Store[]; message: string }>(`/stores?userId=${userId}`),

  create: (data: StoreCreateDto) =>
    axiosInstance.post<{ success: boolean; data: Store; message: string }>('/stores', data),

  update: (storeId: number, data: StoreDto) =>
    axiosInstance.put<{ success: boolean; data: Store; message: string }>(`/stores/${storeId}`, data),

  delete: (storeId: number) =>
    axiosInstance.delete<{ success: boolean; data: Store; message: string }>(`/stores/${storeId}`),

  getModules: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: StoreModule[]; message: string }>(`/stores/${storeId}/modules`),
};
