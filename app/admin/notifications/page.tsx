import { redirect } from "next/navigation";

// Phase J 부터 알림 설정은 사용자 관리(관리자 탭)로 통합됨.
// 옛 링크가 남아있을 가능성에 대비해 자동 리다이렉트만 수행.
export default function NotificationsRedirectPage() {
  redirect("/admin/users");
}
