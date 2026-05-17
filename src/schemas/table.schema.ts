import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const tableSchema = z.object({
  name: z.string().min(1, "Tên bàn không được để trống"),
});

export const tableResolver = zodResolver(tableSchema);

export type TableDto = z.infer<typeof tableSchema>;

export interface Table {
  id: number;
  name: string;
  sortOrder: number;
  areaId: number;
}
