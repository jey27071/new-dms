"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { assetCategoryLabel, type Asset, type AssetCategory, type AssetFormat } from "@/lib/data";
import { createAsset, updateAsset, type AssetInput } from "@/lib/store/assets";

const ALL_CATEGORIES: AssetCategory[] = [
  "logo",
  "icon",
  "photo",
  "template",
  "social",
  "typography",
  "style",
];
const ALL_FORMATS: AssetFormat[] = ["AI", "PNG", "PDF", "SVG", "EPS", "ZIP", "MP4", "FIG", "ASE"];

type Props = {
  mode: "create" | "edit";
  initial?: Asset;
  uploader: string;
};

export function AssetForm({ mode, initial, uploader }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<AssetCategory>(initial?.category ?? "logo");
  const [formats, setFormats] = useState<AssetFormat[]>(initial?.formats ?? ["PNG"]);
  const [image, setImage] = useState(initial?.image ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [internal, setInternal] = useState(initial?.internal ?? false);
  const [primary, setPrimary] = useState(initial?.primary ?? false);
  const [error, setError] = useState<string | null>(null);

  function toggleFormat(f: AssetFormat) {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    if (!image.trim()) {
      setError("이미지 URL을 입력해주세요.");
      return;
    }
    const payload: AssetInput = {
      title: title.trim(),
      category,
      formats,
      image: image.trim(),
      description: description.trim() || undefined,
      uploader,
      internal,
      primary,
    };
    if (mode === "create") {
      createAsset(payload);
    } else if (initial) {
      updateAsset(initial.id, payload);
    }
    router.push("/admin/assets");
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
        {/* 미리보기 */}
        <div className="grid grid-cols-3 gap-lg items-start">
          <div className="col-span-1">
            <label className="text-label-caps text-on-surface-variant mb-sm block">미리보기</label>
            <div className="aspect-[4/3] bg-surface-container-low border border-outline-variant border-dashed rounded-lg overflow-hidden flex items-center justify-center">
              {image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={image} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-secondary p-md">
                  <Icon name="image" className="text-[32px]" />
                  <p className="text-label-sm mt-xs">이미지 URL을 입력하면 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2 space-y-md">
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
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="image">
                이미지 URL <span className="text-error">*</span>
              </label>
              <input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://picsum.photos/seed/my-asset/800/600"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all font-mono text-body-sm"
              />
              <p className="text-label-sm text-secondary">
                데모용으로 <span className="font-mono">picsum.photos</span> 또는 외부 이미지 URL을 붙여넣으세요.
              </p>
            </div>
          </div>
        </div>

        {/* 카테고리 */}
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            카테고리 <span className="text-error">*</span>
          </label>
          <div className="flex flex-wrap gap-sm">
            {ALL_CATEGORIES.map((c) => (
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
                {assetCategoryLabel[c]}
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
            className="px-xl py-sm rounded-lg bg-primary text-on-primary font-semibold hover:brightness-95 transition-all flex items-center gap-sm"
          >
            <Icon name={mode === "create" ? "add" : "save"} className="text-[18px]" />
            {mode === "create" ? "에셋 등록" : "변경사항 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
