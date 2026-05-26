export type ManagerRole = "superadmin" | "moderador" | "soporte";

export type ManagerAppSession = {
  id: string;
  email: string;
  displayName: string;
  role: ManagerRole;
  loggedInAt: string;
};

export type ManagerAppLoginResponse = {
  ok: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: ManagerRole;
  };
};
