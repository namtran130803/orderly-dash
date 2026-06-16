import { axiosInstance } from '@/lib/axios';
import type { User, AssignRolesDto } from '@/schemas/user.schema';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  q?: string;
  name?: string;
  phone?: string;
  storeName?: string;
}

export const userService = {
  list: (params: UserListParams = {}) =>
    axiosInstance.get<{
      success: boolean;
      data: User[];
      pagination: PaginationMeta;
    }>('/users', { params }),

  getUserRoles: (userId: number) =>
    axiosInstance.get<{
      success: boolean;
      data: {
        id: number;
        name: string;
        code: string;
        permissions: { code: string; name: string }[];
      }[];
    }>(`/users/${userId}/roles`),

  assignRoles: (userId: number, data: AssignRolesDto) =>
    axiosInstance.post<{ success: boolean; data: { id: number }; message: string }>(`/users/${userId}/roles`, data),
};
