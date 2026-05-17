import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const storeRoleSchema = z.object({
  name: z.string().min(1, "Tên vai trò không được để trống"),
  permissionCodes: z.array(z.string()),
});

export const storeRoleResolver = zodResolver(storeRoleSchema);

export type StoreRoleDto = z.infer<typeof storeRoleSchema>;

export interface StoreRolePermission {
  permission: {
    id: number;
    code: string;
    name: string;
  };
}

export interface StoreRole {
  id: number;
  storeId: number;
  name: string;
  permissions: StoreRolePermission[];
}
