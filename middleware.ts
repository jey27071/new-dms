// 현재는 가짜 쿠키 인증 사용 중이라 별도 미들웨어 처리 불필요.
// 추후 SSO/Supabase Auth 도입 시 여기서 세션 새로고침 로직 추가.

import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
