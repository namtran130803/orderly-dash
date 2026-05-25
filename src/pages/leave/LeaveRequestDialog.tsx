import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { CircleNotch } from "@phosphor-icons/react";
import { leaveService } from "@/services/leave.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

const schema = z.object({
  fromDate: z.string().min(1, "Chọn ngày bắt đầu"),
  toDate: z.string().min(1, "Chọn ngày kết thúc"),
  isPaid: z.string(),
  reason: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveRequestDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const canCreate = usePerm(PERMS.leave.create);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver,
    defaultValues: { fromDate: "", toDate: "", isPaid: "true", reason: "" },
  });

  useEffect(() => {
    if (open) reset({ fromDate: "", toDate: "", isPaid: "true", reason: "" });
  }, [open, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      leaveService.create(selectedStoreId!, {
        fromDate: data.fromDate,
        toDate: data.toDate,
        isPaid: data.isPaid === "true",
        reason: data.reason || undefined,
      }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["leave", selectedStoreId] });
    },
  });

  if (!selectedStoreId || !canCreate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <DialogHeader>
            <DialogTitle>Tạo đơn nghỉ phép</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Từ ngày</FieldLabel>
                <Input type="date" {...register("fromDate")} data-invalid={!!errors.fromDate} />
                <FieldError errors={[errors.fromDate]} />
              </Field>
              <Field>
                <FieldLabel>Đến ngày</FieldLabel>
                <Input type="date" {...register("toDate")} data-invalid={!!errors.toDate} />
                <FieldError errors={[errors.toDate]} />
              </Field>
              <Field>
                <FieldLabel>Loại nghỉ</FieldLabel>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="true" {...register("isPaid")} defaultChecked />
                    Có lương
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="false" {...register("isPaid")} />
                    Không lương
                  </label>
                </div>
              </Field>
              <Field>
                <FieldLabel>Lý do</FieldLabel>
                <Textarea placeholder="Nhập lý do..." {...register("reason")} />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <CircleNotch className="mr-2 animate-spin" />}
              Gửi đơn
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
