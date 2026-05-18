import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  SquaresFourIcon,
  StorefrontIcon,
  ShieldCheckIcon,
  UserGearIcon,
  ListBulletsIcon,
  ForkKnifeIcon,
  ChairIcon,
  ListChecksIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";
import { storeService } from "@/services/store.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type Store, type StoreModule } from "@/schemas/store.schema";
import { StoreDialog } from "./StoreDialog";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  stores: <StorefrontIcon size={20} />,
  store_roles: <ShieldCheckIcon size={20} />,
  employees: <UserGearIcon size={20} />,
  categories: <ListBulletsIcon size={20} />,
  menu_items: <ForkKnifeIcon size={20} />,
  areas: <SquaresFourIcon size={20} />,
  tables: <ChairIcon size={20} />,
  statuses: <ListChecksIcon size={20} />,
  orders: <ShoppingCartIcon size={20} />,
  expenses: <ReceiptIcon size={20} />,
  dashboard: <ChartBarIcon size={20} />,
};

interface StoreModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: Store | null;
  userId: number;
}

function StoreModulesDialog({
  open,
  onOpenChange,
  store,
  userId,
}: StoreModulesDialogProps) {
  const setSelectedStoreId = useStoreContext((s) => s.setSelectedStoreId);
  const setSelectedUserId = useStoreContext((s) => s.setSelectedUserId);
  const setSelectedStoreName = useStoreContext((s) => s.setSelectedStoreName);

  const { data: modulesData, isLoading } = useQuery({
    queryKey: ["store-modules", store?.id],
    queryFn: () => storeService.getModules(store!.id),
    enabled: open && !!store,
  });

  const routeMap: Record<string, string> = {
    stores: "/dashboard/stores",
    store_roles: "/dashboard/store-roles",
    employees: "/dashboard/employees",
    categories: "/dashboard/categories",
    menu_items: "/dashboard/menu-items",
    areas: "/dashboard/areas",
    tables: "/dashboard/tables",
    statuses: "/dashboard/statuses",
    orders: "/dashboard/orders",
    expenses: "/dashboard/expenses",
    dashboard: "/dashboard/stats",
  };

  const modules = modulesData?.data?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 flex-none">
          <DialogTitle>Module của {store?.name}</DialogTitle>
          <DialogDescription>
            Chọn module để quản lý cho cửa hàng này.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Đang tải module...
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {modules.map((module: StoreModule) => {
                  const route = routeMap[module.code];
                  return route ? (
                    <Link
                      key={module.code}
                      to={route}
                      className="flex items-center gap-3 w-full p-3 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer text-left no-underline text-inherit"
                      onClick={() => {
                        setSelectedStoreId(store!.id);
                        setSelectedUserId(userId);
                        setSelectedStoreName(store!.name);
                      }}
                    >
                      <div className="text-primary shrink-0">
                        {MODULE_ICONS[module.code] || (
                          <SquaresFourIcon size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">
                          {module.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {module.apis.length} APIs
                      </span>
                    </Link>
                  ) : null;
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StoresPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const selectedUserId = useStoreContext((s) => s.selectedUserId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [modulesDialogOpen, setModulesDialogOpen] = useState(false);
  const [storeForModules, setStoreForModules] = useState<Store | null>(null);

  useEffect(() => {
    if (!selectedUserId) {
      navigate("/dashboard/users", { replace: true });
    }
  }, [selectedUserId, navigate]);

  const { data: storesData, isLoading } = useQuery({
    queryKey: ["stores", selectedUserId],
    queryFn: () => storeService.getAll(selectedUserId!),
    enabled: !!selectedUserId,
  });

  const { mutate: deleteStore, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => storeService.delete(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["stores", selectedUserId] });
    },
  });

  const handleOpenAdd = () => {
    setSelectedStore(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (store: Store) => {
    setSelectedStore(store);
    setIsDialogOpen(true);
  };

  const handleOpenModules = (store: Store) => {
    setStoreForModules(store);
    setModulesDialogOpen(true);
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

  const stores = storesData?.data?.data || [];

  if (!selectedUserId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Thêm cửa hàng
        </Button>
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên cửa hàng</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
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
            ) : stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Chưa có cửa hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-mono text-xs">
                    {store.id}
                  </TableCell>
                  <TableCell className="font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="text-left hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline"
                          onClick={() => handleOpenModules(store)}
                        >
                          {store.name}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chọn mô-đun</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {store.address || "---"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {store.roleName && store.roleName.length > 0 ? (
                        store.roleName.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all bg-emerald-50 text-emerald-700 border-emerald-200">
                          Chủ cửa hàng
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(store.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:!text-emerald-600 transition-colors"
                            onClick={() => handleOpenModules(store)}
                          >
                            <SquaresFourIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chọn mô-đun</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 transition-colors"
                            onClick={() => handleOpenEdit(store)}
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
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 transition-colors"
                            onClick={() => {
                              setStoreToDelete(store);
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

      <StoreDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedStore={selectedStore}
        userId={selectedUserId}
      />

      <StoreModulesDialog
        open={modulesDialogOpen}
        onOpenChange={setModulesDialogOpen}
        store={storeForModules}
        userId={selectedUserId}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa cửa hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Cửa hàng{" "}
              <strong>{storeToDelete?.name}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => storeToDelete && deleteStore(storeToDelete.id)}
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
