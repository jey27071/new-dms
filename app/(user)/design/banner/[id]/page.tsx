"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type BannerTemplate } from "@/lib/data";
import { getBannerTemplate } from "@/lib/store/banner-templates";

type Align = "left" | "center" | "right";

export default function BannerEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [template, setTemplate] = useState<BannerTemplate | undefined | null>(undefined);

  // 편집 상태
  const [headline, setHeadline] = useState("여기에 헤드라인을 입력하세요");
  const [subtitle, setSubtitle] = useState("부제목 또는 안내 문구");
  const [color, setColor] = useState("#ffffff");
  const [align, setAlign] = useState<Align>("left");
  const [dim, setDim] = useState(true);
  const [dimOpacity, setDimOpacity] = useState(35);
  const [headlineScale, setHeadlineScale] = useState(100);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const found = await getBannerTemplate(id);
      if (!cancelled) setTemplate(found ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const aspect = useMemo(() => {
    if (!template) return 3;
    return template.height > 0 ? template.width / template.height : 3;
  }, [template]);

  // 폰트 크기 (캔버스 기준) — 짧은 변 기준 + 사용자 조절
  const baseSize = useMemo(() => {
    if (!template) return 80;
    return Math.min(template.width, template.height);
  }, [template]);
  const headlinePx = (baseSize * 0.12 * headlineScale) / 100;
  const subtitlePx = baseSize * 0.06;

  async function handleDownload() {
    if (!template || !previewRef.current) return;
    setError(null);
    setDownloading(true);
    try {
      const mod = await import("html2canvas");
      const html2canvas = mod.default;
      const element = previewRef.current;
      // 화면 표시 크기 → 템플릿 실제 픽셀로 스케일
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
        <p className="text-body-base text-on-surface-variant mb-lg">
          요청하신 ID에 해당하는 배너 템플릿이 없습니다.
        </p>
        <Link
          href="/design/banner"
          className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
        >
          템플릿 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-xs text-secondary text-label-sm mb-xs">
            <Icon name="auto_awesome" className="text-[14px]" />
            <Link href="/design/banner" className="hover:text-primary transition-colors">
              배너 제작
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
              {/* 실제 캔버스 — html2canvas가 이걸 캡쳐 */}
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
                <div
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{
                    padding: "8%",
                    alignItems:
                      align === "center"
                        ? "center"
                        : align === "right"
                          ? "flex-end"
                          : "flex-start",
                    textAlign: align,
                  }}
                >
                  {headline ? (
                    <h2
                      style={{
                        color,
                        fontSize: `${headlinePx}px`,
                        fontWeight: 700,
                        lineHeight: 1.15,
                        margin: 0,
                        wordBreak: "keep-all",
                        maxWidth: "100%",
                      }}
                    >
                      {headline}
                    </h2>
                  ) : null}
                  {subtitle ? (
                    <p
                      style={{
                        color,
                        fontSize: `${subtitlePx}px`,
                        fontWeight: 400,
                        lineHeight: 1.4,
                        marginTop: `${subtitlePx * 0.5}px`,
                        wordBreak: "keep-all",
                        maxWidth: "100%",
                        opacity: 0.95,
                      }}
                    >
                      {subtitle}
                    </p>
                  ) : null}
                </div>
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
            <h3 className="text-h3 font-semibold mb-sm">텍스트</h3>

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
              <label className="text-label-caps text-on-surface-variant">정렬</label>
              <div className="flex bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
                {(["left", "center", "right"] as Align[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAlign(a)}
                    className={
                      "flex-1 py-sm transition-colors " +
                      (align === a
                        ? "bg-primary text-on-primary"
                        : "text-secondary hover:bg-surface-container")
                    }
                  >
                    <Icon
                      name={
                        a === "left"
                          ? "format_align_left"
                          : a === "center"
                            ? "format_align_center"
                            : "format_align_right"
                      }
                      className="text-[18px]"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant flex items-center justify-between">
                <span>헤드라인 크기</span>
                <span className="text-secondary font-mono">{headlineScale}%</span>
              </label>
              <input
                type="range"
                min={50}
                max={200}
                step={5}
                value={headlineScale}
                onChange={(e) => setHeadlineScale(parseInt(e.target.value, 10))}
                className="w-full accent-primary"
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
