"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type Guideline } from "@/lib/data";
import { listGuidelines, isUserGuideline, deleteGuideline } from "@/lib/store/guidelines";

export default function AdminGuidelinesPage() {
  const [items, setItems] = useState<Guideline[]>([]);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const result = await listGuidelines();
    setItems(result);
    setMounted(true);
  }

  async function handleDelete(id: string) {
    await deleteGuideline(id);
    setConfirmDeleteId(null);
    await refresh();
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((g) => g.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((g) => {
      if (tagFilter && !g.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.notes.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        (g.owner ?? "").toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, query, tagFilter]);

  const seedCount = items.filter((g) => !isUserGuideline(g)).length;
  const userCount = items.length - seedCount;

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">가이드라인 관리</h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            브랜드 가이드·정책 문서를 게시판형으로 관리합니다. 샘플은 읽기 전용입니다.
          </p>
        </div>
        <Link
          href="/admin/guidelines/new"
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all"
        >
          <Icon name="add" className="text-[20px]" />새 가이드라인
        </Link>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-lg">
        <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
          <span className="text-label-caps text-secondary">총 가이드라인</span>
          <p className="text-h1 font-semibold mt-xs">{mounted ? items.length : "–"}</p>
        </div>
        <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
          <span className="text-label-caps text-secondary">샘플 (읽기 전용)</span>
          <p className="text-h1 font-semibold mt-xs text-secondary">{mounted ? seedCount : "–"}</p>
        </div>
        <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
          <span className="text-label-caps text-secondary">사용자 등록</span>
          <p className="text-h1 font-semibold mt-xs text-primary">{mounted ? userCount : "–"}</p>
        </div>
      </div>

      {/* 검색 + 태그 필터 */}
      <div className="bg-white p-md rounded-xl card-shadow border border-outline-variant/30 space-y-md">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목 · 카테고리 · 담당자 · 해시태그 검색"
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
          />
        </div>
        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-xs items-center">
            <span className="text-label-caps text-on-surface-variant mr-sm">태그:</span>
            <button
              onClick={() => setTagFilter(null)}
              className={
                "px-sm py-xs rounded-full text-label-sm transition-colors " +
                (tagFilter === null
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-secondary hover:bg-surface-container")
              }
            >
              전체
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={
                  "px-sm py-xs rounded-full text-label-sm transition-colors " +
                  (tagFilter === t
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-secondary hover:bg-surface-container")
                }
              >
                #{t}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* 게시판 */}
      <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase">
              <tr>
                <th className="px-lg py-md w-[60px]"></th>
                <th className="px-lg py-md">제목</th>
                <th className="px-lg py-md">카테고리</th>
                <th className="px-lg py-md">담당자</th>
                <th className="px-lg py-md">해시태그</th>
                <th className="px-lg py-md">업데이트</th>
                <th className="px-lg py-md">출처</th>
                <th className="px-lg py-md text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {!mounted ? (
                <tr>
                  <td colSpan={8} className="px-lg py-xl text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-lg py-xl text-center text-secondary">
                    {items.length === 0
                      ? "등록된 가이드라인이 없습니다."
                      : "검색 결과가 없습니다."}
                  </td>
                </tr>
              ) : (
                filtered.map((g) => {
                  const isUser = isUserGuideline(g);
                  return (
                    <tr key={g.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={g.cover}
                          alt={g.title}
                          className="w-10 h-12 rounded object-cover bg-surface-container"
                        />
                      </td>
                      <td className="px-lg py-md font-semibold text-on-surface">
                        <Link
                          href={`/guidelines/${g.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {g.title}
                        </Link>
                        <span className="ml-xs text-label-sm text-secondary font-normal">
                          {g.version}
                        </span>
                      </td>
                      <td className="px-lg py-md text-secondary">{g.category}</td>
                      <td className="px-lg py-md text-secondary">{g.owner ?? "–"}</td>
                      <td className="px-lg py-md">
                        <div className="flex flex-wrap gap-xs">
                          {g.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-xs py-[2px] text-[10px] bg-surface-container-high text-on-surface-variant rounded"
                            >
                              #{t}
                            </span>
                          ))}
                          {g.tags.length > 3 ? (
                            <span className="text-[10px] text-outline">+{g.tags.length - 3}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-lg py-md text-secondary">{g.updatedAt}</td>
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
                                href={`/admin/guidelines/${g.id}`}
                                className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-primary transition-colors"
                                title="수정"
                              >
                                <Icon name="edit" className="text-[18px]" />
                              </Link>
                              <button
                                onClick={() => setConfirmDeleteId(g.id)}
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

      {/* 삭제 확인 모달 */}
      {confirmDeleteId ? (
        <div className="fixed inset-0 bg-on-background/40 z-50 flex items-center justify-center p-md">
          <div className="bg-white rounded-xl card-shadow border border-outline-variant max-w-md w-full p-xl">
            <div className="flex items-start gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
                <Icon name="warning" className="text-on-error-container text-[22px]" />
              </div>
              <div>
                <h3 className="text-h3 font-semibold mb-xs">가이드라인을 삭제할까요?</h3>
                <p className="text-body-sm text-on-surface-variant">
                  사용자 화면에서도 즉시 사라집니다. 이 작업은 되돌릴 수 없습니다.
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
