import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
import { payrollService } from "@/services/payroll.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { cn } from "@/lib/utils";
import { paths } from "@/config/paths";

const statusColors: Record<string, string> = {
  OFF: "bg-gray-100 text-gray-500",
  ABSENT: "bg-red-50 text-red-600",
  WORK: "bg-green-50 text-green-600",
  PAID_LEAVE: "bg-blue-50 text-blue-600",
  UNPAID_LEAVE: "bg-amber-50 text-amber-600",
};

const statusLabels: Record<string, string> = {
  OFF: "Nghỉ", ABSENT: "Vắng", WORK: "Đi làm",
  PAID_LEAVE: "Nghỉ CP", UNPAID_LEAVE: "Nghỉ KP",
};

export function PayrollEmployeeDetailPage() {
  const { employeeId, month, year } = useParams<{
    employeeId: string;
    month: string;
    year: string;
  }>();
  const navigate = useNavigate();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const { data, isLoading } = useQuery({
    queryKey: ["payroll-detail", selectedStoreId, employeeId, month, year],
    queryFn: () =>
      payrollService.employeeDetail(
        selectedStoreId!,
        Number(employeeId!),
        Number(month!),
        Number(year!),
      ),
    enabled: !!selectedStoreId && !!employeeId && !!month && !!year,
  });

  const detail = data?.data?.data;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button variant="ghost" onClick={() => navigate(paths.payroll.index)} className="w-fit">
        <ArrowLeftIcon size={18} className="mr-2" /> Quay lại
      </Button>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
      ) : detail ? (
        <>
          {/* Header info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {detail.employee.user.name}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  Tháng {detail.month}/{detail.year}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge variant="outline">
                  Loại: {detail.employee.salaryType === "MONTHLY" ? "Lương tháng" : "Lương giờ"}
                </Badge>
                <Badge variant="outline">Ngày chuẩn: {detail.counts.standardDays}</Badge>
                <Badge variant="outline">Ngày trả: {detail.counts.paidDays}</Badge>
                <Badge variant="outline">
                  Lương: <span className="font-semibold text-primary">{formatPrice(detail.salary)}</span>
                </Badge>
                {detail.snapshot && (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Đã khóa
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Có mặt</p>
              <p className="text-xl font-bold text-green-600">{detail.counts.workDays}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Vắng</p>
              <p className="text-xl font-bold text-amber-600">{detail.counts.absentDays}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Nghỉ CP</p>
              <p className="text-xl font-bold">{detail.counts.paidLeaveDays}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Tổng phút</p>
              <p className="text-xl font-bold">{(detail.counts.totalWorkMinutes ?? 0).toLocaleString("vi-VN")}</p>
            </CardContent></Card>
          </div>

          {/* Day breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-base">Chi tiết ngày</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Phút</TableHead>
                    <TableHead>Tính lương</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(detail.dayBreakdown ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    (detail.dayBreakdown ?? []).map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-mono text-sm">
                          {new Date(day.date).toLocaleDateString("vi-VN", {
                            day: "2-digit", month: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs font-medium",
                            statusColors[day.status] || "bg-gray-100",
                          )}>
                            {statusLabels[day.status] || day.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {day.workMinutes ?? "—"}
                        </TableCell>
                        <TableCell>
                          {day.countsTowardPaid ? (
                            <span className="text-green-600 text-xs font-medium">Có</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Không</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">Không tìm thấy dữ liệu.</div>
      )}
    </div>
  );
}
