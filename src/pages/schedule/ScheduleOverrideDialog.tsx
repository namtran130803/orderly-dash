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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { CircleNotch } from "@phosphor-icons/react";
import { scheduleService } from "@/services/schedule.service";
import { useStoreContext } from "@/stores/storeContext.store";

const schema = z.object({
  date: z.string().min(1, "Chọn ngày"),
  type: z.enum(["OFF", "WORKING_DAY"]),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleOverrideDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver,
    defaultValues: { date: "", type: "OFF" },
  });

  useEffect(() => {
    if (open) reset({ date: "", type: "OFF" });
  }, [open, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => scheduleService.postOverride(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["schedule", selectedStoreId] });
    },
  });

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <DialogHeader>
            <DialogTitle>Thêm ngày đặc biệt</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Ngày</FieldLabel>
                <Input type="date" {...register("date")} data-invalid={!!errors.date} />
                <FieldError errors={[errors.date]} />
              </Field>
              <Field>
                <FieldLabel>Loại</FieldLabel>
                <select
                  {...register("type")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="OFF">Nghỉ</option>
                  <option value="WORKING_DAY">Làm bù</option>
                </select>
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <CircleNotch className="mr-2 animate-spin" />}
              Thêm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
