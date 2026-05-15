import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { getRequest, statusMeta } from "@/lib/data";

const referenceFiles = [
  {
    name: "Moodboard_01.pdf",
    img: "https://picsum.photos/seed/ref-1/600/340",
  },
  {
    name: "Brand_Palette_V2.png",
    img: "https://picsum.photos/seed/ref-2/600/340",
  },
  {
    name: "Icon_Style_Guide.pdf",
    img: "https://picsum.photos/seed/ref-3/600/340",
  },
];

const stepperSteps = [
  { label: "제출됨", meta: "5월 9일, 오전 09:15", state: "done" },
  { label: "검토 중", meta: "5월 10일, 오후 02:30", state: "done" },
  { label: "진행 중", meta: "예상 완료일: 5월 19일", state: "active" },
  { label: "완료", meta: "최종 에셋 대기 중", state: "pending" },
] as const;

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const req = getRequest(params.id);
  if (!req) notFound();
  const s = statusMeta[req.status];

  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      {/* Breadcrumb + 헤더 */}
      <div>
        <div className="flex items-center gap-xs text-secondary mb-xs">
          <Link href="/my-requests" className="text-label-sm hover:text-primary">
            요청 목록
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-label-sm font-semibold text-primary">#{req.id}</span>
        </div>
        <div className="flex items-center justify-between gap-md">
          <h1 className="text-h1 font-semibold text-on-surface">{req.title}</h1>
          <span
            className={`inline-flex items-center gap-sm px-md py-xs rounded-full bg-tertiary-fixed text-tertiary text-label-sm font-semibold`}
          >
            <span className={`w-2 h-2 rounded-full ${s.dotClass}`} />
            {s.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg items-start">
        {/* 좌측: 설명 + 참조 파일 + 액션 */}
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          {/* 설명 */}
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md">요청 설명</h3>
            <p className="text-body-base text-on-surface-variant leading-relaxed mb-lg">
              {req.description ??
                "이 요청에 대한 상세 설명이 아직 작성되지 않았습니다. 담당자가 추가 정보를 곧 업데이트할 예정입니다."}
            </p>
            <div className="grid grid-cols-2 gap-xl">
              <div>
                <h4 className="text-label-caps text-outline mb-sm">카테고리</h4>
                <div className="flex flex-wrap gap-xs">
                  <span className="px-sm py-xs bg-surface-container text-primary text-label-sm rounded-lg">
                    {req.category ?? "분류 없음"}
                  </span>
                  <span className="px-sm py-xs bg-surface-container text-primary text-label-sm rounded-lg">
                    {req.type}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-label-caps text-outline mb-sm">마감일</h4>
                <div className="flex items-center gap-sm text-body-base font-semibold">
                  <Icon name="calendar_today" className="text-primary text-[18px]" />
                  {req.deadline}
                </div>
              </div>
            </div>
          </div>

          {/* 참조 파일 */}
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-h3 font-semibold">참조 파일</h3>
              <span className="text-label-sm text-primary font-medium cursor-pointer">전체 보기 (3)</span>
            </div>
            <div className="grid grid-cols-3 gap-md">
              {referenceFiles.map((f) => (
                <div
                  key={f.name}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-outline-variant cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.img}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-on-background/10 group-hover:bg-on-background/20 transition-colors" />
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-xs rounded text-[10px] truncate">
                    {f.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 액션 */}
          <div className="pt-lg border-t border-outline-variant flex justify-start">
            <button className="px-xl py-sm border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors">
              요청 취소
            </button>
          </div>
        </div>

        {/* 우측: 상태 + 댓글 */}
        <div className="col-span-12 lg:col-span-4 space-y-lg">
          {/* 상태 스테퍼 */}
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-lg">요청 상태</h3>
            <div className="relative pl-8 space-y-xl">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-outline-variant" />
              {stepperSteps.map((step) => (
                <div key={step.label} className="relative">
                  <div
                    className={
                      "absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 " +
                      (step.state === "done"
                        ? "bg-primary text-on-primary"
                        : step.state === "active"
                          ? "bg-tertiary-fixed text-tertiary border-2 border-tertiary"
                          : "bg-surface-container border border-outline-variant")
                    }
                  >
                    {step.state === "done" ? (
                      <Icon name="check" className="text-[16px]" />
                    ) : step.state === "active" ? (
                      <div className="w-2 h-2 bg-tertiary rounded-full" />
                    ) : null}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={
                        "text-body-base font-semibold " +
                        (step.state === "active"
                          ? "text-tertiary"
                          : step.state === "pending"
                            ? "text-outline"
                            : "")
                      }
                    >
                      {step.label}
                    </span>
                    <span
                      className={
                        "text-label-sm " +
                        (step.state === "pending" ? "text-outline" : "text-on-surface-variant")
                      }
                    >
                      {step.meta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-xl pt-lg border-t border-outline-variant">
              <h4 className="text-label-caps text-outline mb-md">배정된 에디터</h4>
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                  DC
                </div>
                <div>
                  <p className="text-body-base font-semibold">David Chen</p>
                  <p className="text-label-sm text-on-surface-variant">시니어 비주얼 디자이너</p>
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 */}
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30 flex flex-col">
            <h3 className="text-h3 font-semibold mb-md">활동 및 댓글</h3>
            <div className="flex-1 space-y-md mb-md max-h-[280px] overflow-y-auto pr-sm">
              <div className="bg-surface-container-low p-md rounded-lg rounded-tl-none border border-outline-variant/30">
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-label-sm font-bold text-primary">David Chen</span>
                  <span className="text-[10px] text-outline">어제, 오후 4:10</span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  기본 아이콘 그리드 작업을 시작했습니다. 아이콘을 엄격하게 아웃라인 중심으로 가야 할까요, 아니면
                  주요 요소에 약간의 면 채우기를 포함해도 될까요?
                </p>
              </div>
              <div className="flex justify-center">
                <span className="bg-surface px-sm text-[10px] text-outline italic">
                  David Chen에 의해 상태가 '진행 중'으로 변경되었습니다.
                </span>
              </div>
            </div>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="답글 작성..."
                className="w-full bg-surface-bright border border-outline-variant rounded-lg p-md text-body-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none outline-none"
              />
              <button className="absolute bottom-2 right-2 p-xs bg-primary text-on-primary rounded-lg hover:brightness-95 transition-all">
                <Icon name="send" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
