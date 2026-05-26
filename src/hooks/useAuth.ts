import { useCallback, useState } from "react";

export type ManagerUser = {
  id: string;
  email: string;
  displayName: string;
};

const STORAGE_KEY = "onnivers.manager.session";

function readStoredUser(): ManagerUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ManagerUser;
    if (parsed?.id && parsed.email) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

const DEFAULT_USER: ManagerUser = {
  id: "manager-local",
  email: "manager@onniverso.local",
  displayName: "Manager",
};

export const useAuth = () => {
  const [user, setUser] = useState<ManagerUser | null>(() => readStoredUser() ?? DEFAULT_USER);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("onniverso.profile.name");
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const signInLocal = useCallback((next: ManagerUser) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setUser(next);
  }, []);

  return { user, loading: false, signOut, signInLocal };
};
