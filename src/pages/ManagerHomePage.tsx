import Navbar from "@/components/Navbar";
import ProfileCard, { type ProfileCardConfirmPayload } from "@/components/ProfileCard";
import { LOCKED_PROFILE_CARD_WRAPPER_CLASS } from "@/config/lockedHomeLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ManagerHomePage = () => {
  const { user, signInLocal } = useAuth();
  const displayName = user?.displayName?.trim() || "Manager";

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-sm text-muted-foreground">Sesión cerrada</p>
        <button
          type="button"
          className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-display text-primary"
          onClick={() =>
            signInLocal({ id: "manager-local", email: "manager@onniverso.local", displayName: "Manager" })
          }
        >
          Volver al panel
        </button>
      </div>
    );
  }

  const handleProfilePersist = async (payload: ProfileCardConfirmPayload) => {
    try {
      localStorage.setItem("onniverso.profile.name", payload.name.trim() || displayName);
      toast.success("Perfil guardado");
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <Navbar />
      <main className="relative min-h-0 flex-1">
        <img
          src="/onnivers-home-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className={LOCKED_PROFILE_CARD_WRAPPER_CLASS}>
            <ProfileCard
              initialName={displayName}
              initialAvatarSrc="/placeholder.svg"
              onConfirm={handleProfilePersist}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerHomePage;
