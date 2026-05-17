import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Tên vai trò không được để trống")
    .max(100, "Tên vai trò quá dài"),
  permissionCodes: z.array(z.string()),
});

export const roleResolver = zodResolver(roleSchema);

export type RoleDto = z.infer<typeof roleSchema>;

export interface Role {
  id: number;
  name: string;
  code: string;
  isSystem?: boolean;
  createdAt: string;
  permissions: {
    roleId: number;
    permissionId: number;
    permission: {
      id: number;
      code: string;
      name: string;
    };
  }[];
}

export interface Permission {
  code: string;
  name: string;
}

export interface PermissionModule {
  code: string;
  name: string;
  apis: Permission[];
}
