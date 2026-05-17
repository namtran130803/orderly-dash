import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { CircleNotch } from "@phosphor-icons/react"
import { roleService } from "@/services/role.service"
import { roleResolver, type RoleDto, type Role } from "@/schemas/role.schema"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRole: Role | null
}

export function RoleDialog({ open, onOpenChange, selectedRole }: RoleDialogProps) {
  const queryClient = useQueryClient()

  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => roleService.getPermissions(),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleDto>({
    resolver: roleResolver,
    defaultValues: {
      name: "",
      permissionCodes: [],
    }
  })

  useEffect(() => {
    if (open) {
      if (selectedRole) {
        reset({
          name: selectedRole.name,
          permissionCodes: selectedRole.permissions?.map(p => p.permission.code) || [],
        })
      } else {
        reset({ name: "", permissionCodes: [] })
      }
    }
  }, [open, selectedRole, reset])

  const { mutate: saveRole, isPending: isSaving } = useMutation({
    mutationFn: (data: RoleDto) =>
      selectedRole
        ? roleService.update(selectedRole.id, data)
        : roleService.create(data),
    onSuccess: (res) => {
      toast.success(res.data.message)
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    }
  })

  const selectedPermissions = watch("permissionCodes") || []

  const handleTogglePermission = (code: string) => {
    const current = [...selectedPermissions]
    const index = current.indexOf(code)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(code)
    }
    setValue("permissionCodes", current, { shouldValidate: true })
  }

  const handleToggleModule = (apiCodes: string[], isAllSelected: boolean) => {
    let current = [...selectedPermissions]
    if (isAllSelected) {
      // Unselect all in this module
      current = current.filter(code => !apiCodes.includes(code))
    } else {
      // Select all in this module
      const toAdd = apiCodes.filter(code => !current.includes(code))
      current = [...current, ...toAdd]
    }
    setValue("permissionCodes", current, { shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[80vh] h-[80vh] flex flex-col p-0 overflow-hidden text-left">
        <form
          onSubmit={handleSubmit((data: RoleDto) => saveRole(data))}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <DialogHeader className="p-4 flex-none">
            <DialogTitle>
              {selectedRole ? "Cập nhật vai trò" : "Thêm vai trò mới"}
            </DialogTitle>
            <DialogDescription>
              Thiết lập tên và phân quyền chi tiết cho vai trò này.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-sm font-semibold">Tên vai trò</FieldLabel>
                    <Input
                      placeholder="VD: Quản lý cửa hàng"
                      {...register("name")}
                      data-invalid={!!errors.name}
                    />
                    <FieldError errors={[errors.name]} />
                  </Field>

                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">Phân quyền chi tiết</FieldLabel>
                    <div className="grid grid-cols-1 gap-4">
                      {permissionsData?.data?.data && permissionsData.data.data.map((moduleItem) => {
                        const apiCodes = moduleItem.apis.map(a => a.code)
                        const isAllSelected = apiCodes.every(code => selectedPermissions.includes(code))
                        const isSomeSelected = apiCodes.some(code => selectedPermissions.includes(code)) && !isAllSelected

                        return (
                          <div key={moduleItem.code} className="space-y-4 p-4 border bg-muted/30">
                            <div className="flex items-center justify-between border-b pb-2">
                              <h4 className="font-bold text-sm uppercase tracking-wider text-primary">
                                {moduleItem.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`all-${moduleItem.code}`}
                                  checked={isAllSelected}
                                  onCheckedChange={() => handleToggleModule(apiCodes, isAllSelected)}
                                  className={isSomeSelected ? "data-[state=unchecked]:bg-primary/20" : ""}
                                />
                                <label
                                  htmlFor={`all-${moduleItem.code}`}
                                  className="text-xs font-bold cursor-pointer whitespace-nowrap"
                                >
                                  Chọn tất cả
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                              {moduleItem.apis.map((perm) => (
                                <div key={perm.code} className="flex items-center space-x-2 group">
                                  <Checkbox
                                    id={perm.code}
                                    checked={selectedPermissions.includes(perm.code)}
                                    onCheckedChange={() => handleTogglePermission(perm.code)}
                                  />
                                  <label
                                    htmlFor={perm.code}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary transition-colors"
                                  >
                                    {perm.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </FieldGroup>
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="p-4 border-t bg-background flex-none">
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
  )
}
