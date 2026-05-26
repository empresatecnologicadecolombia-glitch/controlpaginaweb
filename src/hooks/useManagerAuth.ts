import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ManagerAppLoginResponse, ManagerAppSession, ManagerRole } from "@/types/managerAppSession";

export type { ManagerRole } from "@/types/managerAppSession";

export type ManagerProfile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export type ManagerUser = {
  id: string;
  email: string;
};

const STORAGE_KEY = "onnivers.manager.app.session";

/** Acceso directo SIEMPRE (sin login). */
const ALWAYS_ALLOW = true;
const ALWAYS_SESSION: ManagerAppSession = {
  id: "manager-local",
  email: "deivys1224@gmail.com",
  displayName: "Manager",
  role: "superadmin",
  loggedInAt: new Date().toISOString(),
};

function readStoredSession(): ManagerAppSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ManagerAppSession;
    if (parsed?.id && parsed.email && parsed.role) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function persistSession(session: ManagerAppSession | null) {
  try {
    if (!session) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

type ManagerAuthState = {
  configured: boolean;
  loading: boolean;
  user: ManagerUser | null;
  profile: ManagerProfile | null;
  role: ManagerRole | null;
  isAllowed: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useManagerAuth = (): ManagerAuthState => {
  const configured = Boolean(supabase);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ManagerAppSession | null>(() =>
    ALWAYS_ALLOW ? ALWAYS_SESSION : readStoredSession(),
  );

  useEffect(() => {
    setSession(ALWAYS_ALLOW ? ALWAYS_SESSION : readStoredSession());
    setLoading(false);
  }, []);

  const user = useMemo<ManagerUser | null>(() => {
    if (!session) return null;
    return { id: session.id, email: session.email };
  }, [session]);

  const profile = useMemo<ManagerProfile | null>(() => {
    if (!session) return null;
    return {
      id: session.id,
      fullName: session.displayName,
      avatarUrl: null,
    };
  }, [session]);

  const role = session?.role ?? null;
  const isAllowed = ALWAYS_ALLOW ? true : Boolean(session);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (ALWAYS_ALLOW) return;
    if (!supabase) throw new Error("Supabase no configurado (.env.local)");

    const { data, error } = await supabase.rpc("manager_app_login", {
      p_email: email.trim(),
      p_password: password,
    });

    if (error) {
      if (error.message.includes("manager_app_login")) {
        throw new Error(
          "Falta ejecutar supabase/manager_app_users.sql en tu proyecto Supabase (SQL Editor).",
        );
      }
      throw error;
    }

    const result = data as ManagerAppLoginResponse | null;
    if (!result?.ok || !result.user) {
      throw new Error(result?.message ?? "Credenciales incorrectas");
    }

    const nextSession: ManagerAppSession = {
      id: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
      role: result.user.role,
      loggedInAt: new Date().toISOString(),
    };

    persistSession(nextSession);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    if (ALWAYS_ALLOW) {
      // No cerrar sesión en modo acceso directo
      return;
    }
    persistSession(null);
    setSession(null);
    try {
      localStorage.removeItem("onniverso.profile.name");
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    setSession(ALWAYS_ALLOW ? ALWAYS_SESSION : readStoredSession());
  }, []);

  return {
    configured,
    loading,
    user,
    profile,
    role,
    isAllowed,
    signInWithPassword,
    signOut,
    refresh,
  };
};
