"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type Prompt } from "@/lib/data";
import { listPrompts, isUserPrompt, deletePrompt } from "@/lib/store/prompts";

export default function AdminPromptsPage() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const result = await listPrompts();
    setItems(result);
    setMounted(true);
  }

  async function handleDelete(id: string) {
    await deletePrompt(id);
    setConfirmDeleteId(null);
    await refresh();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [items, query]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">AI 프롬프트</h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            사내에서 검증된 생성형 AI 프롬프트를 라이브러리화합니다. 일반 사용자는 검색·복사해서 사용합니다.
          </p>
        </div>
        <Link
          href="/admin/prompts/new"
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all"
        >
          <Icon name="add" className="text-[20px]" />새 프롬프트
        </Link>
      </div>

      <div className="bg-white p-md rounded-xl card-shadow border border-outline-variant/30">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목 · 카테고리 · 해시태그 · 본문 검색"
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase">
              <tr>
                <th className="px-lg py-md">제목</th>
                <th className="px-lg py-md">카테고리</th>
                <th className="px-lg py-md">해시태그</th>
                <th className="px-lg py-md">등록일</th>
                <th className="px-lg py-md">출처</th>
                <th className="px-lg py-md text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {!mounted ? (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-secondary">
                    {items.length === 0 ? "등록된 프롬프트가 없습니다." : "검색 결과가 없습니다."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isUser = isUserPrompt(p);
                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-md font-semibold text-on-surface">{p.title}</td>
                      <td className="px-lg py-md">
                        <span className="px-sm py-xs bg-primary-fixed text-on-primary-fixed-variant text-label-sm rounded-full">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex flex-wrap gap-xs">
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-xs py-[2px] text-[10px] bg-surface-container-high text-on-surface-variant rounded"
                            >
                              #{t}
                            </span>
                          ))}
                          {p.tags.length > 3 ? (
                            <span className="text-[10px] text-outline">+{p.tags.length - 3}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-lg py-md text-secondary">
                        {p.createdAt.slice(0, 10)}
                      </td>
                      <td className="px-lg py-md">
                        {isUser ? (
                          <span className="px-xs py-[2px] bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wider rounded">
                            사용자
                          </span>
                        ) : (
                          <span className="px-xs py-[2px] bg-surface-container-high text-secondary text-[10px] font-bold uppercase tracking-wider rounded">
                            샘플
                          </span>
                        )}
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-xs justify-end">
                          {isUser ? (
                            <>
                              <Link
                                href={`/admin/prompts/${p.id}`}
                                className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-primary transition-colors"
                                title="수정"
                              >
                                <Icon name="edit" className="text-[18px]" />
                              </Link>
                              <button
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-error transition-colors"
                                title="삭제"
                              >
                                <Icon name="delete" className="text-[18px]" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-outline italic">읽기 전용</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDeleteId ? (
        <div className="fixed inset-0 bg-on-background/40 z-50 flex items-center justify-center p-md">
          <div className="bg-white rounded-xl card-shadow border border-outline-variant max-w-md w-full p-xl">
            <div className="flex items-start gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
                <Icon name="warning" className="text-on-error-container text-[22px]" />
              </div>
              <div>
                <h3 className="text-h3 font-semibold mb-xs">프롬프트를 삭제할까요?</h3>
                <p className="text-body-sm text-on-surface-variant">
                  사용자 라이브러리에서 즉시 사라집니다. 되돌릴 수 없습니다.
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
