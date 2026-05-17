import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createEmployeeSchema = z.object({
  phone: z.string().regex(/^(0|\+84)[3-9]\d{8}$/, 'Số điện thoại không hợp lệ'),
  roleIds: z.array(z.number().int().positive()).min(1, 'Phải chọn ít nhất một vai trò'),
});

export const createEmployeeResolver = zodResolver(createEmployeeSchema);

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

export const assignRolesSchema = z.object({
  roleIds: z.array(z.number().int().positive()).min(1, 'Phải chọn ít nhất một vai trò'),
});

export const assignRolesResolver = zodResolver(assignRolesSchema);

export type AssignRolesDto = z.infer<typeof assignRolesSchema>;

export interface EmployeeRole {
  storeRole: {
    id: number;
    name: string;
    permissions: {
      permission: {
        code: string;
        name: string;
      };
    }[];
  };
}

export interface Employee {
  id: number;
  userId: number;
  storeId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
  };
  employeeRoles: EmployeeRole[];
}
