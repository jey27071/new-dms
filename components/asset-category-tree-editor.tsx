"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/icon";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  swapSortOrder,
  buildCategoryTree,
  type Category,
  type CategoryNode,
} from "@/lib/store/categories";

/**
 * 에셋 카테고리 전용 2단계 트리 편집기
 * - 대분류: parent_id 가 null
 * - 소분류: parent_id 가 대분류 id
 * - 깊이 2단계 고정 (소분류 안에 하위 항목은 만들지 못함)
 */
export function AssetCategoryTreeEditor() {
  const [flat, setFlat] = useState<Category[]>([]);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [mounted, setMounted] = useState(false);
  const [newRootLabel, setNewRootLabel] = useState("");
  const [addingRoot, setAddingRoot] = useState(false);
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  const [newChildLabel, setNewChildLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setMounted(false);
    const result = await listCategories("asset");
    setFlat(result);
    const t = buildCategoryTree(result);
    setTree(t);
    // 새로 로드 시 모든 대분류 펼침
    setExpanded(new Set(t.map((n) => n.id)));
    setMounted(true);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAddRoot() {
    const label = newRootLabel.trim();
    if (!label) return;
    setAddingRoot(true);
    await createCategory("asset", label, null);
    setNewRootLabel("");
    await refresh();
    setAddingRoot(false);
  }

  async function handleAddChild(parentId: string) {
    const label = newChildLabel.trim();
    if (!label) return;
    await createCategory("asset", label, parentId);
    setNewChildLabel("");
    setAddingChildTo(null);
    // 부모를 펼침 상태로 유지
    setExpanded((prev) => new Set(prev).add(parentId));
    await refresh();
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

  async function moveSibling(items: CategoryNode[], idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[idx]!;
    const b = items[target]!;
    await swapSortOrder(
      { id: a.id, sortOrder: a.sortOrder },
      { id: b.id, sortOrder: b.sortOrder },
    );
    await refresh();
  }

  return (
    <>
      {/* 대분류 추가 */}
      <div className="p-lg border-b border-outline-variant/30 flex gap-sm">
        <input
          type="text"
          value={newRootLabel}
          onChange={(e) => setNewRootLabel(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddRoot();
            }
          }}
          placeholder="새 대분류 이름 (예: 브랜드, 마케팅, 제품)"
          className="flex-1 px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
        />
        <button
          type="button"
          onClick={handleAddRoot}
          disabled={addingRoot || !newRootLabel.trim()}
          className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-sm whitespace-nowrap"
        >
          <Icon name={addingRoot ? "hourglass_empty" : "create_new_folder"} className="text-[18px]" />
          {addingRoot ? "추가 중..." : "대분류 추가"}
        </button>
      </div>

      <div>
        {!mounted ? (
          <div className="p-xl text-center text-secondary">불러오는 중...</div>
        ) : tree.length === 0 ? (
          <div className="p-xl text-center text-secondary">
            아직 등록된 카테고리가 없습니다. 위에서 대분류를 추가하세요.
          </div>
        ) : (
          <ul>
            {tree.map((root, idx) => (
              <li key={root.id} className="border-b border-outline-variant/30 last:border-b-0">
                {/* 대분류 행 */}
                <div className="flex items-center gap-sm px-lg py-md hover:bg-surface-container-low/50">
                  <button
                    type="button"
                    onClick={() => toggleExpand(root.id)}
                    className="text-secondary hover:text-primary"
                  >
                    <Icon
                      name={expanded.has(root.id) ? "expand_more" : "chevron_right"}
                      className="text-[22px]"
                    />
                  </button>
                  <Icon name="folder" className="text-primary text-[20px]" />

                  <div className="flex flex-col gap-[2px]">
                    <button
                      type="button"
                      onClick={() => moveSibling(tree, idx, -1)}
                      disabled={idx === 0}
                      className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      title="위로"
                    >
                      <Icon name="arrow_drop_up" className="text-[20px] leading-none" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSibling(tree, idx, 1)}
                      disabled={idx === tree.length - 1}
                      className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      title="아래로"
                    >
                      <Icon name="arrow_drop_down" className="text-[20px] leading-none" />
                    </button>
                  </div>

                  {editingId === root.id ? (
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
                      className="flex-1 text-body-base font-semibold text-on-surface cursor-pointer hover:text-primary"
                      onClick={() => startEdit(root)}
                    >
                      {root.label}
                      <span className="ml-sm text-label-sm text-secondary font-normal">
                        ({root.children.length}개 소분류)
                      </span>
                    </span>
                  )}

                  <div className="flex items-center gap-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAddingChildTo(root.id);
                        setExpanded((prev) => new Set(prev).add(root.id));
                      }}
                      className="px-sm py-xs text-label-sm text-primary hover:bg-primary-fixed rounded-lg flex items-center gap-xs"
                      title="소분류 추가"
                    >
                      <Icon name="add" className="text-[16px]" />
                      소분류
                    </button>
                    {editingId === root.id ? null : (
                      <button
                        type="button"
                        onClick={() => startEdit(root)}
                        className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-primary"
                        title="이름 수정"
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(root.id)}
                      className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-error"
                      title="삭제"
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                </div>

                {/* 소분류 목록 */}
                {expanded.has(root.id) ? (
                  <div className="bg-surface-container-low/30">
                    {root.children.length === 0 ? null : (
                      <ul>
                        {root.children.map((child, cidx) => (
                          <li
                            key={child.id}
                            className="flex items-center gap-sm pl-[64px] pr-lg py-sm hover:bg-surface-container-low"
                          >
                            <Icon name="subdirectory_arrow_right" className="text-secondary text-[18px]" />
                            <div className="flex flex-col gap-[2px]">
                              <button
                                type="button"
                                onClick={() => moveSibling(root.children, cidx, -1)}
                                disabled={cidx === 0}
                                className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                title="위로"
                              >
                                <Icon name="arrow_drop_up" className="text-[18px] leading-none" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSibling(root.children, cidx, 1)}
                                disabled={cidx === root.children.length - 1}
                                className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                title="아래로"
                              >
                                <Icon name="arrow_drop_down" className="text-[18px] leading-none" />
                              </button>
                            </div>
                            {editingId === child.id ? (
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
                                className="flex-1 px-md py-xs border border-primary rounded-lg outline-none text-body-sm bg-white"
                              />
                            ) : (
                              <span
                                className="flex-1 text-body-sm text-on-surface cursor-pointer hover:text-primary"
                                onClick={() => startEdit(child)}
                              >
                                {child.label}
                              </span>
                            )}
                            <div className="flex items-center gap-xs">
                              {editingId === child.id ? null : (
                                <button
                                  type="button"
                                  onClick={() => startEdit(child)}
                                  className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-primary"
                                  title="이름 수정"
                                >
                                  <Icon name="edit" className="text-[16px]" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(child.id)}
                                className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-error"
                                title="삭제"
                              >
                                <Icon name="delete" className="text-[16px]" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* 소분류 추가 폼 */}
                    {addingChildTo === root.id ? (
                      <div className="flex items-center gap-sm pl-[64px] pr-lg py-sm bg-primary-fixed/40">
                        <Icon name="add" className="text-primary text-[18px]" />
                        <input
                          type="text"
                          value={newChildLabel}
                          onChange={(e) => setNewChildLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddChild(root.id);
                            } else if (e.key === "Escape") {
                              setAddingChildTo(null);
                              setNewChildLabel("");
                            }
                          }}
                          autoFocus
                          placeholder="소분류 이름 입력 후 Enter"
                          className="flex-1 px-md py-xs border border-primary rounded-lg outline-none text-body-sm bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddChild(root.id)}
                          disabled={!newChildLabel.trim()}
                          className="px-md py-xs bg-primary text-on-primary rounded-lg text-label-sm font-semibold disabled:opacity-60"
                        >
                          추가
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingChildTo(null);
                            setNewChildLabel("");
                          }}
                          className="px-md py-xs text-secondary hover:text-error rounded-lg text-label-sm"
                        >
                          취소
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
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
                  대분류 삭제 시 그 아래 소분류도 같이 사라집니다. 이미 저장된 에셋의 카테고리 라벨은
                  그대로 유지되지만, 새 에셋 등록 시엔 선택지에서 제외됩니다.
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
    </>
  );
}
