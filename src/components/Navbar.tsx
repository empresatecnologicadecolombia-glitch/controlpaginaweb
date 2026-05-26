import { Button } from "@/components/ui/button";
import OnniVersoLogo from "@/components/branding/OnniVersoLogo";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LOCKED_NAVBAR_HEIGHT_CLASS } from "@/config/lockedHomeLayout";

type NavbarProps = {
  onExit?: () => void;
};

const Navbar = ({ onExit }: NavbarProps) => {
  const { signOut } = useAuth();

  const handleExit = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    onExit?.();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full max-w-[100dvw] overflow-x-clip glass">
      <div
        className={`relative mx-auto flex ${LOCKED_NAVBAR_HEIGHT_CLASS} w-full max-w-full items-center justify-between gap-2 px-3 sm:px-6`}
      >
        <div className="flex shrink-0 items-center gap-2" aria-label="OnniVers Control Manager">
          <OnniVersoLogo className="shrink-0" iconSize={24} />
        </div>

        <Button variant="heroOutline" size="sm" onClick={handleExit} className="gap-1.5">
          <LogOut className="h-3.5 w-3.5" />
          Salir
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
