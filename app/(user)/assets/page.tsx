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

  // 필터 상태
  // selectedCategories: 빈 set = 전체. 라벨 기준.
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());
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
      const t = buildCategoryTree(catList);
      setTree(t);
      // 기본: 모든 대분류 펼침
      setExpandedRoots(new Set(t.map((n) => n.id)));
      setMounted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 필터 후보 산출
  const allFormats = useMemo(() => {
    const set = new Set<string>();
    items.forEach((a) => a.formats.forEach((f) => set.add(f)));
    return Array.from(set).sort();
  }, [items]);

  // 필터링된 결과
  const filtered = useMemo(() => {
    return items.filter((a) => {
      const catLabel = getAssetCategoryLabel(a.category);
      const passCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(catLabel) ||
        selectedCategories.has(a.category);
      const passFormat =
        selectedFormats.size === 0 || a.formats.some((f) => selectedFormats.has(f));
      return passCategory && passFormat;
    });
  }, [items, selectedCategories, selectedFormats]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // 필터 변경 시 페이지 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [selectedCategories, selectedFormats]);

  function toggleCategory(label: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleRoot(root: CategoryNode) {
    // 대분류 토글: 자기 자신 + 모든 자식 라벨 한꺼번에
    const labels = [root.label, ...root.children.map((c) => c.label)];
    const allOn = labels.every((l) => selectedCategories.has(l));
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (allOn) {
        labels.forEach((l) => next.delete(l));
      } else {
        labels.forEach((l) => next.add(l));
      }
      return next;
    });
  }

  function isRootChecked(root: CategoryNode): "all" | "some" | "none" {
    const labels = [root.label, ...root.children.map((c) => c.label)];
    const onCount = labels.filter((l) => selectedCategories.has(l)).length;
    if (onCount === 0) return "none";
    if (onCount === labels.length) return "all";
    return "some";
  }

  function toggleFormat(f: string) {
    setSelectedFormats((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedRoots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetFilters() {
    setSelectedCategories(new Set());
    setSelectedFormats(new Set());
  }

  const allSelected = selectedCategories.size === 0;

  return (
    <div className="flex max-w-[1280px] mx-auto -mt-md">
      {/* 좌측 필터 */}
      <aside className="w-[240px] p-lg border-r border-outline-variant bg-surface-container-low min-h-[calc(100vh-160px)] space-y-xl">
        <div>
          <h3 className="text-label-caps text-on-surface-variant mb-md">카테고리</h3>
          <div className="space-y-xs">
            <label className="flex items-center gap-sm cursor-pointer py-xs">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => setSelectedCategories(new Set())}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-body-sm font-semibold">전체</span>
            </label>
            {tree.map((root) => {
              const state = isRootChecked(root);
              const expanded = expandedRoots.has(root.id);
              return (
                <div key={root.id}>
                  <div className="flex items-center gap-xs py-xs">
                    <button
                      type="button"
                      onClick={() => toggleExpand(root.id)}
                      className="text-secondary hover:text-primary"
                    >
                      <Icon
                        name={expanded ? "expand_more" : "chevron_right"}
                        className="text-[18px]"
                      />
                    </button>
                    <label className="flex items-center gap-sm cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={state === "all"}
                        ref={(el) => {
                          if (el) el.indeterminate = state === "some";
                        }}
                        onChange={() => toggleRoot(root)}
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-body-sm font-medium">{root.label}</span>
                    </label>
                  </div>
                  {expanded && root.children.length > 0 ? (
                    <div className="ml-lg space-y-xs">
                      {root.children.map((child) => (
                        <label
                          key={child.id}
                          className="flex items-center gap-sm cursor-pointer py-[2px]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.has(child.label)}
                            onChange={() => toggleCategory(child.label)}
                            className="rounded border-outline-variant text-primary focus:ring-primary"
                          />
                          <span className="text-body-sm text-on-surface-variant">
                            {child.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-label-caps text-on-surface-variant mb-md">파일 형식</h3>
          {allFormats.length === 0 ? (
            <p className="text-label-sm text-secondary">아직 업로드된 파일이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 gap-xs">
              {allFormats.map((f) => {
                const active = selectedFormats.has(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFormat(f)}
                    className={
                      "py-xs text-label-sm rounded-lg transition-colors border " +
                      (active
                        ? "bg-primary text-on-primary border-primary font-semibold"
                        : "bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-high")
                    }
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-md">
          <button
            onClick={resetFilters}
            disabled={allSelected && selectedFormats.size === 0}
            className="w-full text-secondary hover:text-primary text-label-sm transition-colors text-left flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="restart_alt" className="text-[18px]" />
            필터 초기화
          </button>
        </div>
      </aside>

      {/* 결과 영역 */}
      <section className="flex-1 p-xl">
        <div className="flex justify-between items-end mb-lg">
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
        <div className="bg-primary-fixed/40 border border-primary/20 rounded-xl p-md mb-lg flex items-center justify-between gap-md">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <Icon name="lightbulb" className="text-primary text-[22px]" />
            </div>
            <div>
              <p className="text-body-base font-semibold text-on-surface">
                찾는 에셋이 없나요?
              </p>
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

        {!mounted ? (
          <div className="grid grid-cols-3 gap-lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <button
              type="button"
              onClick={resetFilters}
              className="px-lg py-sm bg-white border border-outline-variant rounded-lg text-label-sm font-semibold hover:bg-surface-container-high"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-lg">
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
                  <h4 className="text-h3 font-semibold text-on-surface mb-xs">{a.title}</h4>
                  <div className="flex gap-xs mb-md flex-wrap">
                    <span className="px-xs py-[2px] bg-surface-container text-label-sm text-on-surface-variant rounded">
                      {getAssetCategoryLabel(a.category)}
                    </span>
                    {a.formats.map((f, idx) => (
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
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex items-center gap-xs text-secondary">
                      <Icon name="download" className="text-[16px]" />
                      <span className="text-label-sm">{a.downloads} 다운로드</span>
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
      </section>
    </div>
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
