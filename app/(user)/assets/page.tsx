"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import {
  getAssetCategoryLabel,
  type Asset,
} from "@/lib/data";
import { listAssets } from "@/lib/store/assets";
import {
  listCategories,
  buildCategoryTree,
  type CategoryNode,
} from "@/lib/store/categories";

const PAGE_SIZE = 24;

export default function AssetLibraryPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [mounted, setMounted] = useState(false);

  // 필터·검색 상태
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [assetList, catList] = await Promise.all([
        listAssets(),
        listCategories("asset"),
      ]);
      if (cancelled) return;
      setItems(assetList);
      setTree(buildCategoryTree(catList));
      setMounted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 사용 중인 포맷 (DB 데이터에서 자동 추출)
  const allFormats = useMemo(() => {
    const set = new Set<string>();
    items.forEach((a) => a.formats.forEach((f) => set.add(f)));
    return Array.from(set).sort();
  }, [items]);

  // 활성 대분류 (소분류 노출 결정용): 선택된 라벨이 어느 대분류 소속인지 추적
  const activeRootIds = useMemo(() => {
    const ids = new Set<string>();
    for (const root of tree) {
      if (selectedCategories.has(root.label)) ids.add(root.id);
      for (const child of root.children) {
        if (selectedCategories.has(child.label)) ids.add(root.id);
      }
    }
    return ids;
  }, [tree, selectedCategories]);

  // 필터링
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((a) => {
      const catLabel = getAssetCategoryLabel(a.category);
      const passCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(catLabel) ||
        selectedCategories.has(a.category);
      const passFormat =
        selectedFormats.size === 0 || a.formats.some((f) => selectedFormats.has(f));
      const passSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q) ||
        catLabel.toLowerCase().includes(q);
      return passCategory && passFormat && passSearch;
    });
  }, [items, search, selectedCategories, selectedFormats]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // 필터·검색 바뀔 때 페이지 1로
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategories, selectedFormats]);

  function toggleCategoryLabel(label: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleRootGroup(root: CategoryNode) {
    // 대분류 + 자식 라벨 한 번에 토글
    const labels = [root.label, ...root.children.map((c) => c.label)];
    const allOn = labels.every((l) => selectedCategories.has(l));
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (allOn) labels.forEach((l) => next.delete(l));
      else labels.forEach((l) => next.add(l));
      return next;
    });
  }

  function toggleFormat(f: string) {
    setSelectedFormats((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  function resetFilters() {
    setSearch("");
    setSelectedCategories(new Set());
    setSelectedFormats(new Set());
  }

  const allCategoryActive = selectedCategories.size === 0;
  const hasAnyFilter = !!search.trim() || !allCategoryActive || selectedFormats.size > 0;
  const noCategoriesConfigured = mounted && tree.length === 0;

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-md flex-wrap">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">
            {mounted ? `${filtered.length}개의 에셋` : "에셋 라이브러리"}
          </h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            브랜드 가이드에 맞는 검증된 에셋을 검색·다운로드하세요.
          </p>
        </div>
      </div>

      {/* CTA · 찾는 에셋이 없을 때 */}
      <div className="bg-primary-fixed/40 border border-primary/20 rounded-xl p-md flex items-center justify-between gap-md">
        <div className="flex items-center gap-md min-w-0">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Icon name="lightbulb" className="text-primary text-[22px]" />
          </div>
          <div className="min-w-0">
            <p className="text-body-base font-semibold text-on-surface">찾는 에셋이 없나요?</p>
            <p className="text-label-sm text-on-surface-variant">
              필요한 에셋을 디자인 팀에 직접 요청하세요. 보통 영업일 기준 2~3일 내 검토됩니다.
            </p>
          </div>
        </div>
        <Link
          href="/my-requests/new?type=asset_create"
          className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all whitespace-nowrap"
        >
          <Icon name="add" className="text-[18px]" />
          새 에셋 요청
        </Link>
      </div>

      {/* 검색 + 필터 통합 바 */}
      <div className="bg-white border border-outline-variant rounded-xl card-shadow p-md space-y-md">
        {/* 검색 */}
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="에셋 제목·설명·카테고리로 검색"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-md py-sm text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          ) : null}
        </div>

        {/* 카테고리 칩 (대분류) */}
        <div className="flex items-start gap-md flex-wrap">
          <span className="text-label-caps text-secondary pt-[6px] w-[64px] flex-shrink-0">
            카테고리
          </span>
          <div className="flex flex-wrap gap-xs flex-1">
            <Chip active={allCategoryActive} onClick={() => setSelectedCategories(new Set())}>
              전체
            </Chip>
            {noCategoriesConfigured ? (
              <span className="text-label-sm text-secondary py-xs">
                등록된 카테고리가 없습니다. 관리자에게 문의하세요.
              </span>
            ) : (
              tree.map((root) => {
                const labels = [root.label, ...root.children.map((c) => c.label)];
                const allOn = labels.every((l) => selectedCategories.has(l));
                const someOn = labels.some((l) => selectedCategories.has(l));
                return (
                  <Chip
                    key={root.id}
                    active={allOn}
                    indeterminate={someOn && !allOn}
                    onClick={() => toggleRootGroup(root)}
                  >
                    {root.label}
                    {root.children.length > 0 ? (
                      <span className="ml-xs text-label-sm opacity-70">
                        ({root.children.length})
                      </span>
                    ) : null}
                  </Chip>
                );
              })
            )}
          </div>
        </div>

        {/* 활성 대분류의 소분류 노출 */}
        {tree
          .filter((r) => activeRootIds.has(r.id) && r.children.length > 0)
          .map((root) => (
            <div key={root.id} className="flex items-start gap-md flex-wrap pl-[80px]">
              <span className="text-label-sm text-secondary pt-[6px]">
                └ {root.label} 하위
              </span>
              <div className="flex flex-wrap gap-xs flex-1">
                {root.children.map((child) => (
                  <Chip
                    key={child.id}
                    size="sm"
                    active={selectedCategories.has(child.label)}
                    onClick={() => toggleCategoryLabel(child.label)}
                  >
                    {child.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}

        {/* 파일 형식 */}
        {allFormats.length > 0 ? (
          <div className="flex items-start gap-md flex-wrap">
            <span className="text-label-caps text-secondary pt-[6px] w-[64px] flex-shrink-0">
              파일 형식
            </span>
            <div className="flex flex-wrap gap-xs flex-1">
              {allFormats.map((f) => (
                <Chip
                  key={f}
                  active={selectedFormats.has(f)}
                  onClick={() => toggleFormat(f)}
                  size="sm"
                  mono
                >
                  {f}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        {/* 필터 초기화 */}
        {hasAnyFilter ? (
          <div className="flex justify-end pt-xs border-t border-outline-variant/40">
            <button
              type="button"
              onClick={resetFilters}
              className="text-label-sm text-secondary hover:text-primary flex items-center gap-xs"
            >
              <Icon name="restart_alt" className="text-[16px]" />
              모든 필터 초기화
            </button>
          </div>
        ) : null}
      </div>

      {/* 결과 그리드 */}
      {!mounted ? (
        <div className="grid grid-cols-4 gap-lg">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white card-shadow rounded-xl p-md animate-pulse">
              <div className="aspect-[4/3] rounded-lg bg-surface-container mb-md" />
              <div className="h-4 bg-surface-container rounded mb-xs w-3/4" />
              <div className="h-3 bg-surface-container rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-xl text-center">
          <Icon name="search_off" className="text-secondary text-[40px] mb-md block mx-auto" />
          <p className="text-body-base font-semibold mb-xs">조건에 맞는 에셋이 없습니다</p>
          <p className="text-body-sm text-on-surface-variant mb-md">
            필터를 해제하거나 위의 "새 에셋 요청"으로 디자인 팀에 요청해보세요.
          </p>
          {hasAnyFilter ? (
            <button
              type="button"
              onClick={resetFilters}
              className="px-lg py-sm bg-white border border-outline-variant rounded-lg text-label-sm font-semibold hover:bg-surface-container-high"
            >
              필터 초기화
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-lg">
            {visible.map((a) => (
              <Link
                key={a.id}
                href={`/assets/${a.id}`}
                className="bg-white card-shadow rounded-xl p-md flex flex-col group transition-all hover:scale-[1.01] hover:border-primary-fixed border border-transparent"
              >
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-md bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                  <span className="absolute top-sm right-sm p-xs bg-white/80 rounded-full inline-flex">
                    <Icon name="bookmark" className="text-secondary text-[20px]" />
                  </span>
                </div>
                <h4 className="text-h3 font-semibold text-on-surface mb-xs truncate">
                  {a.title}
                </h4>
                <div className="flex gap-xs mb-md flex-wrap">
                  <span className="px-xs py-[2px] bg-surface-container text-label-sm text-on-surface-variant rounded">
                    {getAssetCategoryLabel(a.category)}
                  </span>
                  {a.formats.slice(0, 3).map((f, idx) => (
                    <span
                      key={f}
                      className={
                        "px-xs py-[2px] text-label-sm rounded " +
                        (idx === 0
                          ? "bg-primary-fixed text-on-primary-fixed-variant"
                          : "bg-secondary-fixed text-on-secondary-fixed-variant")
                      }
                    >
                      {f}
                    </span>
                  ))}
                  {a.formats.length > 3 ? (
                    <span className="px-xs py-[2px] text-label-sm rounded bg-surface-container text-secondary">
                      +{a.formats.length - 3}
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-xs text-secondary">
                    <Icon name="download" className="text-[16px]" />
                    <span className="text-label-sm">{a.downloads}</span>
                  </div>
                  <span className="bg-primary text-on-primary px-md py-xs rounded-lg text-label-sm font-semibold">
                    다운로드
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-xs mt-xl">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-md py-sm rounded-lg text-label-sm border border-outline-variant bg-white hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-xs"
              >
                <Icon name="chevron_left" className="text-[18px]" />
                이전
              </button>
              {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`gap-${i}`} className="px-xs text-secondary">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={
                      "min-w-[40px] py-sm rounded-lg text-label-sm border transition-colors " +
                      (p === currentPage
                        ? "bg-primary text-on-primary border-primary font-semibold"
                        : "bg-white text-on-surface border-outline-variant hover:bg-surface-container-high")
                    }
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-md py-sm rounded-lg text-label-sm border border-outline-variant bg-white hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-xs"
              >
                다음
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          ) : null}
          <p className="text-label-sm text-secondary text-center mt-md">
            {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} /{" "}
            {filtered.length}개 표시
          </p>
        </>
      )}
    </div>
  );
}

/** 칩 버튼 — 토글 가능한 작은 배지 형태 */
function Chip({
  children,
  active,
  indeterminate,
  onClick,
  size = "md",
  mono,
}: {
  children: React.ReactNode;
  active?: boolean;
  indeterminate?: boolean;
  onClick: () => void;
  size?: "sm" | "md";
  mono?: boolean;
}) {
  const padding = size === "sm" ? "px-sm py-xs" : "px-md py-xs";
  const base =
    "rounded-full text-label-sm transition-all border whitespace-nowrap " +
    (mono ? "font-mono " : "") +
    padding;
  let style = "";
  if (active) {
    style = "bg-primary text-on-primary border-primary font-semibold";
  } else if (indeterminate) {
    style =
      "bg-primary-fixed text-primary border-primary/40 font-semibold";
  } else {
    style =
      "bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low hover:border-primary/30";
  }
  return (
    <button type="button" onClick={onClick} className={`${base} ${style}`}>
      {children}
    </button>
  );
}

/** 페이지 번호 1, 2, …, n 압축 표시 */
function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | "...")[] = [1];
  if (current > 3) result.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    result.push(i);
  }
  if (current < total - 2) result.push("...");
  result.push(total);
  return result;
}
