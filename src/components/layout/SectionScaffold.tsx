import type { ReactNode } from "react";

type SectionScaffoldProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
};

const SectionScaffold = ({ title, subtitle, icon, children }: SectionScaffoldProps) => (
  <main className="relative h-full overflow-y-auto">
    <img
      src="/onnivers-home-bg.png"
      alt=""
      className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-35"
      draggable={false}
    />
    <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-primary">
          {icon}
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Control Manager
          </span>
        </div>
        <h1 className="font-display text-2xl text-gradient-neon sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>
      {children ?? (
        <section className="presale-glass-card rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">Sección en construcción.</p>
        </section>
      )}
    </div>
  </main>
);

export default SectionScaffold;

