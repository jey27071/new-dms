// 서버·클라이언트 양쪽에서 쓰는 상수·타입 (cookies() import 없음)

export type Role = "admin" | "viewer";

export const ROLE_COOKIE = "dms-role";
export const EMAIL_COOKIE = "dms-email";

/**
 * @deprecated Phase J 부터는 admins 테이블 기반 판정으로 변경됨.
 * 로그인 시 lib/store/admins.ts 의 isEmailAdmin() 사용.
 * 이 함수는 호환을 위해 남겨둠 (외부 참조 없음).
 */
export function roleFromEmail(email: string): Role {
  return email.trim().toLowerCase().startsWith("admin@") ? "admin" : "viewer";
}
