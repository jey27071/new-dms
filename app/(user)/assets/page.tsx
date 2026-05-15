"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { assetCategoryLabel, type Asset, type AssetCategory, type AssetFormat } from "@/lib/data";
import { listAssets } from "@/lib/store/assets";

const categories: AssetCategory[] = [
  "logo",
  "icon",
  "photo",
  "template",
  "social",
  "typography",
  "style",
];

const formats: AssetFormat[] = ["AI", "PNG", "PDF", "SVG"];

export default function AssetLibraryPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(listAssets());
    setMounted(true);
  }, []);

  const visible = items.slice(0, 9);

  return (
    <div className="flex max-w-[1280px] mx-auto -mt-md">
      {/* 좌측 필터 */}
      <aside className="w-[220px] p-lg border-r border-outline-variant bg-surface-container-low min-h-[calc(100vh-160px)] space-y-xl">
        <div>
          <h3 className="text-label-caps text-on-surface-variant mb-md">카테고리</h3>
          <div className="space-y-sm">
            {categories.map((c, i) => (
              <label key={c} className="flex items-center gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={i === 0}
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-body-sm">{assetCategoryLabel[c]}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-label-caps text-on-surface-variant mb-md">에셋 유형</h3>
          <select className="w-full bg-white border border-outline-variant rounded-lg text-body-sm p-xs focus:ring-2 focus:ring-primary/10 outline-none">
            <option>모든 유형</option>
            <option>벡터</option>
            <option>래스터</option>
            <option>문서</option>
          </select>
        </div>

        <div>
          <h3 className="text-label-caps text-on-surface-variant mb-md">파일 형식</h3>
          <div className="grid grid-cols-2 gap-xs">
            {formats.map((f) => (
              <button
                key={f}
                className="bg-white border border-outline-variant py-xs text-label-sm rounded-lg hover:bg-surface-container-high"
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-label-caps text-on-surface-variant mb-md">날짜 범위</h3>
          <div className="space-y-xs">
            <input
              type="date"
              className="w-full bg-white border border-outline-variant rounded-lg text-body-sm p-xs"
            />
            <input
              type="date"
              className="w-full bg-white border border-outline-variant rounded-lg text-body-sm p-xs"
            />
          </div>
        </div>

        <div className="pt-md">
          <button className="w-full text-secondary hover:text-primary text-label-sm transition-colors text-left flex items-center gap-xs">
            <Icon name="restart_alt" className="text-[18px]" />
            필터 초기화
          </button>
        </div>
      </aside>

      {/* 결과 영역 */}
      <section className="flex-1 p-xl">
        <div className="flex justify-between items-end mb-xl">
          <div>
            <h1 className="text-h1 font-semibold text-on-surface">
              {mounted ? `${items.length}개의 에셋` : "에셋 라이브러리"}
            </h1>
            <p className="text-body-base text-on-surface-variant mt-xs">
              브랜드 가이드에 맞는 검증된 에셋을 검색·다운로드하세요.
            </p>
          </div>
          <div className="flex items-center gap-md">
            <span className="text-label-sm text-secondary">정렬:</span>
            <select className="bg-transparent border-none text-label-sm text-primary p-0 pr-xl focus:ring-0 cursor-pointer outline-none">
              <option>최신순</option>
              <option>오래된순</option>
              <option>최다 다운로드순</option>
            </select>
          </div>
        </div>

        {!mounted ? (
          <div className="grid grid-cols-3 gap-lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white card-shadow rounded-xl p-md animate-pulse">
                <div className="aspect-[4/3] rounded-lg bg-surface-container mb-md" />
                <div className="h-4 bg-surface-container rounded mb-xs w-3/4" />
                <div className="h-3 bg-surface-container rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-lg">
            {visible.map((a) => (
              <Link
                key={a.id}
                href={`/assets/${a.id}`}
                className="bg-white card-shadow rounded-xl p-md flex flex-col group transition-all hover:scale-[1.01] hover:border-primary-fixed border border-transparent"
              >
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-md bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                  <span className="absolute top-sm right-sm p-xs bg-white/80 rounded-full inline-flex">
                    <Icon name="bookmark" className="text-secondary text-[20px]" />
                  </span>
                </div>
                <h4 className="text-h3 font-semibold text-on-surface mb-xs">{a.title}</h4>
                <div className="flex gap-xs mb-md flex-wrap">
                  <span className="px-xs py-[2px] bg-surface-container text-label-sm text-on-surface-variant rounded">
                    {assetCategoryLabel[a.category]}
                  </span>
                  {a.formats.map((f, idx) => (
                    <span
                      key={f}
                      className={
                        "px-xs py-[2px] text-label-sm rounded " +
                        (idx === 0
                          ? "bg-primary-fixed text-on-primary-fixed-variant"
                          : "bg-secondary-fixed text-on-secondary-fixed-variant")
                      }
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-xs text-secondary">
                    <Icon name="download" className="text-[16px]" />
                    <span className="text-label-sm">{a.downloads} 다운로드</span>
                  </div>
                  <span className="bg-primary text-on-primary px-md py-xs rounded-lg text-label-sm font-semibold">
                    다운로드
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
