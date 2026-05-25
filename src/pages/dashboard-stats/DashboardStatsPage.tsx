import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from "@phosphor-icons/react";
import { dashboardService } from "@/services/dashboard.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { cn } from "@/lib/utils";

// --- VN date helpers ---

function todayVnDateString(): string {
  const now = new Date();
  const vnOffset = 7 * 60;
  const vn = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + vnOffset * 60000);
  return vn.toISOString().split("T")[0];
}

function daysAgoVn(n: number): string {
  const d = new Date();
  const vnOffset = 7 * 60;
  const vn = new Date(d.getTime() + d.getTimezoneOffset() * 60000 + vnOffset * 60000);
  vn.setDate(vn.getDate() - n);
  return vn.toISOString().split("T")[0];
}

type PeriodPreset = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

function getOverviewPeriodRangeVN(preset: PeriodPreset): { from: string; to: string } {
  const today = todayVnDateString();
  const [y, m, d] = today.split("-").map(Number);
  const firstDayOfMonth = `${y}-${String(m).padStart(2, "0")}-01`;

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday":
      return { from: daysAgoVn(1), to: daysAgoVn(1) };
    case "thisWeek": {
      const dow = new Date(y, m - 1, d).getDay();
      const monOffset = dow === 0 ? -6 : 1 - dow;
      const mon = daysAgoVn(-monOffset);
      const sun = daysAgoVn(-(monOffset + 6));
      return { from: mon, to: sun };
    }
    case "lastWeek": {
      const dow = new Date(y, m - 1, d).getDay();
      const monOffset = dow === 0 ? -6 : 1 - dow;
      return { from: daysAgoVn(-(monOffset + 7)), to: daysAgoVn(-(monOffset + 1)) };
    }
    case "thisMonth":
      return { from: firstDayOfMonth, to: today };
    case "lastMonth": {
      const lm = m === 1 ? 12 : m - 1;
      const ly = m === 1 ? y - 1 : y;
      const lmFirst = `${ly}-${String(lm).padStart(2, "0")}-01`;
      const lmLast = firstDayOfMonth;
      return { from: lmFirst, to: daysAgoVn(
        Math.round((new Date(lmLast).getTime() - new Date(lmFirst).getTime()) / 86400000)
      ) };
    }
    default:
      return { from: firstDayOfMonth, to: today };
  }
}

