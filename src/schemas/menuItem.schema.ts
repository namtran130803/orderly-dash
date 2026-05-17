import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const menuItemSchema = z.object({
  name: z.string().min(1, "Tên món không được để trống"),
  price: z.number().int().positive("Giá phải là số dương"),
  categoryId: z.number().int().positive("Vui lòng chọn danh mục"),
});

export const menuItemResolver = zodResolver(menuItemSchema);

export type MenuItemDto = z.infer<typeof menuItemSchema>;

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}
