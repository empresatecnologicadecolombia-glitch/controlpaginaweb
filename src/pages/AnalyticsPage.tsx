import { AreaChart, RefreshCw } from "lucide-react";
import SectionScaffold from "@/components/layout/SectionScaffold";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

const AnalyticsPage = () => {
  const { loading, metrics, refresh } = useDashboardMetrics();

  return (
    <SectionScaffold
      title="Analytics"
      subtitle="V1: resumen numérico (gráficas se agregan cuando tengamos tablas históricas)."
      icon={<AreaChart className="h-5 w-5" />}
    >
      <div className="mb-4 flex justify-end">
        <Button variant="heroOutline" size="sm" className="gap-1.5" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <section className="presale-glass-card rounded-2xl p-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Usuarios</p>
          <p className="mt-2 font-display text-2xl text-foreground">{metrics.totalUsers ?? "—"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Total registrados</p>
        </section>
        <section className="presale-glass-card rounded-2xl p-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Online</p>
          <p className="mt-2 font-display text-2xl text-foreground">{metrics.onlineUsers ?? "—"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Simultáneos (según live_status)</p>
        </section>
        <section className="presale-glass-card rounded-2xl p-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Mensajes</p>
          <p className="mt-2 font-display text-2xl text-foreground">{metrics.messagesToday ?? "—"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Enviados hoy</p>
        </section>
      </div>

      <section className="presale-glass-card mt-6 rounded-2xl p-6">
        <p className="font-display text-lg text-foreground">Siguiente paso</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Para gráficas reales (crecimiento por día, conciertos por semana, etc.) necesitamos que la plataforma guarde
          eventos agregables (por ejemplo en <code>system_events</code> o tablas específicas). Ya dejé <code>system_events</code>
          en <code>supabase/manager_setup_all.sql</code>.
        </p>
      </section>
    </SectionScaffold>
  );
};

export default AnalyticsPage;

