import Link from "next/link";
import { Icon } from "@/components/icon";

type RequestType = { label: string; icon: string; active?: boolean };

const requestTypes: RequestType[] = [
  { label: "가이드 문의", icon: "help_center", active: true },
  { label: "에셋 제작", icon: "brush" },
  { label: "현장 프로덕션", icon: "videocam" },
  { label: "기타", icon: "more_horiz" },
];

const categories = [
  "마케팅 자료",
  "로고 사용",
  "소셜 미디어",
  "웹 및 디지털",
  "인쇄물 에셋",
  "내부 도구",
  "이벤트 및 사이니지",
];

type StepState = "done" | "active" | "pending";
type Step = { label: string; desc: string; state: StepState };

const steps: Step[] = [
  { label: "제출 완료", desc: "DMS 대기열에 즉시 등록됩니다.", state: "done" },
  { label: "분류 및 검토", desc: "브랜드 매니저가 기술 사양을 검토합니다.", state: "active" },
  { label: "디자인 제작", desc: "크리에이티브 팀이 에셋 제작을 시작합니다.", state: "pending" },
  { label: "최종 승인", desc: "에셋이 DMS 포털에 공개됩니다.", state: "pending" },
];

export default function SubmitRequestPage() {
  return (
    <div className="max-w-[1040px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-xs text-secondary mb-xs">
        <Link href="/my-requests" className="text-label-sm hover:text-primary">
          요청 목록
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-label-sm font-semibold text-primary">새 요청</span>
      </div>
      <h1 className="text-h1 font-semibold text-on-surface mb-xl">디자인 요청 제출</h1>

      <div className="flex flex-col lg:flex-row gap-xl items-start">
        {/* 폼 */}
        <section className="flex-1 max-w-[760px] bg-white rounded-xl card-shadow p-xl">
          <form className="space-y-lg" action="/my-requests" method="get">
            {/* 요청 유형 */}
            <div className="space-y-md">
              <label className="text-label-caps text-on-surface-variant">요청 유형</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {requestTypes.map((t) => (
                  <label
                    key={t.label}
                    className={
                      "flex flex-col items-center gap-sm p-md border rounded-xl cursor-pointer transition-colors " +
                      (t.active
                        ? "border-primary bg-primary-fixed/40"
                        : "border-outline-variant hover:bg-surface-container")
                    }
                  >
                    <input
                      type="radio"
                      name="req_type"
                      defaultChecked={t.active}
                      className="hidden"
                    />
                    <Icon
                      name={t.icon}
                      className={t.active ? "text-primary text-[28px]" : "text-secondary text-[28px]"}
                    />
                    <span className="text-label-sm text-center">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div className="space-y-xs">
              <label htmlFor="title" className="text-label-caps text-on-surface-variant">
                요청 제목
              </label>
              <input
                id="title"
                type="text"
                placeholder="예: 2026년 3분기 브랜드 가이드 업데이트"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
              />
            </div>

            {/* 상세 */}
            <div className="space-y-xs">
              <label htmlFor="details" className="text-label-caps text-on-surface-variant">
                프로젝트 상세 내용
              </label>
              <textarea
                id="details"
                rows={6}
                placeholder="타겟 오디언스 및 구체적인 산출물을 포함하여 요청 사항을 상세히 기재해 주세요..."
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
              />
            </div>

            {/* 카테고리·마감일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant">기본 카테고리</label>
                <select className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base">
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant">희망 마감일</label>
                <input
                  type="date"
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
                />
              </div>
            </div>

            {/* 첨부 */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant">첨부 파일</label>
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center gap-md hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="upload_file" className="text-primary text-[28px]" />
                </div>
                <div className="text-center">
                  <p className="text-body-base font-semibold text-on-surface">
                    파일을 여기에 끌어다 놓으세요
                  </p>
                  <p className="text-label-sm text-secondary">
                    또는 클릭하여 컴퓨터에서 탐색 (파일당 최대 50MB)
                  </p>
                </div>
              </div>
            </div>

            {/* 액션 */}
            <div className="pt-lg border-t border-outline-variant flex items-center justify-between">
              <Link
                href="/my-requests"
                className="text-body-base text-secondary hover:text-on-surface font-semibold"
              >
                취소
              </Link>
              <button
                type="submit"
                className="bg-primary-container text-on-primary px-xl py-md rounded-xl text-h3 font-semibold hover:opacity-90 transition-opacity flex items-center gap-sm shadow-lg shadow-primary/10"
              >
                요청 제출하기
                <Icon name="send" className="text-[20px]" />
              </button>
            </div>
          </form>
        </section>

        {/* 사이드 */}
        <aside className="w-full lg:w-[260px] space-y-lg">
          <div className="bg-secondary-container rounded-xl p-lg card-shadow">
            <h3 className="text-h3 font-semibold text-on-secondary-fixed mb-lg">제출 후 단계는?</h3>
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-outline-variant" />
              {steps.map((s, i) => (
                <div
                  key={s.label}
                  className={"relative flex items-start gap-md " + (i < steps.length - 1 ? "pb-xl" : "")}
                >
                  <div
                    className={
                      "relative z-10 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-secondary-container " +
                      (s.state === "done"
                        ? "bg-primary"
                        : s.state === "active"
                          ? "bg-surface-container-highest border-2 border-primary"
                          : "bg-white border-2 border-outline-variant")
                    }
                  >
                    {s.state === "done" ? (
                      <Icon name="check" className="text-[14px] text-white" />
                    ) : s.state === "active" ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <div>
                    <p
                      className={
                        "text-label-sm font-bold " +
                        (s.state === "active"
                          ? "text-primary"
                          : s.state === "done"
                            ? "text-on-surface"
                            : "text-on-surface-variant")
                      }
                    >
                      {s.label}
                    </p>
                    <p className="text-label-sm text-secondary">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant border-dashed">
            <div className="flex items-center gap-sm text-primary mb-sm">
              <Icon name="info" className="text-[20px]" />
              <span className="text-label-sm font-bold">도움이 필요하신가요?</span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              <Link href="#" className="text-primary underline">
                크리에이티브 FAQ
              </Link>
              를 확인하거나 디자인 데스크(내선 552)로 문의해 주세요.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
