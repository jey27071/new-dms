"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type Guideline } from "@/lib/data";
import {
  createGuideline,
  updateGuideline,
  uploadGuidelineCover,
  uploadGuidelineAttachment,
  type GuidelineInput,
} from "@/lib/store/guidelines";

const MAX_IMAGE_MB = 5;
const MAX_FILE_MB = 20;

type Props = {
  mode: "create" | "edit";
  initial?: Guideline;
};

export function GuidelineForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [version, setVersion] = useState(initial?.version ?? "v1.0");
  const [category, setCategory] = useState(initial?.category ?? "가이드");
  const [owner, setOwner] = useState(initial?.owner ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [pages, setPages] = useState<number>(initial?.pages ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 표지
  const existingCover = initial?.cover ?? "";
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(existingCover);
  const [coverDragging, setCoverDragging] = useState(false);

  // 첨부
  const existingAttachment = initial?.attachment ?? "";
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>(
    existingAttachment ? existingAttachment.split("/").pop() ?? "기존 첨부" : "",
  );

  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  function applyCoverFile(f: File) {
    setError(null);
    if (!f.type.startsWith("image/")) {
      setError("표지는 이미지 파일만 가능합니다.");
      return;
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`표지 이미지가 ${MAX_IMAGE_MB}MB를 초과합니다.`);
      return;
    }
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  }

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) applyCoverFile(f);
  }

  function handleCoverDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setCoverDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) applyCoverFile(f);
  }

  function handleAttachmentChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`첨부 파일이 ${MAX_FILE_MB}MB를 초과합니다.`);
      return;
    }
    setAttachmentFile(f);
    setAttachmentName(f.name);
  }

  function addTag() {
    const value = tagInput.trim().replace(/^#/, "");
    if (!value) return;
    if (tags.includes(value)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagInput("");
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("제목을 입력해주세요.");
    if (!notes.trim()) return setError("요약(짧은 설명)을 입력해주세요.");
    if (!coverFile && !existingCover) return setError("표지 이미지를 업로드해주세요.");

    setSubmitting(true);
    try {
      let coverUrl = existingCover;
      if (coverFile) {
        const uploaded = await uploadGuidelineCover(coverFile);
        if (!uploaded) {
          setError("표지 이미지 업로드에 실패했습니다.");
          setSubmitting(false);
          return;
        }
        coverUrl = uploaded;
      }

      let attachmentUrl = existingAttachment || undefined;
      if (attachmentFile) {
        const uploaded = await uploadGuidelineAttachment(attachmentFile);
        if (!uploaded) {
          setError("첨부 파일 업로드에 실패했습니다.");
          setSubmitting(false);
          return;
        }
        attachmentUrl = uploaded;
      }

      const payload: GuidelineInput = {
        title: title.trim(),
        version: version.trim() || "v1.0",
        category: category.trim() || "가이드",
        notes: notes.trim(),
        body: body.trim() || undefined,
        tags,
        cover: coverUrl,
        owner: owner.trim() || undefined,
        attachment: attachmentUrl,
        pages: Number.isFinite(pages) ? Math.max(0, Math.floor(pages)) : 0,
      };

      let result;
      if (mode === "create") {
        result = await createGuideline(payload);
      } else if (initial) {
        result = await updateGuideline(initial.id, payload);
      }
      if (!result) {
        setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/guidelines");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("저장 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[900px] mx-auto space-y-lg">
      <div className="flex items-center gap-xs text-secondary text-label-sm">
        <Link href="/admin/guidelines" className="hover:text-primary transition-colors">
          가이드라인 관리
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-primary font-semibold">
          {mode === "create" ? "새 가이드라인 등록" : "가이드라인 수정"}
        </span>
      </div>
      <h1 className="text-h1 font-semibold text-on-surface">
        {mode === "create" ? "새 가이드라인 등록" : "가이드라인 수정"}
      </h1>

      <div className="grid grid-cols-3 gap-lg items-start">
        {/* 좌측 메인 */}
        <div className="col-span-2 space-y-lg">
          <div className="bg-white rounded-xl card-shadow p-xl border border-outline-variant/30 space-y-lg">
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
                placeholder="예: 2026 브랜드 아이덴티티 가이드라인"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
              />
            </div>

            {/* 카테고리/버전/페이지수 */}
            <div className="grid grid-cols-3 gap-md">
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant" htmlFor="category">
                  카테고리
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="가이드 / 정책 / 에셋 키트"
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant" htmlFor="version">
                  버전
                </label>
                <input
                  id="version"
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant" htmlFor="pages">
                  페이지 수
                </label>
                <input
                  id="pages"
                  type="number"
                  min={0}
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value || "0", 10))}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
                />
              </div>
            </div>

            {/* 담당자 */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="owner">
                담당자
              </label>
              <input
                id="owner"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="예: 브랜드전략팀 김디자"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
              />
            </div>

            {/* 요약 */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="notes">
                요약 <span className="text-error">*</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="목록과 카드에 표시되는 짧은 설명 (1~2 문장)"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
              />
            </div>

            {/* 본문 */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="body">
                본문 / 업데이트 노트
              </label>
              <textarea
                id="body"
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="상세 내용·변경 이력·사용 가이드 등을 자유롭게 작성하세요."
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
              />
            </div>

            {/* 해시태그 */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant">검색 해시태그</label>
              <div className="border border-outline-variant rounded-lg p-sm flex flex-wrap gap-xs items-center min-h-[48px]">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-xs bg-primary-fixed text-on-primary-fixed-variant px-sm py-xs rounded-full text-label-sm"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-error transition-colors"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  onBlur={addTag}
                  placeholder={tags.length === 0 ? "태그 입력 후 Enter 또는 쉼표" : ""}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-body-base px-xs"
                />
              </div>
              <p className="text-label-sm text-secondary">
                Enter·쉼표·포커스 이동으로 추가. Backspace로 마지막 태그 제거.
              </p>
            </div>
          </div>
        </div>

        {/* 우측 사이드 — 파일 업로드 */}
        <aside className="col-span-1 space-y-lg sticky top-24">
          {/* 표지 이미지 */}
          <div className="bg-white rounded-xl card-shadow p-lg border border-outline-variant/30 space-y-xs">
            <label className="text-label-caps text-on-surface-variant">
              표지 이미지 <span className="text-error">*</span>
            </label>
            <label
              htmlFor="cover-file"
              onDragOver={(e) => {
                e.preventDefault();
                setCoverDragging(true);
              }}
              onDragLeave={() => setCoverDragging(false)}
              onDrop={handleCoverDrop}
              className={
                "block border-2 border-dashed rounded-lg overflow-hidden cursor-pointer transition-all " +
                (coverDragging
                  ? "border-primary bg-primary/10"
                  : "border-outline-variant hover:border-primary/40 hover:bg-primary/5")
              }
            >
              {coverPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={coverPreview} alt="cover" className="w-full h-48 object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-sm p-lg">
                  <Icon name="image" className="text-primary text-[28px]" />
                  <p className="text-body-sm text-on-surface text-center">
                    드롭 또는 클릭해서 표지 선택
                  </p>
                  <p className="text-label-sm text-secondary text-center">
                    이미지 · 최대 {MAX_IMAGE_MB}MB
                  </p>
                </div>
              )}
              <input
                id="cover-file"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
            {coverFile ? (
              <p className="text-label-sm text-secondary">
                {coverFile.name} ({(coverFile.size / 1024).toFixed(0)} KB)
              </p>
            ) : null}
          </div>

          {/* 첨부 파일 */}
          <div className="bg-white rounded-xl card-shadow p-lg border border-outline-variant/30 space-y-xs">
            <label className="text-label-caps text-on-surface-variant">첨부 파일 (PDF 등)</label>
            <label
              htmlFor="attach-file"
              className="block border-2 border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all p-lg flex flex-col items-center gap-sm"
            >
              {attachmentName ? (
                <>
                  <Icon name="description" className="text-primary text-[28px]" />
                  <p className="text-body-sm text-on-surface text-center truncate w-full">
                    {attachmentName}
                  </p>
                  <p className="text-label-sm text-primary">교체하려면 클릭</p>
                </>
              ) : (
                <>
                  <Icon name="upload_file" className="text-primary text-[28px]" />
                  <p className="text-body-sm text-on-surface text-center">PDF 첨부</p>
                  <p className="text-label-sm text-secondary">최대 {MAX_FILE_MB}MB</p>
                </>
              )}
              <input
                id="attach-file"
                type="file"
                onChange={handleAttachmentChange}
                className="hidden"
              />
            </label>
            {attachmentFile ? (
              <p className="text-label-sm text-secondary">
                {(attachmentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {error ? (
        <div className="bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm">
          <Icon name="error_outline" className="text-[20px]" />
          <span className="text-body-sm">{error}</span>
        </div>
      ) : null}

      <div className="flex justify-end gap-sm pt-lg border-t border-outline-variant">
        <Link
          href="/admin/guidelines"
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
            ? coverFile || attachmentFile
              ? "업로드 중..."
              : "저장 중..."
            : mode === "create"
              ? "가이드라인 등록"
              : "변경사항 저장"}
        </button>
      </div>
    </form>
  );
}
