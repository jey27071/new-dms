export type RequestStatus = "review" | "in_progress" | "completed" | "rejected";

export type RequestType = "guide_inquiry" | "asset_create" | "production" | "other";

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  guide_inquiry: "가이드 문의",
  asset_create: "에셋 제작",
  production: "현장 프로덕션",
  other: "기타",
};

export const REQUEST_TYPE_ICON: Record<RequestType, string> = {
  guide_inquiry: "help_center",
  asset_create: "brush",
  production: "videocam",
  other: "more_horiz",
};

export type DesignRequest = {
  id: string;
  title: string;
  type: RequestType;
  description?: string;
  status: RequestStatus;
  category?: string;
  deadline?: string;
  attachments: string[];
  requesterEmail: string;
  requesterName?: string;
  assigneeEmail?: string;
  assigneeName?: string;
  ccEmails: string[];
  submittedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RequestActivityType = "created" | "status_change" | "assignment" | "comment";

export type RequestActivity = {
  id: string;
  requestId: string;
  type: RequestActivityType;
  actorEmail: string;
  actorName?: string;
  data: Record<string, unknown>;
  createdAt: string;
};

export const statusMeta: Record<
  RequestStatus,
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  review: {
    label: "검토 중",
    dotClass: "bg-primary",
    textClass: "text-primary",
    bgClass: "bg-primary-fixed",
  },
  in_progress: {
    label: "진행 중",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600",
    bgClass: "bg-amber-100",
  },
  completed: {
    label: "완료됨",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600",
    bgClass: "bg-emerald-100",
  },
  rejected: {
    label: "반려됨",
    dotClass: "bg-error",
    textClass: "text-error",
    bgClass: "bg-error-container",
  },
};

// ===== 에셋 =====

/**
 * 에셋 카테고리는 DB(`categories` 테이블, domain='asset')에서 관리합니다.
 * 저장값은 라벨 문자열(예: "로고", "아이콘")이며,
 * 초기 시드 데이터의 영문 키("logo", "icon" 등)와의 호환을 위해
 * `getAssetCategoryLabel()` 헬퍼를 사용해 표시 라벨을 결정하세요.
 */

/** 초기 시드 데이터의 영문 키와 한글 라벨 매핑 (호환용) */
export const LEGACY_ASSET_CATEGORY_LABEL: Record<string, string> = {
  logo: "로고",
  icon: "아이콘",
  photo: "사진",
  template: "템플릿",
  social: "소셜 미디어",
  typography: "타이포그래피",
  style: "스타일 가이드",
};

/** DB에 카테고리가 비어있을 때 사용할 기본 카테고리 목록 (라벨) */
export const DEFAULT_ASSET_CATEGORIES = [
  "로고",
  "아이콘",
  "사진",
  "템플릿",
  "소셜 미디어",
  "타이포그래피",
  "스타일 가이드",
] as const;

/**
 * 저장된 카테고리 값을 표시용 라벨로 변환.
 * - 신규 라벨 문자열(예: "로고")은 그대로 반환
 * - 초기 시드의 영문 키(예: "logo")는 한글 라벨로 변환
 * - 알 수 없는 값은 입력 그대로 반환 (사용자 정의 카테고리 보존)
 */
export function getAssetCategoryLabel(category: string): string {
  return LEGACY_ASSET_CATEGORY_LABEL[category] ?? category;
}

export type AssetFormat = "AI" | "PNG" | "PDF" | "SVG" | "EPS" | "ZIP" | "MP4" | "FIG" | "ASE";

export type Asset = {
  id: string;
  title: string;
  description?: string;
  /** DB categories(domain='asset')의 라벨, 또는 초기 시드의 영문 키 */
  category: string;
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
  body?: string;
  tags: string[];
  cover: string;
  owner?: string;
  attachment?: string; // PDF 또는 첨부 파일 URL
  pages: number;
  seed?: boolean;
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

// ===== 배너 템플릿 =====

export type BannerSlot = {
  /** 캔버스 상단 기준 % (0-100) */
  top: number;
  /** 캔버스 좌측 기준 % */
  left: number;
  /** 캔버스 너비 대비 박스 너비 % */
  width: number;
  /** 텍스트 정렬 */
  align: "left" | "center" | "right";
  /** 기본 표시 문구 */
  defaultText: string;
  /** 짧은 변 기준 폰트 크기 비율 (예: 0.12 = 12%) */
  fontScale: number;
};

export type BannerTemplate = {
  id: string;
  name: string;
  description?: string;
  image: string;
  width: number;
  height: number;
  createdBy?: string;
  createdAt: string;
  seed?: boolean;
  headlineSlot: BannerSlot;
  subtitleSlot: BannerSlot;
};

// 사내 게시물 템플릿 — 구조는 배너와 동일, 다른 테이블 사용
export type NoticeTemplate = BannerTemplate;

// ===== AI 프롬프트 =====

export type Prompt = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  prompt: string;
  description?: string;
  example?: string;
  createdBy?: string;
  createdAt: string;
  seed?: boolean;
};

export const PROMPT_CATEGORIES = [
  "텍스트 작성",
  "이미지 생성",
  "코드 작성",
  "분석/요약",
  "번역",
  "마케팅 카피",
  "기타",
] as const;

/** 캔버스 비율에 맞는 기본 슬롯 위치 */
export function computeDefaultSlots(width: number, height: number): {
  headline: BannerSlot;
  subtitle: BannerSlot;
} {
  const aspect = height > 0 ? width / height : 3;
  if (aspect >= 1.5) {
    // 가로 배너
    return {
      headline: { top: 30, left: 6, width: 60, align: "left", fontScale: 0.14, defaultText: "헤드라인을 입력하세요" },
      subtitle: { top: 58, left: 6, width: 60, align: "left", fontScale: 0.06, defaultText: "부제목 또는 안내 문구" },
    };
  }
  if (aspect <= 0.8) {
    // 세로 배너
    return {
      headline: { top: 12, left: 8, width: 84, align: "center", fontScale: 0.08, defaultText: "헤드라인을 입력하세요" },
      subtitle: { top: 26, left: 8, width: 84, align: "center", fontScale: 0.045, defaultText: "부제목 또는 안내 문구" },
    };
  }
  // 정사각 근처
  return {
    headline: { top: 38, left: 8, width: 84, align: "center", fontScale: 0.1, defaultText: "헤드라인을 입력하세요" },
    subtitle: { top: 56, left: 8, width: 84, align: "center", fontScale: 0.05, defaultText: "부제목 또는 안내 문구" },
  };
}
