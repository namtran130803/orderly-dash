import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { CircleNotch } from "@phosphor-icons/react";
import { menuItemService } from "@/services/menuItem.service";
import { categoryService } from "@/services/category.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { menuItemResolver, type MenuItemDto, type MenuItem } from "@/schemas/menuItem.schema";

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: MenuItem | null;
}

export function MenuItemDialog({ open, onOpenChange, selectedItem }: MenuItemDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", selectedStoreId],
    queryFn: () => categoryService.getAll(selectedStoreId!),
    enabled: open && !!selectedStoreId,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemDto>({
    resolver: menuItemResolver,
    defaultValues: {
      name: "",
      price: 0,
      categoryId: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedItem) {
        reset({
          name: selectedItem.name,
          price: selectedItem.price,
          categoryId: selectedItem.categoryId,
        });
      } else {
        reset({ name: "", price: 0, categoryId: 0 });
      }
    }
  }, [open, selectedItem, reset]);

  const { mutate: saveItem, isPending: isSaving } = useMutation({
    mutationFn: (data: MenuItemDto) =>
      selectedItem
        ? menuItemService.update(selectedStoreId!, selectedItem.id, data)
        : menuItemService.create(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["menu-items", selectedStoreId] });
    },
  });

  const categories = categoriesData?.data?.data || [];

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: MenuItemDto) => saveItem(data))}>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Cập nhật món" : "Thêm món mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem ? "Cập nhật thông tin món." : "Tạo món mới trong thực đơn."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Tên món</FieldLabel>
                <Input
                  placeholder="VD: Cà phê Sữa đá"
                  {...register("name")}
                  data-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel>Danh mục</FieldLabel>
                <Select
                  value={watch("categoryId")?.toString()}
                  onValueChange={(v) => setValue("categoryId", parseInt(v), { shouldValidate: true })}
                >
                  <SelectTrigger data-invalid={!!errors.categoryId}>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.categoryId]} />
              </Field>

              <Field>
                <FieldLabel>Giá (VNĐ)</FieldLabel>
                <Input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  data-invalid={!!errors.price}
                />
                <FieldError errors={[errors.price]} />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <CircleNotch className="mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
