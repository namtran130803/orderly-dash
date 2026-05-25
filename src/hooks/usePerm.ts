import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";

export function usePerm(code: string): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return permissions.includes(code);
}

export function useAnyPerm(codes: string[]): boolean {
  const permissions = useAuthStore((s) => s.permissions);

  return useMemo(
    () => codes.some((code) => permissions.includes(code)),
    [codes, permissions],
  );
}

export function hasAnyPermission(permissions: string[], codes: string[]): boolean {
  return codes.some((code) => permissions.includes(code));
}
