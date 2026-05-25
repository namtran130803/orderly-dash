import { axiosInstance } from '@/lib/axios';

export interface PayrollEmployeeRow {
  employeeId: number;
  user: { id: number; name: string; phone: string };
  salaryType: string;
  baseSalary: number;
  hourlyRate: number | null;
  standardDays: number;
  paidDays: number;
  salary: number;
}

export interface PayrollPreview {
  month: number;
  year: number;
  locked: boolean;
  employees: PayrollEmployeeRow[];
}

export interface PayrollDayBreakdown {
  date: string;
  status: string;
  workMinutes: number | null;
  countsTowardPaid: boolean;
}

export interface PayrollSnapshot {
  salary: number;
  standardDays: number;
  paidDays: number;
  lockedAt: string;
}

export interface PayrollEmployeeDetail {
  month: number;
  year: number;
  locked: boolean;
  employee: {
    id: number;
    user: { id: number; name: string; phone: string };
    salaryType: string;
    baseSalary: number;
    hourlyRate: number | null;
    workDays: number[];
    usesStoreSchedule: boolean;
    effectiveWorkDays: number[];
  };
  counts: {
    standardDays: number;
    paidDays: number;
    workDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    absentDays: number;
    offDays: number;
    totalWorkMinutes: number;
    totalWorkHours: number;
  };
  salary: number;
  snapshot: PayrollSnapshot | null;
  dayBreakdown: PayrollDayBreakdown[];
}

export const payrollService = {
  preview: (storeId: number, month: number, year: number) =>
    axiosInstance.get<{ success: boolean; data: PayrollPreview; message: string }>(
      `/stores/${storeId}/payroll`,
      { params: { month, year } },
    ),

  employeeDetail: (storeId: number, employeeId: number, month: number, year: number) =>
    axiosInstance.get<{ success: boolean; data: PayrollEmployeeDetail; message: string }>(
      `/stores/${storeId}/payroll/employees/${employeeId}`,
      { params: { month, year } },
    ),

  lock: (storeId: number, month: number, year: number) =>
    axiosInstance.post<{ success: boolean; data: unknown; message: string }>(
      `/stores/${storeId}/payroll/lock`,
      {},
      { params: { month, year } },
    ),

  unlock: (storeId: number, month: number, year: number) =>
    axiosInstance.delete<{ success: boolean; data: null; message: string }>(
      `/stores/${storeId}/payroll/lock`,
      { params: { month, year } },
    ),
};
