import { Shield, ShieldAlert } from "lucide-react";
import SectionScaffold from "@/components/layout/SectionScaffold";

const ModeracionPage = () => (
  <SectionScaffold
    title="Moderación"
    subtitle="Reportes (usuarios/conciertos), historial y herramientas rápidas."
    icon={<Shield className="h-5 w-5" />}
  >
    <section className="presale-glass-card rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-lg text-foreground">Listas de reportes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta sección ya está lista visualmente. Para completarla con datos reales, necesito que tu app
            de usuarios/conciertos escriba reportes en una tabla (por ejemplo: <code>reports</code>).
            Ya dejé el SQL base en <code>supabase/manager_setup_all.sql</code> (system_events/auditoría).
          </p>
        </div>
      </div>
    </section>
  </SectionScaffold>
);

export default ModeracionPage;

