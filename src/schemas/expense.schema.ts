import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const expenseSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  amount: z.number().int().positive("Số tiền phải là số dương"),
  rawDate: z.string().min(1, "Ngày không được để trống"),
});

export const expenseResolver = zodResolver(expenseSchema);

export type ExpenseDto = z.infer<typeof expenseSchema>;

export interface Expense {
  id: number;
  title: string;
  description: string | null;
  amount: number;
  rawDate: string;
}

export interface ExpenseListResponse {
  items: Expense[];
  nextCursor: number | null;
}
