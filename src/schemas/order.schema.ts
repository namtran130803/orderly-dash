import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const orderItemInputSchema = z.object({
  menuItemId: z.number().int().positive(),
  qty: z.number().int().positive(),
});

export const orderSchema = z.object({
  tableName: z.string().nullable().optional(),
  items: z.array(orderItemInputSchema).min(1, "Phải có ít nhất 1 món"),
});

export const orderResolver = zodResolver(orderSchema);

export type OrderDto = z.infer<typeof orderSchema>;

export interface OrderItemInput {
  menuItemId: number;
  qty: number;
}

export interface OrderItem {
  id: number;
  menuItemId: number | null;
  statusId: number | null;
  statusSnapshot: string | null;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
}

export interface Order {
  id: number;
  tableId: number | null;
  tableSnapshot: string | null;
  statusId: number | null;
  statusSnapshot: string | null;
  createdAt: string;
  items: OrderItem[];
}
