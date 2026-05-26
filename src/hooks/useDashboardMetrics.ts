import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type DashboardEvent = {
  id: string;
  action: string;
  createdAt: string;
  actorEmail: string | null;
  targetTable: string | null;
  targetId: string | null;
};

export type DashboardMetrics = {
  totalUsers: number | null;
  onlineUsers: number | null;
  blockedUsers: number | null;
  messagesToday: number | null;
  activeConcerts: number | null;
  liveStreams: number | null;
  friendRequests: number | null;
  lastUserLabel: string | null;
  lastConcertLabel: string | null;
  lastStreamLabel: string | null;
  events: DashboardEvent[];
};

const startOfTodayIso = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return start.toISOString();
};

const safeCount = async (table: string, where?: (q: any) => any) => {
  if (!supabase) return null;
  try {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (where) q = where(q);
    const { count, error } = await q;
    if (error) return null;
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
};

export const useDashboardMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: null,
    onlineUsers: null,
    blockedUsers: null,
    messagesToday: null,
    activeConcerts: null,
    liveStreams: null,
    friendRequests: null,
    lastUserLabel: null,
    lastConcertLabel: null,
    lastStreamLabel: null,
    events: [],
  });

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [totalUsers, onlineUsers, blockedUsers, messagesToday] = await Promise.all([
      safeCount("profiles"),
      safeCount("profiles", (q) => q.neq("live_status", "Offline")),
      safeCount("profiles", (q) => q.eq("blocked", true)),
      safeCount("chat_messages", (q) => q.gte("created_at", startOfTodayIso())),
    ]);

    const [activeConcerts, liveStreams, friendRequests] = await Promise.all([
      safeCount("concerts", (q) => q.in("status", ["aprobado", "en_vivo"])),
      safeCount("streams", (q) => q.eq("status", "en_vivo")),
      safeCount("friend_requests", (q) => q.eq("status", "active")),
    ]);

    let lastUserLabel: string | null = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(1);
      const row = (data?.[0] as Record<string, unknown> | undefined) ?? null;
      if (row) {
        lastUserLabel = (row.full_name as string | null) ?? `id:${String(row.id).slice(0, 8)}…`;
      }
    } catch {
      lastUserLabel = null;
    }

    let events: DashboardEvent[] = [];
    try {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("id, action, created_at, actor_email, target_table, target_id")
        .order("created_at", { ascending: false })
        .limit(12);
      events = (data ?? []).map((row: any) => ({
        id: String(row.id),
        action: String(row.action ?? "event"),
        createdAt: String(row.created_at ?? new Date().toISOString()),
        actorEmail: (row.actor_email as string | null) ?? null,
        targetTable: (row.target_table as string | null) ?? null,
        targetId: (row.target_id as string | null) ?? null,
      }));
    } catch {
      events = [];
    }

    setMetrics((prev) => ({
      ...prev,
      totalUsers,
      onlineUsers,
      blockedUsers,
      messagesToday,
      activeConcerts,
      liveStreams,
      friendRequests,
      lastUserLabel,
      // aún no hay tablas confirmadas para conciertos/streams
      lastConcertLabel: null,
      lastStreamLabel: null,
      events,
    }));

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(() => metrics, [metrics]);

  return { loading, metrics: summary, refresh };
};

