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
import { storeRoleService } from "@/services/storeRole.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type StoreRole } from "@/schemas/storeRole.schema";
import { StoreRoleDialog } from "./StoreRoleDialog";

export function StoreRolesPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<StoreRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<StoreRole | null>(null);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["store-roles", selectedStoreId],
    queryFn: () => storeRoleService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { mutate: deleteRole, isPending: isDeleting } = useMutation({
    mutationFn: (roleId: number) => storeRoleService.delete(selectedStoreId!, roleId),
    onSuccess: () => {
      toast.success("Đã xóa vai trò");
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["store-roles", selectedStoreId] });
    },
  });

  const handleOpenAdd = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (role: StoreRole) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const roles = rolesData?.data?.data || [];

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Thêm vai trò
        </Button>
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Số quyền</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Chưa có vai trò nào.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-xs">{role.id}</TableCell>
                  <TableCell className="font-semibold">{role.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissions?.length || 0} quyền</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 transition-colors"
                            onClick={() => handleOpenEdit(role)}
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
                              setRoleToDelete(role);
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

      <StoreRoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedRole={selectedRole}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa vai trò?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Vai trò <strong>{roleToDelete?.name}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToDelete && deleteRole(roleToDelete.id)}
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
