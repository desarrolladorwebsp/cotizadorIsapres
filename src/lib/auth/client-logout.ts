import { STAFF_LOGIN_PATH } from "@/lib/auth/constants";

/** Cierra sesión staff: borra cookies httpOnly vía API y recarga en el login. */
export async function performStaffLogout(
  loginPath: string = STAFF_LOGIN_PATH,
): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  } finally {
    window.location.assign(loginPath);
  }
}
