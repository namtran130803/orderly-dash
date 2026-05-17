import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const statusSchema = z.object({
  name: z.string().min(1, "Tên trạng thái không được để trống"),
});

export const statusResolver = zodResolver(statusSchema);

export type StatusDto = z.infer<typeof statusSchema>;

export const reorderStatusesSchema = z.object({
  ids: z.array(z.number()),
});

export type ReorderStatusesDto = z.infer<typeof reorderStatusesSchema>;

export interface Status {
  id: number;
  name: string;
  type: "start" | "mid" | "end";
  sortOrder: number;
}