// --- Formatting helpers ---

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function formatPct(pct: number | null | undefined): string | null {
  if (pct == null || Number.isNaN(pct)) return null;
  if (pct === 0) return "±0%";
  return `${pct > 0 ? "+" : ""}${pct.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}

function hourLabel(h: number): string {
  return h === 23 ? "23h→24h" : `${h}h→${h + 1}h`;
}

// --- Page ---

const TABS = ["today", "period"] as const;

export function DashboardStatsPage() {
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const [tab, setTab] = useState<"today" | "period">("today");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("thisMonth");
  const todayAnchor = todayVnDateString();
  const { from: periodFrom, to: periodTo } = useMemo(
    () => getOverviewPeriodRangeVN(periodPreset),
    [periodPreset],
  );
  const [dateFrom, setDateFrom] = useState(periodFrom);
  const [dateTo, setDateTo] = useState(periodTo);

  // Today queries
  const opsQuery = useQuery({
    queryKey: ["dashboard-ops", selectedStoreId],
    queryFn: () => dashboardService.getOperations(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const todayFinanceQuery = useQuery({
    queryKey: ["dashboard-finance", selectedStoreId, todayAnchor, todayAnchor],
    queryFn: () => dashboardService.getFinance(selectedStoreId!, todayAnchor, todayAnchor),
    enabled: !!selectedStoreId,
  });

  const staffQuery = useQuery({
    queryKey: ["dashboard-staff", selectedStoreId, todayAnchor, todayAnchor],
    queryFn: () => dashboardService.getStaff(selectedStoreId!, todayAnchor, todayAnchor),
    enabled: !!selectedStoreId,
  });

  // Period queries
  const periodFinanceQuery = useQuery({
    queryKey: ["dashboard-finance", selectedStoreId, dateFrom, dateTo],
    queryFn: () => dashboardService.getFinance(selectedStoreId!, dateFrom, dateTo),
    enabled: !!selectedStoreId && tab === "period",
  });

  const periodOrdersQuery = useQuery({
    queryKey: ["dashboard-orders", selectedStoreId, dateFrom, dateTo],
    queryFn: () => dashboardService.getOrders(selectedStoreId!, dateFrom, dateTo),
    enabled: !!selectedStoreId && tab === "period",
  });

  const periodStaffQuery = useQuery({
    queryKey: ["dashboard-staff", selectedStoreId, dateFrom, dateTo],
    queryFn: () => dashboardService.getStaff(selectedStoreId!, dateFrom, dateTo),
    enabled: !!selectedStoreId && tab === "period",
  });

  if (!selectedStoreId) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Vui lòng chọn cửa hàng.
      </div>
    );
  }

  const handlePeriodPresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const range = getOverviewPeriodRangeVN(preset);
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tab bar + date controls */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-1 border-b">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "today" ? "Hôm nay" : "Kỳ"}
            </button>
          ))}
        </div>

        {tab === "period" && (
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={periodPreset}
              onChange={(e) => handlePeriodPresetChange(e.target.value as PeriodPreset)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="thisWeek">Tuần này</option>
              <option value="lastWeek">Tuần trước</option>
              <option value="thisMonth">Tháng này</option>
              <option value="lastMonth">Tháng trước</option>
            </select>
            <span className="text-sm text-muted-foreground">hoặc</span>
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-muted-foreground">→</span>
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        )}
      </div>

      {tab === "today" ? (
        <TodayView
          ops={opsQuery.data?.data?.data ?? null}
          finance={todayFinanceQuery.data?.data?.data ?? null}
          staff={staffQuery.data?.data?.data ?? null}
          isLoading={opsQuery.isLoading || todayFinanceQuery.isLoading || staffQuery.isLoading}
        />
      ) : (
        <PeriodView
          finance={periodFinanceQuery.data?.data?.data ?? null}
          orders={periodOrdersQuery.data?.data?.data ?? null}
          staff={periodStaffQuery.data?.data?.data ?? null}
          isLoading={periodFinanceQuery.isLoading || periodOrdersQuery.isLoading || periodStaffQuery.isLoading}
        />
      )}
    </div>
  );
}

// --- Today view ---

function PctBadge({ pct }: { pct: number | null | undefined }) {
  const text = formatPct(pct);
  if (!text) return null;
  const isUp = pct != null && pct > 0;
  const isFlat = pct === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        isFlat && "text-muted-foreground",
        !isFlat && isUp && "text-green-600",
        !isFlat && !isUp && "text-red-600",
      )}
    >
      {!isFlat && (isUp ? <ArrowUpRightIcon size={14} /> : <ArrowDownRightIcon size={14} />)}
      {text}
    </span>
  );
}

type TodayViewProps = {
  ops: unknown;
  finance: unknown;
  staff: unknown;
  isLoading: boolean;
};

function TodayView({ ops, finance, staff, isLoading }: TodayViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const o = ops as Record<string, unknown> | null;
  const cmp = (finance as Record<string, unknown> | null)?.comparePrevious as Record<string, unknown> | null;
  const todayStaff = (staff as Record<string, unknown> | null)?.today as Record<string, unknown> | null;

  return (
    <div className="flex flex-col gap-6">
      {/* Operations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Đơn đang xử lý</span>
            <span className="text-2xl font-bold text-amber-600">
              {o ? Number(o.openOrderCount) : "…"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Bàn có đơn</span>
            <span className="text-2xl font-bold">
              {o ? `${o.busyTables}/${o.totalTables}` : "…"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Món không phục vụ</span>
            <span className="text-2xl font-bold text-red-600">
              {o ? Number(o.unavailableMenuCount) : "…"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Đơn nghỉ chờ duyệt</span>
            <span className="text-2xl font-bold text-amber-600">
              {o ? Number(o.leavePendingCount) : "…"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Finance today */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tài chính hôm nay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Doanh thu</span>
              <span className="text-xl font-bold text-green-600">
                {finance ? formatPrice(Number((finance as Record<string, unknown>).revenue)) : "…"}
              </span>
              {cmp && <PctBadge pct={Number(cmp.revenuePct)} />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Chi tiêu</span>
              <span className="text-xl font-bold text-red-600">
                {finance ? formatPrice(Number((finance as Record<string, unknown>).expense)) : "…"}
              </span>
              {cmp && <PctBadge pct={Number(cmp.expensePct)} />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Lợi nhuận gộp</span>
              <span className="text-xl font-bold text-primary">
                {finance ? formatPrice(Number((finance as Record<string, unknown>).profit)) : "…"}
              </span>
              {cmp && <PctBadge pct={Number(cmp.profitPct)} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff today */}
      {todayStaff && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nhân sự hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Có ca</span>
                <span className="text-lg font-bold">{String(todayStaff.scheduledCount ?? "…")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Đang ca</span>
                <span className="text-lg font-bold text-green-600">{String(todayStaff.workingCount ?? "…")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Vắng (có ca)</span>
                <span className="text-lg font-bold text-amber-600">{String(todayStaff.absentCount ?? "…")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Nghỉ CP/KP</span>
                <span className="text-lg font-bold">{String(todayStaff.paidLeaveToday ?? 0)}/{String(todayStaff.unpaidLeaveToday ?? 0)}</span>
              </div>
            </div>
            {Array.isArray(todayStaff.onShiftNow) && (todayStaff.onShiftNow as Array<Record<string, unknown>>).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground self-center">Đang mở ca:</span>
                {(todayStaff.onShiftNow as Array<Record<string, unknown>>).map((s: Record<string, unknown>, i: number) => (
                  <Badge key={Number(s.employeeId) ?? i} variant="secondary">{String(s.name)}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Period view ---

type PeriodViewProps = {
  finance: unknown;
  orders: unknown;
  staff: unknown;
  isLoading: boolean;
};

function PeriodView({ finance, orders, staff, isLoading }: PeriodViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const cmpFin = (finance as Record<string, unknown> | null)?.comparePrevious as Record<string, unknown> | null;
  const cmpOrd = (orders as Record<string, unknown> | null)?.comparePrevious as Record<string, unknown> | null;
  const byStatus = (orders as Record<string, unknown> | null)?.byStatus as Array<Record<string, unknown>> | null;
  const topItems = (orders as Record<string, unknown> | null)?.topItems as Array<Record<string, unknown>> | null;
  const ordersByHour = (orders as Record<string, unknown> | null)?.ordersByHour as Array<Record<string, unknown>> | null;
  const periodStaff = (staff as Record<string, unknown> | null)?.period as Record<string, unknown> | null;

  const peakHours = [...(ordersByHour ?? [])]
    .sort((a, b) => Number(b.count) - Number(a.count) || Number(a.hour) - Number(b.hour))
    .filter((row) => Number(row.count) > 0)
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      {/* Finance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tài chính</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Doanh thu</span>
              <span className="text-xl font-bold text-green-600">
                {finance ? formatPrice(Number((finance as Record<string, unknown>).revenue)) : "…"}
              </span>
              {cmpFin && <PctBadge pct={Number(cmpFin.revenuePct)} />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Chi tiêu</span>
              <span className="text-xl font-bold text-red-600">
                {finance ? formatPrice(Number((finance as Record<string, unknown>).expense)) : "…"}
              </span>
              {cmpFin && <PctBadge pct={Number(cmpFin.expensePct)} />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Lợi nhuận gộp</span>
              <span className="text-xl font-bold text-primary">
                {finance ? formatPrice(Number((finance as Record<string, unknown>).profit)) : "…"}
              </span>
              {cmpFin && <PctBadge pct={Number(cmpFin.profitPct)} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Đơn tạo trong kỳ</span>
            <span className="text-2xl font-bold">{orders ? String((orders as Record<string, unknown>).orderCount) : "…"}</span>
            {cmpOrd && <PctBadge pct={Number(cmpOrd.orderCountPct)} />}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Đơn đã đóng</span>
            <span className="text-2xl font-bold text-green-600">{orders ? String((orders as Record<string, unknown>).completedOrderCount) : "…"}</span>
            {cmpOrd && <PctBadge pct={Number(cmpOrd.completedOrderCountPct)} />}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Giá TB / đơn</span>
            <span className="text-2xl font-bold text-sky-600">{orders ? formatPrice(Number((orders as Record<string, unknown>).avgOrderValue)) : "…"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Tại bàn / Mang về</span>
            <span className="text-2xl font-bold">{orders ? `${(orders as Record<string, unknown>).dineInCount} · ${(orders as Record<string, unknown>).takeawayCount}` : "…"}</span>
          </CardContent>
        </Card>
      </div>

      {/* Orders by status */}
      {byStatus && byStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số đơn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byStatus.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{String(s.name)}</TableCell>
                    <TableCell className="text-right font-semibold">{String(s.count)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Top items */}
      {topItems && topItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top món bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Tên món</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.slice(0, 10).map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{String(item.name)}</TableCell>
                    <TableCell className="text-right"><Badge variant="secondary">{String(item.qty)}</Badge></TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{formatPrice(Number(item.revenue))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Peak hours */}
      {peakHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch tạo đơn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {peakHours.map((row) => (
                <div key={Number(row.hour)} className="flex justify-between items-center border rounded-md px-3 py-2 text-sm">
                  <span className="font-medium">{hourLabel(Number(row.hour))}</span>
                  <span className="font-semibold tabular-nums">{String(row.count)} đơn</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff period */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhân sự trong kỳ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Ca có mặt</span>
              <span className="text-lg font-bold">{periodStaff ? String(periodStaff.workDays) : "…"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Vắng (có ca)</span>
              <span className="text-lg font-bold text-amber-600">{periodStaff ? String(periodStaff.absentDays) : "…"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Nghỉ CP/KP</span>
              <span className="text-lg font-bold">{periodStaff ? `${String(periodStaff.paidLeaveDays)} / ${String(periodStaff.unpaidLeaveDays)}` : "…"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Phút làm</span>
              <span className="text-lg font-bold">{periodStaff ? Number(periodStaff.totalWorkMinutes).toLocaleString("vi-VN") : "…"}</span>
            </div>
          </div>
          {periodStaff?.estimatedPayrollTotal != null && (
            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <span className="text-sm font-medium">Lương dự kiến</span>
              <div className="text-right">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(Number(periodStaff.estimatedPayrollTotal))}
                </span>
                {!!periodStaff.payrollLocked && (
                  <p className="text-xs text-muted-foreground mt-0.5">Đã khóa kỳ</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
