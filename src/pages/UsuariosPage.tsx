import { useCallback, useMemo, useState } from "react";
import { Filter, RefreshCw, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserDetailModal from "@/components/users/UserDetailModal";
import UserListItem from "@/components/users/UserListItem";
import { useRegisteredUsers } from "@/hooks/useRegisteredUsers";
import type { RegisteredUser } from "@/types/registeredUser";

const UsuariosPage = () => {
  const { users, loading, error, configured, refresh, deleteUser, setBlocked } = useRegisteredUsers();
  const [detailUser, setDetailUser] = useState<RegisteredUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterBlocked, setFilterBlocked] = useState(false);
  const [filterNew, setFilterNew] = useState(false);
  const [filterInactive, setFilterInactive] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const isNew = (iso: string) => {
      try {
        const created = new Date(iso).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        return Date.now() - created <= sevenDays;
      } catch {
        return false;
      }
    };

    return users.filter((u) => {
      const haystack = `${u.displayName ?? ""} ${u.email ?? ""} ${u.id ?? ""}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (filterBlocked && !u.blocked) return false;
      if (filterOnline) {
        const live = (u.onlineStatus ?? "").toLowerCase();
        if (live !== "online") return false;
      }
      if (filterNew && !isNew(u.createdAt)) return false;
      if (filterInactive) {
        const live = (u.onlineStatus ?? "").toLowerCase();
        if (live === "online") return false;
      }
      return true;
    });
  }, [filterBlocked, filterInactive, filterNew, filterOnline, query, users]);

  const handleDelete = useCallback(
    async (user: RegisteredUser) => {
      const ok = window.confirm(
        `¿Eliminar a ${user.displayName?.trim() || user.email}? Esta acción no se puede deshacer.`,
      );
      if (!ok) return;

      setBusyId(user.id);
      try {
        await deleteUser(user.id);
        toast.success("Usuario eliminado");
        if (detailUser?.id === user.id) setDetailUser(null);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
      } finally {
        setBusyId(null);
      }
    },
    [deleteUser, detailUser],
  );

  const handleToggleBlock = useCallback(
    async (user: RegisteredUser) => {
      setBusyId(user.id);
      try {
        await setBlocked(user.id, !user.blocked);
        toast.success(user.blocked ? "Usuario desbloqueado" : "Usuario bloqueado");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo actualizar el estado");
      } finally {
        setBusyId(null);
      }
    },
    [setBlocked],
  );

  return (
    <main className="relative h-full overflow-y-auto">
      <img
        src="/onnivers-home-bg.png"
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-40"
        draggable={false}
      />
      <div className="relative mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Control Manager
              </span>
            </div>
            <h1 className="font-display text-2xl text-gradient-neon sm:text-3xl">Usuarios</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Lista de usuarios registrados. Gestiona bloqueo, eliminación y revisa errores de registro.
            </p>
          </div>
          <Button
            variant="heroOutline"
            size="sm"
            className="gap-1.5"
            onClick={() => void refresh()}
            disabled={loading || !configured}
          >
            <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            Actualizar
          </Button>
        </header>

        <section className="mb-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="presale-glass-card rounded-2xl p-4">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Buscar por nombre, correo o ID
            </label>
            <div className="flex gap-2">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: DavisH, correo@, uuid…"
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="heroOutline"
                size="icon"
                className="shrink-0"
                onClick={() => setQuery("")}
                disabled={!query.trim()}
                aria-label="Limpiar búsqueda"
                title="Limpiar"
              >
                ×
              </Button>
            </div>
          </div>

          <div className="presale-glass-card rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <p className="text-[10px] font-medium uppercase tracking-widest">Filtros</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={filterOnline ? "hero" : "heroOutline"}
                size="sm"
                onClick={() => setFilterOnline((v) => !v)}
              >
                Online
              </Button>
              <Button
                type="button"
                variant={filterBlocked ? "hero" : "heroOutline"}
                size="sm"
                onClick={() => setFilterBlocked((v) => !v)}
              >
                Bloqueados
              </Button>
              <Button
                type="button"
                variant={filterNew ? "hero" : "heroOutline"}
                size="sm"
                onClick={() => setFilterNew((v) => !v)}
              >
                Nuevos (7d)
              </Button>
              <Button
                type="button"
                variant={filterInactive ? "hero" : "heroOutline"}
                size="sm"
                onClick={() => setFilterInactive((v) => !v)}
              >
                Inactivos
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Mostrando <span className="text-foreground">{filteredUsers.length}</span> de{" "}
              <span className="text-foreground">{users.length}</span>
            </p>
          </div>
        </section>

        {!configured && (
          <div className="presale-glass-card mb-6 rounded-2xl border border-primary/30 p-5">
            <h2 className="font-display text-sm text-primary">Conectar Supabase</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea un archivo <code className="text-primary">.env.local</code> en la raíz del proyecto (copia desde{" "}
              <code className="text-primary">.env.example</code>) con tu URL y clave anon de Supabase. Ejecuta el SQL
              en <code className="text-primary">supabase/profiles_manager_columns.sql</code> (opcional, para email/bloqueo) y reinicia{" "}
              <code className="text-primary">npm run dev</code>.
            </p>
          </div>
        )}

        {configured && error && (
          <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            <p className="mt-2 text-xs text-muted-foreground">
              Verifica el nombre de la tabla (<code>VITE_SUPABASE_USERS_TABLE</code>) y las políticas RLS en Supabase.
            </p>
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-muted-foreground">Cargando usuarios…</p>
        )}

        {!loading && configured && !error && users.length === 0 && (
          <div className="presale-glass-card rounded-2xl p-8 text-center">
            <p className="font-display text-foreground">No hay usuarios registrados</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cuando tu app de registro inserte filas en Supabase, aparecerán aquí.
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <UserListItem
                user={user}
                busy={busyId === user.id}
                onViewDetails={() => setDetailUser(user)}
                onToggleBlock={() => void handleToggleBlock(user)}
                onDelete={() => void handleDelete(user)}
              />
            </li>
          ))}
        </ul>
      </div>

      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
    </main>
  );
};

export default UsuariosPage;
