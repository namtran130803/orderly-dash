import { axiosInstance } from '@/lib/axios';
import type { Area, AreaDto, ReorderAreasDto } from '@/schemas/area.schema';

export const areaService = {
  getAll: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: Area[]; message: string }>(`/stores/${storeId}/areas`),

  create: (storeId: number, data: AreaDto) =>
    axiosInstance.post<{ success: boolean; data: Area; message: string }>(`/stores/${storeId}/areas`, data),

  update: (storeId: number, areaId: number, data: AreaDto) =>
    axiosInstance.put<{ success: boolean; data: Area; message: string }>(`/stores/${storeId}/areas/${areaId}`, data),

  delete: (storeId: number, areaId: number) =>
    axiosInstance.delete<{ success: boolean; data: Area; message: string }>(`/stores/${storeId}/areas/${areaId}`),

  reorder: (storeId: number, data: ReorderAreasDto) =>
    axiosInstance.post<{ success: boolean; message: string }>(`/stores/${storeId}/areas/reorder`, data),
};
