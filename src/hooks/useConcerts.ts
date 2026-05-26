import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type ConcertStatus = "pendiente" | "aprobado" | "rechazado" | "en_vivo" | "finalizado";

export type ConcertCreator = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  liveStatus: string | null;
};

export type Concert = {
  id: string;
  title: string;
  artist: string | null;
  creatorUserId: string | null;
  creator: ConcertCreator | null;
  eventAt: string | null;
  status: ConcertStatus;
  hlsCode: string | null;
  bannerUrl: string | null;
  capacity: number | null;
  viewersCount: number;
  featured: boolean;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
  raw: Record<string, unknown>;
};

const mapConcert = (row: any): Concert => ({
  id: String(row.id),
  title: String(row.title ?? "—"),
  artist: (row.artist as string | null) ?? null,
  creatorUserId: (row.creator_user_id as string | null) ?? null,
  creator: null,
  eventAt: (row.event_at as string | null) ?? null,
  status: (row.status as ConcertStatus) ?? "pendiente",
  hlsCode: (row.hls_code as string | null) ?? null,
  bannerUrl: (row.banner_url as string | null) ?? null,
  capacity: typeof row.capacity === "number" ? row.capacity : null,
  viewersCount: typeof row.viewers_count === "number" ? row.viewers_count : 0,
  featured: Boolean(row.featured),
  disabled: Boolean(row.disabled),
  createdAt: String(row.created_at ?? new Date().toISOString()),
  updatedAt: String(row.updated_at ?? new Date().toISOString()),
  raw: row as Record<string, unknown>,
});

export const useConcerts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [concerts, setConcerts] = useState<Concert[]>([]);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      setConcerts([]);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("concerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setConcerts([]);
    } else {
      const base = (data ?? []).map(mapConcert);

      const creatorIds = Array.from(
        new Set(base.map((c) => c.creatorUserId).filter((id): id is string => Boolean(id))),
      );

      if (creatorIds.length === 0) {
        setConcerts(base);
      } else {
        const { data: creators } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, live_status")
          .in("id", creatorIds);

        const creatorMap = new Map<string, ConcertCreator>();
        (creators ?? []).forEach((p: any) => {
          const id = String(p.id);
          creatorMap.set(id, {
            id,
            fullName: (p.full_name as string | null) ?? null,
            avatarUrl: (p.avatar_url as string | null) ?? null,
            liveStatus: (p.live_status as string | null) ?? null,
          });
        });

        setConcerts(base.map((c) => ({ ...c, creator: c.creatorUserId ? creatorMap.get(c.creatorUserId) ?? null : null })));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateConcert = useCallback(async (id: string, patch: Record<string, unknown>) => {
    if (!supabase) throw new Error("Supabase no configurado");
    const { error } = await supabase.from("concerts").update(patch).eq("id", id);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const removeConcert = useCallback(async (id: string) => {
    if (!supabase) throw new Error("Supabase no configurado");
    const { error } = await supabase.from("concerts").delete().eq("id", id);
    if (error) throw error;
    setConcerts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const summary = useMemo(() => ({ concerts, loading, error }), [concerts, loading, error]);
  return { ...summary, refresh, updateConcert, removeConcert };
};

