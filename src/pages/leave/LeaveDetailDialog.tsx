import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { type LeaveRequest } from "@/services/leave.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: LeaveRequest | null;
}

const statusLabels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export function LeaveDetailDialog({ open, onOpenChange, leave }: Props) {
  if (!leave) return null;

  const formatDate = (dateStr?: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("vi-VN", {
          day: "2-digit", month: "2-digit", year: "numeric",
        })
      : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nhân viên</p>
              <p className="font-semibold">{leave.employee.user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trạng thái</p>
              <Badge variant="outline" className={
                leave.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                leave.status === "APPROVED" ? "bg-green-50 text-green-600" :
                "bg-red-50 text-red-600"
              }>
                {statusLabels[leave.status]}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Từ ngày</p>
              <p className="font-semibold">{formatDate(leave.fromDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Đến ngày</p>
              <p className="font-semibold">{formatDate(leave.toDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loại</p>
              <p className="font-semibold">{leave.isPaid ? "Có lương" : "Không lương"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Người duyệt</p>
              <p className="font-semibold">{leave.reviewer?.name || "—"}</p>
            </div>
          </div>
          {leave.reason && (
            <div>
              <p className="text-sm text-muted-foreground">Lý do</p>
              <p className="text-sm mt-1">{leave.reason}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Tạo lúc: {leave.createdAt ? new Date(leave.createdAt).toLocaleString("vi-VN") : "—"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
