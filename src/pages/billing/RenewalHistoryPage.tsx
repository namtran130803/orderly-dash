import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { MagnifyingGlassIcon, PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  billingService,
  type AdminRenewalDto,
  type BillingHistoryParams,
  type CreateSubscriptionPlanDto,
  type PaginationMeta,
  type RenewalHistoryItem,
  type SubscriptionPlan,
  type UpdateSubscriptionPlanDto,
} from "@/services/billing.service";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

const sourceText: Record<RenewalHistoryItem["source"], string> = {
  TRIAL: "Dùng thử",
  PAYMENT: "Thanh toán",
  ADMIN_ADJUSTMENT: "Gia hạn thủ công",
  LEGACY_GRACE: "Gia hạn chuyển tiếp",
};

const sourceBadgeStyles: Record<RenewalHistoryItem["source"], { variant: string; className?: string }> = {
  TRIAL: { variant: "outline", className: "bg-gray-50 text-gray-600" },
  PAYMENT: { variant: "outline", className: "bg-green-50 text-green-600 border-green-200" },
  ADMIN_ADJUSTMENT: { variant: "outline", className: "bg-blue-50 text-blue-600 border-blue-200" },
  LEGACY_GRACE: { variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function getPageItems(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page]);
  for (let i = page - 2; i <= page + 2; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "..."> = [];
  sorted.forEach((item, index) => {
    const previous = sorted[index - 1];
    if (previous && item - previous > 1) result.push("...");
    result.push(item);
  });
  return result;
}

interface PaginationBarProps {
  pagination?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

function PaginationBar({ pagination, page, onPageChange }: PaginationBarProps) {
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;
  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(1)}
      >
        {"<<"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {"<"}
      </Button>
      {pageItems.map((item, index) =>
        item === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <Button
            key={item}
            variant={item === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {">"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        {">>"}
      </Button>
    </div>
  );
}

interface AddPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
}

function AddPlanDialog({ open, onOpenChange, plan }: AddPlanDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto>({
    code: "",
    name: "",
    days: 30,
    price: 0,
  });

  useEffect(() => {
    if (open) {
      setForm(
        plan
          ? {
              code: plan.code,
              name: plan.name,
              days: plan.days,
              price: plan.price,
            }
          : { code: "", name: "", days: 30, price: 0 },
      );
    }
  }, [open, plan]);

  const mutation = useMutation({
    mutationFn: () =>
      plan
        ? billingService.updatePlan(plan.id, form)
        : billingService.createPlan(form as CreateSubscriptionPlanDto),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      onOpenChange(false);
    },
  });

  const canSubmit = Number(form.days) > 0 && Number(form.price) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{plan ? "Sửa gói gia hạn" : "Thêm gói gia hạn"}</DialogTitle>
          <DialogDescription>
            {plan
              ? "Cập nhật thông tin gói gia hạn đang bán."
              : "Tạo gói mới để người dùng có thể chọn khi gia hạn."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Mã gói</label>
            <Input
              placeholder="Ví dụ: D30"
              value={form.code ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Tên gói</label>
            <Input
              placeholder="Ví dụ: Gói 30 ngày"
              value={form.name ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Số ngày</label>
            <Input
              inputMode="numeric"
              value={form.days ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  days: Number(event.target.value),
                }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Giá tiền</label>
            <Input
              inputMode="numeric"
              value={form.price ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  price: Number(event.target.value),
                }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending
              ? plan
                ? "Đang cập nhật..."
                : "Đang tạo..."
              : plan
                ? "Cập nhật"
                : "Tạo gói"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ManualRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: SubscriptionPlan[];
  initialStoreId?: number;
  initialStoreName?: string;
}

function ManualRenewalDialog({
  open,
  onOpenChange,
  plans,
  initialStoreId,
  initialStoreName,
}: ManualRenewalDialogProps) {
  const queryClient = useQueryClient();
  const [storeId, setStoreId] = useState(initialStoreId?.toString() ?? "");
  const [days, setDays] = useState<AdminRenewalDto["days"]>(30);

  useEffect(() => {
    if (!open) return;
    setStoreId(initialStoreId?.toString() ?? "");
    setDays(plans[0]?.days ?? 30);
  }, [initialStoreId, open, plans]);

  const mutation = useMutation({
    mutationFn: () =>
      billingService.adminRenew({
        storeId: Number(storeId),
        days,
      }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["billing-renewals"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gia hạn thủ công</DialogTitle>
          <DialogDescription>
            Gia hạn trực tiếp cho cửa hàng và ghi lịch sử dạng điều chỉnh thủ
            công.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {initialStoreName && (
            <div className="text-sm">
              Cửa hàng: <span className="font-semibold">{initialStoreName}</span>
            </div>
          )}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Mã cửa hàng</label>
            <Input
              inputMode="numeric"
              placeholder="Nhập ID cửa hàng"
              value={storeId}
              onChange={(event) => setStoreId(event.target.value)}
              disabled={Boolean(initialStoreId)}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Gói gia hạn</label>
            <Select
              value={String(days)}
              onValueChange={(value) => setDays(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn gói" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.days)}>
                    {plan.name} - {formatMoney(plan.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            disabled={!Number(storeId) || !days || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang gia hạn..." : "Gia hạn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RenewalHistoryPage() {
  const queryClient = useQueryClient();
  const canViewRenewals = usePerm(PERMS.subscriptions.admin_periods);
  const canAdminRenew = usePerm(PERMS.subscriptions.admin_renew);
  const canCreatePlan = usePerm(PERMS.subscriptions.admin_plan_create);
  const canUpdatePlan = usePerm(PERMS.subscriptions.admin_plan_update);
  const canDeletePlan = usePerm(PERMS.subscriptions.admin_plan_delete);
  const canManagePlans = canCreatePlan || canUpdatePlan || canDeletePlan;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BillingHistoryParams>({
    limit: 10,
  });
  const [renewalTarget, setRenewalTarget] = useState<{
    storeId?: number;
    storeName?: string;
  } | null>(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const queryParams = useMemo(
    () => ({ ...filters, page, limit: filters.limit ?? 20 }),
    [filters, page],
  );

  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => billingService.plans(),
  });

  const renewalsQuery = useQuery({
    queryKey: ["billing-renewals", queryParams],
    queryFn: () => billingService.renewals(queryParams),
    enabled: canViewRenewals,
  });

  const plans = plansQuery.data?.data.data ?? [];
  const items = renewalsQuery.data?.data.data ?? [];
  const pagination = renewalsQuery.data?.data.pagination;

  const deletePlanMutation = useMutation({
    mutationFn: (planId: number) => billingService.deletePlan(planId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
  });

  const updateFilter = (key: keyof BillingHistoryParams, value?: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Gói gia hạn</h2>
          <p className="text-xs text-muted-foreground">
            Danh sách gói đang bán trên hệ thống.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManagePlans && (
            <Button onClick={() => setIsPlanDialogOpen(true)}>
              <PlusIcon size={16} weight="bold" className="mr-2" />
              Thêm gói
            </Button>
          )}
          {canAdminRenew && (
            <Button onClick={() => setRenewalTarget({})}>
              <PlusIcon size={16} weight="bold" className="mr-2" />
              Gia hạn
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        {plansQuery.isLoading ? (
          <div className="border bg-background p-4 text-sm text-muted-foreground md:col-span-4">
            Đang tải gói gia hạn...
          </div>
        ) : plans.length === 0 ? (
          <div className="border bg-background p-4 text-sm text-muted-foreground md:col-span-4">
            Chưa có gói gia hạn.
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{plan.name}</div>
                    
                  </div>
                  <div className="text-sm font-semibold text-green-600">{formatMoney(plan.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {canUpdatePlan && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 transition-colors"
                          onClick={() => {
                            setEditingPlan(plan);
                            setIsPlanDialogOpen(true);
                          }}
                        >
                          <PencilSimpleIcon size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Sửa gói</p></TooltipContent>
                    </Tooltip>
                  )}

                  {canDeletePlan && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 transition-colors"
                          onClick={() => {
                            if (confirm("Bạn có chắc muốn ẩn gói này không?")) {
                              deletePlanMutation.mutate(plan.id);
                            }
                          }}
                        >
                          <TrashIcon size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Ẩn gói</p></TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="grid flex-1 gap-2 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Tìm tên, SĐT, cửa hàng, mã thanh toán"
              value={filters.q ?? ""}
              onChange={(event) => updateFilter("q", event.target.value)}
              disabled={!canViewRenewals}
            />
          </div>
          {/* removed separate phone and store inputs — using single search input */}
          <Select
            value={filters.source ?? "ALL"}
            onValueChange={(value) =>
              updateFilter("source", value === "ALL" ? undefined : value)
            }
            disabled={!canViewRenewals}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Nguồn gia hạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả nguồn</SelectItem>
              <SelectItem value="TRIAL">Dùng thử</SelectItem>
              <SelectItem value="PAYMENT">Thanh toán</SelectItem>
              <SelectItem value="ADMIN_ADJUSTMENT">Gia hạn thủ công</SelectItem>
              <SelectItem value="LEGACY_GRACE">Gia hạn chuyển tiếp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden border bg-background">
        <Table>
          <TableHeader>
              <TableRow>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>Số ngày</TableHead>
              <TableHead>Bắt đầu</TableHead>
              <TableHead>Kết thúc</TableHead>
              <TableHead>Mã thanh toán</TableHead>
              <TableHead className="text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!canViewRenewals ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Bạn không có quyền xem lịch sử gia hạn.
                </TableCell>
              </TableRow>
            ) : renewalsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Chưa có lịch sử gia hạn phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.store.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID {item.store.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.store.user?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.store.user?.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const s = sourceBadgeStyles[item.source];
                      return (
                        <Badge variant={s.variant as any} className={s.className}>
                          {sourceText[item.source]}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>+{item.days} ngày</TableCell>
                  <TableCell>{formatDate(item.startsAt)}</TableCell>
                  <TableCell>{formatDate(item.endsAt)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.payment?.paymentCode ?? "---"}
                  </TableCell>
                  <TableCell className="text-center">
                    {canAdminRenew ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            onClick={() =>
                              setRenewalTarget({
                                storeId: item.store.id,
                                storeName: item.store.name,
                              })
                            }
                          >
                            <PlusIcon size={16} weight="bold" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Gia hạn</p></TooltipContent>
                      </Tooltip>
                    ) : (
                      "---"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {canViewRenewals && (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span>Tổng {pagination?.total ?? 0} bản ghi</span>
            <div className="flex items-center gap-1.5">
              <span>Hiển thị</span>
              <Select
                value={String(queryParams.limit)}
                onValueChange={(val) => {
                  setPage(1);
                  setFilters((current) => ({
                    ...current,
                    limit: Number(val),
                  }));
                }}
              >
                <SelectTrigger className="h-8 w-18">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 25, 50, 100, 200].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <PaginationBar
            pagination={pagination}
            page={page}
            onPageChange={setPage}
          />
        </div>
      )}

      <TooltipProvider>
        {canManagePlans && (
          <AddPlanDialog
            open={isPlanDialogOpen}
            onOpenChange={(open) => {
              setIsPlanDialogOpen(open);
              if (!open) setEditingPlan(null);
            }}
            plan={editingPlan ?? undefined}
          />
        )}
      </TooltipProvider>

      {canAdminRenew && (
        <ManualRenewalDialog
          open={renewalTarget !== null}
          onOpenChange={(open) => !open && setRenewalTarget(null)}
          plans={plans}
          initialStoreId={renewalTarget?.storeId}
          initialStoreName={renewalTarget?.storeName}
        />
      )}
    </div>
  );
}
