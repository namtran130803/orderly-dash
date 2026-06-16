import { axiosInstance } from "@/lib/axios";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SubscriptionPlan {
  id: number;
  code: string;
  name: string;
  days: number;
  price: number;
  isActive: boolean;
}

export interface BillingUser {
  id: number;
  name: string;
  phone: string;
}

export interface BillingStore {
  id: number;
  name: string;
  user?: BillingUser;
}

export interface PaymentHistoryItem {
  id: number;
  amount: number;
  paymentCode: string;
  transferContent: string;
  provider: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED";
  paidAt: string | null;
  createdAt: string;
  user: BillingUser;
  store: BillingStore;
  plan: SubscriptionPlan;
}

export interface RenewalHistoryItem {
  id: number;
  storeId: number;
  paymentId: number | null;
  source: "TRIAL" | "PAYMENT" | "ADMIN_ADJUSTMENT" | "LEGACY_GRACE";
  days: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  store: BillingStore;
  payment?: {
    id: number;
    paymentCode: string;
    amount: number;
    status: PaymentHistoryItem["status"];
    paidAt: string | null;
    plan: SubscriptionPlan;
  } | null;
}

export interface BillingHistoryParams {
  page?: number;
  limit?: number;
  q?: string;
  phone?: string;
  userName?: string;
  storeName?: string;
  status?: PaymentHistoryItem["status"];
  source?: RenewalHistoryItem["source"];
  from?: string;
  to?: string;
}

export interface AdminRenewalDto {
  storeId: number;
  days: number;
}

export interface CreateSubscriptionPlanDto {
  code?: string;
  name?: string;
  days: number;
  price: number;
}

export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto> & {
  isActive?: boolean;
};

export const billingService = {
  plans: () =>
    axiosInstance.get<{
      success: boolean;
      data: SubscriptionPlan[];
      message: string;
    }>("/subscriptions/plans"),

  createPlan: (data: CreateSubscriptionPlanDto) =>
    axiosInstance.post<{
      success: boolean;
      data: SubscriptionPlan;
      message: string;
    }>("/subscriptions/plans", data),

  updatePlan: (planId: number, data: UpdateSubscriptionPlanDto) =>
    axiosInstance.put<{
      success: boolean;
      data: SubscriptionPlan;
      message: string;
    }>(`/subscriptions/plans/${planId}`, data),

  deletePlan: (planId: number) =>
    axiosInstance.delete<{
      success: boolean;
      data: SubscriptionPlan;
      message: string;
    }>(`/subscriptions/plans/${planId}`),

  payments: (params: BillingHistoryParams) =>
    axiosInstance.get<{
      success: boolean;
      data: PaymentHistoryItem[];
      pagination: PaginationMeta;
    }>("/payments", { params }),

  renewals: (params: BillingHistoryParams) =>
    axiosInstance.get<{
      success: boolean;
      data: RenewalHistoryItem[];
      pagination: PaginationMeta;
    }>("/subscriptions/periods", { params }),

  adminRenew: (data: AdminRenewalDto) =>
    axiosInstance.post<{
      success: boolean;
      data: RenewalHistoryItem;
      message: string;
    }>("/subscriptions/admin-renewals", data),
};
