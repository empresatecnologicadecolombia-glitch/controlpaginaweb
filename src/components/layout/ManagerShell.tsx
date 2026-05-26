import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { toast } from "sonner";
import { useManagerAuth } from "@/hooks/useManagerAuth";

const ManagerShell = () => {
  const { loading, user, isAllowed, signOut } = useManagerAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (user && !isAllowed) {
      toast.error("Acceso denegado");
      void signOut();
    }
  }, [isAllowed, loading, signOut, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-muted-foreground">Acceso denegado</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <Navbar />
      <div className="min-h-0 flex-1 overflow-hidden pt-12">
        <Outlet />
      </div>
    </div>
  );
};

export default ManagerShell;
