import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase, SUPABASE_USERS_TABLE } from "@/lib/supabase";
import { mapRegisteredUser } from "@/lib/mapRegisteredUser";
import type { RegisteredUser } from "@/types/registeredUser";

type UseRegisteredUsersResult = {
  users: RegisteredUser[];
  loading: boolean;
  error: string | null;
  configured: boolean;
  refresh: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setBlocked: (id: string, blocked: boolean) => Promise<void>;
};

export const useRegisteredUsers = (): UseRegisteredUsersResult => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUsers([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from(SUPABASE_USERS_TABLE)
      .select("*")
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setUsers([]);
    } else {
      setUsers((data ?? []).map((row) => mapRegisteredUser(row as Record<string, unknown>)));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deleteUser = useCallback(
    async (id: string) => {
      if (!supabase) throw new Error("Supabase no configurado");
      const { error: deleteError } = await supabase.from(SUPABASE_USERS_TABLE).delete().eq("id", id);
      if (deleteError) throw deleteError;
      setUsers((prev) => prev.filter((u) => u.id !== id));
    },
    [],
  );

  const setBlocked = useCallback(async (id: string, blocked: boolean) => {
    if (!supabase) throw new Error("Supabase no configurado");

    const { error: updateError } = await supabase
      .from(SUPABASE_USERS_TABLE)
      .update({ blocked })
      .eq("id", id);

    if (updateError) throw updateError;

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blocked } : u)));
  }, []);

  return {
    users,
    loading,
    error,
    configured: isSupabaseConfigured,
    refresh,
    deleteUser,
    setBlocked,
  };
};
