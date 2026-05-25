import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import { leaveService, type LeaveRequest } from "@/services/leave.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { LeaveRequestDialog } from "./LeaveRequestDialog";
import { LeaveDetailDialog } from "./LeaveDetailDialog";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200",
  APPROVED: "bg-green-50 text-green-600 border-green-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
};

export function LeavePage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leave", selectedStoreId, statusFilter],
    queryFn: () =>
      leaveService.list(selectedStoreId!, statusFilter ? { status: statusFilter } : undefined),
    enabled: !!selectedStoreId,
  });

  const leaves = data?.data?.data ?? [];

  const { mutate: approveLeave, isPending: isApproving } = useMutation({
    mutationFn: (leaveId: number) => leaveService.approve(selectedStoreId!, leaveId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setApproveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["leave", selectedStoreId] });
    },
  });

  const { mutate: rejectLeave, isPending: isRejecting } = useMutation({
    mutationFn: (leaveId: number) => leaveService.reject(selectedStoreId!, leaveId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ["leave", selectedStoreId] });
    },
  });

  const handleViewDetail = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsDetailOpen(true);
  };

  const formatDate = (dateStr?: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("vi-VN", {
          day: "2-digit", month: "2-digit", year: "numeric",
        })
      : "—";

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  const tabs = [
    { label: "Tất cả", value: undefined },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đã duyệt", value: "APPROVED" },
    { label: "Từ chối", value: "REJECTED" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                statusFilter === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Tạo đơn
        </Button>
      </div>

      {/* Table */}
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Từ ngày</TableHead>
              <TableHead>Đến ngày</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người duyệt</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">Đang tải...</TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">Không có đơn nghỉ phép.</TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-mono text-xs">{leave.id}</TableCell>
                  <TableCell className="font-semibold">{leave.employee.user.name}</TableCell>
                  <TableCell className="font-mono text-sm">{formatDate(leave.fromDate)}</TableCell>
                  <TableCell className="font-mono text-sm">{formatDate(leave.toDate)}</TableCell>
                  <TableCell>
                    {leave.isPaid ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        Có lương
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">
                        Không lương
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-muted-foreground">
                    {leave.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-block px-2 py-0.5 rounded text-xs font-medium border",
                      statusColors[leave.status] || "",
                    )}>
                      {statusLabels[leave.status] || leave.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {leave.reviewer?.name || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-colors"
                            onClick={() => handleViewDetail(leave)}
                          >
                            <EyeIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Chi tiết</p></TooltipContent>
                      </Tooltip>
                      {leave.status === "PENDING" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 bg-green-50 hover:bg-green-100 hover:!text-green-600 transition-colors"
                                onClick={() => setApproveTarget(leave)}
                              >
                                <CheckCircleIcon size={18} weight="bold" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Duyệt</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 transition-colors"
                                onClick={() => setRejectTarget(leave)}
                              >
                                <XCircleIcon size={18} weight="bold" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Từ chối</p></TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <LeaveRequestDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <LeaveDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        leave={selectedLeave}
      />

      {/* Approve confirm */}
      <AlertDialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyệt đơn nghỉ phép?</AlertDialogTitle>
            <AlertDialogDescription>
              Duyệt đơn của <strong>{approveTarget?.employee.user.name}</strong> từ{" "}
              {approveTarget && formatDate(approveTarget.fromDate)} đến{" "}
              {approveTarget && formatDate(approveTarget.toDate)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveTarget && approveLeave(approveTarget.id)}
              disabled={isApproving}
            >
              {isApproving ? "Đang duyệt..." : "Duyệt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject confirm */}
      <AlertDialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối đơn nghỉ phép?</AlertDialogTitle>
            <AlertDialogDescription>
              Từ chối đơn của <strong>{rejectTarget?.employee.user.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectTarget && rejectLeave(rejectTarget.id)}
              className="bg-destructive text-destructive-foreground"
              disabled={isRejecting}
            >
              {isRejecting ? "Đang từ chối..." : "Từ chối"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
