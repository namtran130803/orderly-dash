import { axiosInstance } from '@/lib/axios';

export interface LeaveRequest {
  id: number;
  storeId: number;
  employeeId: number;
  fromDate: string;
  toDate: string;
  isPaid: boolean;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: number | null;
  createdAt: string;
  employee: {
    id: number;
    userId: number;
    salaryType: string;
    baseSalary: number;
    hourlyRate: number | null;
    user: { id: number; name: string; phone: string };
  };
  reviewer: { id: number; name: string } | null;
}

export const leaveService = {
  list: (storeId: number, params?: { status?: string }) =>
    axiosInstance.get<{ success: boolean; data: LeaveRequest[]; message: string }>(
      `/stores/${storeId}/leave`,
      { params },
    ),

  create: (storeId: number, data: { fromDate: string; toDate: string; isPaid: boolean; reason?: string }) =>
    axiosInstance.post<{ success: boolean; data: LeaveRequest; message: string }>(
      `/stores/${storeId}/leave`,
      data,
    ),

  approve: (storeId: number, leaveId: number) =>
    axiosInstance.patch<{ success: boolean; data: LeaveRequest; message: string }>(
      `/stores/${storeId}/leave/${leaveId}/approve`,
    ),

  reject: (storeId: number, leaveId: number) =>
    axiosInstance.patch<{ success: boolean; data: LeaveRequest; message: string }>(
      `/stores/${storeId}/leave/${leaveId}/reject`,
    ),
};
