import { axiosInstance } from '@/lib/axios';

export interface DashboardStats {
  revenue: number;
  expense: number;
  orderCount: number;
  topItems: { name: string; qty: number }[];
}

export const dashboardService = {
  getStats: (storeId: number, from: string, to: string) =>
    axiosInstance.get<{ success: boolean; data: DashboardStats; message: string }>(`/stores/${storeId}/dashboard`, {
      params: { from, to },
    }),
};
