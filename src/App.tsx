import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardLayout } from "@/layout/DashboardLayout";
import { SplashLayout } from "@/layout/SplashLayout";
import { StoreLayout } from "@/layout/StoreLayout";
import { paths } from "@/config/paths";
import { routePermissions } from "@/config/permissionRoutes";
import { queryClient } from "@/lib/queryClient";
import { DashboardIndexRedirect, PermissionRoute } from "@/components/PermissionRoute";

import { SystemOverviewPage } from "@/pages/system-overview/SystemOverviewPage";
import { StoresPage } from "@/pages/stores/StoresPage";
import { CategoriesPage } from "@/pages/categories/CategoriesPage";
import { MenuItemsPage } from "@/pages/menu-items/MenuItemsPage";
import { AreasPage } from "@/pages/areas/AreasPage";
import { TablesPage } from "@/pages/tables/TablesPage";
import { StatusesPage } from "@/pages/statuses/StatusesPage";
import { OrdersPage } from "@/pages/orders/OrdersPage";
import { ExpensesPage } from "@/pages/expenses/ExpensesPage";
import { DashboardStatsPage } from "@/pages/dashboard-stats/DashboardStatsPage";
import { RolesPage } from "@/pages/roles/RolesPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { PaymentHistoryPage } from "@/pages/billing/PaymentHistoryPage";
import { RenewalHistoryPage } from "@/pages/billing/RenewalHistoryPage";
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import { StoreRolesPage } from "@/pages/store-roles/StoreRolesPage";
import { AttendancePage } from "@/pages/attendance/AttendancePage";
import { SchedulePage } from "@/pages/schedule/SchedulePage";
import { PayrollPage } from "@/pages/payroll/PayrollPage";
import { PayrollEmployeeDetailPage } from "@/pages/payroll/PayrollEmployeeDetailPage";
import { LeavePage } from "@/pages/leave/LeavePage";

const router = createBrowserRouter([
  {
    element: <SplashLayout />,
    children: [
      {
        path: paths.auth.login,
        element: <LoginPage />,
      },
      {
        path: paths.dashboard.index,
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardIndexRedirect />,
          },
          {
            path: "overview",
            element: (
              <PermissionRoute anyOf={[...routePermissions.systemOverview]}>
                <SystemOverviewPage />
              </PermissionRoute>
            ),
          },
          {
            path: "stores",
            element: (
              <PermissionRoute anyOf={[...routePermissions.stores]}>
                <StoresPage />
              </PermissionRoute>
            ),
          },
          {
            element: <StoreLayout />,
            children: [
              {
                path: "categories",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.categories]}>
                    <CategoriesPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "menu-items",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.menuItems]}>
                    <MenuItemsPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "areas",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.areas]}>
                    <AreasPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "tables",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.tables]}>
                    <TablesPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "statuses",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.statuses]}>
                    <StatusesPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "orders",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.orders]}>
                    <OrdersPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "expenses",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.expenses]}>
                    <ExpensesPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "stats",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.dashboardStats]}>
                    <DashboardStatsPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "employees",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.employees]}>
                    <EmployeesPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "store-roles",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.storeRoles]}>
                    <StoreRolesPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "attendance",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.attendance]}>
                    <AttendancePage />
                  </PermissionRoute>
                ),
              },
              {
                path: "schedule",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.schedule]}>
                    <SchedulePage />
                  </PermissionRoute>
                ),
              },
              {
                path: "payroll",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.payroll]}>
                    <PayrollPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "payroll/employees/:employeeId/:month/:year",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.payrollDetail]}>
                    <PayrollEmployeeDetailPage />
                  </PermissionRoute>
                ),
              },
              {
                path: "leave",
                element: (
                  <PermissionRoute anyOf={[...routePermissions.leave]}>
                    <LeavePage />
                  </PermissionRoute>
                ),
              },
            ],
          },
          {
            path: "roles",
            element: (
              <PermissionRoute anyOf={[...routePermissions.roles]}>
                <RolesPage />
              </PermissionRoute>
            ),
          },
          {
            path: "users",
            element: (
              <PermissionRoute anyOf={[...routePermissions.users]}>
                <UsersPage />
              </PermissionRoute>
            ),
          },
          {
            path: "payment-history",
            element: (
              <PermissionRoute anyOf={[...routePermissions.paymentHistory]}>
                <PaymentHistoryPage />
              </PermissionRoute>
            ),
          },
          {
            path: "renewal-history",
            element: (
              <PermissionRoute anyOf={[...routePermissions.renewalHistory]}>
                <RenewalHistoryPage />
              </PermissionRoute>
            ),
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={paths.dashboard.index} replace />,
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
