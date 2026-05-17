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
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { CircleNotch } from "@phosphor-icons/react";
import { expenseService } from "@/services/expense.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { expenseResolver, type ExpenseDto, type Expense } from "@/schemas/expense.schema";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExpense: Expense | null;
}

export function ExpenseDialog({ open, onOpenChange, selectedExpense }: ExpenseDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseDto>({
    resolver: expenseResolver,
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      rawDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedExpense) {
        reset({
          title: selectedExpense.title,
          description: selectedExpense.description || "",
          amount: selectedExpense.amount,
          rawDate: selectedExpense.rawDate,
        });
      } else {
        reset({
          title: "",
          description: "",
          amount: 0,
          rawDate: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [open, selectedExpense, reset]);

  const { mutate: saveExpense, isPending: isSaving } = useMutation({
    mutationFn: (data: ExpenseDto) =>
      selectedExpense
        ? expenseService.update(selectedStoreId!, selectedExpense.id, data)
        : expenseService.create(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["expenses", selectedStoreId] });
    },
  });

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: ExpenseDto) => saveExpense(data))}>
          <DialogHeader>
            <DialogTitle>
              {selectedExpense ? "Cập nhật chi phí" : "Thêm chi phí mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedExpense ? "Cập nhật thông tin chi phí." : "Ghi nhận chi phí mới."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Tiêu đề</FieldLabel>
                <Input
                  placeholder="VD: Nhập nguyên liệu"
                  {...register("title")}
                  data-invalid={!!errors.title}
                />
                <FieldError errors={[errors.title]} />
              </Field>

              <Field>
                <FieldLabel>Mô tả</FieldLabel>
                <Textarea
                  placeholder="Mô tả chi tiết (tùy chọn)"
                  {...register("description")}
                />
              </Field>

              <Field>
                <FieldLabel>Số tiền (VNĐ)</FieldLabel>
                <Input
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  data-invalid={!!errors.amount}
                />
                <FieldError errors={[errors.amount]} />
              </Field>

              <Field>
                <FieldLabel>Ngày</FieldLabel>
                <Input
                  type="date"
                  {...register("rawDate")}
                  data-invalid={!!errors.rawDate}
                />
                <FieldError errors={[errors.rawDate]} />
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
