import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useManagerAuth } from "@/hooks/useManagerAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { configured, loading, user, signInWithPassword } = useManagerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => email.trim() && password.trim() && !busy, [busy, email, password]);

  useEffect(() => {
    if (!loading && user) navigate("/inicio", { replace: true });
  }, [loading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      toast.error("Supabase no configurado (.env.local)");
      return;
    }

    setBusy(true);
    try {
      await signInWithPassword(email.trim(), password);
      toast.success("Sesión iniciada");
      navigate("/inicio", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-black text-sm text-muted-foreground">
        Cargando…
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-black">
      <img
        src="/onnivers-home-bg.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        draggable={false}
      />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-md items-center px-4">
        <section className="presale-glass-card w-full rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2 text-primary">
            <Lock className="h-5 w-5" />
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              OnniVers Control Manager
            </p>
          </div>
          <h1 className="font-display text-2xl text-gradient-neon">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Usa tu correo y contraseña del panel (tabla manager_app_users).
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Correo
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="deivys1224@gmail.com"
                disabled={busy}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={busy}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full gap-2" disabled={!canSubmit}>
              <LogIn className="h-4 w-4" />
              {busy ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
