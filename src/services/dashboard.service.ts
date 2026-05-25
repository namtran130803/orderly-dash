import { axiosInstance } from '@/lib/axios';

export interface DashboardStats {
  revenue: number;
  expense: number;
  orderCount: number;
  topItems: { name: string; qty: number }[];
}

export interface DashboardFinanceCompare {
  revenue: number;
  expense: number;
  profit: number;
  revenuePct: number | null;
  expensePct: number | null;
  profitPct: number | null;
}

export interface DashboardFinance {
  revenue: number;
  expense: number;
  profit: number;
  comparePrevious: DashboardFinanceCompare | null;
}

export interface DashboardOrderStatusCount {
  statusId: number | null;
  name: string;
  count: number;
}

export interface DashboardTopItem {
  name: string;
  qty: number;
  revenue: number;
}

export interface DashboardOrdersByHour {
  hour: number;
  count: number;
}

export interface DashboardOrdersCompare {
  orderCount: number;
  completedOrderCount: number;
  orderCountPct: number | null;
  completedOrderCountPct: number | null;
}

export interface DashboardOrders {
  orderCount: number;
  completedOrderCount: number;
  avgOrderValue: number;
  dineInCount: number;
  takeawayCount: number;
  byStatus: DashboardOrderStatusCount[];
  topItems: DashboardTopItem[];
  ordersByHour: DashboardOrdersByHour[];
  comparePrevious: DashboardOrdersCompare | null;
}

export interface DashboardOperations {
  date: string;
  storeOpenToday: boolean;
  openOrderCount: number;
  busyTables: number;
  totalTables: number;
  unavailableMenuCount: number;
  leavePendingCount: number;
}

export interface DashboardStaffOnShift {
  employeeId: number;
  name: string;
}

export interface DashboardStaffToday {
  scheduledCount: number;
  workingCount: number;
  onShiftNow: DashboardStaffOnShift[];
  absentCount: number;
  paidLeaveToday: number;
  unpaidLeaveToday: number;
}

export interface DashboardStaffPeriod {
  workDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  totalWorkMinutes: number;
  estimatedPayrollTotal?: number;
  payrollLocked?: boolean;
}

export interface DashboardStaff {
  today: DashboardStaffToday;
  period: DashboardStaffPeriod;
}

export const dashboardService = {
  getStats: (storeId: number, from: string, to: string) =>
    axiosInstance.get<{ success: boolean; data: DashboardStats; message: string }>(
      `/stores/${storeId}/dashboard`,
      { params: { from, to } },
    ),

  getFinance: (storeId: number, from: string, to: string) =>
    axiosInstance.get<{ success: boolean; data: DashboardFinance; message: string }>(
      `/stores/${storeId}/dashboard/finance`,
      { params: { from, to } },
    ),

  getOrders: (storeId: number, from: string, to: string) =>
    axiosInstance.get<{ success: boolean; data: DashboardOrders; message: string }>(
      `/stores/${storeId}/dashboard/orders`,
      { params: { from, to } },
    ),

  getOperations: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: DashboardOperations; message: string }>(
      `/stores/${storeId}/dashboard/operations`,
    ),

  getStaff: (storeId: number, from: string, to: string) =>
    axiosInstance.get<{ success: boolean; data: DashboardStaff; message: string }>(
      `/stores/${storeId}/dashboard/staff`,
      { params: { from, to } },
    ),
};
