import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Nombre de la tabla con registros de usuarios (ajústalo si tu tabla se llama distinto). */
export const SUPABASE_USERS_TABLE =
  import.meta.env.VITE_SUPABASE_USERS_TABLE?.trim() || "registered_users";

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
