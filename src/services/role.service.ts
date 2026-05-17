import { axiosInstance } from '@/lib/axios';
import type { Role, RoleDto, PermissionModule } from '@/schemas/role.schema';

export const roleService = {
  getAll: () =>
    axiosInstance.get<{ success: boolean; data: Role[] }>('/roles'),

  getPermissions: () =>
    axiosInstance.get<{ success: boolean; data: PermissionModule[] }>('/system/modules'),

  create: (data: RoleDto) =>
    axiosInstance.post<{ success: boolean; data: Role; message: string }>('/roles', data),

  update: (id: number, data: RoleDto) =>
    axiosInstance.put<{ success: boolean; data: Role; message: string }>(`/roles/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/roles/${id}`),
};
