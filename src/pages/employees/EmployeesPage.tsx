import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { employeeService } from "@/services/employee.service";
import { useStoreContext } from "@/stores/storeContext.store";
import { type Employee } from "@/schemas/employee.schema";
import { EmployeeDialog } from "./EmployeeDialog";
import { EmployeeRolesDialog } from "./EmployeeRolesDialog";
import { PERMS } from "@/config/perms";
import { usePerm } from "@/hooks/usePerm";

export function EmployeesPage() {
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const canCreate = usePerm(PERMS.employees.create);
  const canManageRoles =
    usePerm(PERMS.employees.assign_role) || usePerm(PERMS.employees.remove_role);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["employees", selectedStoreId],
    queryFn: () => employeeService.getAll(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const handleOpenAdd = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleOpenRoles = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsRolesOpen(true);
  };

  const employees = employeesData?.data?.data || [];

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return "---";
    }
  };

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {canCreate && <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="h-9 px-4">
          <PlusIcon size={18} weight="bold" className="mr-2" /> Thêm nhân viên
        </Button>
      </div>}

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chưa có nhân viên nào.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-mono text-xs">{employee.id}</TableCell>
                  <TableCell className="font-semibold">{employee.user.name}</TableCell>
                  <TableCell className="font-mono text-sm">{employee.user.phone}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(employee.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canManageRoles && <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:!text-emerald-600 transition-colors"
                            onClick={() => handleOpenRoles(employee)}
                          >
                            <ShieldCheckIcon size={20} weight="bold" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Vai trò</p></TooltipContent>
                      </Tooltip>}

                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <EmployeeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <EmployeeRolesDialog
        open={isRolesOpen}
        onOpenChange={setIsRolesOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}
