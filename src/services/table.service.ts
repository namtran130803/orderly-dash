import { axiosInstance } from '@/lib/axios';
import type { Table, TableDto } from '@/schemas/table.schema';

export const tableService = {
  getAll: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: Table[]; message: string }>(`/stores/${storeId}/tables`),

  update: (storeId: number, tableId: number, data: TableDto) =>
    axiosInstance.put<{ success: boolean; data: Table; message: string }>(`/stores/${storeId}/tables/${tableId}`, data),

  delete: (storeId: number, tableId: number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/stores/${storeId}/tables/${tableId}`),
};
