"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { assetCategoryLabel, type Asset } from "@/lib/data";
import { listAssets, getAsset } from "@/lib/store/assets";

export default function AssetDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [asset, setAsset] = useState<Asset | undefined | null>(undefined);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const [all, one] = await Promise.all([listAssets(), getAsset(id)]);
      if (!cancelled) {
        setAllAssets(all);
        setAsset(one ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (asset === undefined) {
    return (
      <div className="max-w-[1040px] mx-auto pb-24">
        <div className="animate-pulse space-y-lg">
          <div className="h-6 bg-surface-container rounded w-1/2" />
          <div className="h-64 bg-surface-container rounded-xl" />
        </div>
      </div>
    );
  }

  if (asset === null) {
    return (
      <div className="max-w-[1040px] mx-auto pb-24 flex flex-col items-center text-center pt-xl">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-md">
          <Icon name="error_outline" className="text-on-error-container text-[32px]" />
        </div>
        <h1 className="text-h1 font-semibold mb-xs">에셋을 찾을 수 없습니다</h1>
        <p className="text-body-base text-on-surface-variant mb-lg">
          요청하신 ID에 해당하는 에셋이 없습니다. 라이브러리에서 다시 확인해주세요.
        </p>
        <Link
          href="/assets"
          className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
        >
          에셋 라이브러리로
        </Link>
      </div>
    );
  }

  const related = allAssets.filter((a) => a.id !== asset.id).slice(0, 4);

  return (
    <div className="max-w-[1040px] mx-auto pb-24">
      <nav className="flex items-center gap-xs text-body-sm text-secondary mb-lg">
        <Link href="/" className="hover:text-primary transition-colors">
          홈
        </Link>
        <Icon name="chevron_right" className="text-[16px]" />
        <Link href="/assets" className="hover:text-primary transition-colors">
          에셋 라이브러리
        </Link>
        <Icon name="chevron_right" className="text-[16px]" />
        <span className="text-on-surface-variant font-semibold">{asset.title}</span>
      </nav>

      <div className="flex gap-xl">
        <div className="w-[60%] flex flex-col gap-lg">
          <div className="bg-white rounded-xl card-shadow p-lg overflow-hidden border border-outline-variant">
            <div className="relative aspect-video bg-surface-container rounded-lg flex items-center justify-center p-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.image}
                alt={asset.title}
                className="max-w-full max-h-full object-contain"
              />
              <button className="absolute top-md right-md bg-white/80 backdrop-blur-md p-sm rounded-full card-shadow hover:bg-white transition-colors">
                <Icon name="zoom_in" className="text-[20px]" />
              </button>
            </div>

            <div className="mt-lg">
              <div className="flex items-center border-b border-outline-variant mb-md">
                {asset.formats.map((f, i) => (
                  <button
                    key={f}
                    className={
                      "px-lg py-sm text-body-base " +
                      (i === 0
                        ? "border-b-2 border-primary text-primary font-semibold"
                        : "text-secondary hover:text-on-surface transition-colors")
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-md">
                  <div className="bg-primary-fixed p-sm rounded-lg">
                    <Icon name="description" className="text-primary text-[20px]" />
                  </div>
                  <div>
                    <p className="text-body-base font-semibold">
                      Primary_Logo_V1.{asset.formats[0]?.toLowerCase() ?? "ai"}
                    </p>
                    <p className="text-body-sm text-secondary">벡터 파일 · 4.2 MB</p>
                  </div>
                </div>
                <button className="flex items-center gap-xs bg-primary text-on-primary px-lg py-sm rounded-lg hover:brightness-95 transition-all">
                  <Icon name="download" className="text-[18px]" />
                  {asset.formats[0] ?? "AI"} 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[40%] flex flex-col gap-lg">
          <div className="bg-white rounded-xl card-shadow p-lg border border-outline-variant h-fit">
            <div className="flex justify-between items-start mb-sm">
              {asset.primary ? (
                <span className="bg-primary-fixed text-primary text-[10px] tracking-wider px-sm py-xs rounded uppercase font-bold">
                  핵심 에셋
                </span>
              ) : (
                <span />
              )}
              {asset.internal ? (
                <div className="bg-error-container text-on-error-container px-sm py-xs rounded-lg flex items-center gap-xs">
                  <Icon name="lock" className="text-[14px]" />
                  <span className="text-label-sm">내부 전용</span>
                </div>
              ) : null}
            </div>

            <h1 className="text-h1 font-semibold text-on-surface mb-md">{asset.title}</h1>

            <div className="flex flex-wrap gap-xs mb-lg">
              <span className="bg-surface-container-high text-on-surface-variant px-sm py-xs rounded-full text-label-sm">
                #{assetCategoryLabel[asset.category]}
              </span>
              {asset.formats.map((f) => (
                <span
                  key={f}
                  className="bg-surface-container-high text-on-surface-variant px-sm py-xs rounded-full text-label-sm"
                >
                  #{f}
                </span>
              ))}
            </div>

            <div className="space-y-lg">
              {asset.description ? (
                <div>
                  <p className="text-label-caps text-secondary mb-xs">사용 지침</p>
                  <p className="text-body-base text-on-surface-variant leading-relaxed">
                    {asset.description}
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-lg border-t border-outline-variant pt-lg">
                <div>
                  <p className="text-label-caps text-secondary mb-xs">업로더</p>
                  <div className="flex items-center gap-sm">
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <Icon name="person" className="text-[14px]" />
                    </div>
                    <span className="text-body-base">{asset.uploader}</span>
                  </div>
                </div>
                <div>
                  <p className="text-label-caps text-secondary mb-xs">날짜</p>
                  <span className="text-body-base">{asset.uploadedAt}</span>
                </div>
                <div>
                  <p className="text-label-caps text-secondary mb-xs">다운로드</p>
                  <div className="flex items-center gap-xs text-primary">
                    <Icon name="show_chart" className="text-[18px]" />
                    <span className="text-body-base font-semibold">{asset.downloads}회</span>
                  </div>
                </div>
                <div>
                  <p className="text-label-caps text-secondary mb-xs">상태</p>
                  <div className="flex items-center gap-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-body-base">인증됨</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-xl">
        <div className="flex justify-between items-end mb-lg">
          <h2 className="text-h2 font-semibold">관련 에셋</h2>
          <Link
            href="/guidelines"
            className="text-primary text-body-base font-semibold hover:underline"
          >
            브랜드 가이드 보기
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-lg">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/assets/${r.id}`}
              className="bg-white rounded-xl card-shadow border border-outline-variant overflow-hidden group hover:border-primary-fixed transition-all"
            >
              <div className="aspect-video bg-surface-container overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.image}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-md">
                <p className="text-body-base font-semibold mb-xs truncate">{r.title}</p>
                <span className="text-label-sm text-secondary">{r.formats.join(", ")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
