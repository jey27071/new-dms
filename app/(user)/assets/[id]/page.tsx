"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { getAssetCategoryLabel, type Asset, type AssetFormat } from "@/lib/data";
import { listAssets, getAsset } from "@/lib/store/assets";

/** 다운로드 시 파일명 생성: 제목 → 안전 슬러그 + 포맷 확장자 */
function makeDownloadFileName(title: string, format: AssetFormat): string {
  const safe = title
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
  return `${safe || "asset"}.${format.toLowerCase()}`;
}

export default function AssetDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [asset, setAsset] = useState<Asset | undefined | null>(undefined);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [zoomOpen, setZoomOpen] = useState(false);

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

  // ESC로 줌 모달 닫기
  useEffect(() => {
    if (!zoomOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

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
            {/* 이미지 미리보기 */}
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="relative w-full aspect-video bg-surface-container rounded-lg flex items-center justify-center p-xl overflow-hidden group"
              aria-label="이미지 확대"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.image}
                alt={asset.title}
                className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform"
              />
              <span className="absolute top-md right-md inline-flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md rounded-full card-shadow group-hover:bg-white transition-colors">
                <Icon name="zoom_in" className="text-on-surface text-[20px]" />
              </span>
            </button>

            {/* 다운로드 영역 — 포맷별로 행 분리 */}
            <div className="mt-lg">
              <p className="text-label-caps text-secondary mb-sm">
                다운로드 ({asset.formats.length}개 포맷)
              </p>
              <ul className="space-y-sm">
                {asset.formats.map((f) => {
                  const fileName = makeDownloadFileName(asset.title, f);
                  return (
                    <li
                      key={f}
                      className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant/40"
                    >
                      <div className="flex items-center gap-md min-w-0">
                        <div className="bg-primary-fixed p-sm rounded-lg flex-shrink-0">
                          <Icon name="description" className="text-primary text-[20px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-body-base font-semibold truncate">{fileName}</p>
                          <p className="text-body-sm text-secondary">{f} 파일</p>
                        </div>
                      </div>
                      <a
                        href={asset.image}
                        download={fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 flex items-center gap-xs bg-primary text-on-primary px-lg py-sm rounded-lg hover:brightness-95 transition-all text-label-sm font-semibold"
                      >
                        <Icon name="download" className="text-[18px]" />
                        {f}
                      </a>
                    </li>
                  );
                })}
              </ul>
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
                #{getAssetCategoryLabel(asset.category)}
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

              <div className="border-t border-outline-variant pt-lg space-y-md">
                {/* 날짜 (상단) */}
                <div>
                  <p className="text-label-caps text-secondary mb-xs">날짜</p>
                  <span className="text-body-base">{asset.uploadedAt}</span>
                </div>

                {/* 작성자 (이름 위, 이메일 아래) */}
                <div>
                  <p className="text-label-caps text-secondary mb-xs">작성자</p>
                  <div className="flex items-start gap-sm">
                    <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 mt-[2px]">
                      <Icon name="person" className="text-[16px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-base font-semibold truncate">
                        {asset.uploader.split("@")[0]}
                      </p>
                      <p className="text-label-sm text-secondary break-all">{asset.uploader}</p>
                    </div>
                  </div>
                </div>

                {/* 다운로드 / 상태 (2열) */}
                <div className="grid grid-cols-2 gap-md">
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
      </div>

      {/* 확대 모달 */}
      {zoomOpen ? (
        <div
          className="fixed inset-0 z-50 bg-on-background/80 backdrop-blur-sm flex items-center justify-center p-xl"
          onClick={() => setZoomOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.image}
            alt={asset.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="fixed top-lg right-lg inline-flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-white rounded-full card-shadow"
            aria-label="닫기"
          >
            <Icon name="close" className="text-on-surface text-[24px]" />
          </button>
        </div>
      ) : null}

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
