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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { statusService } from "@/services/status.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type Status } from "@/schemas/status.schema";
import { StatusDialog } from "./StatusDialog";

const typeLabels: Record<string, string> = {
  start: "Bắt đầu",
  mid: "Trung gian",
  end: "Kết thúc",
};

const typeColors: Record<string, string> = {
  start: "default",
  mid: "secondary",
  end: "destructive",
};

export function StatusesPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);

  const { data: statusesData, isLoading } = useQuery({
    queryKey: ["statuses", selectedStoreId],
    queryFn: () => statusService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { mutate: deleteStatus, isPending: isDeleting } = useMutation({
    mutationFn: (statusId: number) => statusService.delete(selectedStoreId!, statusId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["statuses", selectedStoreId] });
    },
  });

  const handleOpenAdd = () => {
    setSelectedStatus(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (status: Status) => {
    setSelectedStatus(status);
    setIsDialogOpen(true);
  };

  const statuses = statusesData?.data?.data || [];

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Thêm trạng thái
        </Button>
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên trạng thái</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : statuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chưa có trạng thái nào.
                </TableCell>
              </TableRow>
            ) : (
              statuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell className="font-mono text-xs">{status.id}</TableCell>
                  <TableCell className="font-semibold">{status.name}</TableCell>
                  <TableCell>
                    <Badge variant={(typeColors[status.type] as any) || "secondary"}>
                      {typeLabels[status.type] || status.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{status.sortOrder}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 transition-colors"
                            onClick={() => handleOpenEdit(status)}
                          >
                            <PencilSimpleIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Chỉnh sửa</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 transition-colors"
                            onClick={() => {
                              setStatusToDelete(status);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <TrashIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Xóa</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <StatusDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedStatus={selectedStatus}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa trạng thái?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Trạng thái <strong>{statusToDelete?.name}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => statusToDelete && deleteStatus(statusToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
