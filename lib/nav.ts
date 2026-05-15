export type NavItem = {
  label: string;
  href: string;
  icon: string;
  match?: (pathname: string) => boolean;
};

// 일반 사용자 영역 메뉴
export const userNav: NavItem[] = [
  { label: "홈", href: "/", icon: "home", match: (p) => p === "/" },
  { label: "에셋", href: "/assets", icon: "inventory_2", match: (p) => p.startsWith("/assets") },
  { label: "가이드라인", href: "/guidelines", icon: "menu_book", match: (p) => p.startsWith("/guidelines") },
  { label: "내 요청", href: "/my-requests", icon: "pending_actions", match: (p) => p.startsWith("/my-requests") },
  { label: "프리뷰 제작", href: "/preview", icon: "auto_awesome", match: (p) => p.startsWith("/preview") },
];

// 관리자 영역 메뉴
export const adminNav: NavItem[] = [
  { label: "대시보드", href: "/admin", icon: "space_dashboard", match: (p) => p === "/admin" },
  { label: "에셋 관리", href: "/admin/assets", icon: "folder_managed", match: (p) => p.startsWith("/admin/assets") },
  { label: "가이드라인 관리", href: "/admin/guidelines", icon: "rule", match: (p) => p.startsWith("/admin/guidelines") },
  { label: "모든 요청", href: "/admin/requests", icon: "list_alt", match: (p) => p.startsWith("/admin/requests") },
  { label: "사용자 관리", href: "/admin/users", icon: "group", match: (p) => p.startsWith("/admin/users") },
  { label: "카테고리 설정", href: "/admin/categories", icon: "category", match: (p) => p.startsWith("/admin/categories") },
];

// 하위 호환 (기존 import 경로 보존)
export const primaryNav = userNav;
