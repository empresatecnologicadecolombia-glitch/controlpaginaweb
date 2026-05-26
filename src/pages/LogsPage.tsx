import { FileText, RefreshCw } from "lucide-react";
import SectionScaffold from "@/components/layout/SectionScaffold";
import { Button } from "@/components/ui/button";
import { useAuditLog } from "@/hooks/useAuditLog";

const LogsPage = () => {
  const { loading, error, events, refresh } = useAuditLog(60);

  return (
    <SectionScaffold
      title="Logs del Sistema"
      subtitle="Auditoría de acciones administrativas y eventos del sistema."
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="mb-4 flex justify-end">
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
            Ejecuta <code>supabase/manager_setup_all.sql</code> para crear <code>admin_audit_log</code> y su RLS.
          </p>
        </div>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <section className="presale-glass-card rounded-2xl p-8 text-center">
          <p className="font-display text-foreground">Sin eventos</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando se registren acciones administrativas, aparecerán aquí.
          </p>
        </section>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="presale-glass-card rounded-2xl p-4">
              <p className="text-sm text-foreground">
                <span className="font-medium text-primary">{e.action}</span>
                {e.targetTable ? <span className="text-muted-foreground"> · {e.targetTable}</span> : null}
                {e.targetId ? <span className="text-muted-foreground"> · {e.targetId}</span> : null}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {e.actorEmail ?? "—"} · {new Date(e.createdAt).toLocaleString("es-CO")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionScaffold>
  );
};

export default LogsPage;

