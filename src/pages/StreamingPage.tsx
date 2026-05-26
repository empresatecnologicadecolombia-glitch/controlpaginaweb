import { Radio, RefreshCw } from "lucide-react";
import SectionScaffold from "@/components/layout/SectionScaffold";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type StreamRow = {
  id: string;
  status: string;
  hlsUrl: string | null;
  viewersCount: number;
  lastError: string | null;
  updatedAt: string;
};

const StreamingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<StreamRow[]>([]);

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("streams")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(40);

    if (fetchError) {
      setError(fetchError.message);
      setStreams([]);
    } else {
      setStreams(
        (data ?? []).map((r: any) => ({
          id: String(r.id),
          status: String(r.status ?? "—"),
          hlsUrl: (r.hls_url as string | null) ?? null,
          viewersCount: typeof r.viewers_count === "number" ? r.viewers_count : 0,
          lastError: (r.last_error as string | null) ?? null,
          updatedAt: String(r.updated_at ?? r.created_at ?? new Date().toISOString()),
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <SectionScaffold
      title="Streaming"
      subtitle="Panel técnico: estado HLS, tiempo, viewers y errores."
      icon={<Radio className="h-5 w-5" />}
    >
      <div className="mb-4 flex justify-end">
        <Button variant="heroOutline" size="sm" className="gap-1.5" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Actualizar
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <p className="mt-2 text-xs text-muted-foreground">
            Ejecuta <code>supabase/manager_setup_all.sql</code> para crear la tabla <code>streams</code> y su RLS.
          </p>
        </div>
      ) : null}

      {!loading && !error && streams.length === 0 ? (
        <section className="presale-glass-card rounded-2xl p-8 text-center">
          <p className="font-display text-foreground">Sin streams</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando existan streams, se verán aquí con su estado.
          </p>
        </section>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {streams.map((s) => {
            const live = String(s.status).toLowerCase() === "en_vivo";
            return (
              <li key={s.id}>
                <article
                  className={cn(
                    "presale-glass-card rounded-2xl border border-border/50 p-4",
                    live && "ring-1 ring-fuchsia-500/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Stream</p>
                      <p className="mt-1 truncate text-sm text-foreground">ID: {s.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Actualizado: {new Date(s.updatedAt).toLocaleString("es-CO")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Estado</p>
                      <p className={cn("mt-1 font-display text-lg", live ? "text-fuchsia-200" : "text-foreground")}>
                        {s.status}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Viewers: {s.viewersCount}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">HLS</p>
                    <p className="mt-0.5 truncate text-xs text-foreground/90">{s.hlsUrl ?? "—"}</p>
                  </div>
                  {s.lastError ? (
                    <p className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {s.lastError}
                    </p>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </SectionScaffold>
  );
};

export default StreamingPage;

