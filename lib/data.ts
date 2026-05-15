export type RequestStatus = "review" | "in_progress" | "completed" | "rejected";

export type DesignRequest = {
  id: string;
  title: string;
  type: string;
  status: RequestStatus;
  submittedAt: string;
  deadline: string;
  closedAt?: string;
  assignee: { initials: string; name: string; bg: string };
  category?: string;
  description?: string;
};

export const requests: DesignRequest[] = [
  {
    id: "BR-492",
    title: "신규 캠페인 아이콘",
    type: "에셋 제작",
    status: "review",
    submittedAt: "2026-05-09",
    deadline: "2026-05-19",
    assignee: { initials: "SM", name: "사라 밀러", bg: "bg-secondary-fixed" },
    category: "아이코노그래피",
    description:
      "다가오는 \"Summer Refresh\" 디지털 캠페인을 위한 12개의 맞춤형 아이콘 세트가 필요합니다. 스타일은 현재의 플랫 코포레이트 미학을 유지하되, 테라코타 오렌지 강조색을 사용하여 약간 더 경쾌한 분위기를 주어야 합니다.",
  },
  {
    id: "BR-488",
    title: "Q4 뉴스레터 배너",
    type: "수정 요청",
    status: "in_progress",
    submittedAt: "2026-05-05",
    deadline: "2026-05-14",
    assignee: { initials: "JD", name: "제임스 도", bg: "bg-primary-fixed-dim" },
    category: "디지털 마케팅",
  },
  {
    id: "BR-485",
    title: "업데이트된 브랜드 키트 2.0",
    type: "에셋 제작",
    status: "completed",
    submittedAt: "2026-04-30",
    deadline: "2026-05-07",
    closedAt: "2026-05-07",
    assignee: { initials: "AC", name: "알렉스 첸", bg: "bg-tertiary-fixed" },
    category: "브랜드 시스템",
  },
  {
    id: "BR-481",
    title: "이벤트 브로셔 디자인",
    type: "에셋 제작",
    status: "rejected",
    submittedAt: "2026-04-25",
    deadline: "2026-05-02",
    closedAt: "2026-04-27",
    assignee: { initials: "BH", name: "베스 H.", bg: "bg-error-container" },
    category: "이벤트 및 사이니지",
  },
];

export const statusMeta: Record<
  RequestStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  review: { label: "검토 중", dotClass: "bg-primary", textClass: "text-primary" },
  in_progress: { label: "진행 중", dotClass: "bg-amber-500", textClass: "text-amber-600" },
  completed: { label: "완료됨", dotClass: "bg-emerald-500", textClass: "text-emerald-600" },
  rejected: { label: "반려됨", dotClass: "bg-error", textClass: "text-error" },
};

export function getRequest(id: string) {
  return requests.find((r) => r.id === id);
}

// ===== 에셋 =====

export type AssetCategory =
  | "logo"
  | "icon"
  | "photo"
  | "template"
  | "social"
  | "typography"
  | "style";

export const assetCategoryLabel: Record<AssetCategory, string> = {
  logo: "로고",
  icon: "아이콘",
  photo: "사진",
  template: "템플릿",
  social: "소셜 미디어",
  typography: "타이포그래피",
  style: "스타일 가이드",
};

export type AssetFormat = "AI" | "PNG" | "PDF" | "SVG" | "EPS" | "ZIP" | "MP4" | "FIG" | "ASE";

export type Asset = {
  id: string;
  title: string;
  description?: string;
  category: AssetCategory;
  formats: AssetFormat[];
  image: string;
  downloads: string;
  uploader: string;
  uploadedAt: string;
  internal?: boolean;
  primary?: boolean;
  related?: string[];
  /** Supabase seed 데이터인지 여부 (true면 읽기 전용) */
  seed?: boolean;
};

