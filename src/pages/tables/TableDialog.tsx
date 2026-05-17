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
import { tableService } from "@/services/table.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { tableResolver, type TableDto, type Table } from "@/schemas/table.schema";

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTable: Table | null;
}

export function TableDialog({ open, onOpenChange, selectedTable }: TableDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableDto>({
    resolver: tableResolver,
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedTable) {
        reset({ name: selectedTable.name });
      } else {
        reset({ name: "" });
      }
    }
  }, [open, selectedTable, reset]);

  const { mutate: saveTable, isPending: isSaving } = useMutation({
    mutationFn: (data: TableDto) =>
      tableService.update(selectedStoreId!, selectedTable!.id, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["tables", selectedStoreId] });
    },
  });

  if (!selectedStoreId || !selectedTable) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: TableDto) => saveTable(data))}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bàn</DialogTitle>
            <DialogDescription>Cập nhật tên bàn.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Tên bàn</FieldLabel>
                <Input
                  placeholder="VD: Bàn 1A"
                  {...register("name")}
                  data-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
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
