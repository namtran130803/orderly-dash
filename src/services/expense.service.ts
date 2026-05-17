import { axiosInstance } from '@/lib/axios';
import type { Expense, ExpenseDto, ExpenseListResponse } from '@/schemas/expense.schema';

export const expenseService = {
  getAll: (storeId: number, params?: { cursor?: number; from?: string; to?: string; limit?: number }) =>
    axiosInstance.get<{ success: boolean; data: ExpenseListResponse; message: string }>(`/stores/${storeId}/expenses`, { params }),

  create: (storeId: number, data: ExpenseDto) =>
    axiosInstance.post<{ success: boolean; data: Expense; message: string }>(`/stores/${storeId}/expenses`, data),

  update: (storeId: number, expenseId: number, data: ExpenseDto) =>
    axiosInstance.put<{ success: boolean; data: Expense; message: string }>(`/stores/${storeId}/expenses/${expenseId}`, data),

  delete: (storeId: number, expenseId: number) =>
    axiosInstance.delete<{ success: boolean; data: Expense; message: string }>(`/stores/${storeId}/expenses/${expenseId}`),
};
