import Link from "next/link";
import { Icon } from "@/components/icon";
import { guidelines } from "@/lib/data";

export default function GuidelinesPage() {
  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      <div>
        <h1 className="text-h1 font-semibold text-on-surface">가이드라인</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          브랜드 가이드·정책·에셋 키트 등 모든 공식 문서를 한 곳에서 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-lg">
        {guidelines.map((g) => (
          <Link
            key={g.id}
            href={`/guidelines/${g.id}`}
            className="bg-white p-lg rounded-xl border border-outline-variant card-shadow group hover:border-primary transition-all"
          >
            <div className="w-full h-40 bg-surface-container rounded-lg mb-md overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.cover}
                alt={g.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-white/90 backdrop-blur-sm px-sm py-xs rounded text-label-caps text-on-surface border border-outline-variant/30">
                  {g.category}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-xs">
              <h4 className="text-h3 font-semibold text-on-surface group-hover:text-primary transition-colors">
                {g.title}
              </h4>
              <span className="text-label-sm text-secondary">{g.version}</span>
            </div>
            <p className="text-body-sm text-on-surface-variant line-clamp-2">{g.notes}</p>
            <div className="flex items-center gap-xs text-label-sm text-secondary mt-md">
              <Icon name="calendar_today" className="text-[14px]" />
              {g.updatedAt}
              <span className="mx-xs">·</span>
              <Icon name="description" className="text-[14px]" />
              {g.pages}p
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
