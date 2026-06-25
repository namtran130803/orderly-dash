import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheckIcon, StorefrontIcon } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { userService, type UserListParams } from "@/services/user.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type User } from "@/schemas/user.schema";
import { UserRoleDialog } from "./UserRoleDialog";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function getPageItems(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page]);
  for (let i = page - 2; i <= page + 2; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "..."> = [];
  sorted.forEach((item, index) => {
    const previous = sorted[index - 1];
    if (previous && item - previous > 1) result.push("...");
    result.push(item);
  });
  return result;
}

function PaginationBar({
  pagination,
  page,
  onPageChange,
}: {
  pagination?: PaginationMeta;
  page: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;
  const pageItems = getPageItems(currentPage, totalPages);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(1)}>{"<<"}</Button>
      <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>{"<"}</Button>
      {pageItems.map((item, index) =>
        item === "..." ? (
          <span key={`e-${index}`} className="px-2 text-sm text-muted-foreground">...</span>
        ) : (
          <Button key={item} variant={item === currentPage ? "default" : "outline"} size="sm" onClick={() => onPageChange(item)}>
            {item}
          </Button>
        ),
      )}
      <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>{">"}  </Button>
      <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(totalPages)}>{">>"}</Button>
    </div>
  );
}

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
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserListParams>({ limit: 10 });

  const queryParams = { ...filters, page, limit: filters.limit ?? 20 };
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => userService.list(queryParams),
  });

  const users = usersData?.data?.data || [];
  const pagination = usersData?.data?.pagination;
  const selectedUser = users.find((u) => u.id === selectedRoleUserId) || null;

  const updateFilter = (key: keyof UserListParams, value: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

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
    } catch {
      return "---";
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid gap-2 md:grid-cols-4">
        <SearchInput
          placeholder="Tìm tên người dùng, tên cửa hàng, số điện thoại"
          onDebouncedChange={(value) => updateFilter("q", value)}
        />
      </div>

      <TooltipProvider>
        <div className="overflow-hidden border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">ID</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Cửa hàng</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Chưa có người dùng phù hợp.
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
                    <TableCell className="max-w-[280px]">
                      <div className="truncate text-sm">
                        {user.stores?.map((store) => store.name).join(", ") || "---"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100 hover:!text-violet-600"
                              onClick={() => handleManageStores(user)}
                            >
                              <StorefrontIcon size={20} weight="bold" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quản lý cửa hàng</p>
                          </TooltipContent>
                        </Tooltip>

                        {canManageRoles && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 hover:!text-emerald-600"
                                onClick={() => handleOpenRoles(user)}
                              >
                                <ShieldCheckIcon size={20} weight="bold" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Vai trò</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span>Tổng {pagination?.total ?? 0} người dùng</span>
          <div className="flex items-center gap-1.5">
            <span>Hiển thị</span>
            <Select
              value={String(queryParams.limit)}
              onValueChange={(val) => {
                setPage(1);
                setFilters((current) => ({
                  ...current,
                  limit: Number(val),
                }));
              }}
            >
              <SelectTrigger className="h-8 w-18">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 25, 50, 100, 200].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </div>

      <UserRoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
