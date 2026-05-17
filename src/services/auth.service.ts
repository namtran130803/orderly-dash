import { axiosInstance } from '@/lib/axios';
import type { LoginDto } from '@/schemas/auth.schema';

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
  };
}

export const authService = {
  login: (data: LoginDto) =>
    axiosInstance.post<{ success: boolean; data: AuthResponse; message: string }>('/auth/login', data),
  getMe: () =>
    axiosInstance.get<{ success: boolean; data: AuthResponse['user']; message: string }>('/auth/me'),
};
