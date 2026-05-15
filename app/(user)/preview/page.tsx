import { Icon } from "@/components/icon";

type Template = {
  name: string;
  size: string;
  shape: "h-banner" | "v-banner" | "digital" | "sns" | "a4" | "card";
  active?: boolean;
};

const templates: Template[] = [
  { name: "가로형 배너", size: "1200 x 400px", shape: "h-banner", active: true },
  { name: "세로형 배너", size: "400 x 1200px", shape: "v-banner" },
  { name: "디지털 배너", size: "1920 x 1080px", shape: "digital" },
  { name: "SNS 배너", size: "1080 x 1080px", shape: "sns" },
  { name: "A4 공지", size: "210 x 297mm", shape: "a4" },
  { name: "명함", size: "85 x 55mm", shape: "card" },
];

function TemplatePreview({ shape }: { shape: Template["shape"] }) {
  switch (shape) {
    case "h-banner":
      return <div className="w-full h-12 bg-surface-container-high rounded-lg border border-dashed border-outline-variant" />;
    case "v-banner":
      return <div className="w-16 h-full bg-surface-container-low rounded-lg border border-dashed border-outline-variant" />;
    case "digital":
      return <div className="w-full h-24 bg-surface-container-low rounded-lg border border-dashed border-outline-variant" />;
    case "sns":
      return <div className="w-24 h-24 bg-surface-container-low rounded-lg border border-dashed border-outline-variant" />;
    case "a4":
      return <div className="w-20 h-28 bg-surface-container-low rounded-lg border border-dashed border-outline-variant" />;
    case "card":
      return <div className="w-28 h-16 bg-surface-container-low rounded-lg border border-dashed border-outline-variant" />;
  }
}

