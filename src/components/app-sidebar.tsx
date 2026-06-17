"use client";

import * as React from "react";
import { useLocation } from "react-router-dom";
import { StorefrontIcon, WarehouseIcon } from "@phosphor-icons/react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SYSTEM_ROUTES, STORE_ROUTES } from "@/layout/DashboardLayout";
import { paths } from "@/config/paths";
import { hasAnyPermission } from "@/hooks/usePerm";
import { useAuthStore } from "@/stores/auth.store";
import { useStoreContext } from "@/stores/storeContext.store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const location = useLocation();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const selectedUserId = useStoreContext((s) => s.selectedUserId);

  const availableSystemRoutes = SYSTEM_ROUTES.filter((route) =>
    hasAnyPermission(permissions, [...route.permissions]),
  );
  const availableStoreRoutes = STORE_ROUTES.filter((route) =>
    hasAnyPermission(permissions, [...route.permissions]),
  );

  const isAnyStoreRouteActive = availableStoreRoutes.some((route) =>
    location.pathname.startsWith(route.url),
  );

  const storeRoutesWithState = availableStoreRoutes.map((route) => ({
    title: route.title,
    url: route.url,
    icon: route.icon,
    isActive: location.pathname.startsWith(route.url),
    disabled: (route.needsStore && !selectedStoreId) || !selectedUserId,
  }));

  const navItems = [
    ...availableSystemRoutes.map((route) => ({
      title: route.title,
      url: route.url,
      icon: route.icon,
      isActive: location.pathname.startsWith(route.url),
    })),
    ...(storeRoutesWithState.length > 0
      ? [
          {
            title: "Quản lý cửa hàng",
            url: paths.stores.index,
            icon: <WarehouseIcon />,
            isActive: isAnyStoreRouteActive,
            isOpen: !!selectedUserId,
            disabled: !selectedUserId,
            items: storeRoutesWithState,
          },
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <img src="/orderly-icon.svg" alt="Logo" className="size-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-base">Orderly</span>
                <span className="truncate text-xs">Quản trị hệ thống</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Người dùng",
            email: user?.phone || "",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
