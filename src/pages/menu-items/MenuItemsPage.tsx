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
import { menuItemService } from "@/services/menuItem.service";
import { categoryService } from "@/services/category.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type MenuItem } from "@/schemas/menuItem.schema";
import { MenuItemDialog } from "./MenuItemDialog";

export function MenuItemsPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["menu-items", selectedStoreId],
    queryFn: () => menuItemService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", selectedStoreId],
    queryFn: () => categoryService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: (itemId: number) => menuItemService.delete(selectedStoreId!, itemId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["menu-items", selectedStoreId] });
    },
  });

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const items = itemsData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "---";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Thêm món
        </Button>
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên món</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chưa có món nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryName(item.categoryId)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatPrice(item.price)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:!text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:hover:!text-blue-400 transition-colors"
                            onClick={() => handleOpenEdit(item)}
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
                            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:!text-red-600 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:!text-red-400 transition-colors"
                            onClick={() => {
                              setItemToDelete(item);
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

      <MenuItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedItem={selectedItem}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa món?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Món <strong>{itemToDelete?.name}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteItem(itemToDelete.id)}
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
