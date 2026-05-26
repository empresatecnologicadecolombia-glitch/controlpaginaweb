export type RegisteredUser = {
  id: string;
  email: string;
  /** Solo si tu tabla guarda la clave en registro (no disponible en Supabase Auth). */
  password: string | null;
  displayName: string | null;
  blocked: boolean;
  registrationError: string | null;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  onlineStatus: string | null;
  friendsCount: number | null;
  messagesCount: number | null;
  concertsCount: number | null;
  accountType: string | null;
  phone: string | null;
  avatarUrl: string | null;
  authUserId: string | null;
  metadata: Record<string, unknown> | null;
  raw: Record<string, unknown>;
};
