"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import {
  listAiStyles,
  createAiStyle,
  updateAiStyle,
  deleteAiStyle,
  type AiStyle,
  type AiStyleInput,
} from "@/lib/store/ai-styles";

export default function AdminAiStylesPage() {
  const [items, setItems] = useState<AiStyle[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState<AiStyle | "new" | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setMounted(false);
    const list = await listAiStyles(true);
    setItems(list);
    setMounted(true);
  }

  async function handleDelete(id: string) {
    await deleteAiStyle(id);
    setConfirmDeleteId(null);
    await refresh();
  }

  async function toggleActive(item: AiStyle) {
    await updateAiStyle(item.id, { isActive: !item.isActive });
    await refresh();
  }

  return (
    <div className="max-w-[1080px] mx-auto space-y-lg">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">AI 생성 스타일</h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            사용자가 "AI로 생성하기" 화면에서 선택하는 항목별 디자인 가이드를 등록합니다. 각 스타일의 system prompt에 컨셉·색감·구성 지침을 자세히 적어두면 AI가 그에 맞춰 이미지를 생성합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 flex items-center gap-sm whitespace-nowrap"
        >
          <Icon name="add" className="text-[18px]" />
          새 스타일 추가
        </button>
      </div>

      <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant border-dashed">
        <p className="text-label-sm text-on-surface-variant flex items-start gap-xs">
          <Icon name="info" className="text-primary text-[16px] mt-[1px]" />
          <span>
            system prompt에 영문으로 "Minimalist banner, bold typography, blue palette" 같은 스타일 지침을 적으면 사용자 입력 프롬프트와 합쳐져 AI에 전달됩니다. 비활성 처리된 스타일은 사용자에게 안 보입니다.
          </span>
        </p>
      </div>

      {!mounted ? (
        <div className="bg-white rounded-xl card-shadow p-xl text-center text-secondary">
          불러오는 중…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl card-shadow p-xl text-center text-secondary">
          등록된 스타일이 없습니다. 우상단 "새 스타일 추가"로 시작하세요.
        </div>
      ) : (
        <div className="space-y-md">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-lg"
            >
              <div className="flex items-start justify-between gap-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-sm mb-xs">
                    <h3 className="text-h3 font-semibold">{item.name}</h3>
                    <span
                      className={
                        "text-label-sm px-sm py-[2px] rounded-full " +
                        (item.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-surface-container text-secondary")
                      }
                    >
                      {item.isActive ? "활성" : "비활성"}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="text-body-sm text-on-surface-variant mb-md">
                      {item.description}
                    </p>
                  ) : null}
                  <details className="text-body-sm">
                    <summary className="cursor-pointer text-label-sm text-secondary hover:text-primary">
                      System Prompt 보기
                    </summary>
                    <pre className="mt-sm p-md bg-surface-container-low rounded-lg whitespace-pre-wrap text-label-sm font-mono">
                      {item.systemPrompt}
                    </pre>
                    {item.negativePrompt ? (
                      <>
                        <p className="text-label-sm text-secondary mt-sm">Negative Prompt:</p>
                        <pre className="p-md bg-error-container/30 rounded-lg whitespace-pre-wrap text-label-sm font-mono">
                          {item.negativePrompt}
                        </pre>
                      </>
                    ) : null}
                  </details>
                </div>
                <div className="flex items-center gap-xs flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    className="p-sm hover:bg-surface-container-low rounded-lg text-secondary hover:text-primary"
                    title={item.isActive ? "비활성화" : "활성화"}
                  >
                    <Icon
                      name={item.isActive ? "toggle_on" : "toggle_off"}
                      className="text-[22px]"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="p-sm hover:bg-surface-container-low rounded-lg text-secondary hover:text-primary"
                    title="수정"
                  >
                    <Icon name="edit" className="text-[20px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="p-sm hover:bg-error-container/40 rounded-lg text-secondary hover:text-error"
                    title="삭제"
                  >
                    <Icon name="delete" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <StyleEditorModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      ) : null}

      {confirmDeleteId ? (
        <div className="fixed inset-0 bg-on-background/40 z-50 flex items-center justify-center p-md">
          <div className="bg-white rounded-xl card-shadow border border-outline-variant max-w-md w-full p-xl">
            <h3 className="text-h3 font-semibold mb-xs">스타일을 삭제할까요?</h3>
            <p className="text-body-sm text-on-surface-variant mb-lg">
              과거 생성 이력은 그대로 남지만, 사용자는 더 이상 이 스타일로 새 이미지를 생성할 수 없습니다.
            </p>
            <div className="flex justify-end gap-sm">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-lg py-sm rounded-lg text-secondary hover:bg-surface-container-low"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-lg py-sm rounded-lg bg-error text-on-error font-semibold hover:brightness-95"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StyleEditorModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: AiStyle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? "");
  const [negativePrompt, setNegativePrompt] = useState(initial?.negativePrompt ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!systemPrompt.trim()) {
      setError("System prompt를 입력해주세요.");
      return;
    }
    setSaving(true);
    const payload: AiStyleInput = {
      name,
      description: description.trim() || undefined,
      systemPrompt,
      negativePrompt: negativePrompt.trim() || undefined,
      isActive,
    };
    const result = isNew
      ? await createAiStyle(payload)
      : await updateAiStyle(initial!.id, payload);
    setSaving(false);
    if (!result) {
      setError("저장에 실패했습니다.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-on-background/40 z-50 flex items-center justify-center p-md overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl card-shadow border border-outline-variant max-w-2xl w-full p-xl my-lg space-y-md"
      >
        <h3 className="text-h2 font-semibold">
          {isNew ? "새 AI 스타일 추가" : "AI 스타일 수정"}
        </h3>

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            이름 <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 배너(현수막), 아이콘, 인포그래픽"
            className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            한 줄 설명 (사용자에게 노출)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 광고·캠페인용 가로 배너"
            className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            System Prompt (AI 지침) <span className="text-error">*</span>
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            placeholder='예: "Modern minimalist banner, bold typography, blue brand palette, clean composition, high contrast"'
            className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-mono text-label-sm"
          />
          <p className="text-label-sm text-secondary">
            영문으로 작성 권장. 사용자 프롬프트와 합쳐져서 AI에 전달됩니다.
          </p>
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps text-on-surface-variant">
            Negative Prompt (피할 요소)
          </label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            rows={2}
            placeholder='예: "cluttered, low quality, watermark, blurry text"'
            className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-mono text-label-sm"
          />
        </div>

        <div className="space-y-xs">
          <label className="flex items-center gap-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="text-body-base">활성 (사용자 화면에 노출)</span>
          </label>
        </div>

        {error ? (
          <div className="bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm text-body-sm">
            <Icon name="error_outline" className="text-[20px]" />
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
          <button
            type="button"
            onClick={onClose}
            className="px-lg py-sm rounded-lg text-secondary hover:bg-surface-container-low"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-xl py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all flex items-center gap-sm disabled:opacity-60"
          >
            <Icon name={saving ? "hourglass_empty" : "save"} className="text-[18px]" />
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
