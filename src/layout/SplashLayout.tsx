import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StorefrontIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { paths } from '@/config/paths';

const authRoutes = [paths.auth.login];

export const SplashLayout: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
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

  useEffect(() => {
    if (userData) setUser(userData as any);
  }, [userData, setUser]);

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError, logout]);

  const isLoaded = !!user;

  useEffect(() => {
    const isFetching = isFetchingUser;
    if (isFetching) return;

    if (token && isAuthRoute) {
      navigate(paths.dashboard.index, { replace: true });
    } else if (!token && !isAuthRoute) {
      navigate(paths.auth.login, { replace: true });
    } else {
      setIsRedirecting(false);
    }
  }, [isFetchingUser, token, isAuthRoute, navigate, isLoaded]);

  if (!token && !isAuthRoute) return <Navigate to={paths.auth.login} replace />;

  const isLoading = isFetchingUser || (token && !isLoaded);

  if (isLoading || isRedirecting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-4 shadow-sm">
          <StorefrontIcon size={24} weight="fill" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Orderly</h1>
        <p className="text-muted-foreground text-sm mb-6">Quản trị Hệ thống</p>
        <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
};
