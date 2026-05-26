import { MessagesSquare, RefreshCw } from "lucide-react";
import SectionScaffold from "@/components/layout/SectionScaffold";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type ChatMessage = {
  id: string;
  createdAt: string;
  userId: string | null;
  content: string | null;
};

const ChatPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (fetchError) {
      setError(fetchError.message);
      setMessages([]);
    } else {
      setMessages(
        (data ?? []).map((r: any) => ({
          id: String(r.id ?? crypto.randomUUID()),
          createdAt: String(r.created_at ?? new Date().toISOString()),
          userId: (r.user_id as string | null) ?? (r.sender_id as string | null) ?? null,
          content: (r.content as string | null) ?? (r.message as string | null) ?? null,
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
      title="Chat y Comunidad"
      subtitle="Mensajes globales y monitoreo básico (se ampliará a conversaciones/reportes)."
      icon={<MessagesSquare className="h-5 w-5" />}
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
            Si tu tabla usa otras columnas, la adapto (p. ej. <code>message</code> o <code>sender_id</code>).
          </p>
        </div>
      ) : null}

      {!loading && !error && messages.length === 0 ? (
        <section className="presale-glass-card rounded-2xl p-8 text-center">
          <p className="font-display text-foreground">Sin mensajes</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando haya mensajes en <code>chat_messages</code>, aparecerán aquí.
          </p>
        </section>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => (
            <li key={m.id} className="presale-glass-card rounded-2xl p-4">
              <p className="text-sm text-foreground/90">{m.content ?? "—"}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {m.userId ? `user:${m.userId.slice(0, 8)}…` : "—"} · {new Date(m.createdAt).toLocaleString("es-CO")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionScaffold>
  );
};

export default ChatPage;

