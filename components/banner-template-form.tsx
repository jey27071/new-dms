"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { SlotEditor } from "@/components/slot-editor";
import { type BannerTemplate, type BannerSlot, computeDefaultSlots } from "@/lib/data";
import {
  createBannerTemplate,
  updateBannerTemplate,
  uploadBannerTemplateImage,
  type BannerTemplateInput,
} from "@/lib/store/banner-templates";

const MAX_IMAGE_MB = 8;

type Preset = { label: string; width: number; height: number };
const PRESETS: Preset[] = [
  { label: "가로 배너 (1200×400)", width: 1200, height: 400 },
  { label: "와이드 배너 (1920×600)", width: 1920, height: 600 },
  { label: "정사각 (1080×1080)", width: 1080, height: 1080 },
  { label: "세로 배너 (600×1200)", width: 600, height: 1200 },
];

type Props = {
  mode: "create" | "edit";
  initial?: BannerTemplate;
  createdBy?: string;
};

export function BannerTemplateForm({ mode, initial, createdBy }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [width, setWidth] = useState(initial?.width ?? 1200);
  const [height, setHeight] = useState(initial?.height ?? 400);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialSlots = initial
    ? { headline: initial.headlineSlot, subtitle: initial.subtitleSlot }
    : computeDefaultSlots(initial?.width ?? 1200, initial?.height ?? 400);
  const [headlineSlot, setHeadlineSlot] = useState<BannerSlot>(initialSlots.headline);
  const [subtitleSlot, setSubtitleSlot] = useState<BannerSlot>(initialSlots.subtitle);

  // 이미지
  const existingImage = initial?.image ?? "";
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(existingImage);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function applyFile(f: File) {
    setError(null);
    if (!f.type.startsWith("image/")) {
      setError("이미지 파일만 가능합니다.");
      return;
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`파일이 ${MAX_IMAGE_MB}MB를 초과합니다.`);
      return;
    }
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFile(f);
    const objUrl = URL.createObjectURL(f);
    setPreviewUrl(objUrl);

    // 이미지 자연 크기 자동 감지 + 슬롯 기본 위치 재설정 (create 모드에서만)
    const img = new Image();
    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      if (mode === "create") {
        const defaults = computeDefaultSlots(img.naturalWidth, img.naturalHeight);
        setHeadlineSlot(defaults.headline);
        setSubtitleSlot(defaults.subtitle);
      }
    };
    img.src = objUrl;
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) applyFile(f);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) applyFile(f);
  }

  function applyPreset(p: Preset) {
    setWidth(p.width);
    setHeight(p.height);
  }

  function resetSlots() {
    const defaults = computeDefaultSlots(width, height);
    setHeadlineSlot(defaults.headline);
    setSubtitleSlot(defaults.subtitle);
  }

  function onSlotChange(next: { headline: BannerSlot; subtitle: BannerSlot }) {
    setHeadlineSlot(next.headline);
    setSubtitleSlot(next.subtitle);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("템플릿 이름을 입력해주세요.");
    if (!file && !existingImage) return setError("배경 이미지를 업로드해주세요.");
    if (width <= 0 || height <= 0) return setError("가로·세로 크기를 확인해주세요.");

    setSubmitting(true);
    try {
      let finalImage = existingImage;
      if (file) {
        const uploaded = await uploadBannerTemplateImage(file);
        if (!uploaded) {
          setError("이미지 업로드에 실패했습니다.");
          setSubmitting(false);
          return;
        }
        finalImage = uploaded;
      }
      const payload: BannerTemplateInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        image: finalImage,
        width: Math.floor(width),
        height: Math.floor(height),
        createdBy,
        headlineSlot,
        subtitleSlot,
      };
      let result;
      if (mode === "create") {
        result = await createBannerTemplate(payload);
      } else if (initial) {
        result = await updateBannerTemplate(initial.id, payload);
      }
      if (!result) {
        setError("저장에 실패했습니다.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/banner-templates");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("저장 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  const aspect = height > 0 ? width / height : 3;

  return (
    <form onSubmit={handleSubmit} className="max-w-[900px] mx-auto space-y-lg">
      <div className="flex items-center gap-xs text-secondary text-label-sm">
        <Link href="/admin/banner-templates" className="hover:text-primary transition-colors">
          배너 템플릿
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-primary font-semibold">
          {mode === "create" ? "새 템플릿 등록" : "템플릿 수정"}
        </span>
      </div>
      <h1 className="text-h1 font-semibold text-on-surface">
        {mode === "create" ? "새 배너 템플릿" : "템플릿 수정"}
      </h1>

      <div className="bg-white rounded-xl card-shadow p-xl border border-outline-variant/30 space-y-lg">
        {/* 배경 이미지 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            배경 이미지 <span className="text-error">*</span>
          </label>
          <label
            htmlFor="bt-file"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={
              "block border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all " +
              (isDragging
                ? "border-primary bg-primary/10"
                : "border-outline-variant hover:border-primary/40 hover:bg-primary/5")
            }
          >
            {previewUrl ? (
              <div className="bg-surface-container-low" style={{ aspectRatio: `${aspect}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-md p-xl">
                <Icon name="image" className="text-primary text-[28px]" />
                <p className="text-body-base font-semibold">드롭 또는 클릭해서 배경 이미지 선택</p>
                <p className="text-label-sm text-secondary">최대 {MAX_IMAGE_MB}MB</p>
              </div>
            )}
            <input
              id="bt-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {file ? (
            <p className="text-label-sm text-secondary">
              {file.name} ({(file.size / 1024).toFixed(0)} KB) · 원본 크기 자동 감지됨
            </p>
          ) : null}
        </div>

        {/* 이름 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="name">
            템플릿 이름 <span className="text-error">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 가을 캠페인 가로 배너"
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
          />
        </div>

        {/* 크기 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">캔버스 크기</label>
          <div className="flex gap-xs flex-wrap mb-sm">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className={
                  "px-sm py-xs rounded-lg text-label-sm border transition-colors " +
                  (width === p.width && height === p.height
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-white text-secondary border-outline-variant hover:bg-surface-container-low")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">가로 (px)</label>
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value || "0", 10))}
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">세로 (px)</label>
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value || "0", 10))}
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
              />
            </div>
          </div>
        </div>

        {/* 슬롯 편집기 — 이미지 있을 때만 */}
        {previewUrl ? (
          <SlotEditor
            image={previewUrl}
            width={width}
            height={height}
            headline={headlineSlot}
            subtitle={subtitleSlot}
            onChange={onSlotChange}
            onReset={resetSlots}
          />
        ) : null}

        {/* 설명 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="description">
            설명
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 템플릿의 용도·권장 사용처 등 (선택)"
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
          />
        </div>

        {error ? (
          <div className="bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm">
            <Icon name="error_outline" className="text-[20px]" />
            <span className="text-body-sm">{error}</span>
          </div>
        ) : null}

        <div className="flex justify-end gap-sm pt-lg border-t border-outline-variant">
          <Link
            href="/admin/banner-templates"
            className="px-lg py-sm rounded-lg text-secondary hover:bg-surface-container-low transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-xl py-sm rounded-lg bg-primary text-on-primary font-semibold hover:brightness-95 transition-all flex items-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon
              name={submitting ? "hourglass_empty" : mode === "create" ? "add" : "save"}
              className="text-[18px]"
            />
            {submitting
              ? file
                ? "업로드 중..."
                : "저장 중..."
              : mode === "create"
                ? "템플릿 등록"
                : "변경사항 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
