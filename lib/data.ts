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
  /** 라이브러리 카드용 미리보기 이미지 */
  image: string;
  /**
   * 포맷별 실제 다운로드 파일 URL.
   * 예: { "PNG": "...", "AI": "..." }
   * 비어 있거나 특정 포맷이 없으면 download 시 image 로 폴백.
   */
  files?: Record<string, string>;
  downloads: string;
  uploader: string;
  uploadedAt: string;
  internal?: boolean;
  primary?: boolean;
  related?: string[];
  /** Supabase seed 데이터인지 여부 (true면 읽기 전용) */
  seed?: boolean;
};

// 실제 에셋 데이터는 Supabase `assets` 테이블에서 관리합니다.
// 조회는 `lib/store/assets.ts` 의 listAssets/getAsset 사용.

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

// 실제 가이드라인 데이터는 Supabase `guidelines` 테이블에서 관리합니다.
// 조회는 `lib/store/guidelines.ts` 의 listGuidelines/getGuideline 사용.

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
