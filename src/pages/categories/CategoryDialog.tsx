import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { CircleNotch } from "@phosphor-icons/react";
import { categoryService } from "@/services/category.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { categoryResolver, type CategoryDto, type Category } from "@/schemas/category.schema";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: Category | null;
}

export function CategoryDialog({ open, onOpenChange, selectedCategory }: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryDto>({
    resolver: categoryResolver,
    defaultValues: {
      name: "",
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedCategory) {
        reset({
          name: selectedCategory.name,
          sortOrder: selectedCategory.sortOrder,
        });
      } else {
        reset({ name: "", sortOrder: 0 });
      }
    }
  }, [open, selectedCategory, reset]);

  const { mutate: saveCategory, isPending: isSaving } = useMutation({
    mutationFn: (data: CategoryDto) =>
      selectedCategory
        ? categoryService.update(selectedStoreId!, selectedCategory.id, data)
        : categoryService.create(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["categories", selectedStoreId] });
    },
  });

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: CategoryDto) => saveCategory(data))}>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory ? "Cập nhật thông tin danh mục." : "Tạo danh mục thực đơn mới."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Tên danh mục</FieldLabel>
                <Input
                  placeholder="VD: Cà phê máy"
                  {...register("name")}
                  data-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel>Thứ tự</FieldLabel>
                <Input
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                />
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
