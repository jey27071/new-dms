import { cookies } from "next/headers";

export type Role = "admin" | "viewer";

export const ROLE_COOKIE = "dms-role";
export const EMAIL_COOKIE = "dms-email";

export function getRole(): Role | null {
  const value = cookies().get(ROLE_COOKIE)?.value;
  if (value === "admin" || value === "viewer") return value;
  return null;
}

export function getEmail(): string | null {
  return cookies().get(EMAIL_COOKIE)?.value ?? null;
}

export function roleFromEmail(email: string): Role {
  return email.trim().toLowerCase().startsWith("admin@") ? "admin" : "viewer";
}
