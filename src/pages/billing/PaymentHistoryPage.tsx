import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  billingService,
  type BillingHistoryParams,
  type PaymentHistoryItem,
} from "@/services/billing.service";

const statusText: Record<PaymentHistoryItem["status"], string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

function formatDate(value: string | null) {
  if (!value) return "---";
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

export function PaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BillingHistoryParams>({
    limit: 20,
  });

  const queryParams = { ...filters, page, limit: filters.limit ?? 20 };
  const { data, isLoading } = useQuery({
    queryKey: ["billing-payments", queryParams],
    queryFn: () => billingService.payments(queryParams),
  });

  const items = data?.data.data ?? [];
  const pagination = data?.data.pagination;

  const updateFilter = (key: keyof BillingHistoryParams, value?: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid gap-2 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <MagnifyingGlassIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Tìm mã thanh toán, tên, SĐT, cửa hàng"
            value={filters.q ?? ""}
            onChange={(event) => updateFilter("q", event.target.value)}
          />
        </div>
        <Input
          placeholder="Số điện thoại"
          value={filters.phone ?? ""}
          onChange={(event) => updateFilter("phone", event.target.value)}
        />
        <Input
          placeholder="Tên cửa hàng"
          value={filters.storeName ?? ""}
          onChange={(event) => updateFilter("storeName", event.target.value)}
        />
        <Select
          value={filters.status ?? "ALL"}
          onValueChange={(value) =>
            updateFilter("status", value === "ALL" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="EXPIRED">Hết hạn</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            <SelectItem value="FAILED">Thất bại</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Gói</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Thanh toán lúc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Chưa có lịch sử thanh toán phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.paymentCode}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.user.phone}
                    </div>
                  </TableCell>
                  <TableCell>{item.store.name}</TableCell>
                  <TableCell>{item.plan.name}</TableCell>
                  <TableCell>{formatMoney(item.amount)}</TableCell>
                  <TableCell>
                    {(() => {
                      const map: Record<PaymentHistoryItem['status'], { variant: string; className?: string }> = {
                        PENDING: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        PAID: { variant: 'outline', className: 'bg-green-50 text-green-600 border-green-200' },
                        EXPIRED: { variant: 'outline', className: 'bg-gray-50 text-gray-600' },
                        CANCELLED: { variant: 'outline', className: 'bg-red-50 text-red-600 border-red-200' },
                        FAILED: { variant: 'outline', className: 'bg-red-50 text-red-600 border-red-200' },
                      };
                      const v = map[item.status];
                      return <Badge variant={v.variant as any} className={v.className}>{statusText[item.status]}</Badge>;
                    })()}
                  </TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>{formatDate(item.paidAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Tổng {pagination?.total ?? 0} bản ghi
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination || pagination.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Trước
          </Button>
          <span>
            Trang {pagination?.page ?? page}/{pagination?.totalPages ?? 1}
          </span>
          <Button
            variant="outline"
            disabled={!pagination || pagination.page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
