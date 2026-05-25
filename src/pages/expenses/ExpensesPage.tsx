import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon, PencilSimpleIcon, TrashIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { expenseService } from "@/services/expense.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { type Expense } from "@/schemas/expense.schema";
import { ExpenseDialog } from "./ExpenseDialog";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const canCreate = usePerm(PERMS.expenses.create);
  const canUpdate = usePerm(PERMS.expenses.update);
  const canDelete = usePerm(PERMS.expenses.delete);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  const {
    data: expensesData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["expenses", selectedStoreId, dateFrom, dateTo],
    queryFn: ({ pageParam }) =>
      expenseService.getAll(selectedStoreId!, {
        from: dateFrom,
        to: dateTo,
        cursor: pageParam as number | undefined,
        limit: 20,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.data.data.nextCursor ?? undefined,
    enabled: !!selectedStoreId,
  });

  const sentinelRef = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const { mutate: deleteExpense, isPending: isDeleting } = useMutation({
    mutationFn: (expenseId: number) => expenseService.delete(selectedStoreId!, expenseId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["expenses", selectedStoreId] });
    },
  });

  const handleOpenAdd = () => {
    setSelectedExpense(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const expenses = expensesData?.pages.flatMap((page) => page.data.data.items) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
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

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          className="border rounded-md px-3 py-2 text-sm"
          value={dateFrom || ""}
          onChange={(e) => setDateFrom(e.target.value || undefined)}
          placeholder="Từ ngày"
        />
        <input
          type="date"
          className="border rounded-md px-3 py-2 text-sm"
          value={dateTo || ""}
          onChange={(e) => setDateTo(e.target.value || undefined)}
          placeholder="Đến ngày"
        />
        <div className="flex-1" />
        {canCreate && <Button onClick={handleOpenAdd} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Thêm chi phí
        </Button>}
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Ngày</TableHead>
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
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Chưa có chi phí nào.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-mono text-xs">{expense.id}</TableCell>
                  <TableCell className="font-semibold">{expense.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{expense.description || "---"}</TableCell>
                  <TableCell className="font-mono text-sm text-red-600">{formatPrice(expense.amount)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(expense.rawDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canUpdate && <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 transition-colors"
                            onClick={() => handleOpenEdit(expense)}
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
                              setExpenseToDelete(expense);
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

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CircleNotchIcon size={16} className="animate-spin" />
            Đang tải thêm...
          </div>
        )}
      </div>

      <ExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedExpense={selectedExpense}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chi phí?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chi phí <strong>{expenseToDelete?.title}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => expenseToDelete && deleteExpense(expenseToDelete.id)}
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