export const assets: Asset[] = [
  {
    id: "1",
    title: "기업 로고 v1.2",
    description:
      "모든 주요 브랜드 커뮤니케이션에 이 마스터 파일을 사용하십시오. 로고 너비의 20%에 해당하는 최소 여백을 사방에 확보하십시오. 색상이나 비율을 변경하지 마십시오.",
    category: "logo",
    formats: ["AI", "PNG"],
    image: "https://picsum.photos/seed/asset-1/800/600",
    downloads: "2.4k",
    uploader: "Sarah Miller",
    uploadedAt: "2026-04-22",
    internal: true,
    primary: true,
    related: ["2", "5", "6", "7"],
  },
  {
    id: "2",
    title: "보조 브랜드 조합",
    category: "logo",
    formats: ["SVG"],
    image: "https://picsum.photos/seed/asset-2/800/600",
    downloads: "1.8k",
    uploader: "Sarah Miller",
    uploadedAt: "2026-04-15",
  },
  {
    id: "3",
    title: "아이코노그래피 세트 v2",
    category: "icon",
    formats: ["AI", "PDF"],
    image: "https://picsum.photos/seed/asset-3/800/600",
    downloads: "5.2k",
    uploader: "James Do",
    uploadedAt: "2026-04-10",
  },
  {
    id: "4",
    title: "브랜드 변천사 키트",
    category: "template",
    formats: ["AI"],
    image: "https://picsum.photos/seed/asset-4/800/600",
    downloads: "840",
    uploader: "Alex Chen",
    uploadedAt: "2026-04-02",
  },
  {
    id: "5",
    title: "흑백 워드마크",
    category: "logo",
    formats: ["PNG"],
    image: "https://picsum.photos/seed/asset-5/800/600",
    downloads: "1.1k",
    uploader: "Sarah Miller",
    uploadedAt: "2026-03-28",
  },
  {
    id: "6",
    title: "파트너 에셋 팩",
    category: "photo",
    formats: ["PNG"],
    image: "https://picsum.photos/seed/asset-6/800/600",
    downloads: "3.4k",
    uploader: "Beth H.",
    uploadedAt: "2026-03-22",
  },
  {
    id: "7",
    title: "UI 아이콘 라이브러리",
    category: "icon",
    formats: ["SVG", "FIG"],
    image: "https://picsum.photos/seed/asset-7/800/600",
    downloads: "920",
    uploader: "James Do",
    uploadedAt: "2026-03-15",
  },
  {
    id: "8",
    title: "소셜 미디어 키트",
    category: "social",
    formats: ["ZIP", "MP4"],
    image: "https://picsum.photos/seed/asset-8/800/600",
    downloads: "612",
    uploader: "Alex Chen",
    uploadedAt: "2026-03-10",
  },
  {
    id: "9",
    title: "브랜드 컬러 팔레트",
    category: "style",
    formats: ["PDF", "ASE"],
    image: "https://picsum.photos/seed/asset-9/800/600",
    downloads: "488",
    uploader: "Sarah Miller",
    uploadedAt: "2026-03-05",
  },
];

export function getAsset(id: string) {
  return assets.find((a) => a.id === id);
}

// ===== 가이드라인 =====

export type Guideline = {
  id: string;
  title: string;
  version: string;
  category: string;
  updatedAt: string;
  notes: string;
  tags: string[];
  cover: string;
  pages: number;
};

export const guidelines: Guideline[] = [
  {
    id: "brand-identity-v23",
    title: "브랜드 아이덴티티 가이드라인",
    version: "v2.3",
    category: "가이드",
    updatedAt: "2026-04-24",
    notes:
      "이번 버전에는 업데이트된 소셜 미디어 안전 영역, 새로운 3차 색상 팔레트 통합, 그리고 모바일 애플리케이션 아이콘 렌더링에 대한 정제된 가이드라인이 포함되어 있습니다.",
    tags: ["#기업", "#로고-사용", "#색상", "#타이포그래피"],
    cover: "https://picsum.photos/seed/guide-1/800/1130",
    pages: 48,
  },
  {
    id: "social-media-kit",
    title: "소셜 미디어 키트",
    version: "v1.4",
    category: "에셋 키트",
    updatedAt: "2026-04-18",
    notes: "LinkedIn, Twitter, Instagram 캠페인을 위한 전체 템플릿 세트입니다.",
    tags: ["#소셜", "#템플릿", "#캠페인"],
    cover: "https://picsum.photos/seed/guide-2/800/1130",
    pages: 22,
  },
  {
    id: "email-signature",
    title: "이메일 서명 정책",
    version: "v1.0",
    category: "정책",
    updatedAt: "2026-03-30",
    notes: "모든 기업 이메일 통신을 위한 서식 규칙 및 법적 고지 사항입니다.",
    tags: ["#정책", "#이메일", "#내부"],
    cover: "https://picsum.photos/seed/guide-3/800/1130",
    pages: 12,
  },
];

export function getGuideline(id: string) {
  return guidelines.find((g) => g.id === id);
}
