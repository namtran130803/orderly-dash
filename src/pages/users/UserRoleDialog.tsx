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
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { type User } from "@/schemas/user.schema";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
}: UserRoleDialogProps) {
  const queryClient = useQueryClient();

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
    enabled: open,
  });

  const { data: userRolesData, isLoading: isLoadingUserRoles } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: () => userService.getUserRoles(user!.id),
    enabled: open && !!user,
  });

  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  const { mutate: assignRole } = useMutation({
    mutationFn: (roleId: number) => {
      setUpdatingRoleId(roleId);
      return userService.assignRole(user!.id, { roleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles", user?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi gán vai trò");
    },
    onSettled: () => setUpdatingRoleId(null),
  });

  const { mutate: removeRole } = useMutation({
    mutationFn: (roleId: number) => {
      setUpdatingRoleId(roleId);
      return userService.removeRole(user!.id, roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles", user?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi gỡ vai trò");
    },
    onSettled: () => setUpdatingRoleId(null),
  });

  if (!user) return null;

  const roles = rolesData?.data?.data || [];
  const userRoles = userRolesData?.data?.data || [];
  const userRoleIds = userRoles.map((ur) => ur.id);

  const handleToggleRole = (roleId: number, checked: boolean) => {
    if (updatingRoleId !== null) return;
    if (checked) {
      assignRole(roleId);
    } else {
      removeRole(roleId);
    }
  };

  const isLoading = isLoadingRoles || isLoadingUserRoles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] h-[80vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b flex-none">
          <DialogTitle className="flex items-center gap-2">
            Danh sách vai trò
          </DialogTitle>
          <DialogDescription className="mt-1">
            Chọn các vai trò cho <strong>{user.name}</strong>
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
                  const isChecked = userRoleIds.includes(role.id);
                  const isThisUpdating = updatingRoleId === role.id;

                  return (
                    <div
                      key={role.id}
                      className={`flex items-center space-x-3 space-y-0 rounded-md p-3 transition-colors cursor-pointer ${isThisUpdating
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-muted/50"
                        }`}
                      onClick={() =>
                        !isThisUpdating && handleToggleRole(role.id, !isChecked)
                      }
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={updatingRoleId !== null}
                        onCheckedChange={(checked) =>
                          handleToggleRole(role.id, !!checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">
                          {role.name}
                        </p>
                        {role.code && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">
                            {role.code}
                          </p>
                        )}
                      </div>
                      {isThisUpdating && (
                        <CircleNotchIcon
                          className="animate-spin text-primary"
                          size={16}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-background flex-none">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
