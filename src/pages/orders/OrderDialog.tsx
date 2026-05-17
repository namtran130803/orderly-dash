import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { CircleNotch, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { orderService } from "@/services/order.service";
import { menuItemService } from "@/services/menuItem.service";
import { tableService } from "@/services/table.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { orderResolver, type OrderDto } from "@/schemas/order.schema";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDialog({ open, onOpenChange }: OrderDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const { data: menuItemsData } = useQuery({
    queryKey: ["menu-items", selectedStoreId],
    queryFn: () => menuItemService.getAll(selectedStoreId!),
    enabled: open && !!selectedStoreId,
  });

  const { data: tablesData } = useQuery({
    queryKey: ["tables", selectedStoreId],
    queryFn: () => tableService.getAll(selectedStoreId!),
    enabled: open && !!selectedStoreId,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<OrderDto>({
    resolver: orderResolver,
    defaultValues: {
      tableName: null,
      items: [{ menuItemId: 0, qty: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const menuItems = menuItemsData?.data?.data || [];
  const tables = tablesData?.data?.data || [];

  useEffect(() => {
    if (open) {
      reset({ tableName: null, items: [{ menuItemId: 0, qty: 1 }] });
    }
  }, [open, reset]);

  const { mutate: createOrder, isPending: isSaving } = useMutation({
    mutationFn: (data: OrderDto) => orderService.create(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["orders", selectedStoreId] });
    },
  });

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] h-[80vh] flex flex-col p-0 overflow-hidden text-left">
        <form onSubmit={handleSubmit((data: OrderDto) => createOrder(data))} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="p-4 flex-none">
            <DialogTitle>Tạo đơn hàng mới</DialogTitle>
            <DialogDescription>Chọn bàn và các món cho đơn hàng.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Bàn (tùy chọn)</FieldLabel>
                      <Select
                        value={watch("tableName") || "takeaway"}
                        onValueChange={(v) => setValue("tableName", v === "takeaway" ? null : v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mang đi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="takeaway">Mang đi</SelectItem>
                          {tables.map((t) => (
                            <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </Field>

                  <div className="space-y-2">
                    <FieldLabel>Danh sách món</FieldLabel>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Select
                            value={watch(`items.${index}.menuItemId`)?.toString() || ""}
                            onValueChange={(v) => setValue(`items.${index}.menuItemId`, parseInt(v), { shouldValidate: true })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn món" />
                            </SelectTrigger>
                            <SelectContent>
                              {menuItems.map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          type="number"
                          className="w-20"
                          {...register(`items.${index}.qty`, { valueAsNumber: true })}
                          min={1}
                        />
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ menuItemId: 0, qty: 1 })}
                    >
                      <PlusIcon size={14} className="mr-1" /> Thêm món
                    </Button>
                    <FieldError errors={[errors.items?.root]} />
                  </div>
                </FieldGroup>
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="p-4 border-t flex-none">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <CircleNotch className="mr-2 animate-spin" />}
              Tạo đơn
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
