import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const storeSchema = z.object({
  name: z.string().min(1, "Tên cửa hàng không được để trống"),
  address: z.string().optional(),
});

export const storeResolver = zodResolver(storeSchema);

export type StoreDto = z.infer<typeof storeSchema>;

export interface StoreCreateDto extends StoreDto {
  userId: number;
}

export interface Store {
  id: number;
  name: string;
  address: string | null;
  createdAt: string;
  roleName?: string[];
  userId?: number;
  subscription?: StoreSubscription;
}

export interface StoreSubscription {
  status: "TRIALING" | "ACTIVE" | "EXPIRED";
  isReadOnly: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  daysRemaining: number;
  trialUsed?: boolean;
}

export interface StoreModule {
  code: string;
  name: string;
  apis: {
    code: string;
    name: string;
  }[];
}
