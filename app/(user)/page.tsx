"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { listAssets } from "@/lib/store/assets";
import { type Asset, getAssetCategoryLabel } from "@/lib/data";

const categories = [
  { label: "로고", icon: "category", filter: "logo" },
  { label: "폰트", icon: "font_download", filter: "typography" },
  { label: "컬러", icon: "palette", filter: "style" },
  { label: "아이콘", icon: "token", filter: "icon" },
  { label: "템플릿", icon: "dashboard_customize", filter: "template" },
  { label: "사진", icon: "camera", filter: "photo" },
  { label: "소셜 미디어", icon: "share", filter: "social" },
];

function relativeTime(date: string): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전 업데이트됨";
  if (min < 60) return `${min}분 전 업데이트됨`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전 업데이트됨`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "어제 업데이트됨";
  if (day < 30) return `${day}일 전 업데이트됨`;
  return `${date.slice(0, 10)} 업데이트됨`;
}

/** "2.4k" / "612" 같은 다운로드 카운트 문자열을 숫자로 변환 */
function parseDownloads(s: string): number {
  if (!s) return 0;
  const m = s.trim().toLowerCase();
  const num = parseFloat(m);
  if (isNaN(num)) return 0;
  if (m.endsWith("k")) return num * 1000;
  if (m.endsWith("m")) return num * 1000000;
  return num;
}

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listAssets().then((result) => {
      if (!cancelled) {
        setAssets(result);
        setMounted(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const recentlyAdded = useMemo(() => {
    return [...assets]
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )
      .slice(0, 6);
  }, [assets]);

  const popular = useMemo(() => {
    return [...assets]
      .sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads))
      .slice(0, 4);
  }, [assets]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-xl">
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
        {!mounted ? (
          <div className="flex gap-lg overflow-x-auto pb-md hide-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-none w-[280px] bg-white rounded-xl card-shadow overflow-hidden p-md animate-pulse"
              >
                <div className="h-40 rounded-lg bg-surface-container mb-sm" />
                <div className="h-3 bg-surface-container rounded w-1/3 mb-xs" />
                <div className="h-5 bg-surface-container rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : recentlyAdded.length === 0 ? (
          <div className="bg-white rounded-xl card-shadow p-xl text-center">
            <Icon name="inventory_2" className="text-secondary text-[40px] mb-sm" />
            <p className="text-body-base text-secondary">아직 등록된 에셋이 없습니다.</p>
          </div>
        ) : (
          <div className="flex gap-lg overflow-x-auto pb-md hide-scrollbar">
            {recentlyAdded.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets/${asset.id}`}
                className="flex-none w-[280px] bg-white rounded-xl card-shadow overflow-hidden p-md group cursor-pointer border border-transparent hover:border-primary-fixed transition-all"
              >
                <div className="h-40 rounded-lg bg-surface-container overflow-hidden mb-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={asset.title}
                    src={asset.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-label-caps text-primary mb-xs block">
                  {getAssetCategoryLabel(asset.category)}
                </span>
                <h4 className="text-h3 font-semibold text-on-surface truncate">{asset.title}</h4>
                <p className="text-body-sm text-secondary mt-xs">{relativeTime(asset.uploadedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 이번 달 인기 에셋 */}
      <section>
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-h2 font-semibold text-on-background">인기 에셋</h3>
          <Link href="/assets" className="text-label-sm text-primary font-bold hover:underline">
            전체 보기
          </Link>
        </div>
        {!mounted ? (
          <div className="grid grid-cols-4 gap-lg">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl card-shadow p-md border border-outline-variant/30 animate-pulse"
              >
                <div className="flex items-center gap-md mb-md">
                  <div className="w-12 h-12 rounded-lg bg-surface-container" />
                  <div className="flex-1">
                    <div className="h-4 bg-surface-container rounded mb-xs w-2/3" />
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-surface-container rounded" />
              </div>
            ))}
          </div>
        ) : popular.length === 0 ? null : (
          <div className="grid grid-cols-4 gap-lg">
            {popular.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets/${asset.id}`}
                className="bg-white rounded-xl card-shadow p-md flex flex-col hover:shadow-lg transition-shadow border border-outline-variant/30 group"
              >
                <div className="flex items-center gap-md mb-md">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.image}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-h3 font-semibold truncate group-hover:text-primary transition-colors">
                      {asset.title}
                    </h4>
                    <p className="text-label-sm text-secondary truncate">
                      {getAssetCategoryLabel(asset.category)} · {asset.downloads} 다운로드
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex flex-wrap gap-xs">
                    {asset.formats.slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="px-xs py-[1px] text-[10px] bg-primary-fixed text-on-primary-fixed-variant rounded font-mono"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <Icon name="download" className="text-outline-variant text-[18px]" />
                </div>
              </Link>
            ))}
          </div>
        )}
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
