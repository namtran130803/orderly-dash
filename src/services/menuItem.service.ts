import { axiosInstance } from '@/lib/axios';
import type { MenuItem, MenuItemDto } from '@/schemas/menuItem.schema';

export const menuItemService = {
  getAll: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: MenuItem[]; message: string }>(`/stores/${storeId}/menu-items`),

  create: (storeId: number, data: MenuItemDto) =>
    axiosInstance.post<{ success: boolean; data: MenuItem; message: string }>(`/stores/${storeId}/menu-items`, data),

  update: (storeId: number, itemId: number, data: MenuItemDto) =>
    axiosInstance.put<{ success: boolean; data: MenuItem; message: string }>(`/stores/${storeId}/menu-items/${itemId}`, data),

  delete: (storeId: number, itemId: number) =>
    axiosInstance.delete<{ success: boolean; data: MenuItem; message: string }>(`/stores/${storeId}/menu-items/${itemId}`),
};
