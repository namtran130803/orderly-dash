import { axiosInstance } from '@/lib/axios';
import type { Status, StatusDto, ReorderStatusesDto } from '@/schemas/status.schema';

export const statusService = {
  getAll: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: Status[]; message: string }>(`/stores/${storeId}/statuses`),

  create: (storeId: number, data: StatusDto) =>
    axiosInstance.post<{ success: boolean; data: Status; message: string }>(`/stores/${storeId}/statuses`, data),

  update: (storeId: number, statusId: number, data: StatusDto) =>
    axiosInstance.put<{ success: boolean; data: Status; message: string }>(`/stores/${storeId}/statuses/${statusId}`, data),

  delete: (storeId: number, statusId: number) =>
    axiosInstance.delete<{ success: boolean; data: Status; message: string }>(`/stores/${storeId}/statuses/${statusId}`),

  reorder: (storeId: number, data: ReorderStatusesDto) =>
    axiosInstance.patch<{ success: boolean; data: Status[] }>(`/stores/${storeId}/statuses/reorder`, data),
};
