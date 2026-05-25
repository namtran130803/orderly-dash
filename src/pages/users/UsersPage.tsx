import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShieldCheckIcon, StorefrontIcon } from "@phosphor-icons/react";
import { userService } from "@/services/user.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type User } from "@/schemas/user.schema";
import { UserRoleDialog } from "./UserRoleDialog";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

export function UsersPage() {
  const navigate = useNavigate();
  const canListRoles = usePerm(PERMS.users.role_list);
  const canAssignRoles = usePerm(PERMS.users.role_assign);
  const canRemoveRoles = usePerm(PERMS.users.role_remove);
  const canManageRoles = canListRoles || canAssignRoles || canRemoveRoles;
  const setSelectedUserId = useStoreContext((s) => s.setSelectedUserId);
  const setSelectedUserName = useStoreContext((s) => s.setSelectedUserName);
  const [selectedRoleUserId, setSelectedRoleUserId] = useState<number | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.list(),
  });

  const users = usersData?.data?.data || [];
  const selectedUser = users.find((u) => u.id === selectedRoleUserId) || null;

  const handleOpenRoles = (user: User) => {
    setSelectedRoleUserId(user.id);
    setIsRoleDialogOpen(true);
  };

  const handleManageStores = (user: User) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.name);
    navigate("/dashboard/stores");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch (e) {
      return "---";
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">ID</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Ngày tham gia</TableHead>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chưa có người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center font-mono text-xs">
                    {user.id}
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-violet-600 bg-violet-50 hover:bg-violet-100 hover:!text-violet-600 transition-colors"
                            onClick={() => handleManageStores(user)}
                          >
                            <StorefrontIcon size={20} weight="bold" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quản lý cửa hàng</p>
                        </TooltipContent>
                      </Tooltip>

                      {canManageRoles && <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:!text-emerald-600 transition-colors"
                            onClick={() => handleOpenRoles(user)}
                          >
                            <ShieldCheckIcon size={20} weight="bold" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Vai trò</p>
                        </TooltipContent>
                      </Tooltip>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <UserRoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
