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
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { CircleNotch } from "@phosphor-icons/react";
import { employeeService } from "@/services/employee.service";
import { storeRoleService } from "@/services/storeRole.service";
import { useStoreContext } from "@/stores/storeContext.store";
import type { CreateEmployeeDto } from "@/schemas/employee.schema";
import { createEmployeeResolver } from "@/schemas/employee.schema";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDialog({ open, onOpenChange }: EmployeeDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);

  const { data: rolesData } = useQuery({
    queryKey: ["store-roles", selectedStoreId],
    queryFn: () => storeRoleService.getAll(selectedStoreId!),
    enabled: open && !!selectedStoreId,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEmployeeDto>({
    resolver: createEmployeeResolver,
    defaultValues: {
      phone: "",
      roleIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      reset({ phone: "", roleIds: [] });
    }
  }, [open, reset]);

  const { mutate: createEmployee, isPending: isSaving } = useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeeService.create(selectedStoreId!, data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["employees", selectedStoreId] });
    },
  });

  const selectedRoleIds = watch("roleIds") || [];

  const handleToggleRole = (roleId: number) => {
    const current = [...selectedRoleIds];
    const index = current.indexOf(roleId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(roleId);
    }
    setValue("roleIds", current, { shouldValidate: true });
  };

  const roles = rolesData?.data?.data || [];

  if (!selectedStoreId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit((data: CreateEmployeeDto) => createEmployee(data))}>
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
            <DialogDescription>
              Nhập số điện thoại tài khoản của nhân viên đã đăng ký hệ thống để thêm vào cửa hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Số điện thoại</FieldLabel>
                <Input
                  placeholder="VD: 0901234567"
                  {...register("phone")}
                  data-invalid={!!errors.phone}
                />
                <FieldError errors={[errors.phone]} />
              </Field>

              <div className="space-y-2">
                <FieldLabel>Vai trò</FieldLabel>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Chưa có vai trò nào</p>
                  ) : (
                    roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoleIds.includes(role.id)}
                          onCheckedChange={() => handleToggleRole(role.id)}
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {role.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <FieldError errors={[errors.roleIds]} />
              </div>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <CircleNotch className="mr-2 animate-spin" />}
              Tạo nhân viên
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
