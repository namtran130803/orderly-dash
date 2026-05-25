import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, TrashIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { scheduleService, type ScheduleOverride } from "@/services/schedule.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { ScheduleOverrideDialog } from "./ScheduleOverrideDialog";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function SchedulePage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const canManage = usePerm(PERMS.schedule.manage);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleOverride | null>(null);
  const [pendingDays, setPendingDays] = useState<number[] | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["schedule", selectedStoreId],
    queryFn: () => scheduleService.get(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const schedule = data?.data?.data;
  const defaultWorkDays = pendingDays ?? schedule?.defaultWorkDays ?? [];

  const { mutate: saveDefault, isPending: isSavingDefault } = useMutation({
    mutationFn: (days: number[]) => scheduleService.putDefault(selectedStoreId!, days),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setPendingDays(null);
      queryClient.invalidateQueries({ queryKey: ["schedule", selectedStoreId] });
    },
  });

  const { mutate: deleteOverride, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => scheduleService.deleteOverride(selectedStoreId!, id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["schedule", selectedStoreId] });
    },
  });

  const handleToggleDay = (day: number) => {
    if (!canManage) return;

    setPendingDays((prev) => {
      const current = prev ?? schedule?.defaultWorkDays ?? [];
      return current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort();
    });
  };

  const handleSaveDefault = () => {
    if (pendingDays != null) saveDefault(pendingDays);
  };

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Default work days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ngày làm mặc định</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {DAY_LABELS.map((label, i) => (
                  <label
                    key={i}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <Checkbox
                      checked={defaultWorkDays.includes(i)}
                      disabled={!canManage}
                      onCheckedChange={() => handleToggleDay(i)}
                    />
                  </label>
                ))}
              </div>
              {canManage && pendingDays != null && (
                <Button onClick={handleSaveDefault} disabled={isSavingDefault} size="sm">
                  {isSavingDefault && <CircleNotchIcon className="mr-2 animate-spin" />}
                  Lưu thay đổi
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overrides */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Ngày đặc biệt</CardTitle>
          {canManage && <Button onClick={() => setIsOverrideOpen(true)} className="h-8 px-3 text-sm">
            <PlusIcon size={16} weight="bold" className="mr-1" /> Thêm
          </Button>}
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-16 text-center">Đang tải...</TableCell>
                  </TableRow>
                ) : !schedule?.overrides?.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                      Chưa có ngày đặc biệt nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedule.overrides.map((ov) => (
                    <TableRow key={ov.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(ov.date).toLocaleDateString("vi-VN", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          ov.type === "OFF" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                        }`}>
                          {ov.type === "OFF" ? "Nghỉ" : "Làm bù"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {canManage && <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 transition-colors"
                              onClick={() => setDeleteTarget(ov)}
                            >
                              <TrashIcon size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Xóa</p></TooltipContent>
                        </Tooltip>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>

      <ScheduleOverrideDialog
        open={isOverrideOpen}
        onOpenChange={setIsOverrideOpen}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ngày đặc biệt?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa ngày {deleteTarget && new Date(deleteTarget.date).toLocaleDateString("vi-VN")}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteOverride(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
