"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { listAiStyles, type AiStyle } from "@/lib/store/ai-styles";
import {
  countTodayForUser,
  createAiGeneration,
  markSelected,
  DAILY_QUOTA,
} from "@/lib/store/ai-generations";
import { getClientEmail } from "@/lib/auth-client";

type GenerationResult = {
  id: string;
  imageUrls: string[];
};

export default function DesignAiGeneratePage() {
  const [styles, setStyles] = useState<AiStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [usedToday, setUsedToday] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const e = getClientEmail();
    setEmail(e);
    (async () => {
      const [stylesList, count] = await Promise.all([
        listAiStyles(false),
        e ? countTodayForUser(e) : Promise.resolve(0),
      ]);
      if (cancelled) return;
      setStyles(stylesList);
      if (stylesList.length > 0) setSelectedStyleId(stylesList[0]!.id);
      setUsedToday(count);
      setMounted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = Math.max(0, DAILY_QUOTA - usedToday);
  const exceededQuota = remaining <= 0;
  const selectedStyle = styles.find((s) => s.id === selectedStyleId);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!prompt.trim()) {
      setError("프롬프트를 입력해주세요.");
      return;
    }
    if (!selectedStyle) {
      setError("스타일을 선택해주세요.");
      return;
    }
    if (exceededQuota) {
      setError(`오늘 한도(${DAILY_QUOTA}회)를 모두 사용했습니다.`);
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedUrl(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          systemPrompt: selectedStyle.systemPrompt,
          negativePrompt: selectedStyle.negativePrompt,
          count: 3,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "이미지 생성에 실패했습니다.");
        setLoading(false);
        return;
      }
      // DB에 기록
      const gen = await createAiGeneration({
        userEmail: email,
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        prompt: prompt.trim(),
        fullPrompt: data.fullPrompt,
        imageUrls: data.imageUrls,
      });
      if (gen) {
        setResult({ id: gen.id, imageUrls: gen.imageUrls });
        setUsedToday((c) => c + 1);
      } else {
        setError("이력 저장에 실패했지만 이미지는 생성됐습니다. 새로고침 후 다시 시도해주세요.");
      }
    } catch (err) {
      console.error(err);
      setError("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(url: string) {
    setSelectedUrl(url);
    if (result) {
      await markSelected(result.id, url);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-sm text-secondary text-label-sm mb-xs">
          <Icon name="auto_fix_high" className="text-[14px]" />
          <Link href="/design/ai" className="hover:text-primary transition-colors">
            AI로 디자인 하기
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-primary font-semibold">AI로 생성하기</span>
        </div>
        <h1 className="text-h1 font-semibold text-on-surface">AI로 생성하기</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          항목 스타일을 고르고 만들고 싶은 이미지를 한 줄로 설명하면 3장이 생성됩니다.
          마음에 드는 1장을 선택해 다운로드하세요.
        </p>
      </div>

      {/* 한도 표시 */}
      <div
        className={
          "rounded-xl p-md border flex items-center justify-between gap-md " +
          (exceededQuota
            ? "bg-error-container/30 border-error-container"
            : "bg-primary-fixed/30 border-primary/20")
        }
      >
        <div className="flex items-center gap-md">
          <Icon
            name={exceededQuota ? "block" : "bolt"}
            className={(exceededQuota ? "text-error" : "text-primary") + " text-[22px]"}
          />
          <div>
            <p className="text-body-base font-semibold">
              {exceededQuota
                ? "오늘 한도를 모두 사용했습니다"
                : `오늘 ${remaining}회 남음 · 총 ${DAILY_QUOTA}회/일`}
            </p>
            <p className="text-label-sm text-on-surface-variant">
              {exceededQuota
                ? "추가 사용이 필요하면 디자인 팀에 요청하세요. 승인 후 한도가 확장됩니다."
                : `현재 사용 ${usedToday}회 / ${DAILY_QUOTA}회. 자정에 자동 초기화`}
            </p>
          </div>
        </div>
        {exceededQuota ? (
          <Link
            href="/my-requests/new?type=other&topic=ai_quota"
            className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 whitespace-nowrap"
          >
            추가 사용 요청
          </Link>
        ) : null}
      </div>

      {/* 생성 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-lg space-y-md">
        {/* 스타일 선택 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            스타일 / 항목 <span className="text-error">*</span>
          </label>
          {!mounted ? (
            <p className="text-body-sm text-secondary">불러오는 중…</p>
          ) : styles.length === 0 ? (
            <div className="bg-surface-container-low rounded-lg p-md text-body-sm text-secondary">
              등록된 스타일이 없습니다. 관리자에게 문의하세요.
            </div>
          ) : (
            <div className="flex flex-wrap gap-sm">
              {styles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStyleId(s.id)}
                  className={
                    "px-md py-sm rounded-lg text-label-sm border transition-all " +
                    (selectedStyleId === s.id
                      ? "bg-primary text-on-primary border-primary font-semibold"
                      : "bg-white text-on-surface border-outline-variant hover:bg-surface-container-low")
                  }
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
          {selectedStyle?.description ? (
            <p className="text-label-sm text-secondary mt-xs">
              ↳ {selectedStyle.description}
            </p>
          ) : null}
        </div>

        {/* 프롬프트 */}
        <div className="space-y-xs">
          <label htmlFor="prompt" className="text-label-caps text-on-surface-variant">
            만들고 싶은 이미지 설명 <span className="text-error">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              selectedStyle?.name === "배너(현수막)"
                ? "예: 여름 캠페인 홍보용 시원한 배너, 파란색 톤"
                : selectedStyle?.name === "아이콘"
                  ? "예: 클립보드와 체크 표시가 있는 업무 관리 아이콘"
                  : "예: 사무실에서 회의하는 모습의 사진"
            }
            rows={3}
            disabled={loading || exceededQuota}
            className="w-full bg-surface-bright border border-outline-variant rounded-lg p-md text-body-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none outline-none disabled:opacity-60"
          />
          <p className="text-label-sm text-secondary">
            힌트: 색감·분위기·구체적 요소를 함께 적으면 더 정확하게 생성됩니다.
          </p>
        </div>

        {error ? (
          <div className="bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm text-body-sm">
            <Icon name="error_outline" className="text-[20px]" />
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant">
          <button
            type="submit"
            disabled={loading || exceededQuota || !prompt.trim() || styles.length === 0}
            className="px-xl py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all flex items-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon
              name={loading ? "hourglass_empty" : "auto_awesome"}
              className={"text-[18px] " + (loading ? "animate-pulse" : "")}
            />
            {loading ? "생성 중… (10~30초)" : "이미지 3장 생성"}
          </button>
        </div>
      </form>

      {/* 결과 */}
      {result ? (
        <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-lg space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="text-h3 font-semibold">생성된 결과 (3장)</h3>
            <p className="text-label-sm text-secondary">
              마음에 드는 이미지를 선택하면 다운로드 버튼이 활성화됩니다
            </p>
          </div>
          <div className="grid grid-cols-3 gap-md">
            {result.imageUrls.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => handleSelect(url)}
                className={
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all " +
                  (selectedUrl === url
                    ? "border-primary ring-4 ring-primary/20"
                    : "border-outline-variant hover:border-primary/60")
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="AI 생성 결과" className="w-full h-full object-cover" />
                {selectedUrl === url ? (
                  <span className="absolute top-sm right-sm w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center">
                    <Icon name="check" className="text-[18px]" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setSelectedUrl(null);
              }}
              className="px-lg py-sm rounded-lg text-secondary hover:bg-surface-container-low transition-colors"
            >
              다시 시도
            </button>
            {selectedUrl ? (
              <a
                href={selectedUrl}
                download={`ai-generated-${result.id}.png`}
                target="_blank"
                rel="noreferrer"
                className="px-xl py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all flex items-center gap-sm"
              >
                <Icon name="download" className="text-[18px]" />
                선택한 이미지 다운로드
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="px-xl py-sm bg-surface-container text-secondary rounded-lg text-label-sm font-semibold opacity-60 cursor-not-allowed flex items-center gap-sm"
              >
                <Icon name="download" className="text-[18px]" />
                먼저 이미지를 선택하세요
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* 안내 (AI provider 미연동 임시 안내) */}
      <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant border-dashed">
        <p className="text-label-sm text-on-surface-variant flex items-start gap-xs">
          <Icon name="info" className="text-primary text-[16px] mt-[1px]" />
          <span>
            현재는 AI 이미지 생성 API 연동 전 단계로, <strong>실제 AI 모델이 아닌 샘플 이미지</strong>가 반환됩니다.
            화면 흐름과 한도 시스템은 동일하게 검증할 수 있어요. 실 API 연동 후엔 같은 화면에서 진짜 결과물이 나옵니다.
          </span>
        </p>
      </div>
    </div>
  );
}
