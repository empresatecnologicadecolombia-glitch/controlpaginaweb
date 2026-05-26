import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RegisteredUser } from "@/types/registeredUser";
import { cn } from "@/lib/utils";

type UserDetailModalProps = {
  user: RegisteredUser;
  onClose: () => void;
};

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const DetailRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn("mt-0.5 break-all text-sm", highlight && "text-destructive")}>{value}</p>
  </div>
);

const UserDetailModal = ({ user, onClose }: UserDetailModalProps) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="user-detail-title"
    onClick={onClose}
  >
    <div
      className="presale-glass-card relative z-10 max-h-[min(90dvh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl p-5 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="user-detail-title" className="font-display text-lg text-gradient-neon">
            Información del usuario
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <DetailRow label="ID" value={user.id} />
        <DetailRow label="Correo" value={user.email} />
        <DetailRow
          label="Clave"
          value={user.password ?? "No almacenada en la tabla (Auth de Supabase no expone contraseñas)"}
        />
        <DetailRow label="Nombre" value={user.displayName ?? "—"} />
        <DetailRow label="Teléfono" value={user.phone ?? "—"} />
        <DetailRow label="Estado" value={user.blocked ? "Bloqueado" : "Activo"} />
        <DetailRow label="Fecha de registro" value={formatDate(user.createdAt)} />
        <DetailRow label="Última actualización" value={user.updatedAt ? formatDate(user.updatedAt) : "—"} />
        <DetailRow label="Auth user ID" value={user.authUserId ?? "—"} />
        {user.registrationError ? (
          <div className="sm:col-span-2">
            <DetailRow label="Error en el registro" value={user.registrationError} highlight />
          </div>
        ) : (
          <DetailRow label="Error en el registro" value="Sin errores reportados" />
        )}
      </div>

      {user.metadata && Object.keys(user.metadata).length > 0 && (
        <div className="mt-3 rounded-lg border border-border/50 bg-muted/20 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Metadata</p>
          <pre className="mt-2 max-h-40 overflow-auto text-xs text-foreground/90">
            {JSON.stringify(user.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  </div>
);

export default UserDetailModal;
