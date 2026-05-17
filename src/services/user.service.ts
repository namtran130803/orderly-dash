import { axiosInstance } from '@/lib/axios';
import type { User, AssignRolesDto } from '@/schemas/user.schema';

export const userService = {
  list: () =>
    axiosInstance.get<{ success: boolean; data: User[] }>('/users'),

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
