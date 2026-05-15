import Link from "next/link";
import { Icon } from "@/components/icon";
import { requests, statusMeta } from "@/lib/data";

const stats = [
  { label: "전체 요청", value: "24", hint: "이번 주 +2", hintClass: "text-primary" },
  { label: "검토 대기", value: "08", dot: true },
  { label: "완료됨", value: "12", hint: "완료율 85%", hintClass: "text-secondary" },
  { label: "긴급 마감", value: "03", warning: true },
] as const;

const tabs = ["전체", "진행 중", "완료됨", "반려됨"];

export default function MyRequestsPage() {
  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">내 요청</h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            현재 활성화된 브랜드 에셋 요청을 관리하고 추적하세요.
          </p>
        </div>
        <div className="flex gap-sm p-xs bg-surface-container-low rounded-xl">
          {tabs.map((t, i) => (
            <button
              key={t}
              className={
                "px-md py-xs text-label-sm rounded-lg transition-colors " +
                (i === 0
                  ? "bg-white text-primary card-shadow"
                  : "text-secondary hover:bg-white/50")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-lg">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-lg rounded-xl card-shadow flex flex-col gap-xs">
            <span className="text-label-caps text-secondary">{s.label}</span>
            <div className="flex items-baseline gap-sm">
              <span className={"text-h1 font-semibold " + (s.warning ? "text-tertiary" : "")}>
                {s.value}
              </span>
              {s.hint ? <span className={"text-label-sm " + s.hintClass}>{s.hint}</span> : null}
              {s.dot ? <span className="w-2 h-2 rounded-full bg-primary-container" /> : null}
              {s.warning ? <Icon name="warning" className="text-tertiary text-[16px]" /> : null}
            </div>
          </div>
        ))}
      </div>

      {/* 요청 테이블 */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-md">
            <h3 className="text-h3 font-semibold">요청 큐</h3>
            <span className="bg-surface-container text-primary px-sm py-xs rounded text-label-sm">
              12개 활성
            </span>
          </div>
          <div className="flex gap-sm">
            <button className="p-xs border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
              <Icon name="filter_list" className="text-secondary text-[20px]" />
            </button>
            <button className="p-xs border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
              <Icon name="download" className="text-secondary text-[20px]" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest">
              <tr>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  요청 번호
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  제목 및 유형
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  상태
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  타임라인
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  담당자
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {requests.map((r) => {
                const s = statusMeta[r.status];
                return (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-lg text-body-sm font-semibold text-primary">#{r.id}</td>
                    <td className="px-lg py-lg">
                      <div className="text-body-base font-semibold text-on-surface">{r.title}</div>
                      <div className="text-body-sm text-secondary">{r.type}</div>
                    </td>
                    <td className="px-lg py-lg">
                      <div className="flex items-center gap-sm">
                        <div className={`w-2 h-2 rounded-full ${s.dotClass}`} />
                        <span className="text-body-sm">{s.label}</span>
                      </div>
                    </td>
                    <td className="px-lg py-lg">
                      <div className="text-body-sm">제출: {r.submittedAt}</div>
                      <div
                        className={
                          "text-body-sm " +
                          (r.status === "completed" || r.status === "rejected"
                            ? "text-secondary"
                            : "text-tertiary font-medium")
                        }
                      >
                        {r.closedAt
                          ? r.status === "completed"
                            ? `완료: ${r.closedAt}`
                            : `반려: ${r.closedAt}`
                          : `마감: ${r.deadline}`}
                      </div>
                    </td>
                    <td className="px-lg py-lg">
                      <div className="flex items-center gap-sm">
                        <div
                          className={`w-6 h-6 rounded-full ${r.assignee.bg} flex items-center justify-center text-[10px] font-bold`}
                        >
                          {r.assignee.initials}
                        </div>
                        <span className="text-body-sm">{r.assignee.name}</span>
                      </div>
                    </td>
                    <td className="px-lg py-lg">
                      <Link
                        href={`/my-requests/${r.id}`}
                        className="text-label-sm text-primary hover:underline flex items-center gap-xs"
                      >
                        상세 보기
                        <Icon name="chevron_right" className="text-[16px]" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-lg border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <span className="text-body-sm text-secondary">총 24개의 요청 중 4개 표시 중</span>
          <div className="flex gap-xs">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-secondary hover:bg-surface-container-low">
              <Icon name="keyboard_arrow_left" className="text-[18px]" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary bg-primary-fixed text-primary text-label-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-secondary hover:bg-surface-container-low text-label-sm">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-secondary hover:bg-surface-container-low text-label-sm">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-secondary hover:bg-surface-container-low">
              <Icon name="keyboard_arrow_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* 타임라인 + CTA */}
      <div className="grid grid-cols-2 gap-lg">
        <div className="bg-white p-lg rounded-xl card-shadow">
          <div className="flex items-center justify-between mb-lg">
            <h4 className="text-h3 font-semibold">요청 타임라인</h4>
            <Icon name="more_horiz" className="text-secondary" />
          </div>
          <div className="space-y-lg relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            <TimelineRow
              dotClass="bg-primary text-white"
              icon="check"
              text="#BR-485 요청이 완료되었습니다"
              meta="2시간 전 · 알렉스 첸"
            />
            <TimelineRow
              dotClass="bg-surface-variant"
              text="새 요청 #BR-492가 제출되었습니다"
              meta="5시간 전 · 본인"
              innerDot
            />
            <TimelineRow
              dotClass="bg-tertiary-container text-white"
              icon="priority_high"
              text="#BR-488에 대한 수정이 요청되었습니다"
              meta="어제 · 제임스 도"
            />
          </div>
        </div>

        <div className="bg-primary p-lg rounded-xl card-shadow text-on-primary flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-h3 font-semibold mb-sm">에셋 제작에 도움이 필요하신가요?</h4>
            <p className="text-body-sm opacity-80 mb-lg max-w-[240px]">
              저희 디자인 부서에서 맞춤형 브랜드 소재 제작을 도와드립니다. 평균 소요 시간: 영업일 기준 3일.
            </p>
            <Link
              href="/my-requests/new"
              className="inline-block bg-white text-primary px-lg py-sm rounded-lg text-label-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              새 요청 시작하기
            </Link>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute right-4 top-4 opacity-20">
            <Icon name="auto_awesome" className="text-[120px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  dotClass,
  icon,
  text,
  meta,
  innerDot,
}: {
  dotClass: string;
  icon?: string;
  text: React.ReactNode;
  meta: string;
  innerDot?: boolean;
}) {
  return (
    <div className="flex gap-lg relative">
      <div
        className={`w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 border-4 border-white ${dotClass}`}
      >
        {icon ? <Icon name={icon} className="text-[10px]" /> : null}
        {innerDot ? <div className="w-2 h-2 rounded-full bg-secondary" /> : null}
      </div>
      <div>
        <p className="text-body-sm text-on-surface">{text}</p>
        <p className="text-label-sm text-secondary mt-[2px]">{meta}</p>
      </div>
    </div>
  );
}
