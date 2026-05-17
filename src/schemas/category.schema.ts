import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  sortOrder: z.number().int().optional(),
});

export const categoryResolver = zodResolver(categorySchema);

export type CategoryDto = z.infer<typeof categorySchema>;

export const reorderCategoriesSchema = z.object({
  ids: z.array(z.number()),
});

export type ReorderCategoriesDto = z.infer<typeof reorderCategoriesSchema>;

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
}
