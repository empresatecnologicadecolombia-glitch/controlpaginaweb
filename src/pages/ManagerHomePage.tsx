import ProfileCard, { type ProfileCardConfirmPayload } from "@/components/ProfileCard";
import ManagerProfileNav from "@/components/navigation/ManagerProfileNav";
import {
  MANAGER_HOME_PROFILE_CARD_CLASS,
  MANAGER_HOME_PROFILE_WRAPPER_CLASS,
} from "@/config/lockedHomeLayout";
import { useManagerAuth } from "@/hooks/useManagerAuth";
import { toast } from "sonner";

const ManagerHomePage = () => {
  const { profile } = useManagerAuth();
  const displayName = profile?.fullName?.trim() || "Manager";

  const handleProfilePersist = async (payload: ProfileCardConfirmPayload) => {
    try {
      localStorage.setItem("onniverso.profile.name", payload.name.trim() || displayName);
      toast.success("Perfil guardado");
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  return (
    <main className="relative h-full min-h-0 flex-1 overflow-y-auto">
      <img
        src="/onnivers-home-bg.png"
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div className={MANAGER_HOME_PROFILE_WRAPPER_CLASS}>
          <div className={MANAGER_HOME_PROFILE_CARD_CLASS}>
            <ProfileCard
              initialName={displayName}
              brandLogoAsAvatar
              onConfirm={handleProfilePersist}
            />
          </div>
          <ManagerProfileNav />
        </div>
      </div>
    </main>
  );
};

export default ManagerHomePage;
