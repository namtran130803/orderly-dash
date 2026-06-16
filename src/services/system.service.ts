import { axiosInstance } from '@/lib/axios';

export interface SystemOverviewData {
  summary: {
    totalStores: number;
    totalUsers: number;
    totalPlans: number;
    totalRevenue: number;
    activeStores: number;
  };
  growth: {
    month: string;
    newStores: number;
    revenue: number;
  }[];
  recentStores: {
    id: number;
    name: string;
    createdAt: string;
    ownerName: string;
    ownerPhone: string;
  }[];
  recentPayments: {
    id: number;
    paymentCode: string;
    amount: number;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED";
    createdAt: string;
    storeName: string;
    userName: string;
    planName: string;
  }[];
  planDistribution: {
    planName: string;
    count: number;
  }[];
}

export const systemService = {
  getOverview: () =>
    axiosInstance.get<{ success: boolean; data: SystemOverviewData; message: string }>('/system/overview'),
};
