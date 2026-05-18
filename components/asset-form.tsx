"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import {
  DEFAULT_ASSET_CATEGORIES,
  getAssetCategoryLabel,
  type Asset,
  type AssetFormat,
} from "@/lib/data";
import {
  createAsset,
  updateAsset,
  uploadAssetImage,
  type AssetInput,
} from "@/lib/store/assets";
import { listCategories, type Category } from "@/lib/store/categories";

const ALL_FORMATS: AssetFormat[] = ["AI", "PNG", "PDF", "SVG", "EPS", "ZIP", "MP4", "FIG", "ASE"];

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"];

type Props = {
  mode: "create" | "edit";
  initial?: Asset;
  uploader: string;
};

export function AssetForm({ mode, initial, uploader }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  // 기존 시드의 영문 키("logo" 등)는 라벨로 변환해 폼 내부에서 사용
  const initialCategory = initial?.category
    ? getAssetCategoryLabel(initial.category)
    : DEFAULT_ASSET_CATEGORIES[0];
  const [categories, setCategories] = useState<string[]>([...DEFAULT_ASSET_CATEGORIES]);
  const [category, setCategory] = useState<string>(initialCategory);
  const [formats, setFormats] = useState<AssetFormat[]>(initial?.formats ?? ["PNG"]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [internal, setInternal] = useState(initial?.internal ?? false);
  const [primary, setPrimary] = useState(initial?.primary ?? false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // DB의 에셋 카테고리 목록 불러오기 (있으면 기본값 대체)
  useEffect(() => {
    let cancelled = false;
    listCategories("asset").then((list: Category[]) => {
      if (cancelled) return;
      const labels = list.map((c) => c.label);
      if (labels.length > 0) {
        setCategories(labels);
        // 기존 category가 목록에 없으면(=관리자가 삭제했으면) 첫 항목 추천 (create 모드만)
        if (!labels.includes(category) && mode === "create") {
          setCategory(labels[0]!);
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 이미지 상태
  // - existingUrl: 편집 모드일 때 기존 이미지 URL
  // - file: 새로 선택한 파일 (있으면 업로드)
  // - previewUrl: 화면에 보여줄 URL (objectURL or existingUrl)
  const [file, setFile] = useState<File | null>(null);
  const existingUrl = initial?.image ?? "";
  const [previewUrl, setPreviewUrl] = useState<string>(existingUrl);
  const [isDragging, setIsDragging] = useState(false);

  // objectURL 정리
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function toggleFormat(f: AssetFormat) {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function applyFile(f: File) {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
      setError("지원하지 않는 파일 형식입니다. PNG · JPG · GIF · WEBP · SVG 만 가능합니다.");
      return;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`파일이 ${MAX_FILE_SIZE_MB}MB 보다 큽니다. 더 작은 이미지를 사용해주세요.`);
      return;
    }
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
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

  function clearImage() {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (formats.length === 0) {
      setError("파일 포맷을 최소 1개 이상 선택해주세요.");
      return;
    }
    if (!file && !existingUrl) {
      setError("이미지를 업로드해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      // 1) 새 파일이 있으면 먼저 업로드
      let finalUrl = existingUrl;
      if (file) {
        const uploaded = await uploadAssetImage(file);
        if (!uploaded) {
          setError("이미지 업로드에 실패했습니다. 파일을 다시 선택해주세요.");
          setSubmitting(false);
          return;
        }
        finalUrl = uploaded;
      }

      // 2) DB 저장
      const payload: AssetInput = {
        title: title.trim(),
        category,
        formats,
        image: finalUrl,
        description: description.trim() || undefined,
        uploader,
        internal,
        primary,
      };
      let result;
      if (mode === "create") {
        result = await createAsset(payload);
      } else if (initial) {
        result = await updateAsset(initial.id, payload);
      }
      if (!result) {
        setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/assets");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("저장 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[820px] mx-auto space-y-lg">
      {/* 헤더 */}
      <div className="flex items-center gap-xs text-secondary text-label-sm">
        <Link href="/admin/assets" className="hover:text-primary transition-colors">
          에셋 관리
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-primary font-semibold">
          {mode === "create" ? "새 에셋 등록" : "에셋 수정"}
        </span>
      </div>
      <h1 className="text-h1 font-semibold text-on-surface">
        {mode === "create" ? "새 에셋 등록" : "에셋 수정"}
      </h1>

      {/* 폼 */}
      <div className="bg-white rounded-xl card-shadow p-xl border border-outline-variant/30 space-y-lg">
        {/* 이미지 업로드 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            이미지 <span className="text-error">*</span>
          </label>
          <label
            htmlFor="asset-file"
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
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-full max-h-[360px] object-contain bg-surface-container-low"
                />
                <div className="absolute top-sm right-sm flex gap-xs">
                  <span className="px-sm py-xs bg-white/90 text-on-surface text-label-sm rounded-lg backdrop-blur-sm flex items-center gap-xs">
                    <Icon name="swap_horiz" className="text-[16px]" />
                    클릭/드롭으로 교체
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-md p-xl">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="upload_file" className="text-primary text-[28px]" />
                </div>
                <div className="text-center">
                  <p className="text-body-base font-semibold text-on-surface">
                    파일을 끌어다 놓거나 클릭해서 선택
                  </p>
                  <p className="text-label-sm text-secondary mt-xs">
                    PNG · JPG · GIF · WEBP · SVG (최대 {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              </div>
            )}
            <input
              id="asset-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {previewUrl ? (
            <div className="flex items-center justify-between pt-xs">
              <p className="text-label-sm text-secondary">
                {file
                  ? `선택됨: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`
                  : "현재 이미지 (변경하려면 위 영역 클릭)"}
              </p>
              <button
                type="button"
                onClick={clearImage}
                className="text-label-sm text-error hover:underline flex items-center gap-xs"
              >
                <Icon name="close" className="text-[14px]" />
                이미지 제거
              </button>
            </div>
          ) : null}
        </div>

        {/* 제목 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="title">
            제목 <span className="text-error">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: Q3 캠페인 메인 배너"
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
          />
        </div>

        {/* 카테고리 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            카테고리 <span className="text-error">*</span>
          </label>
          <div className="flex flex-wrap gap-sm">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={
                  "px-md py-sm rounded-lg text-label-sm transition-all border " +
                  (category === c
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-white text-on-surface border-outline-variant hover:bg-surface-container-low")
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 포맷 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            파일 포맷 (복수 선택) <span className="text-error">*</span>
          </label>
          <div className="flex flex-wrap gap-sm">
            {ALL_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFormat(f)}
                className={
                  "px-md py-xs rounded-lg text-label-sm font-mono transition-all border " +
                  (formats.includes(f)
                    ? "bg-primary-fixed text-on-primary-fixed-variant border-primary"
                    : "bg-white text-secondary border-outline-variant hover:bg-surface-container-low")
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 설명 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="description">
            사용 지침 / 설명
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="에셋 사용 규칙·주의사항·권장 사용처 등을 자유롭게 작성하세요."
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
          />
        </div>

        {/* 옵션 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">옵션</label>
          <div className="flex flex-wrap gap-lg pt-xs">
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={primary}
                onChange={(e) => setPrimary(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-body-base">핵심 에셋으로 표시</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={internal}
                onChange={(e) => setInternal(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-body-base">내부 전용</span>
            </label>
          </div>
        </div>

        {error ? (
          <div className="bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm">
            <Icon name="error_outline" className="text-[20px]" />
            <span className="text-body-sm">{error}</span>
          </div>
        ) : null}

        {/* 액션 */}
        <div className="flex justify-end gap-sm pt-lg border-t border-outline-variant">
          <Link
            href="/admin/assets"
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
                ? "에셋 등록"
                : "변경사항 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
