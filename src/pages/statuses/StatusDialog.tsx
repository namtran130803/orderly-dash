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
import { statusService } from "@/services/status.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { statusResolver, type StatusDto, type Status } from "@/schemas/status.schema";

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatus: Status | null;
}

export function StatusDialog({ open, onOpenChange, selectedStatus }: StatusDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatusDto>({
    resolver: statusResolver,
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedStatus) {
        reset({ name: selectedStatus.name });
      } else {
        reset({ name: "" });
      }
    }
  }, [open, selectedStatus, reset]);

  const { mutate: saveStatus, isPending: isSaving } = useMutation({
    mutationFn: (data: StatusDto) =>
      selectedStatus
        ? statusService.update(selectedStoreId!, selectedStatus.id, data)
        : statusService.create(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["statuses", selectedStoreId] });
    },
  });

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: StatusDto) => saveStatus(data))}>
          <DialogHeader>
            <DialogTitle>
              {selectedStatus ? "Cập nhật trạng thái" : "Thêm trạng thái mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedStatus ? "Cập nhật thông tin trạng thái." : "Tạo trạng thái mới trong quy trình đơn hàng."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Tên trạng thái</FieldLabel>
                <Input
                  placeholder="VD: Đang chuẩn bị"
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