export default function PreviewCreatorPage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-xl">
      {/* 헤더 */}
      <div>
        <h1 className="text-h1 font-semibold text-on-surface">프리뷰 크리에이터</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          템플릿을 선택하고 텍스트·브랜드 에셋을 편집해 즉시 시안을 만드세요.
        </p>
      </div>

      {/* 템플릿 선택 */}
      <section>
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-h2 font-semibold text-on-surface">템플릿 선택</h2>
          <div className="flex gap-sm">
            <button className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container">
              <Icon name="chevron_left" />
            </button>
            <button className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container">
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
        <div className="flex gap-lg overflow-x-auto pb-md hide-scrollbar">
          {templates.map((t) => (
            <button key={t.name} className="flex-shrink-0 w-48 text-left group">
              <div
                className={
                  "h-32 bg-white rounded-xl card-shadow overflow-hidden mb-sm flex items-center justify-center p-md transition-colors " +
                  (t.active ? "border-2 border-primary" : "border border-outline-variant group-hover:border-primary")
                }
              >
                <TemplatePreview shape={t.shape} />
              </div>
              <p
                className={
                  "text-body-base " + (t.active ? "font-semibold text-on-surface" : "font-medium text-on-surface")
                }
              >
                {t.name}
              </p>
              <p className="text-label-sm text-secondary">{t.size}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 에디터 */}
      <div className="grid grid-cols-12 gap-lg items-start">
        {/* 캔버스 */}
        <div className="col-span-8">
          <div className="bg-surface-container-low rounded-xl p-xl flex items-center justify-center min-h-[600px] border border-outline-variant">
            <div className="w-full max-w-[800px] aspect-[3/1] bg-white card-shadow rounded-xl overflow-hidden relative flex flex-col p-xl">
              <div className="flex justify-between items-start mb-md">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    DMS
                  </div>
                  <div>
                    <p className="text-h3 font-semibold leading-tight">DMS 코퍼레이트</p>
                    <p className="text-label-sm text-secondary">마케팅 부서</p>
                  </div>
                </div>
                <div className="px-md py-xs bg-surface-container text-primary text-label-caps rounded-lg">
                  애셋 프리뷰
                </div>
              </div>
              <div className="flex-1 border-t border-b border-surface-container-high py-lg">
                <h1 className="text-h1 font-semibold text-on-surface mb-sm">
                  통합 시스템을 통한 기업 아이덴티티 강화
                </h1>
                <p className="text-body-base text-on-surface-variant max-w-lg">
                  자동화된 프리뷰 생성 도구로 브랜드 관리 워크플로우를 효율화하세요.
                </p>
              </div>
              <div className="mt-md flex justify-between items-end">
                <p className="text-label-sm text-outline">내부 배포용 · 2026년 2분기</p>
                <div className="flex gap-sm">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  <div className="w-4 h-4 bg-primary-fixed rounded-full" />
                  <div className="w-4 h-4 bg-on-background rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-md flex justify-between items-center text-secondary px-sm">
            <div className="flex items-center gap-md">
              <span className="text-label-sm">배율: 85%</span>
              <div className="flex gap-xs">
                <button className="p-xs hover:bg-surface-container rounded">
                  <Icon name="remove" className="text-[18px]" />
                </button>
                <button className="p-xs hover:bg-surface-container rounded">
                  <Icon name="add" className="text-[18px]" />
                </button>
              </div>
            </div>
            <p className="text-label-sm italic text-error">저장되지 않음 — 닫기 전에 다운로드하세요.</p>
          </div>
        </div>

        {/* 편집 패널 */}
        <div className="col-span-4 bg-white card-shadow rounded-xl border border-outline-variant overflow-hidden">
          <div className="flex border-b border-outline-variant">
            <button className="flex-1 py-md text-label-caps border-b-2 border-primary text-primary">
              텍스트
            </button>
            <button className="flex-1 py-md text-label-caps text-secondary hover:bg-surface-container-low">
              브랜드 에셋
            </button>
          </div>
          <div className="p-lg space-y-lg">
            <div className="space-y-sm">
              <label className="text-label-sm text-on-surface-variant">헤드라인 내용</label>
              <textarea
                rows={3}
                defaultValue="통합 시스템을 통한 기업 아이덴티티 강화"
                className="w-full p-md bg-surface-container-low border border-outline-variant rounded-lg text-body-base focus:ring-2 focus:ring-primary/10 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div className="space-y-sm">
                <label className="text-label-sm text-on-surface-variant">폰트 패밀리</label>
                <select className="w-full p-md bg-surface-container-low border border-outline-variant rounded-lg text-body-base outline-none">
                  <option>Pretendard</option>
                  <option>Inter</option>
                  <option>Noto Sans KR</option>
                </select>
              </div>
              <div className="space-y-sm">
                <label className="text-label-sm text-on-surface-variant">폰트 크기</label>
                <div className="flex">
                  <input
                    type="number"
                    defaultValue={24}
                    className="w-full p-md bg-surface-container-low border border-outline-variant rounded-l-lg text-body-base outline-none"
                  />
                  <span className="p-md bg-surface-container-high border-y border-r border-outline-variant rounded-r-lg text-label-sm text-secondary flex items-center">
                    PX
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-sm">
              <label className="text-label-sm text-on-surface-variant">정렬</label>
              <div className="flex items-center justify-between gap-md">
                <div className="flex bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
                  <button className="p-md hover:bg-surface-container-high border-r border-outline-variant text-on-surface">
                    <Icon name="format_bold" />
                  </button>
                  <button className="p-md hover:bg-surface-container-high text-secondary">
                    <Icon name="format_italic" />
                  </button>
                </div>
                <div className="flex bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden flex-1">
                  <button className="flex-1 p-md hover:bg-surface-container-high border-r border-outline-variant text-on-surface">
                    <Icon name="format_align_left" />
                  </button>
                  <button className="flex-1 p-md hover:bg-surface-container-high border-r border-outline-variant text-secondary">
                    <Icon name="format_align_center" />
                  </button>
                  <button className="flex-1 p-md hover:bg-surface-container-high text-secondary">
                    <Icon name="format_align_right" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-sm">
              <label className="text-label-sm text-on-surface-variant">텍스트 색상</label>
              <div className="flex items-center gap-md p-sm bg-surface-container-low border border-outline-variant rounded-lg">
                <div className="w-8 h-8 rounded bg-on-background border border-outline-variant" />
                <input
                  type="text"
                  defaultValue="#1B1B24"
                  className="bg-transparent border-none focus:ring-0 outline-none text-body-base flex-1"
                />
              </div>
            </div>

            <div className="pt-lg border-t border-outline-variant space-y-md">
              <button className="w-full bg-primary text-on-primary text-label-sm font-semibold py-md rounded-lg flex items-center justify-center gap-md active:scale-[0.98] transition-transform">
                <Icon name="download" className="text-[20px]" />
                PNG 다운로드
              </button>
              <button className="w-full bg-transparent text-primary border border-primary text-label-sm font-semibold py-md rounded-lg flex items-center justify-center gap-md hover:bg-primary/5 transition-colors">
                <Icon name="picture_as_pdf" className="text-[20px]" />
                PDF 다운로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
