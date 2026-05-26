import { Activity, MessageSquareText, Radio, RefreshCw, ShieldAlert, Ticket, Users, UserX } from "lucide-react";
import SectionScaffold from "@/components/layout/SectionScaffold";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import OnniVersoLogo from "@/components/branding/OnniVersoLogo";

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="presale-glass-card rounded-2xl p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">{icon}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { loading, metrics, refresh } = useDashboardMetrics();

  return (
    <SectionScaffold
      title="Dashboard"
      subtitle="Vista general del sistema (métricas y eventos)."
      icon={<OnniVersoLogo iconSize={20} showText={false} className="text-primary" />}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Usuarios registrados"
          value={metrics.totalUsers ?? "—"}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard label="Usuarios online" value={metrics.onlineUsers ?? "—"} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Conciertos activos" value={metrics.activeConcerts ?? "—"} icon={<Ticket className="h-5 w-5" />} />
        <StatCard
          label="Mensajes hoy"
          value={metrics.messagesToday ?? "—"}
          icon={<MessageSquareText className="h-5 w-5" />}
        />
        <StatCard label="Streams en vivo" value={metrics.liveStreams ?? "—"} icon={<Radio className="h-5 w-5" />} />
        <StatCard
          label="Usuarios bloqueados"
          value={metrics.blockedUsers ?? "—"}
          icon={<UserX className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="presale-glass-card rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display text-lg text-foreground">Eventos recientes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Se conectará a logs/auditoría cuando estén habilitados.
          </p>
          {metrics.events.length === 0 ? (
            <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-xs font-medium uppercase tracking-widest">Pendiente</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Aún no hay eventos cargados (ejecuta `supabase/manager_security.sql` para habilitar auditoría).
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {metrics.events.map((e) => (
                <li key={e.id} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <p className="text-xs text-foreground">
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
        </section>

        <section className="presale-glass-card rounded-2xl p-5">
          <h2 className="font-display text-lg text-foreground">Últimos</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Último usuario registrado
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{metrics.lastUserLabel ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Último concierto creado
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{metrics.lastConcertLabel ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Último stream iniciado
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{metrics.lastStreamLabel ?? "—"}</p>
            </div>
          </div>
        </section>
      </div>
    </SectionScaffold>
  );
};

export default DashboardPage;

