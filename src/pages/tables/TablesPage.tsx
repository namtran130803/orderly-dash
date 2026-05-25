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
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { tableService } from "@/services/table.service";
import { areaService } from "@/services/area.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type Table as TableType } from "@/schemas/table.schema";
import { TableDialog } from "./TableDialog";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

export function TablesPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const canUpdate = usePerm(PERMS.tables.update);
  const canDelete = usePerm(PERMS.tables.delete);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [tableToDelete, setTableToDelete] = useState<TableType | null>(null);

  const { data: tablesData, isLoading } = useQuery({
    queryKey: ["tables", selectedStoreId],
    queryFn: () => tableService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { data: areasData } = useQuery({
    queryKey: ["areas", selectedStoreId],
    queryFn: () => areaService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { mutate: deleteTable, isPending: isDeleting } = useMutation({
    mutationFn: (tableId: number) => tableService.delete(selectedStoreId!, tableId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tables", selectedStoreId] });
    },
  });

  const handleOpenEdit = (table: TableType) => {
    setSelectedTable(table);
    setIsDialogOpen(true);
  };

  const tables = tablesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  const getAreaName = (areaId: number) => {
    return areas.find((a) => a.id === areaId)?.name || "---";
  };

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên bàn</TableHead>
              <TableHead>Khu vực</TableHead>
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
            ) : tables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chưa có bàn nào. Bàn được tạo tự động khi tạo khu vực.
                </TableCell>
              </TableRow>
            ) : (
              tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-mono text-xs">{table.id}</TableCell>
                  <TableCell className="font-semibold">{table.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getAreaName(table.areaId)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{table.sortOrder}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canUpdate && <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 transition-colors"
                            onClick={() => handleOpenEdit(table)}
                          >
                            <PencilSimpleIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Chỉnh sửa</p></TooltipContent>
                      </Tooltip>}

                      {canDelete && <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 transition-colors"
                            onClick={() => {
                              setTableToDelete(table);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <TrashIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Xóa</p></TooltipContent>
                      </Tooltip>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <TableDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedTable={selectedTable}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bàn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bàn <strong>{tableToDelete?.name}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tableToDelete && deleteTable(tableToDelete.id)}
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
