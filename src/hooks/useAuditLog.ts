import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type AuditEvent = {
  id: string;
  createdAt: string;
  actorEmail: string | null;
  action: string;
  targetTable: string | null;
  targetId: string | null;
  payload: Record<string, unknown>;
};

export const useAuditLog = (limit = 50) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("admin_audit_log")
      .select("id, created_at, actor_email, action, target_table, target_id, payload")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fetchError) {
      setError(fetchError.message);
      setEvents([]);
    } else {
      setEvents(
        (data ?? []).map((r: any) => ({
          id: String(r.id),
          createdAt: String(r.created_at ?? new Date().toISOString()),
          actorEmail: (r.actor_email as string | null) ?? null,
          action: String(r.action ?? "event"),
          targetTable: (r.target_table as string | null) ?? null,
          targetId: (r.target_id as string | null) ?? null,
          payload: (r.payload as Record<string, unknown>) ?? {},
        })),
      );
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { loading, error, events, refresh };
};

