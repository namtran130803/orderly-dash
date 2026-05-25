import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { CircleNotch } from "@phosphor-icons/react";
import { attendanceService } from "@/services/attendance.service";
import { employeeService } from "@/services/employee.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { attendanceRecordResolver, type AttendanceRecordDto } from "@/schemas/attendance.schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecord?: {
    id: number;
    employeeId: number;
    date: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    note: string | null;
  } | null;
  prefilledEmployeeId?: number;
  prefilledDate?: string;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AttendanceRecordDialog({ open, onOpenChange, selectedRecord, prefilledEmployeeId, prefilledDate }: Props) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const { data: employeesData } = useQuery({
    queryKey: ["employees", selectedStoreId],
    queryFn: () => employeeService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId && open,
  });

  const employees = employeesData?.data?.data ?? [];

  const defaultValues = useMemo(() => {
    if (selectedRecord) {
      return {
        employeeId: selectedRecord.employeeId,
        date: selectedRecord.date,
        status: selectedRecord.status as "WORK" | "PAID_LEAVE" | "UNPAID_LEAVE",
        checkIn: toDatetimeLocal(selectedRecord.checkIn),
        checkOut: toDatetimeLocal(selectedRecord.checkOut),
        note: selectedRecord.note ?? "",
      };
    }
    return {
      employeeId: prefilledEmployeeId ?? 0,
      date: prefilledDate ?? new Date().toISOString().split("T")[0],
      status: "WORK" as const,
      checkIn: "",
      checkOut: "",
      note: "",
    };
  }, [selectedRecord, prefilledEmployeeId, prefilledDate]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AttendanceRecordDto>({
    resolver: attendanceRecordResolver,
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, defaultValues, reset]);

  const status = watch("status");
  const isWork = status === "WORK";

  const { mutate: saveRecord, isPending: isSaving } = useMutation({
    mutationFn: (data: AttendanceRecordDto) => {
      const body: Record<string, unknown> = {
        employeeId: data.employeeId,
        date: data.date,
        status: data.status,
        note: data.note || null,
      };
      if (data.status === "WORK") {
        body.checkIn = data.checkIn ? new Date(data.checkIn).toISOString() : null;
        body.checkOut = data.checkOut ? new Date(data.checkOut).toISOString() : null;
      } else {
        body.checkIn = null;
        body.checkOut = null;
      }
      if (selectedRecord) {
        return attendanceService.patch(selectedStoreId!, selectedRecord.id, body as any);
      }
      return attendanceService.create(selectedStoreId!, body as any);
    },
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["attendance", selectedStoreId] });
    },
  });

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data) => saveRecord(data))}>
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? "Cập nhật chấm công" : "Thêm chấm công"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Nhân viên</FieldLabel>
                {selectedRecord ? (
                  <p className="text-sm font-medium py-2">
                    {employees.find((e) => e.id === selectedRecord.employeeId)?.user.name ?? `ID: ${selectedRecord.employeeId}`}
                  </p>
                ) : (
                  <>
                    <select
                      {...register("employeeId", { valueAsNumber: true })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      data-invalid={!!errors.employeeId}
                    >
                      <option value={0}>Chọn nhân viên</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.user.name} ({emp.user.phone})
                        </option>
                      ))}
                    </select>
                    <FieldError errors={[errors.employeeId]} />
                  </>
                )}
              </Field>

              <Field>
                <FieldLabel>Ngày</FieldLabel>
                {selectedRecord ? (
                  <p className="text-sm font-medium py-2">
                    {new Date(selectedRecord.date).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                    })}
                  </p>
                ) : (
                  <>
                    <Input type="date" {...register("date")} data-invalid={!!errors.date} />
                    <FieldError errors={[errors.date]} />
                  </>
                )}
              </Field>

              <Field>
                <FieldLabel>Trạng thái</FieldLabel>
                <select
                  {...register("status")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="WORK">Đi làm</option>
                  <option value="PAID_LEAVE">Nghỉ có lương</option>
                  <option value="UNPAID_LEAVE">Nghỉ không lương</option>
                </select>
                <FieldError errors={[errors.status]} />
              </Field>

              {isWork && (
                <>
                  <Field>
                    <FieldLabel>Giờ vào</FieldLabel>
                    <Input type="datetime-local" {...register("checkIn")} data-invalid={!!errors.checkIn} />
                    <FieldError errors={[errors.checkIn]} />
                  </Field>

                  <Field>
                    <FieldLabel>Giờ ra (tùy chọn)</FieldLabel>
                    <Input type="datetime-local" {...register("checkOut")} />
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel>Ghi chú (tùy chọn)</FieldLabel>
                <Textarea placeholder="Ghi chú..." {...register("note")} />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <CircleNotch className="mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
