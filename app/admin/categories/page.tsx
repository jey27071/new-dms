"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/icon";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  swapSortOrder,
  type Category,
  type CategoryDomain,
} from "@/lib/store/categories";
import { AssetCategoryTreeEditor } from "@/components/asset-category-tree-editor";

const DOMAINS: { key: CategoryDomain; label: string; description: string }[] = [
  {
    key: "request",
    label: "요청 카테고리",
    description: "사용자가 새 요청을 제출할 때 선택하는 카테고리 목록.",
  },
  {
    key: "prompt",
    label: "프롬프트 카테고리",
    description: "AI 프롬프트 라이브러리에서 사용되는 카테고리 목록.",
  },
  {
    key: "asset",
    label: "에셋 카테고리",
    description: "에셋 라이브러리에서 분류·필터링에 사용되는 카테고리 목록.",
  },
];

export default function AdminCategoriesPage() {
  const [activeDomain, setActiveDomain] = useState<CategoryDomain>("request");
  const [items, setItems] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDomain]);

  async function refresh() {
    setMounted(false);
    const result = await listCategories(activeDomain);
    setItems(result);
    setMounted(true);
  }

  async function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;
    setAdding(true);
    await createCategory(activeDomain, label);
    setNewLabel("");
    await refresh();
    setAdding(false);
  }

  function handleAddKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  function startEdit(item: Category) {
    setEditingId(item.id);
    setEditLabel(item.label);
  }

  async function saveEdit() {
    if (!editingId || !editLabel.trim()) {
      setEditingId(null);
      return;
    }
    await updateCategory(editingId, { label: editLabel });
    setEditingId(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    await deleteCategory(id);
    setConfirmDeleteId(null);
    await refresh();
  }

  async function moveUp(idx: number) {
    if (idx === 0) return;
    const a = items[idx];
    const b = items[idx - 1];
    if (!a || !b) return;
    await swapSortOrder(
      { id: a.id, sortOrder: a.sortOrder },
      { id: b.id, sortOrder: b.sortOrder },
    );
    await refresh();
  }

  async function moveDown(idx: number) {
    if (idx >= items.length - 1) return;
    const a = items[idx];
    const b = items[idx + 1];
    if (!a || !b) return;
    await swapSortOrder(
      { id: a.id, sortOrder: a.sortOrder },
      { id: b.id, sortOrder: b.sortOrder },
    );
    await refresh();
  }

  const currentDomain = DOMAINS.find((d) => d.key === activeDomain);

  return (
    <div className="max-w-[900px] mx-auto space-y-lg">
      <div>
        <h1 className="text-h1 font-semibold text-on-surface">카테고리 설정</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          사용자가 폼에서 선택하는 카테고리 항목을 추가·수정·삭제·정렬합니다.
        </p>
      </div>

      <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant border-dashed">
        <p className="text-label-sm text-on-surface-variant flex items-start gap-xs">
          <Icon name="info" className="text-primary text-[16px] mt-[1px]" />
          <span>
            기존 데이터에 저장된 카테고리 라벨은 그대로 유지됩니다. 카테고리를 삭제해도 과거 데이터에는
            영향 없이 표시되며, 새로 만드는 항목부터 변경된 목록이 적용됩니다.
          </span>
        </p>
      </div>

      <div className="flex gap-sm p-xs bg-surface-container-low rounded-xl w-fit">
        {DOMAINS.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDomain(d.key)}
            className={
              "px-md py-sm text-label-sm rounded-lg transition-colors " +
              (activeDomain === d.key
                ? "bg-white text-primary card-shadow font-semibold"
                : "text-secondary hover:bg-white/50")
            }
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant/30 bg-surface-container-low/50">
          <h3 className="text-h3 font-semibold">{currentDomain?.label}</h3>
          <p className="text-label-sm text-on-surface-variant mt-xs">{currentDomain?.description}</p>
        </div>

        {activeDomain === "asset" ? (
          <AssetCategoryTreeEditor />
        ) : (
        <>
        <div className="p-lg border-b border-outline-variant/30 flex gap-sm">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={handleAddKey}
            placeholder="새 카테고리 이름 입력 후 Enter"
            className="flex-1 px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newLabel.trim()}
            className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-sm whitespace-nowrap"
          >
            <Icon name={adding ? "hourglass_empty" : "add"} className="text-[18px]" />
            {adding ? "추가 중..." : "추가"}
          </button>
        </div>

        <div>
          {!mounted ? (
            <div className="p-xl text-center text-secondary">불러오는 중...</div>
          ) : items.length === 0 ? (
            <div className="p-xl text-center text-secondary">
              아직 등록된 카테고리가 없습니다. 위에서 추가하세요.
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/30">
              {items.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex items-center gap-sm px-lg py-md hover:bg-surface-container-low/50 transition-colors"
                >
                  <span className="text-label-sm text-secondary font-mono w-6 text-right">
                    {idx + 1}
                  </span>

                  <div className="flex flex-col gap-[2px]">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      title="위로"
                    >
                      <Icon name="arrow_drop_up" className="text-[20px] leading-none" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === items.length - 1}
                      className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      title="아래로"
                    >
                      <Icon name="arrow_drop_down" className="text-[20px] leading-none" />
                    </button>
                  </div>

                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEdit();
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      onBlur={saveEdit}
                      autoFocus
                      className="flex-1 px-md py-xs border border-primary rounded-lg outline-none text-body-base bg-white"
                    />
                  ) : (
                    <span
                      className="flex-1 text-body-base text-on-surface cursor-pointer hover:text-primary transition-colors"
                      onClick={() => startEdit(item)}
                    >
                      {item.label}
                    </span>
                  )}

                  <div className="flex items-center gap-xs">
                    {editingId === item.id ? null : (
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-primary transition-colors"
                        title="수정"
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-error transition-colors"
                      title="삭제"
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        </>
        )}
      </div>

      {confirmDeleteId ? (
        <div className="fixed inset-0 bg-on-background/40 z-50 flex items-center justify-center p-md">
          <div className="bg-white rounded-xl card-shadow border border-outline-variant max-w-md w-full p-xl">
            <div className="flex items-start gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
                <Icon name="warning" className="text-on-error-container text-[22px]" />
              </div>
              <div>
                <h3 className="text-h3 font-semibold mb-xs">카테고리를 삭제할까요?</h3>
                <p className="text-body-sm text-on-surface-variant">
                  이후 새 요청·프롬프트에서 이 카테고리를 선택할 수 없습니다. 이미 저장된 데이터의
                  카테고리 라벨은 그대로 유지됩니다.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-sm mt-lg">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-lg py-sm rounded-lg text-secondary hover:bg-surface-container-low transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-lg py-sm rounded-lg bg-error text-on-error font-semibold hover:brightness-95 transition-all"
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
