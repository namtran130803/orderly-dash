import { axiosInstance } from '@/lib/axios';
import type { Employee, CreateEmployeeDto, AssignRolesDto } from '@/schemas/employee.schema';

export const employeeService = {
  getAll: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: Employee[]; message: string }>(`/stores/${storeId}/employees`),

  create: (storeId: number, data: CreateEmployeeDto) =>
    axiosInstance.post<{ success: boolean; data: Employee; message: string }>(`/stores/${storeId}/employees`, data),

  assignRoles: (storeId: number, employeeId: number, data: AssignRolesDto) =>
    axiosInstance.post<{ success: boolean; data: Employee; message: string }>(`/stores/${storeId}/employees/${employeeId}/roles`, data),

  getRoles: (storeId: number, employeeId: number) =>
    axiosInstance.get<{ success: boolean; data: any[]; message: string }>(`/stores/${storeId}/employees/${employeeId}/roles`),
};
