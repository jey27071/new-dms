export type NavItem = {
  label: string;
  href: string;
  icon: string;
  match?: (pathname: string) => boolean;
  /** 3단계 메뉴를 위한 하위 항목 (선택) */
  children?: NavItem[];
};

export type NavSection = {
  header?: { label: string; icon: string; href?: string };
  items: NavItem[];
  /** true면 사용자가 chevron으로 펼침/닫힘 토글 가능 */
  collapsible?: boolean;
  /** pathname 기반으로 강제 펼침 (예: 현재 경로가 하위 메뉴 안에 있을 때) */
  openWhen?: (pathname: string) => boolean;
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
        label: "디자인 제작 요청",
        href: "/my-requests",
        icon: "pending_actions",
        match: (p) => p.startsWith("/my-requests"),
      },
    ],
  },
  {
    header: { label: "디자인 템플릿", icon: "dashboard_customize", href: "/design" },
    collapsible: true,
    openWhen: (p) =>
      p === "/design" ||
      p.startsWith("/design/banner") ||
      p.startsWith("/design/notice"),
    items: [
      {
        label: "배너(현수막)",
        href: "/design/banner",
        icon: "image",
        match: (p) => p.startsWith("/design/banner"),
      },
      {
        label: "사내 게시물",
        href: "/design/notice",
        icon: "campaign",
        match: (p) => p.startsWith("/design/notice"),
      },
    ],
  },
  {
    header: { label: "AI로 디자인 하기", icon: "auto_fix_high", href: "/design/ai" },
    collapsible: true,
    openWhen: (p) => p.startsWith("/design/ai") || p.startsWith("/design/prompts"),
    items: [
      {
        label: "AI 프롬프트 라이브러리",
        href: "/design/prompts",
        icon: "lightbulb",
        match: (p) => p.startsWith("/design/prompts"),
      },
      {
        label: "AI로 생성하기",
        href: "/design/ai/generate",
        icon: "auto_awesome",
        match: (p) => p.startsWith("/design/ai/generate"),
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
        label: "AI 프롬프트",
        href: "/admin/prompts",
        icon: "lightbulb",
        match: (p) => p.startsWith("/admin/prompts"),
      },
      {
        label: "AI 생성 스타일",
        href: "/admin/ai-styles",
        icon: "auto_fix_high",
        match: (p) => p.startsWith("/admin/ai-styles"),
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
