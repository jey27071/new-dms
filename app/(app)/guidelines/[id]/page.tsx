import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { getGuideline, guidelines } from "@/lib/data";

export default function GuidelineDetailPage({ params }: { params: { id: string } }) {
  const guideline = getGuideline(params.id);
  if (!guideline) notFound();

  const related = guidelines.filter((g) => g.id !== guideline.id).slice(0, 2);

  return (
    <div className="max-w-[1280px] mx-auto">
      <nav className="flex items-center gap-xs mb-lg text-body-sm text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">
          홈
        </Link>
        <Icon name="chevron_right" className="text-[16px]" />
        <Link href="/guidelines" className="hover:text-primary transition-colors">
          가이드라인
        </Link>
        <Icon name="chevron_right" className="text-[16px]" />
        <span className="text-on-surface font-semibold">{guideline.title}</span>
      </nav>

      <div className="grid grid-cols-12 gap-xl items-start">
        {/* PDF Viewer */}
        <section className="col-span-8 flex flex-col gap-md">
          <div className="bg-surface-container-high rounded-xl card-shadow overflow-hidden border border-outline-variant">
            {/* Toolbar */}
            <div className="bg-white flex items-center justify-between px-md py-sm border-b border-outline-variant">
              <div className="flex items-center gap-md">
                <div className="flex items-center gap-sm bg-surface-container-low px-sm py-1 rounded-lg border border-outline-variant">
                  <button className="hover:text-primary transition-colors">
                    <Icon name="navigate_before" className="text-[18px]" />
                  </button>
                  <span className="text-label-sm border-x border-outline-variant/30 px-sm">
                    12 / {guideline.pages}
                  </span>
                  <button className="hover:text-primary transition-colors">
                    <Icon name="navigate_next" className="text-[18px]" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button className="p-1 hover:bg-surface-variant rounded">
                  <Icon name="zoom_out" className="text-[20px]" />
                </button>
                <span className="text-label-sm">85%</span>
                <button className="p-1 hover:bg-surface-variant rounded">
                  <Icon name="zoom_in" className="text-[20px]" />
                </button>
                <div className="h-4 w-[1px] bg-outline-variant mx-1" />
                <button className="p-1 hover:bg-surface-variant rounded">
                  <Icon name="fullscreen" className="text-[20px]" />
                </button>
              </div>
            </div>

            {/* PDF Canvas */}
            <div className="aspect-[1/1.414] bg-surface-variant/30 p-lg overflow-y-auto flex justify-center">
              <div className="w-full max-w-[85%] bg-white card-shadow min-h-[600px] p-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={guideline.cover} alt={guideline.title} className="w-full h-auto rounded-lg" />
                <div className="mt-xl space-y-md">
                  <div className="h-2 bg-surface-container-low w-3/4 rounded-full" />
                  <div className="h-2 bg-surface-container-low w-1/2 rounded-full" />
                  <div className="grid grid-cols-4 gap-md pt-lg">
                    <div className="aspect-square bg-primary rounded-lg" />
                    <div className="aspect-square bg-secondary-container rounded-lg" />
                    <div className="aspect-square bg-tertiary-container rounded-lg" />
                    <div className="aspect-square bg-surface-container-highest rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 메타데이터 */}
        <aside className="col-span-4 flex flex-col gap-lg sticky top-24">
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant">
            <div className="flex justify-between items-start mb-sm">
              <span className="bg-surface-container px-sm py-xs rounded-lg text-label-caps text-primary border border-primary/10">
                {guideline.category}
              </span>
              <span className="bg-primary-container text-on-primary-container px-sm py-xs rounded text-label-sm">
                {guideline.version}
              </span>
            </div>
            <h2 className="text-h1 font-semibold text-on-surface mb-xs">{guideline.title}</h2>
            <p className="text-body-sm text-on-surface-variant mb-lg flex items-center gap-xs">
              <Icon name="calendar_today" className="text-[16px]" />
              업데이트: {guideline.updatedAt}
            </p>

            <div className="space-y-lg">
              <div>
                <h4 className="text-label-caps text-secondary mb-sm">업데이트 노트</h4>
                <p className="text-body-base text-on-surface-variant leading-relaxed">
                  {guideline.notes}
                </p>
              </div>
              <div>
                <h4 className="text-label-caps text-secondary mb-sm">태그</h4>
                <div className="flex flex-wrap gap-xs">
                  {guideline.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-surface-container-low px-sm py-1 rounded-full text-label-sm text-secondary border border-outline-variant"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-primary text-on-primary text-h3 font-semibold py-md rounded-xl card-shadow flex items-center justify-center gap-md hover:brightness-95 transition-all">
                <Icon name="download" className="text-[20px]" />
                PDF 다운로드
              </button>
              <button className="w-full bg-surface-container text-on-surface text-label-sm py-sm rounded-lg flex items-center justify-center gap-sm hover:bg-surface-container-high transition-colors">
                <Icon name="share" className="text-[18px]" />
                부서와 공유
              </button>
            </div>
          </div>

          <div className="bg-white p-lg rounded-xl border border-outline-variant border-dashed">
            <p className="text-label-sm text-on-surface-variant mb-sm">
              가이드라인에 대한 도움이 필요하신가요?
            </p>
            <Link href="#" className="text-primary text-label-sm flex items-center gap-xs hover:underline">
              브랜드 전략팀에 문의
              <Icon name="open_in_new" className="text-[14px]" />
            </Link>
          </div>
        </aside>
      </div>

      {/* 관련 가이드라인 */}
      <section className="mt-xl pt-xl border-t border-outline-variant">
        <div className="flex justify-between items-center mb-lg">
          <h3 className="text-h2 font-semibold text-on-surface">관련 가이드라인</h3>
          <Link href="/guidelines" className="text-primary text-label-sm hover:underline">
            전체 가이드라인 보기
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-lg">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/guidelines/${r.id}`}
              className="bg-white p-lg rounded-xl border border-outline-variant card-shadow group hover:border-primary transition-all"
            >
              <div className="w-full h-32 bg-surface-container rounded-lg mb-md overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.cover}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-label-caps text-on-surface border border-outline-variant/30">
                    {r.category}
                  </span>
                </div>
              </div>
              <h4 className="text-h3 font-semibold text-on-surface group-hover:text-primary transition-colors">
                {r.title}
              </h4>
              <p className="text-body-sm text-on-surface-variant mt-sm line-clamp-2">{r.notes}</p>
            </Link>
          ))}
          <div className="bg-surface-container-low p-lg rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center">
            <Icon name="help_outline" className="text-outline text-[32px] mb-sm" />
            <p className="text-label-sm text-on-surface-variant">다른 것을 찾으시나요?</p>
            <Link href="/my-requests/new" className="mt-sm text-primary text-label-sm hover:underline">
              새 가이드 요청하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
