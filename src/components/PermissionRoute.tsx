import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { routeFallbackOrder } from "@/config/permissionRoutes";
import { hasAnyPermission } from "@/hooks/usePerm";
import { useAuthStore } from "@/stores/auth.store";

type PermissionRouteProps = {
  anyOf: string[];
  children: ReactNode;
};

function getFallbackPath(permissions: string[]): string | null {
  return (
    routeFallbackOrder.find((route) =>
      hasAnyPermission(permissions, [...route.permissions]),
    )?.path ?? null
  );
}

function NoPermissionPage() {
  return (
    <div className="flex min-h-[240px] w-full items-center justify-center text-sm text-muted-foreground">
      Tài khoản hiện tại chưa được cấp quyền truy cập trang quản trị.
    </div>
  );
}

export function PermissionRoute({ anyOf, children }: PermissionRouteProps) {
  const permissions = useAuthStore((s) => s.permissions);

  if (!hasAnyPermission(permissions, anyOf)) {
    const fallbackPath = getFallbackPath(permissions);
    return fallbackPath ? <Navigate to={fallbackPath} replace /> : <NoPermissionPage />;
  }

  return children;
}

export function DashboardIndexRedirect() {
  const permissions = useAuthStore((s) => s.permissions);
  const fallbackPath = getFallbackPath(permissions);
  return fallbackPath ? <Navigate to={fallbackPath} replace /> : <NoPermissionPage />;
}
