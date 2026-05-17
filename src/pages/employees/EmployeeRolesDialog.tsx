import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { employeeService } from "@/services/employee.service";
import { storeRoleService } from "@/services/storeRole.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type Employee } from "@/schemas/employee.schema";

interface EmployeeRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeRolesDialog({ open, onOpenChange, employee }: EmployeeRolesDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["store-roles", selectedStoreId],
    queryFn: () => storeRoleService.getAll(selectedStoreId!),
    enabled: open && !!selectedStoreId,
  });

  const { data: employeeRolesData, isLoading: isLoadingEmployeeRoles } = useQuery({
    queryKey: ["employee-roles", selectedStoreId, employee?.id],
    queryFn: () => employeeService.getRoles(selectedStoreId!, employee!.id),
    enabled: open && !!selectedStoreId && !!employee,
  });

  const { mutate: assignRoles } = useMutation({
    mutationFn: (roleIds: number[]) => {
      setUpdatingRoleId(roleIds[0]);
      return employeeService.assignRoles(selectedStoreId!, employee!.id, { roleIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-roles", selectedStoreId, employee?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi gán vai trò");
    },
    onSettled: () => setUpdatingRoleId(null),
  });

  const { mutate: removeRole } = useMutation({
    mutationFn: (roleId: number) => {
      setUpdatingRoleId(roleId);
      return employeeService.removeRole(selectedStoreId!, employee!.id, roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-roles", selectedStoreId, employee?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi gỡ vai trò");
    },
    onSettled: () => setUpdatingRoleId(null),
  });

  if (!employee || !selectedStoreId) return null;

  const roles = rolesData?.data?.data || [];
  const employeeRoles = employeeRolesData?.data?.data || [];
  const employeeRoleIds = employeeRoles.map((er) => er.id);

  const handleToggleRole = (roleId: number, checked: boolean) => {
    if (updatingRoleId !== null) return;
    if (checked) {
      assignRoles([roleId]);
    } else {
      removeRole(roleId);
    }
  };

  const isLoading = isLoadingRoles || isLoadingEmployeeRoles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] h-[80vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b flex-none">
          <DialogTitle>Quản lý vai trò</DialogTitle>
          <DialogDescription className="mt-1">
            Chọn các vai trò cho <strong>{employee.user.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CircleNotchIcon size={32} className="animate-spin mb-2" />
              <span className="text-sm">Đang tải vai trò và quyền...</span>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-1">
                {roles.map((role) => {
                  const isChecked = employeeRoleIds.includes(role.id);
                  const isThisUpdating = updatingRoleId === role.id;

                  return (
                    <div
                      key={role.id}
                      className={`flex items-center space-x-3 rounded-md p-3 transition-colors cursor-pointer ${isThisUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"}`}
                      onClick={() => !isThisUpdating && handleToggleRole(role.id, !isChecked)}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={updatingRoleId !== null}
                        onCheckedChange={(checked) => handleToggleRole(role.id, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{role.name}</p>
                      </div>
                      {isThisUpdating && (
                        <CircleNotchIcon className="animate-spin text-primary" size={16} />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-background flex-none">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
