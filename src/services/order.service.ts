import { axiosInstance } from '@/lib/axios';
import type { Order, OrderDto } from '@/schemas/order.schema';

export const orderService = {
  getAll: (storeId: number, params?: { statusId?: number; date?: string; sortOrder?: 'asc' | 'desc'; cursor?: number; limit?: number }) =>
    axiosInstance.get<{ success: boolean; data: Order[]; nextCursor: number | null }>(`/stores/${storeId}/orders`, { params }),

  getById: (storeId: number, orderId: number) =>
    axiosInstance.get<{ success: boolean; data: Order }>(`/stores/${storeId}/orders/${orderId}`),

  create: (storeId: number, data: OrderDto) =>
    axiosInstance.post<{ success: boolean; data: Order; message: string }>(`/stores/${storeId}/orders`, data),

  update: (storeId: number, orderId: number, data: OrderDto) =>
    axiosInstance.put<{ success: boolean; data: Order; message: string }>(`/stores/${storeId}/orders/${orderId}`, data),

  delete: (storeId: number, orderId: number) =>
    axiosInstance.delete<{ success: boolean; data: Order; message: string }>(`/stores/${storeId}/orders/${orderId}`),

  advance: (storeId: number, orderId: number, data: { fromStatusId: number }) =>
    axiosInstance.patch<{ success: boolean; data: Order; message: string }>(`/stores/${storeId}/orders/${orderId}/advance`, data),

  revert: (storeId: number, orderId: number, data: { fromStatusId: number }) =>
    axiosInstance.patch<{ success: boolean; data: Order; message: string }>(`/stores/${storeId}/orders/${orderId}/revert`, data),
};
