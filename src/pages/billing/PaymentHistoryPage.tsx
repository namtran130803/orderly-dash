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

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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

export function PaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BillingHistoryParams>({
    limit: 10,
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
            placeholder="Tìm mã thanh toán, tên, số điện thoại, cửa hàng"
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
                  <TableCell>{item.plan?.name || "Khác"}</TableCell>
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
    </div>
  );
}
