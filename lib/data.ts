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
