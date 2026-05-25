import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { AttendanceCell } from "@/services/attendance.service";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeRow | null;
  month: number;
  year: number;
}

const statusColors: Record<string, string> = {
  OFF: "bg-gray-100 text-gray-500",
  ABSENT: "bg-red-50 text-red-600",
  WORK: "bg-green-50 text-green-600",
  PAID_LEAVE: "bg-blue-50 text-blue-600",
  UNPAID_LEAVE: "bg-amber-50 text-amber-600",
};

const statusLabels: Record<string, string> = {
  OFF: "Nghỉ",
  ABSENT: "Vắng",
  WORK: "Đi làm",
  PAID_LEAVE: "Nghỉ CP",
  UNPAID_LEAVE: "Nghỉ KP",
};

export function AttendanceEmployeeDialog({ open, onOpenChange, employee, month, year }: Props) {
  const canEdit = usePerm(PERMS.attendance.edit);
  const [editRecord, setEditRecord] = useState<{
    id: number;
    employeeId: number;
    date: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    note: string | null;
  } | null>(null);

  if (!employee) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chấm công — {employee.name}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Tháng {month}/{year}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stats row */}
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="outline" className="gap-1">
                Có mặt: <span className="font-semibold text-green-600">{employee.workDays}</span>
              </Badge>
              <Badge variant="outline" className="gap-1">
                Vắng: <span className="font-semibold text-amber-600">{employee.absentDays}</span>
              </Badge>
              <Badge variant="outline" className="gap-1">
                Nghỉ CP: <span className="font-semibold text-blue-600">{employee.paidLeaveDays}</span>
              </Badge>
              <Badge variant="outline" className="gap-1">
                Nghỉ KP: <span className="font-semibold">{employee.unpaidLeaveDays}</span>
              </Badge>
              <Badge variant="outline" className="gap-1">
                Tổng phút: <span className="font-semibold">{(employee.totalWorkMinutes ?? 0).toLocaleString("vi-VN")}</span>
              </Badge>
            </div>

            {/* Daily breakdown table */}
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead className="text-right">Phút</TableHead>
                    <TableHead className="text-right w-12">Sửa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.cells.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    employee.cells.map((cell) => (
                      <TableRow key={cell.date}>
                        <TableCell className="font-mono text-sm">
                          {new Date(cell.date).toLocaleDateString("vi-VN", {
                            day: "2-digit", month: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs font-medium",
                            statusColors[cell.runtime] || "bg-gray-100",
                          )}>
                            {statusLabels[cell.runtime] || cell.runtime}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {cell.record?.checkIn
                            ? new Date(cell.record.checkIn).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {cell.record?.checkOut
                            ? new Date(cell.record.checkOut).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {cell.record?.workMinutes ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {cell.record && canEdit ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 transition-colors"
                                  onClick={() => setEditRecord({
                                    id: cell.record!.id,
                                    employeeId: employee.employeeId,
                                    date: cell.date,
                                    status: cell.record!.status,
                                    checkIn: cell.record!.checkIn,
                                    checkOut: cell.record!.checkOut,
                                    note: cell.record!.note,
                                  })}
                                >
                                  <PencilSimpleIcon size={18} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Sửa</p></TooltipContent>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </DialogContent>
      </Dialog>

      <AttendanceRecordDialog
        open={!!editRecord}
        onOpenChange={(open) => { if (!open) setEditRecord(null); }}
        selectedRecord={editRecord}
      />
    </>
  );
}
