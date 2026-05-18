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
import { PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { roleService } from "@/services/role.service";
import { type Role } from "@/schemas/role.schema";
import { RoleDialog } from "./RoleDialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RolesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
  });

  const { mutate: deleteRole, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => roleService.delete(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const handleOpenAdd = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

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
              <TableHead>Code</TableHead>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Tổng số quyền</TableHead>
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
            ) : rolesData?.data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chưa có vai trò nào.
                </TableCell>
              </TableRow>
            ) : (
              rolesData?.data?.data?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-xs">{role.id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {role.code}
                  </TableCell>
                  <TableCell className="font-semibold"> {role.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium">
                      {role.permissions?.length || 0} quyền
                    </Badge>
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
                        <TooltipContent>
                          <p>Chỉnh sửa</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            disabled={role.isSystem}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 disabled:opacity-30 transition-colors"
                            onClick={() => {
                              setRoleToDelete(role);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <TrashIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Xóa</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      {/* Role Dialog */}
      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedRole={selectedRole}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa vai trò?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Vai trò{" "}
              <strong>{roleToDelete?.name}</strong> sẽ bị xóa vĩnh viễn khỏi hệ
              thống.
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
