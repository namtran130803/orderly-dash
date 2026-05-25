import { useLocation, Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { paths } from "@/config/paths";
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
  },
  {
    title: "Người dùng",
    headerTitle: "Quản lý Người dùng",
    url: paths.users.index,
    icon: <UsersIcon />,
  },
];

export const STORE_ROUTES = [
  {
    title: "Cửa hàng",
    headerTitle: "Danh sách Cửa hàng",
    url: paths.stores.index,
    icon: <StorefrontIcon />,
    needsStore: false,
  },
  {
    title: "Danh mục",
    headerTitle: "Quản lý Danh mục",
    url: paths.categories.index,
    icon: <ListBulletsIcon />,
    needsStore: true,
  },
  {
    title: "Món",
    headerTitle: "Quản lý Món",
    url: paths.menuItems.index,
    icon: <ForkKnifeIcon />,
    needsStore: true,
  },
  {
    title: "Khu vực",
    headerTitle: "Quản lý Khu vực",
    url: paths.areas.index,
    icon: <SquaresFourIcon />,
    needsStore: true,
  },
  {
    title: "Bàn",
    headerTitle: "Quản lý Bàn",
    url: paths.tables.index,
    icon: <ChairIcon />,
    needsStore: true,
  },
  {
    title: "Quy trình",
    headerTitle: "Quản lý Quy trình",
    url: paths.statuses.index,
    icon: <ListChecksIcon />,
    needsStore: true,
  },
  {
    title: "Đơn hàng",
    headerTitle: "Quản lý Đơn hàng",
    url: paths.orders.index,
    icon: <ShoppingCartIcon />,
    needsStore: true,
  },
  {
    title: "Chi phí",
    headerTitle: "Quản lý Chi phí",
    url: paths.expenses.index,
    icon: <ReceiptIcon />,
    needsStore: true,
  },
  {
    title: "Thống kê",
    headerTitle: "Thống kê",
    url: paths.dashboardStats.index,
    icon: <ChartBarIcon />,
    needsStore: true,
  },
  {
    title: "Nhân viên",
    headerTitle: "Quản lý Nhân viên",
    url: paths.employees.index,
    icon: <UserGearIcon />,
    needsStore: true,
  },
  {
    title: "Vai trò",
    headerTitle: "Quản lý Vai trò",
    url: paths.storeRoles.index,
    icon: <ShieldCheckIcon />,
    needsStore: true,
  },
  {
    title: "Chấm công",
    headerTitle: "Chấm công",
    url: paths.attendance.index,
    icon: <CalendarCheckIcon />,
    needsStore: true,
  },
  {
    title: "Lịch làm việc",
    headerTitle: "Lịch làm việc",
    url: paths.schedule.index,
    icon: <CalendarBlankIcon />,
    needsStore: true,
  },
  {
    title: "Bảng lương",
    headerTitle: "Bảng lương",
    url: paths.payroll.index,
    icon: <WalletIcon />,
    needsStore: true,
  },
  {
    title: "Nghỉ phép",
    headerTitle: "Đơn nghỉ phép",
    url: paths.leave.index,
    icon: <ClipboardTextIcon />,
    needsStore: true,
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
