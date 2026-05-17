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
import { storeService } from "@/services/store.service";
import { storeResolver, type StoreDto, type Store } from "@/schemas/store.schema";

interface StoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStore: Store | null;
  userId: number;
}

export function StoreDialog({ open, onOpenChange, selectedStore, userId }: StoreDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreDto>({
    resolver: storeResolver,
    defaultValues: {
      name: "",
      address: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedStore) {
        reset({
          name: selectedStore.name,
          address: selectedStore.address || "",
        });
      } else {
        reset({ name: "", address: "" });
      }
    }
  }, [open, selectedStore, reset]);

  const { mutate: saveStore, isPending: isSaving } = useMutation({
    mutationFn: (data: StoreDto) =>
      selectedStore
        ? storeService.update(selectedStore.id, data)
        : storeService.create({ ...data, userId }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["stores", userId] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: StoreDto) => saveStore(data))}>
          <DialogHeader>
            <DialogTitle>
              {selectedStore ? "Cập nhật cửa hàng" : "Thêm cửa hàng mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedStore ? "Cập nhật thông tin cửa hàng." : "Tạo cửa hàng mới trong hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Tên cửa hàng</FieldLabel>
                <Input
                  placeholder="VD: Chi nhánh Quận 1"
                  {...register("name")}
                  data-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel>Địa chỉ</FieldLabel>
                <Input
                  placeholder="VD: 123 Lê Lợi, Quận 1"
                  {...register("address")}
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
