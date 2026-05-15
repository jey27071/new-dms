"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type Guideline } from "@/lib/data";
import { listGuidelines } from "@/lib/store/guidelines";

export default function GuidelinesPage() {
  const [items, setItems] = useState<Guideline[]>([]);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listGuidelines();
      if (!cancelled) {
        setItems(result);
        setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      <div>
        <h1 className="text-h1 font-semibold text-on-surface">가이드라인</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          브랜드 가이드·정책·에셋 키트 등 모든 공식 문서를 한 곳에서 확인하세요.
        </p>
      </div>

      {/* 검색 + 태그 */}
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

      {!mounted ? (
        <div className="grid grid-cols-3 gap-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-lg rounded-xl card-shadow animate-pulse">
              <div className="w-full h-40 bg-surface-container rounded-lg mb-md" />
              <div className="h-5 bg-surface-container rounded w-3/4 mb-xs" />
              <div className="h-3 bg-surface-container rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-xl rounded-xl card-shadow border border-outline-variant/30 text-center text-secondary">
          {items.length === 0 ? "등록된 가이드라인이 없습니다." : "검색 결과가 없습니다."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-lg">
          {filtered.map((g) => (
            <Link
              key={g.id}
              href={`/guidelines/${g.id}`}
              className="bg-white p-lg rounded-xl border border-outline-variant card-shadow group hover:border-primary transition-all"
            >
              <div className="w-full h-40 bg-surface-container rounded-lg mb-md overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.cover}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 backdrop-blur-sm px-sm py-xs rounded text-label-caps text-on-surface border border-outline-variant/30">
                    {g.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-xs">
                <h4 className="text-h3 font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {g.title}
                </h4>
                <span className="text-label-sm text-secondary">{g.version}</span>
              </div>
              <p className="text-body-sm text-on-surface-variant line-clamp-2">{g.notes}</p>
              {g.tags.length > 0 ? (
                <div className="flex flex-wrap gap-xs mt-sm">
                  {g.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="px-xs py-[2px] text-[10px] bg-surface-container-high text-on-surface-variant rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center gap-xs text-label-sm text-secondary mt-md">
                <Icon name="calendar_today" className="text-[14px]" />
                {g.updatedAt}
                {g.owner ? (
                  <>
                    <span className="mx-xs">·</span>
                    <Icon name="person" className="text-[14px]" />
                    {g.owner}
                  </>
                ) : null}
                {g.pages > 0 ? (
                  <>
                    <span className="mx-xs">·</span>
                    <Icon name="description" className="text-[14px]" />
                    {g.pages}p
                  </>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
