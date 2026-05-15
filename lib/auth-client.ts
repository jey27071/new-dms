// 클라이언트 컴포넌트에서 쿠키를 읽기 위한 헬퍼

import { type Role, EMAIL_COOKIE, ROLE_COOKIE } from "@/lib/auth-constants";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const target = `${name}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      try {
        return decodeURIComponent(trimmed.substring(target.length));
      } catch {
        return trimmed.substring(target.length);
      }
    }
  }
  return "";
}

export function getClientEmail(): string {
  return readCookie(EMAIL_COOKIE);
}

export function getClientRole(): Role | null {
  const v = readCookie(ROLE_COOKIE);
  if (v === "admin" || v === "viewer") return v;
  return null;
}
