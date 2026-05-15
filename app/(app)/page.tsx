import Link from "next/link";
import { Icon } from "@/components/icon";

const categories = [
  { label: "로고", icon: "category" },
  { label: "폰트", icon: "font_download" },
  { label: "컬러", icon: "palette" },
  { label: "아이콘", icon: "token" },
  { label: "템플릿", icon: "dashboard_customize" },
  { label: "사진", icon: "camera" },
  { label: "소셜 미디어", icon: "share" },
];

const recentlyAdded = [
  {
    tag: "V3 브랜드 리프레시",
    tagColor: "text-primary",
    title: "겨울 마케팅 키트",
    updated: "2시간 전 업데이트됨",
    image: "https://picsum.photos/seed/dms-winter/560/320",
  },
  {
    tag: "로고",
    tagColor: "text-tertiary",
    title: "모노톤 배지 팩",
    updated: "5시간 전 업데이트됨",
    image: "https://picsum.photos/seed/dms-mono/560/320",
  },
  {
    tag: "아이콘",
    tagColor: "text-primary",
    title: "커스텀 UI 아이콘 세트",
    updated: "어제 업데이트됨",
    image: "https://picsum.photos/seed/dms-icon/560/320",
  },
  {
    tag: "가이드라인",
    tagColor: "text-secondary",
    title: "브랜드 보이스 매뉴얼",
    updated: "2일 전 업데이트됨",
    image: "https://picsum.photos/seed/dms-voice/560/320",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-xl">
      {/* 디자인 탐색 */}
      <section>
        <h2 className="text-h1 font-semibold text-on-background mb-lg">디자인 탐색</h2>
        <div className="grid grid-cols-7 gap-md">
          {categories.map((c) => (
            <Link
              key={c.label}
              href="/assets"
              className="group flex flex-col items-center justify-center p-lg bg-surface-container-low rounded-xl hover:bg-primary-fixed transition-colors gap-sm"
            >
              <Icon
                name={c.icon}
                className="text-primary text-[28px] group-hover:scale-110 transition-transform"
              />
              <span className="text-label-sm text-on-surface-variant group-hover:text-primary">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 추가됨 */}
      <section>
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-h2 font-semibold text-on-background">최근 추가됨</h3>
          <Link href="/assets" className="text-label-sm text-primary font-bold hover:underline">
            전체 보기
          </Link>
        </div>
        <div className="flex gap-lg overflow-x-auto pb-md hide-scrollbar">
          {recentlyAdded.map((card) => (
            <Link
              key={card.title}
              href="/assets/1"
              className="flex-none w-[280px] bg-white rounded-xl card-shadow overflow-hidden p-md group cursor-pointer border border-transparent hover:border-primary-fixed transition-all"
            >
              <div className="h-40 rounded-lg bg-surface-container overflow-hidden mb-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={card.title}
                  src={card.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className={`text-label-caps ${card.tagColor} mb-xs block`}>{card.tag}</span>
              <h4 className="text-h3 font-semibold text-on-surface truncate">{card.title}</h4>
              <p className="text-body-sm text-secondary mt-xs">{card.updated}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 이번 달 인기 에셋 */}
      <section>
        <h3 className="text-h2 font-semibold text-on-background mb-md">이번 달 인기 에셋</h3>
        <div className="grid grid-cols-4 gap-lg">
          {/* 팔레트 */}
          <div className="bg-white rounded-xl card-shadow p-md flex flex-col hover:shadow-lg transition-shadow border border-outline-variant/30">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center">
                <Icon name="format_paint" className="text-primary text-[24px]" />
              </div>
              <div>
                <h4 className="text-h3 font-semibold">기본 팔레트</h4>
                <p className="text-label-sm text-secondary">컬러 · 1.2k 다운로드</p>
              </div>
            </div>
            <div className="flex gap-xs h-4 rounded-full overflow-hidden">
              <div className="flex-1 bg-primary" />
              <div className="flex-1 bg-primary-container" />
              <div className="flex-1 bg-surface-container-highest" />
              <div className="flex-1 bg-secondary" />
            </div>
          </div>

          {/* 키노트 */}
          <div className="bg-white rounded-xl card-shadow p-md flex flex-col hover:shadow-lg transition-shadow border border-outline-variant/30">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center">
                <Icon name="article" className="text-tertiary text-[24px]" />
              </div>
              <div>
                <h4 className="text-h3 font-semibold">키노트 템플릿</h4>
                <p className="text-label-sm text-secondary">템플릿 · 840 다운로드</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <span className="text-body-sm text-on-surface-variant italic">v2.4 출시됨</span>
              <Icon name="download" className="text-outline-variant text-[20px]" />
            </div>
          </div>

          {/* 라이프스타일 */}
          <div className="bg-white rounded-xl card-shadow p-md flex flex-col hover:shadow-lg transition-shadow border border-outline-variant/30">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                <Icon name="imagesmode" className="text-secondary text-[24px]" />
              </div>
              <div>
                <h4 className="text-h3 font-semibold">오피스 라이프스타일</h4>
                <p className="text-label-sm text-secondary">사진 · 612 다운로드</p>
              </div>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-500" />
            </div>
          </div>

          {/* 마스터 로고 키트 */}
          <div className="bg-white rounded-xl card-shadow p-md flex flex-col hover:shadow-lg transition-shadow border border-outline-variant/30">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-lg bg-primary-fixed-dim flex items-center justify-center">
                <Icon name="verified" className="text-on-primary-fixed-variant text-[24px]" />
              </div>
              <div>
                <h4 className="text-h3 font-semibold">마스터 로고 키트</h4>
                <p className="text-label-sm text-secondary">로고 · 2.5k 다운로드</p>
              </div>
            </div>
            <div className="bg-secondary-container rounded px-sm py-xs self-start">
              <span className="text-[10px] font-bold text-on-secondary-fixed-variant">승인된 에셋</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 배너 */}
      <section>
        <div className="relative w-full rounded-xl bg-primary-container p-xl overflow-hidden">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-on-primary-container/10 -skew-x-12 translate-x-1/2" />
          <div className="absolute right-12 top-0 w-1/4 h-full bg-on-primary-container/5 -skew-x-12 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div className="max-w-xl">
              <h2 className="text-h1 font-semibold text-on-primary-container mb-xs">
                필요한 에셋을 찾을 수 없나요?
              </h2>
              <p className="text-body-base text-on-primary-container/80">
                디자인 팀에 공식 요청을 보내주세요. 커스텀 브랜드 에셋의 제작 과정을 처음부터 끝까지 추적해
                드립니다.
              </p>
            </div>
            <Link
              href="/my-requests/new"
              className="inline-flex items-center gap-sm px-xl py-lg bg-white text-primary font-bold rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
            >
              요청하기
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
