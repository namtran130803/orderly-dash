import { useState } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { PlusIcon, TrashIcon, ArrowRightIcon, ArrowLeftIcon, EyeIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { orderService } from "@/services/order.service";
import { statusService } from "@/services/status.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { type Order } from "@/schemas/order.schema";
import { OrderDialog } from "./OrderDialog";
import { OrderDetailDialog } from "./OrderDetailDialog";

export function OrdersPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [filterStatusId, setFilterStatusId] = useState<number | undefined>();
  const [filterDate, setFilterDate] = useState<string | undefined>();

  const {
    data: ordersData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["orders", selectedStoreId, filterStatusId, filterDate],
    queryFn: ({ pageParam }) =>
      orderService.getAll(selectedStoreId!, {
        statusId: filterStatusId,
        date: filterDate,
        cursor: pageParam as number | undefined,
        limit: 20,
        sortOrder: 'desc',
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: !!selectedStoreId,
  });

  const sentinelRef = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const { data: statusesData } = useQuery({
    queryKey: ["statuses", selectedStoreId],
    queryFn: () => statusService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: (orderId: number) => orderService.delete(selectedStoreId!, orderId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["orders", selectedStoreId] });
    },
  });

  const { mutate: advanceOrder } = useMutation({
    mutationFn: ({ orderId, fromStatusId }: { orderId: number; fromStatusId: number }) =>
      orderService.advance(selectedStoreId!, orderId, { fromStatusId }),
    onSuccess: () => {
      toast.success("Đã chuyển trạng thái");
      queryClient.invalidateQueries({ queryKey: ["orders", selectedStoreId] });
    },
  });

  const { mutate: revertOrder } = useMutation({
    mutationFn: ({ orderId, fromStatusId }: { orderId: number; fromStatusId: number }) =>
      orderService.revert(selectedStoreId!, orderId, { fromStatusId }),
    onSuccess: () => {
      toast.success("Đã lùi trạng thái");
      queryClient.invalidateQueries({ queryKey: ["orders", selectedStoreId] });
    },
  });

  const handleOpenAdd = () => {
    setSelectedOrder(null);
    setIsDialogOpen(true);
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const orders = ordersData?.pages.flatMap((page) => page.data.data) || [];
  const statuses = statusesData?.data?.data || [];

  const getStatusType = (statusId: number | null | undefined) => {
    if (statusId == null) return undefined;
    return statuses.find((s) => s.id === statusId)?.type;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return "---";
    }
  };

  const getTotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.priceSnapshot * item.qty, 0);
  };

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-2 items-center">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={filterStatusId || ""}
          onChange={(e) => setFilterStatusId(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="">Tất cả trạng thái</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          type="date"
          className="border rounded-md px-3 py-2 text-sm"
          value={filterDate || ""}
          onChange={(e) => setFilterDate(e.target.value || undefined)}
        />
        <div className="flex-1" />
        <Button onClick={handleOpenAdd} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Tạo đơn
        </Button>
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Bàn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Số món</TableHead>
              <TableHead>Tổng</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Chưa có đơn hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{order.tableSnapshot || "Mang đi"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.statusSnapshot || "Chưa có"}</Badge>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="font-mono text-sm">{formatPrice(getTotal(order))}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:!text-gray-600 dark:bg-gray-950/30 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:!text-gray-400 transition-colors"
                            onClick={() => handleViewDetail(order)}
                          >
                            <EyeIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Chi tiết</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 bg-green-50 hover:bg-green-100 hover:!text-green-600 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/50 dark:hover:!text-green-400 transition-colors"
                            disabled={getStatusType(order.statusId) === "end"}
                            onClick={() => order.statusId && advanceOrder({ orderId: order.id, fromStatusId: order.statusId })}
                          >
                            <ArrowRightIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Chuyển trạng thái</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:!text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-900/50 dark:hover:!text-orange-400 transition-colors"
                            disabled={getStatusType(order.statusId) === "start"}
                            onClick={() => order.statusId && revertOrder({ orderId: order.id, fromStatusId: order.statusId })}
                          >
                            <ArrowLeftIcon size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Lùi trạng thái</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:!text-red-400 transition-colors"
                            onClick={() => {
                              setOrderToDelete(order);
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

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CircleNotchIcon size={16} className="animate-spin" />
            Đang tải thêm...
          </div>
        )}
      </div>

      <OrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <OrderDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        order={selectedOrder}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Đơn hàng <strong>#{orderToDelete?.id}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToDelete && deleteOrder(orderToDelete.id)}
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
