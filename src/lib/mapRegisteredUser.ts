import type { RegisteredUser } from "@/types/registeredUser";

const pickString = (row: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
};

const pickBoolean = (row: Record<string, unknown>, keys: string[], fallback = false): boolean => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
};

const pickObject = (row: Record<string, unknown>, key: string): Record<string, unknown> | null => {
  const value = row[key];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
};

export const mapRegisteredUser = (row: Record<string, unknown>): RegisteredUser => {
  const id = pickString(row, ["id", "user_id", "uuid"]) ?? crypto.randomUUID();
  const password = pickString(row, ["password", "clave", "contrasena", "contraseña"]);
  const displayName = pickString(row, ["display_name", "nombre", "name", "full_name"]);
  const registrationError = pickString(row, [
    "registration_error",
    "error_registro",
    "registro_error",
    "signup_error",
    "error",
  ]);
  const phone = pickString(row, ["phone", "telefono", "teléfono"]);
  const avatarUrl = pickString(row, ["avatar_url", "foto", "avatar"]);
  const authUserId = pickString(row, ["auth_user_id", "user_auth_id"]) ?? id;

  const updatedAt = pickString(row, ["updated_at", "fecha_actualizacion"]);
  const createdAt =
    pickString(row, ["created_at", "fecha_registro", "registered_at"]) ?? updatedAt ?? new Date().toISOString();

  return {
    id,
    email: pickString(row, ["email", "correo", "mail"]) ?? `id:${id.slice(0, 8)}…`,
    password,
    displayName,
    blocked: pickBoolean(row, ["blocked", "is_blocked", "bloqueado", "banned"]),
    registrationError,
    createdAt,
    updatedAt,
    lastLoginAt: pickString(row, ["last_login_at", "last_sign_in_at", "ultimo_login", "último_login"]),
    onlineStatus: pickString(row, ["live_status", "online_status", "status"]),
    friendsCount: typeof row.friends_count === "number" ? (row.friends_count as number) : null,
    messagesCount: typeof row.messages_count === "number" ? (row.messages_count as number) : null,
    concertsCount: typeof row.concerts_count === "number" ? (row.concerts_count as number) : null,
    accountType: pickString(row, ["account_type", "tipo_cuenta", "plan"]),
    phone,
    avatarUrl,
    authUserId,
    metadata: pickObject(row, "metadata"),
    raw: row,
  };
};
