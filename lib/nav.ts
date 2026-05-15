export type NavItem = {
  label: string;
  href: string;
  icon: string;
  match?: (pathname: string) => boolean;
};

export type NavSection = {
  header?: { label: string; icon: string };
  items: NavItem[];
};

// 일반 사용자 영역 — 섹션 단위로 그룹화
export const userNav: NavSection[] = [
  {
    items: [
      { label: "홈", href: "/", icon: "home", match: (p) => p === "/" },
      { label: "에셋", href: "/assets", icon: "inventory_2", match: (p) => p.startsWith("/assets") },
      {
        label: "가이드라인",
        href: "/guidelines",
        icon: "menu_book",
        match: (p) => p.startsWith("/guidelines"),
      },
      {
        label: "내 요청",
        href: "/my-requests",
        icon: "pending_actions",
        match: (p) => p.startsWith("/my-requests"),
      },
    ],
  },
  {
    header: { label: "디자인 제작", icon: "auto_awesome" },
    items: [
      {
        label: "배너 제작",
        href: "/design/banner",
        icon: "image",
        match: (p) => p.startsWith("/design/banner"),
      },
      {
        label: "사내 게시물 제작",
        href: "/design/notice",
        icon: "campaign",
        match: (p) => p.startsWith("/design/notice"),
      },
      {
        label: "AI 프롬프트 라이브러리",
        href: "/design/prompts",
        icon: "lightbulb",
        match: (p) => p.startsWith("/design/prompts"),
      },
    ],
  },
];

// 관리자 영역
export const adminNav: NavSection[] = [
  {
    items: [
      { label: "대시보드", href: "/admin", icon: "space_dashboard", match: (p) => p === "/admin" },
      {
        label: "에셋 관리",
        href: "/admin/assets",
        icon: "folder_managed",
        match: (p) => p.startsWith("/admin/assets"),
      },
      {
        label: "가이드라인 관리",
        href: "/admin/guidelines",
        icon: "rule",
        match: (p) => p.startsWith("/admin/guidelines"),
      },
      {
        label: "배너 템플릿",
        href: "/admin/banner-templates",
        icon: "image",
        match: (p) => p.startsWith("/admin/banner-templates"),
      },
      {
        label: "사내 게시물 템플릿",
        href: "/admin/notice-templates",
        icon: "campaign",
        match: (p) => p.startsWith("/admin/notice-templates"),
      },
      {
        label: "모든 요청",
        href: "/admin/requests",
        icon: "list_alt",
        match: (p) => p.startsWith("/admin/requests"),
      },
      {
        label: "사용자 관리",
        href: "/admin/users",
        icon: "group",
        match: (p) => p.startsWith("/admin/users"),
      },
      {
        label: "카테고리 설정",
        href: "/admin/categories",
        icon: "category",
        match: (p) => p.startsWith("/admin/categories"),
      },
    ],
  },
];
