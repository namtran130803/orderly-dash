import { useLocation, Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { paths } from "@/config/paths";
import { routePermissions } from "@/config/permissionRoutes";
import { useStoreContext } from "@/stores/storeContext.store";
import {
  ListBulletsIcon,
  ForkKnifeIcon,
  SquaresFourIcon,
  ChairIcon,
  ListChecksIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  ChartBarIcon,
  IdentificationCardIcon,
  UsersIcon,
  UserGearIcon,
  ShieldCheckIcon,
  StorefrontIcon,
  CalendarCheckIcon,
  CalendarBlankIcon,
  WalletIcon,
  ClipboardTextIcon,
} from "@phosphor-icons/react";

export const SYSTEM_ROUTES = [
  {
    title: "Vai trò hệ thống",
    headerTitle: "Quản lý Vai trò Hệ thống",
    url: paths.roles.index,
    icon: <IdentificationCardIcon />,
    permissions: routePermissions.roles,
  },
  {
    title: "Người dùng",
    headerTitle: "Quản lý Người dùng",
    url: paths.users.index,
    icon: <UsersIcon />,
    permissions: routePermissions.users,
  },
];

export const STORE_ROUTES = [
  {
    title: "Cửa hàng",
    headerTitle: "Danh sách Cửa hàng",
    url: paths.stores.index,
    icon: <StorefrontIcon />,
    needsStore: false,
    permissions: routePermissions.stores,
  },
  {
    title: "Danh mục",
    headerTitle: "Quản lý Danh mục",
    url: paths.categories.index,
    icon: <ListBulletsIcon />,
    needsStore: true,
    permissions: routePermissions.categories,
  },
  {
    title: "Món ăn",
    headerTitle: "Quản lý Món ăn",
    url: paths.menuItems.index,
    icon: <ForkKnifeIcon />,
    needsStore: true,
    permissions: routePermissions.menuItems,
  },
  {
    title: "Khu vực",
    headerTitle: "Quản lý Khu vực",
    url: paths.areas.index,
    icon: <SquaresFourIcon />,
    needsStore: true,
    permissions: routePermissions.areas,
  },
  {
    title: "Bàn ăn",
    headerTitle: "Quản lý Bàn ăn",
    url: paths.tables.index,
    icon: <ChairIcon />,
    needsStore: true,
    permissions: routePermissions.tables,
  },
  {
    title: "Quy trình",
    headerTitle: "Quản lý Quy trình",
    url: paths.statuses.index,
    icon: <ListChecksIcon />,
    needsStore: true,
    permissions: routePermissions.statuses,
  },
  {
    title: "Đơn hàng",
    headerTitle: "Quản lý Đơn hàng",
    url: paths.orders.index,
    icon: <ShoppingCartIcon />,
    needsStore: true,
    permissions: routePermissions.orders,
  },
  {
    title: "Chi tiêu",
    headerTitle: "Quản lý Chi tiêu",
    url: paths.expenses.index,
    icon: <ReceiptIcon />,
    needsStore: true,
    permissions: routePermissions.expenses,
  },
  {
    title: "Thống kê",
    headerTitle: "Thống kê",
    url: paths.dashboardStats.index,
    icon: <ChartBarIcon />,
    needsStore: true,
    permissions: routePermissions.dashboardStats,
  },
  {
    title: "Nhân viên",
    headerTitle: "Quản lý Nhân viên",
    url: paths.employees.index,
    icon: <UserGearIcon />,
    needsStore: true,
    permissions: routePermissions.employees,
  },
  {
    title: "Vai trò",
    headerTitle: "Quản lý Vai trò",
    url: paths.storeRoles.index,
    icon: <ShieldCheckIcon />,
    needsStore: true,
    permissions: routePermissions.storeRoles,
  },
  {
    title: "Chấm công",
    headerTitle: "Quản lý Chấm công",
    url: paths.attendance.index,
    icon: <CalendarCheckIcon />,
    needsStore: true,
    permissions: routePermissions.attendance,
  },
  {
    title: "Lịch làm",
    headerTitle: "Quản lý Lịch làm",
    url: paths.schedule.index,
    icon: <CalendarBlankIcon />,
    needsStore: true,
    permissions: routePermissions.schedule,
  },
  {
    title: "Bảng lương",
    headerTitle: "Quản lý Bảng lương",
    url: paths.payroll.index,
    icon: <WalletIcon />,
    needsStore: true,
    permissions: routePermissions.payroll,
  },
  {
    title: "Nghỉ phép",
    headerTitle: "Quản lý Nghỉ phép",
    url: paths.leave.index,
    icon: <ClipboardTextIcon />,
    needsStore: true,
    permissions: routePermissions.leave,
  },
];

export const ALL_ROUTES = [...SYSTEM_ROUTES, ...STORE_ROUTES];

export function DashboardLayout() {
  const location = useLocation();
  const selectedStoreName = useStoreContext((s) => s.selectedStoreName);
  const selectedUserName = useStoreContext((s) => s.selectedUserName);

  const currentRoute = ALL_ROUTES.find((route) =>
    location.pathname.startsWith(route.url),
  );
  const title = currentRoute?.headerTitle || "Dashboard";
  const isStoreRoute = STORE_ROUTES.some((route) =>
    location.pathname.startsWith(route.url),
  );

  let displayTitle = title;
  if (isStoreRoute) {
    const parts = [title];
    if (selectedUserName) parts.push(selectedUserName);
    if (selectedStoreName) parts.push(selectedStoreName);
    displayTitle = parts.join(" - ");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="w-full flex justify-between items-center">
              <h1 className="text-lg font-semibold">{displayTitle}</h1>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
            <div className="flex w-full h-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
