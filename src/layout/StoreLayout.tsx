import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useStoreContext } from "@/stores/storeContext.store";
import { paths } from "@/config/paths";

export function StoreLayout() {
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!selectedStoreId) {
      navigate(paths.stores.index, { replace: true, state: { from: location.pathname } });
    }
  }, [selectedStoreId, navigate, location]);

  if (!selectedStoreId) {
    return null;
  }

  return <Outlet />;
}
