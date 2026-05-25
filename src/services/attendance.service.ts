import { axiosInstance } from '@/lib/axios';

export interface AttendanceCellRecord {
  id: number;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  workMinutes: number | null;
  note: string | null;
  shiftCount: number;
}

export interface AttendanceCell {
  date: string;
  runtime: string;
  record: AttendanceCellRecord | null;
}

export interface AttendanceEmployee {
  employeeId: number;
  user: { id: number; name: string; phone: string };
  salaryType: string | null;
  baseSalary: number | null;
  workDays: number | null;
  hourlyRate: number | null;
  cells: AttendanceCell[];
}

export interface AttendanceGrid {
  month: number;
  year: number;
  defaultWorkDays: number[];
  employees: AttendanceEmployee[];
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  workMinutes: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export const attendanceService = {
  list: (storeId: number, month: number, year: number) =>
    axiosInstance.get<{ success: boolean; data: AttendanceGrid; message: string }>(
      `/stores/${storeId}/attendance`,
      { params: { month, year } },
    ),

  employeeDetail: (storeId: number, employeeId: number, month: number, year: number) =>
    axiosInstance.get<{ success: boolean; data: AttendanceGrid; message: string }>(
      `/stores/${storeId}/attendance/employees/${employeeId}`,
      { params: { month, year } },
    ),

  getById: (storeId: number, attendanceId: number) =>
    axiosInstance.get<{ success: boolean; data: AttendanceRecord; message: string }>(
      `/stores/${storeId}/attendance/${attendanceId}`,
    ),

  create: (storeId: number, data: {
    employeeId: number;
    date: string;
    status: 'WORK' | 'PAID_LEAVE' | 'UNPAID_LEAVE';
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string | null;
  }) =>
    axiosInstance.post<{ success: boolean; data: AttendanceRecord; message: string }>(
      `/stores/${storeId}/attendance`,
      data,
    ),

  patch: (storeId: number, attendanceId: number, data: {
    status?: 'WORK' | 'PAID_LEAVE' | 'UNPAID_LEAVE';
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string | null;
    workMinutes?: number | null;
  }) =>
    axiosInstance.patch<{ success: boolean; data: AttendanceRecord; message: string }>(
      `/stores/${storeId}/attendance/${attendanceId}`,
      data,
    ),
};
