import { z } from "zod";

export interface User {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
  stores?: {
    id: number;
    name: string;
  }[];
  userRoles: {
    role: {
      id: number;
      name: string;
    };
  }[];
}

export const assignRoleSchema = z.object({
  roleIds: z.array(z.number()),
});

export type AssignRolesDto = z.infer<typeof assignRoleSchema>;
