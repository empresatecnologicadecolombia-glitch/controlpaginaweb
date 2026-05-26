import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RegisteredUser } from "@/types/registeredUser";
import { cn } from "@/lib/utils";

type UserListItemProps = {
  user: RegisteredUser;
  busy: boolean;
  onViewDetails: () => void;
  onToggleBlock: () => void;
  onDelete: () => void;
};

const formatShortDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
};

const UserListItem = ({ user, busy, onViewDetails, onToggleBlock, onDelete }: UserListItemProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const passwordLabel = user.password ?? "—";
  const isOnline = (user.onlineStatus ?? "").toLowerCase() === "online";

  return (
    <article
      className={cn(
        "presale-glass-card relative rounded-2xl border border-border/50 p-4",
        user.blocked && "opacity-80",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" draggable={false} />
            ) : null}
            <span
              className={cn(
                "absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-black/60",
                isOnline ? "bg-primary" : "bg-muted-foreground/60",
              )}
              aria-label={isOnline ? "Online" : "Offline"}
              title={isOnline ? "Online" : "Offline"}
            />
          </div>

          <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-base text-foreground">
              {user.displayName?.trim() || user.email}
            </h3>
            {user.blocked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
                <Ban className="h-3 w-3" />
                Bloqueado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                <CheckCircle2 className="h-3 w-3" />
                Activo
              </span>
            )}
            {user.registrationError && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                Error registro
              </span>
            )}
            {user.onlineStatus ? (
              <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {user.onlineStatus}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Registro: {formatShortDate(user.createdAt)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">ID: {user.id}</p>
          {user.lastLoginAt ? (
            <p className="mt-1 text-[11px] text-muted-foreground">Último login: {formatShortDate(user.lastLoginAt)}</p>
          ) : null}
          </div>
        </div>

        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={onViewDetails} disabled={busy}>
          <Info className="h-3.5 w-3.5" />
          Ver información
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Correo
          </label>
          <Input readOnly value={user.email} className="bg-background/60 font-mono text-xs" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Clave
          </label>
          <div className="flex gap-2">
            <Input
              readOnly
              type={showPassword ? "text" : "password"}
              value={passwordLabel}
              className="bg-background/60 font-mono text-xs"
            />
            <Button
              type="button"
              variant="heroOutline"
              size="icon"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar clave" : "Mostrar clave"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {user.registrationError && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          {user.registrationError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={user.blocked ? "hero" : "heroOutline"}
          size="sm"
          className="gap-1.5"
          onClick={onToggleBlock}
          disabled={busy}
        >
          {user.blocked ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              Desbloquear
            </>
          ) : (
            <>
              <Ban className="h-3.5 w-3.5" />
              Bloquear
            </>
          )}
        </Button>
        <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete} disabled={busy}>
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>
    </article>
  );
};

export default UserListItem;
