import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EyeIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import { payrollService } from "@/services/payroll.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { paths } from "@/config/paths";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

export function PayrollPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const canDetail = usePerm(PERMS.payroll.detail);
  const canLock = usePerm(PERMS.payroll.lock);
  const canUnlock = usePerm(PERMS.payroll.unlock);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [confirmLock, setConfirmLock] = useState<{ action: "lock" | "unlock" } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["payroll", selectedStoreId, month, year],
    queryFn: () => payrollService.preview(selectedStoreId!, month, year),
    enabled: !!selectedStoreId,
  });

  const preview = data?.data?.data;

  const { mutate: lockPayroll, isPending: isLocking } = useMutation({
    mutationFn: () => payrollService.lock(selectedStoreId!, month, year),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setConfirmLock(null);
      queryClient.invalidateQueries({ queryKey: ["payroll", selectedStoreId, month, year] });
    },
  });

  const { mutate: unlockPayroll, isPending: isUnlocking } = useMutation({
    mutationFn: () => payrollService.unlock(selectedStoreId!, month, year),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setConfirmLock(null);
      queryClient.invalidateQueries({ queryKey: ["payroll", selectedStoreId, month, year] });
    },
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const handleViewDetail = (empId: number) => {
    navigate(paths.payroll.employeeDetail(empId, month, year));
  };

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  const totalSalary = preview?.employees.reduce((s, e) => s + e.salary, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm w-20"
          />
        </div>
        {preview && (
          <div className="flex gap-2">
            {preview.locked && canUnlock ? (
              <Button
                variant="outline"
                onClick={() => setConfirmLock({ action: "unlock" })}
                disabled={isUnlocking}
              >
                {isUnlocking && <CircleNotchIcon className="mr-2 animate-spin" />}
                <LockKeyOpenIcon size={16} className="mr-2" /> Mở khóa
              </Button>
            ) : !preview.locked && canLock ? (
              <Button
                onClick={() => setConfirmLock({ action: "lock" })}
                disabled={isLocking}
              >
                {isLocking && <CircleNotchIcon className="mr-2 animate-spin" />}
                <LockKeyIcon size={16} className="mr-2" /> Khóa lương
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Summary card */}
      {preview && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Bảng lương tháng {month}/{year}
              {preview.locked && (
                <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600">
                  Đã khóa
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(totalSalary)}</div>
            <p className="text-sm text-muted-foreground">{preview.employees.length} nhân viên</p>
          </CardContent>
        </Card>
      )}

      {/* Employee table */}
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Ngày chuẩn</TableHead>
              <TableHead className="text-right">Ngày trừ</TableHead>
              <TableHead className="text-right">Lương</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Đang tải...</TableCell>
              </TableRow>
            ) : !preview?.employees?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Chưa có dữ liệu.</TableCell>
              </TableRow>
            ) : (
              preview.employees.map((emp) => (
                <TableRow key={emp.employeeId}>
                  <TableCell className="font-mono text-xs">{emp.employeeId}</TableCell>
                  <TableCell className="font-semibold">{emp.user.name}</TableCell>
                  <TableCell className="text-sm">{emp.salaryType === "MONTHLY" ? "Tháng" : "Giờ"}</TableCell>
                  <TableCell className="text-right">{emp.standardDays}</TableCell>
                  <TableCell className="text-right font-semibold">{emp.paidDays}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{formatPrice(emp.salary)}</TableCell>
                  <TableCell className="text-right">
                    {canDetail && <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-colors"
                          onClick={() => handleViewDetail(emp.employeeId)}
                        >
                          <EyeIcon size={18} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Chi tiết</p></TooltipContent>
                    </Tooltip>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <AlertDialog open={!!confirmLock} onOpenChange={() => setConfirmLock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmLock?.action === "lock" ? "Khóa bảng lương?" : "Mở khóa bảng lương?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmLock?.action === "lock"
                ? "Sau khi khóa, không thể sửa chấm công cho tháng này."
                : "Mở khóa để cho phép sửa chấm công lại."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmLock?.action === "lock" ? lockPayroll() : unlockPayroll()
              }
              className="bg-destructive text-destructive-foreground"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
