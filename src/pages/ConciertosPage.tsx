import { useMemo, useState } from "react";
import { BadgeCheck, Ban, Flame, RefreshCw, Ticket, XCircle } from "lucide-react";
import { toast } from "sonner";
import SectionScaffold from "@/components/layout/SectionScaffold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useConcerts, type Concert, type ConcertStatus } from "@/hooks/useConcerts";

const statusLabel: Record<ConcertStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  en_vivo: "En vivo",
  finalizado: "Finalizado",
};

const statusClass: Record<ConcertStatus, string> = {
  pendiente: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  aprobado: "border-primary/35 bg-primary/10 text-primary",
  rechazado: "border-destructive/40 bg-destructive/10 text-destructive",
  en_vivo: "border-fuchsia-500/35 bg-fuchsia-500/10 text-fuchsia-200",
  finalizado: "border-border/60 bg-muted/30 text-muted-foreground",
};

const ConciertosPage = () => {
  const { concerts, loading, error, refresh, updateConcert, removeConcert } = useConcerts();
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return concerts;
    return concerts.filter((c) => {
      const hay = `${c.title} ${c.artist ?? ""} ${c.id} ${c.hlsCode ?? ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [concerts, q]);

  const act = async (concert: Concert, patch: Record<string, unknown>, msg: string) => {
    setBusyId(concert.id);
    try {
      await updateConcert(concert.id, patch);
      toast.success(msg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (concert: Concert) => {
    const ok = window.confirm(`¿Eliminar concierto "${concert.title}"?`);
    if (!ok) return;
    setBusyId(concert.id);
    try {
      await removeConcert(concert.id);
      toast.success("Concierto eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SectionScaffold
      title="Conciertos"
      subtitle="Centro operativo: aprobación, estados, HLS y control de transmisiones."
      icon={<Ticket className="h-5 w-5" />}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-xl">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Buscar (título, artista, ID, HLS)
          </label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: Canserbero, hls_..." />
        </div>

        <Button
          variant="heroOutline"
          size="sm"
          className="gap-1.5"
          onClick={() => void refresh()}
          disabled={loading}
        >
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Actualizar
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <p className="mt-2 text-xs text-muted-foreground">
            Ejecuta <code>supabase/manager_setup_all.sql</code> para crear la tabla <code>concerts</code> y su RLS.
          </p>
        </div>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <section className="presale-glass-card rounded-2xl p-8 text-center">
          <p className="font-display text-foreground">No hay conciertos</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando tu plataforma inserte filas en <code>concerts</code>, aparecerán aquí.
          </p>
        </section>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filtered.map((c) => {
            const busy = busyId === c.id;
            const live = c.status === "en_vivo";
            const creatorName = c.creator?.fullName?.trim() || (c.creatorUserId ? `user:${c.creatorUserId.slice(0, 8)}…` : "—");
            const creatorStatus = (c.creator?.liveStatus ?? "").toLowerCase();
            const creatorOnline = creatorStatus === "online";

            return (
              <li key={c.id}>
                <article
                  className={cn(
                    "presale-glass-card relative rounded-2xl border border-border/50 p-4",
                    live && "ring-1 ring-fuchsia-500/40",
                  )}
                >
                  {c.bannerUrl ? (
                    <div className="mb-3 overflow-hidden rounded-xl border border-border/50">
                      <img src={c.bannerUrl} alt="" className="h-28 w-full object-cover" draggable={false} />
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base text-foreground">{c.title}</h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {c.artist ?? "—"} · ID: {c.id}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/20 px-2 py-1">
                          <div className="relative h-6 w-6 overflow-hidden rounded-full border border-border/50 bg-muted/30">
                            {c.creator?.avatarUrl ? (
                              <img
                                src={c.creator.avatarUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                draggable={false}
                              />
                            ) : null}
                          </div>
                          <span className="max-w-[180px] truncate text-[11px] text-foreground/90">
                            {creatorName}
                          </span>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              creatorOnline ? "bg-primary" : "bg-muted-foreground/60",
                            )}
                            title={creatorOnline ? "Online" : creatorStatus ? c.creator?.liveStatus ?? "Offline" : "Offline"}
                            aria-label={creatorOnline ? "Online" : "Offline"}
                          />
                          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {c.creator?.liveStatus ?? "Offline"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                            statusClass[c.status],
                          )}
                        >
                          {statusLabel[c.status]}
                        </span>
                        {c.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                            <Flame className="h-3 w-3" />
                            Destacado
                          </span>
                        ) : null}
                        {c.disabled ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
                            <Ban className="h-3 w-3" />
                            Desactivado
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                        Viewers
                      </p>
                      <p className="mt-1 font-display text-xl text-foreground">{c.viewersCount}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">HLS</p>
                      <p className="mt-0.5 truncate text-xs text-foreground/90">{c.hlsCode ?? "—"}</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fecha</p>
                      <p className="mt-0.5 truncate text-xs text-foreground/90">
                        {c.eventAt ? new Date(c.eventAt).toLocaleString("es-CO") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="heroOutline"
                      className="gap-1.5"
                      disabled={busy}
                      onClick={() => void act(c, { status: "aprobado" }, "Concierto aprobado")}
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="heroOutline"
                      className="gap-1.5"
                      disabled={busy}
                      onClick={() => void act(c, { status: "rechazado" }, "Concierto rechazado")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant={c.featured ? "hero" : "heroOutline"}
                      className="gap-1.5"
                      disabled={busy}
                      onClick={() => void act(c, { featured: !c.featured }, c.featured ? "Quitado de portada" : "Destacado en portada")}
                    >
                      <Flame className="h-3.5 w-3.5" />
                      Portada
                    </Button>
                    <Button
                      size="sm"
                      variant={c.disabled ? "hero" : "heroOutline"}
                      className="gap-1.5"
                      disabled={busy}
                      onClick={() => void act(c, { disabled: !c.disabled }, c.disabled ? "Concierto activado" : "Concierto desactivado")}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      {c.disabled ? "Activar" : "Desactivar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5"
                      disabled={busy}
                      onClick={() => void act(c, { status: "finalizado" }, "Transmisión finalizada")}
                    >
                      Finalizar
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1.5" disabled={busy} onClick={() => void onDelete(c)}>
                      Eliminar
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </SectionScaffold>
  );
};

export default ConciertosPage;

