"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type Prompt } from "@/lib/data";
import { listPrompts } from "@/lib/store/prompts";
import { listCategories } from "@/lib/store/categories";

export default function PromptsLibraryPage() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [managedCategories, setManagedCategories] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [prompts, cats] = await Promise.all([listPrompts(), listCategories("prompt")]);
      if (!cancelled) {
        setItems(prompts);
        setManagedCategories(cats.map((c) => c.label));
        setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  const categories = useMemo(() => {
    // 관리자가 등록한 카테고리 순서 우선, 그 외 실제 데이터에 있는 카테고리는 뒤에 붙임
    const inUse = new Set(items.map((p) => p.category));
    const result: string[] = [];
    for (const c of managedCategories) {
      if (inUse.has(c)) result.push(c);
    }
    for (const c of inUse) {
      if (!result.includes(c)) result.push(c);
    }
    return result;
  }, [items, managedCategories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (tagFilter && !p.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, query, activeCategory, tagFilter]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCopy(p: Prompt) {
    try {
      await navigator.clipboard.writeText(p.prompt);
      setCopiedId(p.id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === p.id ? null : prev));
      }, 1800);
    } catch (err) {
      console.error("clipboard error", err);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-xl">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-sm text-secondary text-label-sm mb-xs">
          <Icon name="auto_awesome" className="text-[14px]" />
          <Link href="/design" className="hover:text-primary transition-colors">
            디자인 템플릿
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <Link href="/design/ai" className="hover:text-primary transition-colors">
            AI로 디자인 하기
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-primary font-semibold">AI 프롬프트 라이브러리</span>
        </div>
        <h1 className="text-h1 font-semibold text-on-surface">AI 프롬프트 라이브러리</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          사내에서 검증된 프롬프트를 검색하고 복사해서 ChatGPT·Claude·Midjourney 등에 그대로 붙여넣어 사용하세요.
        </p>
      </div>

      {/* 검색 + 카테고리 + 태그 */}
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
            placeholder="제목 · 카테고리 · 해시태그 · 본문 검색"
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
          />
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-xs items-center">
            <span className="text-label-caps text-on-surface-variant mr-sm">카테고리:</span>
            <button
              onClick={() => setActiveCategory(null)}
              className={
                "px-sm py-xs rounded-full text-label-sm transition-colors " +
                (activeCategory === null
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-secondary hover:bg-surface-container")
              }
            >
              전체
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={
                  "px-sm py-xs rounded-full text-label-sm transition-colors " +
                  (activeCategory === c
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-secondary hover:bg-surface-container")
                }
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}

        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-xs items-center">
            <span className="text-label-caps text-on-surface-variant mr-sm">태그:</span>
            <button
              onClick={() => setTagFilter(null)}
              className={
                "px-sm py-xs rounded-full text-label-sm transition-colors " +
                (tagFilter === null
                  ? "bg-on-surface text-surface"
                  : "bg-surface-container-low text-secondary hover:bg-surface-container")
              }
            >
              전체
            </button>
            {allTags.slice(0, 12).map((t) => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={
                  "px-sm py-xs rounded-full text-label-sm transition-colors " +
                  (tagFilter === t
                    ? "bg-on-surface text-surface"
                    : "bg-surface-container-low text-secondary hover:bg-surface-container")
                }
              >
                #{t}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* 결과 */}
      {!mounted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-lg rounded-xl card-shadow animate-pulse">
              <div className="h-5 bg-surface-container rounded mb-sm w-2/3" />
              <div className="h-3 bg-surface-container rounded mb-xs" />
              <div className="h-3 bg-surface-container rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-xl rounded-xl card-shadow border border-outline-variant/30 text-center">
          <Icon name="lightbulb" className="text-secondary text-[48px] mb-md" />
          <h3 className="text-h3 font-semibold mb-xs">
            {items.length === 0 ? "등록된 프롬프트가 없습니다" : "검색 결과가 없습니다"}
          </h3>
          <p className="text-body-base text-on-surface-variant">
            {items.length === 0
              ? "관리자가 프롬프트를 등록하면 여기에 나타납니다."
              : "다른 키워드로 검색해보거나 필터를 초기화해주세요."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {filtered.map((p) => {
            const isOpen = expanded.has(p.id);
            const isCopied = copiedId === p.id;
            return (
              <article
                key={p.id}
                className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden flex flex-col"
              >
                <div className="p-lg flex-1">
                  <div className="flex items-start justify-between gap-sm mb-sm">
                    <h3 className="text-h3 font-semibold text-on-surface flex-1">{p.title}</h3>
                    <span className="px-sm py-xs bg-primary-fixed text-on-primary-fixed-variant text-label-sm rounded-full whitespace-nowrap">
                      {p.category}
                    </span>
                  </div>

                  {p.description ? (
                    <p className="text-body-sm text-on-surface-variant mb-md">{p.description}</p>
                  ) : null}

                  <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md font-mono text-body-sm text-on-surface whitespace-pre-wrap mb-md">
                    {isOpen ? p.prompt : truncate(p.prompt, 220)}
                    {!isOpen && p.prompt.length > 220 ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(p.id)}
                        className="ml-xs text-primary hover:underline font-sans"
                      >
                        더 보기
                      </button>
                    ) : null}
                    {isOpen && p.prompt.length > 220 ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(p.id)}
                        className="block mt-sm text-primary hover:underline font-sans text-label-sm"
                      >
                        접기
                      </button>
                    ) : null}
                  </div>

                  {isOpen && p.example ? (
                    <div className="mb-md">
                      <p className="text-label-caps text-on-surface-variant mb-xs">예시 결과</p>
                      <div className="bg-secondary-container/30 border border-outline-variant/50 rounded-lg p-md text-body-sm text-on-surface-variant whitespace-pre-wrap">
                        {p.example}
                      </div>
                    </div>
                  ) : null}

                  {p.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-xs">
                      {p.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTagFilter(t === tagFilter ? null : t)}
                          className="px-xs py-[2px] text-[10px] bg-surface-container-high text-on-surface-variant rounded hover:bg-primary-fixed hover:text-on-primary-fixed-variant transition-colors"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-sm p-md border-t border-outline-variant/30 bg-surface-container-low/50">
                  <button
                    type="button"
                    onClick={() => handleCopy(p)}
                    className={
                      "flex-1 flex items-center justify-center gap-sm py-sm rounded-lg font-semibold transition-all " +
                      (isCopied
                        ? "bg-emerald-500 text-white"
                        : "bg-primary text-on-primary hover:brightness-95")
                    }
                  >
                    <Icon name={isCopied ? "check" : "content_copy"} className="text-[18px]" />
                    {isCopied ? "복사됨" : "프롬프트 복사"}
                  </button>
                  {p.prompt.length > 220 ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(p.id)}
                      className="px-md py-sm rounded-lg border border-outline-variant text-secondary hover:bg-surface-container transition-colors flex items-center gap-xs"
                    >
                      <Icon
                        name={isOpen ? "expand_less" : "expand_more"}
                        className="text-[18px]"
                      />
                      {isOpen ? "접기" : "전체 보기"}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}
