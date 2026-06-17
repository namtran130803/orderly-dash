import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EyeIcon,
  ClockIcon,
  CalendarCheckIcon,
  UserMinusIcon,
  FirstAidKitIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import {
  attendanceService,
  type AttendanceEmployee,
  type AttendanceCell,
} from "@/services/attendance.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { AttendanceEmployeeDialog } from "./AttendanceEmployeeDialog";
import { AttendanceRecordDialog } from "./AttendanceRecordDialog";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

interface EmployeeRow {
  employeeId: number;
  name: string;
  workDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  totalWorkMinutes: number;
  cells: AttendanceCell[];
}

function computeRows(employees: AttendanceEmployee[]): EmployeeRow[] {
  return employees.map((emp) => {
    let workDays = 0;
    let absentDays = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;
    let totalWorkMinutes = 0;

    for (const cell of emp.cells) {
      if (cell.runtime === "WORK") workDays++;
      else if (cell.runtime === "ABSENT") absentDays++;
      else if (cell.runtime === "PAID_LEAVE") paidLeaveDays++;
      else if (cell.runtime === "UNPAID_LEAVE") unpaidLeaveDays++;
      if (cell.record?.workMinutes) totalWorkMinutes += cell.record.workMinutes;
    }

    return {
      employeeId: emp.employeeId,
      name: emp.user.name,
      workDays,
      absentDays,
      paidLeaveDays,
      unpaidLeaveDays,
      totalWorkMinutes,
      cells: emp.cells,
    };
  });
}

export function AttendancePage() {
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const canDetail = usePerm(PERMS.attendance.detail);
  const canCreate = usePerm(PERMS.attendance.create);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", selectedStoreId, month, year],
    queryFn: () => attendanceService.list(selectedStoreId!, month, year),
    enabled: !!selectedStoreId,
  });

  const grid = data?.data?.data;
  const rows = useMemo(() => (grid ? computeRows(grid.employees) : []), [grid]);

  const handleViewDetail = (row: EmployeeRow) => {
    setSelectedEmployee(row);
    setIsDetailOpen(true);
  };

  if (!selectedStoreId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Vui lòng chọn cửa hàng.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm w-20"
          />
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateOpen(true)} className="h-9 px-4">
            <PlusIcon size={18} weight="bold" className="mr-2" /> Thêm chấm công
          </Button>
        )}
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  <CalendarCheckIcon size={14} />
                  Có mặt
                </span>
              </TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  <UserMinusIcon size={14} />
                  Vắng
                </span>
              </TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  <FirstAidKitIcon size={14} />
                  Nghỉ CP
                </span>
              </TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  <FirstAidKitIcon size={14} />
                  Nghỉ KP
                </span>
              </TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon size={14} />
                  Phút
                </span>
              </TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Chưa có dữ liệu chấm công.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.employeeId}>
                  <TableCell className="font-mono text-xs">
                    {row.employeeId}
                  </TableCell>
                  <TableCell className="font-semibold">{row.name}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    {row.workDays}
                  </TableCell>
                  <TableCell className="text-amber-600">
                    {row.absentDays}
                  </TableCell>
                  <TableCell>{row.paidLeaveDays}</TableCell>
                  <TableCell>{row.unpaidLeaveDays}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {(row.totalWorkMinutes ?? 0).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {canDetail && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-colors"
                            onClick={() => handleViewDetail(row)}
                          >
                            <EyeIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chi tiết</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <AttendanceEmployeeDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        employee={selectedEmployee}
        month={month}
        year={year}
      />

      <AttendanceRecordDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        prefilledEmployeeId={undefined}
        prefilledDate={undefined}
      />
    </div>
  );
}
