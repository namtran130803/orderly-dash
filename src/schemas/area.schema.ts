import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const areaSchema = z.object({
  name: z.string().min(1, "Tên khu vực không được để trống"),
  tableCount: z.number().int().positive("Số bàn phải là số dương"),
});

export const areaResolver = zodResolver(areaSchema);

export type AreaDto = z.infer<typeof areaSchema>;

export const reorderAreasSchema = z.object({
  ids: z.array(z.number()),
});

export type ReorderAreasDto = z.infer<typeof reorderAreasSchema>;

export interface Area {
  id: number;
  name: string;
  sortOrder: number;
}
