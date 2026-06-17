export const AUTH_REALM = {
  admin: "admin",
  executive: "executive",
} as const;

export type AuthRealm = (typeof AUTH_REALM)[keyof typeof AUTH_REALM];

export const SESSION_COOKIE = {
  admin: "ci_admin_session",
  executive: "ci_executive_session",
} as const;

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 horas

export const LOGIN_LOCKOUT = {
  maxAttempts: 5,
  lockMinutes: 15,
} as const;

export const PASSWORD_MIN_LENGTH = 8;

export const ADMIN_LOGIN_PATH = "/cotizador/admin/login";
export const EXECUTIVE_LOGIN_PATH = "/cotizador/ejecutivos/login";
export const ADMIN_HOME_PATH = "/cotizador/admin";
export const EXECUTIVE_HOME_PATH = "/cotizador/ejecutivos";
