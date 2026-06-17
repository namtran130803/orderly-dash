import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StorefrontIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { paths } from '@/config/paths';
import { isTokenExpired } from '@/utils/jwt';

const authRoutes = [paths.auth.login];

export const SplashLayout: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const permissions = useAuthStore((s) => s.permissions);
  const setRoles = useAuthStore((s) => s.setRoles);
  const clearPermissions = useAuthStore((s) => s.clearPermissions);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  const isAuthRoute = authRoutes.includes(location.pathname);

  const { isFetching: isFetchingUser, data: userData, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authService.getMe();
      return res.data.data;
    },
    enabled: !!token && !user,
    retry: false,
    staleTime: Infinity,
  });

  const {
    isFetching: isFetchingRoles,
    data: rolesData,
    isError: isRolesError,
  } = useQuery({
    queryKey: ['auth', 'roles', user?.id],
    queryFn: async () => {
      const res = await userService.getUserRoles(user!.id);
      return res.data.data;
    },
    enabled: !!token && !!user,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (userData) setUser(userData as any);
  }, [userData, setUser]);

  useEffect(() => {
    if (rolesData) setRoles(rolesData);
  }, [rolesData, setRoles]);

  useEffect(() => {
    if (isError || isRolesError) {
      logout();
    }
  }, [isError, isRolesError, logout]);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    if (!token) clearPermissions();
  }, [token, clearPermissions]);

  const hasLoadedRoles = rolesData !== undefined || permissions.length > 0;
  const isLoaded = !!user && hasLoadedRoles;

  useEffect(() => {
    const isFetching = isFetchingUser || isFetchingRoles;
    if (isFetching) return;

    if (token && isAuthRoute) {
      navigate(paths.dashboard.index, { replace: true });
    } else if (!token && !isAuthRoute) {
      navigate(paths.auth.login, { replace: true });
    } else {
      setIsRedirecting(false);
    }
  }, [isFetchingUser, isFetchingRoles, token, isAuthRoute, navigate, isLoaded]);

  if (!token && !isAuthRoute) return <Navigate to={paths.auth.login} replace />;

  const isLoading = isFetchingUser || isFetchingRoles || (token && !isLoaded);

  if (isLoading || isRedirecting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <img src="/orderly-icon.svg" alt="Logo" className="size-12 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight mb-1">Orderly</h1>
        <p className="text-muted-foreground text-sm mb-6">Quản trị Hệ thống</p>
        <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
};
