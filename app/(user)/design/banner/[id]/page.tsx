"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type BannerTemplate } from "@/lib/data";
import { getBannerTemplate } from "@/lib/store/banner-templates";

export default function BannerEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [template, setTemplate] = useState<BannerTemplate | undefined | null>(undefined);

  // 사용자 편집 가능: 텍스트 + 색상 + 배경 어둡게
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [dim, setDim] = useState(true);
  const [dimOpacity, setDimOpacity] = useState(35);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const found = await getBannerTemplate(id);
      if (!cancelled) {
        if (found) {
          setHeadline(found.headlineSlot.defaultText);
          setSubtitle(found.subtitleSlot.defaultText);
        }
        setTemplate(found ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // 미리보기 컨테이너 크기 측정 (폰트 비례 표시용)
  useEffect(() => {
    if (!previewRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setContainerSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, [template]);

  const aspect = useMemo(() => {
    if (!template) return 3;
    return template.height > 0 ? template.width / template.height : 3;
  }, [template]);

  const previewShortEdge = Math.min(containerSize.w, containerSize.h);

  async function handleDownload() {
    if (!template || !previewRef.current) return;
    setError(null);
    setDownloading(true);
    try {
      const mod = await import("html2canvas");
      const html2canvas = mod.default;
      const element = previewRef.current;
      const rect = element.getBoundingClientRect();
      const scale = template.width / rect.width;
      const canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: null,
        scale,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("이미지 생성에 실패했습니다.");
          setDownloading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${template.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, "image/png");
    } catch (err) {
      console.error(err);
      setError("다운로드 중 오류가 발생했습니다. 이미지 보안 정책 문제일 수 있어요.");
      setDownloading(false);
    }
  }

  if (template === undefined) {
    return (
      <div className="max-w-[1280px] mx-auto">
        <div className="animate-pulse space-y-md">
          <div className="h-6 bg-surface-container rounded w-1/3" />
          <div className="h-64 bg-surface-container rounded-xl" />
        </div>
      </div>
    );
  }

  if (template === null) {
    return (
      <div className="max-w-[900px] mx-auto pt-xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-md">
          <Icon name="error_outline" className="text-on-error-container text-[32px]" />
        </div>
        <h1 className="text-h1 font-semibold mb-xs">템플릿을 찾을 수 없습니다</h1>
        <Link
          href="/design/banner"
          className="mt-md px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
        >
          템플릿 목록으로
        </Link>
      </div>
    );
  }

  const { headlineSlot, subtitleSlot } = template;
  const headlinePx = headlineSlot.fontScale * previewShortEdge;
  const subtitlePx = subtitleSlot.fontScale * previewShortEdge;

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-xs text-secondary text-label-sm mb-xs">
            <Icon name="auto_awesome" className="text-[14px]" />
            <Link href="/design/banner" className="hover:text-primary transition-colors">
              배너(현수막)
            </Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-primary font-semibold">{template.name}</span>
          </div>
          <h1 className="text-h1 font-semibold text-on-surface">{template.name}</h1>
          <p className="text-body-sm text-secondary mt-xs">
            {template.width} × {template.height} px
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-sm bg-primary text-on-primary px-xl py-md rounded-lg font-semibold hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Icon
            name={downloading ? "hourglass_empty" : "download"}
            className="text-[20px]"
          />
          {downloading ? "생성 중..." : "PNG 다운로드"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-lg items-start">
        {/* 미리보기 */}
        <div className="col-span-8">
          <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant flex items-center justify-center min-h-[400px]">
            <div className="w-full max-w-full">
              <div
                ref={previewRef}
                className="relative overflow-hidden card-shadow"
                style={{ aspectRatio: `${aspect}`, backgroundColor: "#1a1a1a" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={template.image}
                  alt={template.name}
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {dim ? (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(0,0,0,${dimOpacity / 100})` }}
                  />
                ) : null}

                {/* 헤드라인 슬롯 */}
                {headline ? (
                  <div
                    style={{
                      position: "absolute",
                      top: `${headlineSlot.top}%`,
                      left: `${headlineSlot.left}%`,
                      width: `${headlineSlot.width}%`,
                      textAlign: headlineSlot.align,
                      color,
                      fontSize: `${headlinePx}px`,
                      fontWeight: 700,
                      lineHeight: 1.15,
                      wordBreak: "keep-all",
                    }}
                  >
                    {headline}
                  </div>
                ) : null}

                {/* 부제목 슬롯 */}
                {subtitle ? (
                  <div
                    style={{
                      position: "absolute",
                      top: `${subtitleSlot.top}%`,
                      left: `${subtitleSlot.left}%`,
                      width: `${subtitleSlot.width}%`,
                      textAlign: subtitleSlot.align,
                      color,
                      fontSize: `${subtitlePx}px`,
                      fontWeight: 400,
                      lineHeight: 1.4,
                      wordBreak: "keep-all",
                      opacity: 0.95,
                    }}
                  >
                    {subtitle}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-md bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm">
              <Icon name="error_outline" className="text-[20px]" />
              <span className="text-body-sm">{error}</span>
            </div>
          ) : null}
        </div>

        {/* 컨트롤 패널 */}
        <aside className="col-span-4 space-y-md sticky top-24">
          <div className="bg-white rounded-xl card-shadow p-lg border border-outline-variant/30 space-y-md">
            <h3 className="text-h3 font-semibold mb-sm">텍스트 편집</h3>
            <p className="text-label-sm text-secondary">
              관리자가 지정한 위치·크기·정렬을 따릅니다. 사용자는 문구와 색상만 변경할 수 있어요.
            </p>

            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="headline">
                헤드라인
              </label>
              <textarea
                id="headline"
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="배너 메인 메시지"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
              />
            </div>

            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="subtitle">
                부제목
              </label>
              <textarea
                id="subtitle"
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="보조 설명 (선택)"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
              />
            </div>

            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="color">
                텍스트 색상
              </label>
              <div className="flex gap-sm items-center">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-outline-variant cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base font-mono uppercase"
                />
              </div>
              <div className="flex gap-xs pt-xs">
                {["#ffffff", "#000000", "#1B1B24", "#3525CD", "#FF312C", "#FFD700"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg border border-outline-variant hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow p-lg border border-outline-variant/30 space-y-md">
            <h3 className="text-h3 font-semibold mb-sm">배경</h3>
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={dim}
                onChange={(e) => setDim(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-body-base">배경 어둡게 (가독성 향상)</span>
            </label>
            {dim ? (
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant flex items-center justify-between">
                  <span>어둡기</span>
                  <span className="text-secondary font-mono">{dimOpacity}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={70}
                  step={5}
                  value={dimOpacity}
                  onChange={(e) => setDimOpacity(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
              </div>
            ) : null}
          </div>

          <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant border-dashed">
            <p className="text-label-sm text-on-surface-variant flex items-start gap-xs">
              <Icon name="info" className="text-primary text-[16px] mt-[1px]" />
              <span>
                다운로드 결과는 템플릿 실제 크기({template.width}×{template.height} px)로 저장됩니다.
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
