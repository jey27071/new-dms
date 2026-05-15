import { cookies } from "next/headers";
import {
  ROLE_COOKIE,
  EMAIL_COOKIE,
  type Role,
  roleFromEmail,
} from "@/lib/auth-constants";

export { ROLE_COOKIE, EMAIL_COOKIE, type Role, roleFromEmail };

export function getRole(): Role | null {
  const value = cookies().get(ROLE_COOKIE)?.value;
  if (value === "admin" || value === "viewer") return value;
  return null;
}

export function getEmail(): string | null {
  return cookies().get(EMAIL_COOKIE)?.value ?? null;
}
