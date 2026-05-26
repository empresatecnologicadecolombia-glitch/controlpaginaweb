import { NavLink } from "react-router-dom";
import {
  AreaChart,
  FileText,
  Home,
  MessagesSquare,
  Radio,
  Settings,
  Shield,
  Ticket,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/usuarios", label: "Usuarios", icon: Users },
  { to: "/conciertos", label: "Conciertos", icon: Ticket },
  { to: "/chat", label: "Chat", icon: MessagesSquare },
  { to: "/streaming", label: "Streaming", icon: Radio },
  { to: "/moderacion", label: "Moderación", icon: Shield },
  { to: "/logs", label: "Logs", icon: FileText },
  { to: "/config", label: "Config", icon: Settings },
  { to: "/analytics", label: "Analytics", icon: AreaChart },
] as const;

const navButtonClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-colors",
    "min-h-[3.25rem] font-display text-[10px] font-medium uppercase tracking-wide sm:text-[11px]",
    isActive
      ? "border-primary/45 bg-primary/15 text-primary shadow-[0_0_18px_-8px_hsl(var(--primary)/0.7)]"
      : "border-border/40 bg-muted/15 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground",
  );

const ManagerProfileNav = () => (
  <section
    className="presale-glass-card w-full rounded-2xl border border-border/50 p-4 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.35)] backdrop-blur-xl"
    aria-label="Panel de control"
  >
    <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
      Panel de control
    </p>
    <nav className="grid grid-cols-3 gap-2 sm:gap-2.5">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={navButtonClass}>
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="leading-tight">{label}</span>
        </NavLink>
      ))}
    </nav>
  </section>
);

export default ManagerProfileNav;
