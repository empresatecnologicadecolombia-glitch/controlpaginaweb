import { RefreshCw, Settings } from "lucide-react";
import SectionScaffold from "@/components/layout/SectionScaffold";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type FlagRow = { key: string; enabled: boolean; description: string | null };

const ConfigPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<FlagRow[]>([]);

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("feature_flags")
      .select("key, enabled, description")
      .order("key", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setFlags([]);
    } else {
      setFlags(
        (data ?? []).map((r: any) => ({
          key: String(r.key),
          enabled: Boolean(r.enabled),
          description: (r.description as string | null) ?? null,
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const toggle = async (key: string, next: boolean) => {
    if (!supabase) return;
    const { error: upErr } = await supabase.from("feature_flags").update({ enabled: next }).eq("key", key);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: next } : f)));
  };

  return (
    <SectionScaffold
      title="Configuración"
      subtitle="Feature flags y parámetros del sistema."
      icon={<Settings className="h-5 w-5" />}
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
            Ejecuta <code>supabase/manager_setup_all.sql</code> para crear <code>feature_flags</code>.
          </p>
        </div>
      ) : null}

      {!loading && !error && flags.length === 0 ? (
        <section className="presale-glass-card rounded-2xl p-8 text-center">
          <p className="font-display text-foreground">Sin flags</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Agrega flags en Supabase (<code>feature_flags</code>) para controlarlas desde aquí.
          </p>
        </section>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {flags.map((f) => (
            <li key={f.key} className="presale-glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base text-foreground">{f.key}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.description ?? "—"}</p>
                </div>
                <Button
                  size="sm"
                  variant={f.enabled ? "hero" : "heroOutline"}
                  onClick={() => void toggle(f.key, !f.enabled)}
                  disabled={loading}
                >
                  {f.enabled ? "Activo" : "Inactivo"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionScaffold>
  );
};

export default ConfigPage;

