"use client";

import * as React from "react";

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
import { useLocation } from "react-router-dom";
import { StorefrontIcon, WarehouseIcon } from "@phosphor-icons/react";
import { SYSTEM_ROUTES, STORE_ROUTES } from "@/layout/DashboardLayout";
import { paths } from "@/config/paths";
import { useAuthStore } from "@/stores/auth.store";
import { useStoreContext } from "@/stores/storeContext.store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const selectedUserId = useStoreContext((s) => s.selectedUserId);

  const isAnyStoreRouteActive = STORE_ROUTES.some((route) =>
    location.pathname.startsWith(route.url),
  );

  const storeRoutesWithState = STORE_ROUTES.map((route) => ({
    title: route.title,
    url: route.url,
    icon: route.icon,
    isActive: location.pathname.startsWith(route.url),
    disabled: (route.needsStore && !selectedStoreId) || !selectedUserId,
  }));

  const navItems = [
    ...SYSTEM_ROUTES.map((route) => ({
      title: route.title,
      url: route.url,
      icon: route.icon,
      isActive: location.pathname.startsWith(route.url),
    })),
    {
      title: "Quản lý cửa hàng",
      url: paths.stores.index,
      icon: <WarehouseIcon />,
      isActive: isAnyStoreRouteActive,
      isOpen: !!selectedUserId,
      disabled: !selectedUserId,
      items: storeRoutesWithState,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <StorefrontIcon className="size-5" weight="fill" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-base">Orderly</span>
                <span className="truncate text-xs">Quản trị Hệ thống</span>
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
