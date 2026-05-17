import { axiosInstance } from '@/lib/axios';
import type { StoreRole, StoreRoleDto } from '@/schemas/storeRole.schema';

export const storeRoleService = {
  getAll: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: StoreRole[]; message: string }>(`/stores/${storeId}/roles`),

  create: (storeId: number, data: StoreRoleDto) =>
    axiosInstance.post<{ success: boolean; data: StoreRole; message: string }>(`/stores/${storeId}/roles`, data),

  update: (storeId: number, roleId: number, data: StoreRoleDto) =>
    axiosInstance.put<{ success: boolean; data: StoreRole; message: string }>(`/stores/${storeId}/roles/${roleId}`, data),

  delete: (storeId: number, roleId: number) =>
    axiosInstance.delete<void>(`/stores/${storeId}/roles/${roleId}`),
};
