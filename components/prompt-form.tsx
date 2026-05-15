"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type Prompt, PROMPT_CATEGORIES } from "@/lib/data";
import { createPrompt, updatePrompt, type PromptInput } from "@/lib/store/prompts";

type Props = {
  mode: "create" | "edit";
  initial?: Prompt;
  createdBy?: string;
};

export function PromptForm({ mode, initial, createdBy }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? PROMPT_CATEGORIES[0]);
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    if (!prompt.trim()) return setError("프롬프트 본문을 입력해주세요.");

    setSubmitting(true);
    try {
      const payload: PromptInput = {
        title: title.trim(),
        category: category || "기타",
        tags,
        prompt: prompt.trim(),
        description: description.trim() || undefined,
        example: example.trim() || undefined,
        createdBy,
      };
      let result;
      if (mode === "create") {
        result = await createPrompt(payload);
      } else if (initial) {
        result = await updatePrompt(initial.id, payload);
      }
      if (!result) {
        setError("저장에 실패했습니다.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/prompts");
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
        <Link href="/admin/prompts" className="hover:text-primary transition-colors">
          AI 프롬프트
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-primary font-semibold">
          {mode === "create" ? "새 프롬프트 등록" : "프롬프트 수정"}
        </span>
      </div>
      <h1 className="text-h1 font-semibold text-on-surface">
        {mode === "create" ? "새 AI 프롬프트" : "프롬프트 수정"}
      </h1>

      <div className="bg-white rounded-xl card-shadow p-xl border border-outline-variant/30 space-y-lg">
        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="title">
            제목 <span className="text-error">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 회의록 핵심 요약 프롬프트"
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">카테고리</label>
          <div className="flex flex-wrap gap-sm">
            {PROMPT_CATEGORIES.map((c) => (
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

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="prompt">
            프롬프트 본문 <span className="text-error">*</span>
          </label>
          <textarea
            id="prompt"
            rows={8}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="실제 ChatGPT·Claude 등에 붙여넣어 사용할 프롬프트 텍스트를 그대로 입력하세요. 변수가 있으면 {{변수명}} 처럼 표시해두면 사용자가 알기 쉽습니다."
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none font-mono"
          />
          <p className="text-label-sm text-secondary">{prompt.length}자</p>
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="description">
            사용 안내
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 프롬프트가 언제 유용한지, 어떤 변수를 채워야 하는지 등 (선택)"
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant" htmlFor="example">
            예시 결과
          </label>
          <textarea
            id="example"
            rows={4}
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="이 프롬프트로 받은 결과 예시를 보여주면 사용자가 적용을 결정하기 쉬워집니다 (선택)"
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
          />
        </div>

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
        </div>

        {error ? (
          <div className="bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm">
            <Icon name="error_outline" className="text-[20px]" />
            <span className="text-body-sm">{error}</span>
          </div>
        ) : null}

        <div className="flex justify-end gap-sm pt-lg border-t border-outline-variant">
          <Link
            href="/admin/prompts"
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
            {submitting ? "저장 중..." : mode === "create" ? "프롬프트 등록" : "변경사항 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
