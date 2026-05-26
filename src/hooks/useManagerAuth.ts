import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type ManagerRole = "superadmin" | "moderador" | "soporte";

export type ManagerProfile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
};

type ManagerAuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: ManagerProfile | null;
  role: ManagerRole | null;
  isAllowed: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const ALLOWED_FULL_NAMES = new Set(["DavisH", "Davis2"]);

export const useManagerAuth = (): ManagerAuthState => {
  const configured = Boolean(supabase);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [role, setRole] = useState<ManagerRole | null>(null);

  const user = session?.user ?? null;

  const fetchProfileAndRole = useCallback(async () => {
    if (!supabase) return;

    const {
      data: { session: nextSession },
    } = await supabase.auth.getSession();

    setSession(nextSession);

    const nextUser = nextSession?.user;
    if (!nextUser) {
      setProfile(null);
      setRole(null);
      return;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", nextUser.id)
      .maybeSingle();

    setProfile(
      profileRow
        ? {
            id: String(profileRow.id),
            fullName: (profileRow as Record<string, unknown>).full_name as string | null,
            avatarUrl: (profileRow as Record<string, unknown>).avatar_url as string | null,
          }
        : { id: nextUser.id, fullName: null, avatarUrl: null },
    );

    const { data: roleRow } = await supabase
      .from("manager_roles")
      .select("role")
      .eq("user_id", nextUser.id)
      .maybeSingle();

    const roleValue = (roleRow as Record<string, unknown> | null)?.role;
    if (roleValue === "superadmin" || roleValue === "moderador" || roleValue === "soporte") {
      setRole(roleValue);
    } else {
      // Fallback: allowlisted users can operate as superadmin until roles are configured in DB.
      setRole("superadmin");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!supabase) {
      setLoading(false);
      return;
    }

    void (async () => {
      await fetchProfileAndRole();
      if (mounted) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void fetchProfileAndRole();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchProfileAndRole]);

  const isAllowed = useMemo(() => {
    if (!user) return false;
    const fullName = profile?.fullName?.trim() ?? "";
    return ALLOWED_FULL_NAMES.has(fullName);
  }, [profile?.fullName, user]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase no configurado");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await fetchProfileAndRole();
  }, [fetchProfileAndRole]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRole(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    await fetchProfileAndRole();
    setLoading(false);
  }, [fetchProfileAndRole]);

  return {
    configured,
    loading,
    session,
    user,
    profile,
    role,
    isAllowed,
    signInWithPassword,
    signOut,
    refresh,
  };
};

