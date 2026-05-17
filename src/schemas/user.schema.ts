import { z } from "zod";

export interface User {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
  userRoles: {
    role: {
      id: number;
      name: string;
    };
  }[];
}

export const assignRoleSchema = z.object({
  roleId: z.number().min(1, "Vui lòng chọn vai trò"),
});

export type AssignRoleDto = z.infer<typeof assignRoleSchema>;
