// 서버·클라이언트 양쪽에서 쓰는 상수·타입 (cookies() import 없음)

export type Role = "admin" | "viewer";

export const ROLE_COOKIE = "dms-role";
export const EMAIL_COOKIE = "dms-email";

export function roleFromEmail(email: string): Role {
  return email.trim().toLowerCase().startsWith("admin@") ? "admin" : "viewer";
}
