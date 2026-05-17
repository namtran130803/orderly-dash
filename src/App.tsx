import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardLayout } from "@/layout/DashboardLayout";
import { SplashLayout } from "@/layout/SplashLayout";
import { StoreLayout } from "@/layout/StoreLayout";
import { paths } from "@/config/paths";
import { queryClient } from "@/lib/queryClient";

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
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import { StoreRolesPage } from "@/pages/store-roles/StoreRolesPage";

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
            element: <Navigate to={paths.stores.index} replace />,
          },
          { path: "stores", element: <StoresPage /> },
          {
            element: <StoreLayout />,
            children: [
              { path: "categories", element: <CategoriesPage /> },
              { path: "menu-items", element: <MenuItemsPage /> },
              { path: "areas", element: <AreasPage /> },
              { path: "tables", element: <TablesPage /> },
              { path: "statuses", element: <StatusesPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "expenses", element: <ExpensesPage /> },
              { path: "stats", element: <DashboardStatsPage /> },
              { path: "employees", element: <EmployeesPage /> },
              { path: "store-roles", element: <StoreRolesPage /> },
            ],
          },
          { path: "roles", element: <RolesPage /> },
          { path: "users", element: <UsersPage /> },
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
