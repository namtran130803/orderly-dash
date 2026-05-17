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
import { areaService } from "@/services/area.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { areaResolver, type AreaDto, type Area } from "@/schemas/area.schema";

interface AreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedArea: Area | null;
}

export function AreaDialog({ open, onOpenChange, selectedArea }: AreaDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AreaDto>({
    resolver: areaResolver,
    defaultValues: {
      name: "",
      tableCount: 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedArea) {
        reset({
          name: selectedArea.name,
          tableCount: 1,
        });
      } else {
        reset({ name: "", tableCount: 1 });
      }
    }
  }, [open, selectedArea, reset]);

  const { mutate: saveArea, isPending: isSaving } = useMutation({
    mutationFn: (data: AreaDto) =>
      selectedArea
        ? areaService.update(selectedStoreId!, selectedArea.id, data)
        : areaService.create(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["areas", selectedStoreId] });
    },
  });

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: AreaDto) => saveArea(data))}>
          <DialogHeader>
            <DialogTitle>
              {selectedArea ? "Cập nhật khu vực" : "Thêm khu vực mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedArea ? "Cập nhật thông tin khu vực." : "Tạo khu vực bàn mới."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Tên khu vực</FieldLabel>
                <Input
                  placeholder="VD: Tầng 1"
                  {...register("name")}
                  data-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel>Số bàn</FieldLabel>
                <Input
                  type="number"
                  {...register("tableCount", { valueAsNumber: true })}
                  data-invalid={!!errors.tableCount}
                />
                <FieldError errors={[errors.tableCount]} />
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
