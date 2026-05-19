"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icon";
import {
  getAssetCategoryLabel,
  type Asset,
  type BannerTemplate,
  type Guideline,
  type NoticeTemplate,
  type Prompt,
} from "@/lib/data";
import { listAssets } from "@/lib/store/assets";
import { listGuidelines } from "@/lib/store/guidelines";
import { listPrompts } from "@/lib/store/prompts";
import { listBannerTemplates } from "@/lib/store/banner-templates";
import { listNoticeTemplates } from "@/lib/store/notice-templates";

const PER_SECTION = 6;

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [banners, setBanners] = useState<BannerTemplate[]>([]);
  const [notices, setNotices] = useState<NoticeTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [a, g, p, b, n] = await Promise.all([
        listAssets(),
        listGuidelines(),
        listPrompts(),
        listBannerTemplates(),
        listNoticeTemplates(),
      ]);
      if (cancelled) return;
      setAssets(a);
      setGuidelines(g);
      setPrompts(p);
      setBanners(b);
      setNotices(n);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // URL의 q와 동기화 (입력 후 Enter)
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  const q = query.trim().toLowerCase();

  const matchedAssets = useMemo(() => {
    if (!q) return [];
    return assets.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q) ||
        getAssetCategoryLabel(a.category).toLowerCase().includes(q),
    );
  }, [assets, q]);

  const matchedGuidelines = useMemo(() => {
    if (!q) return [];
    return guidelines.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.notes ?? "").toLowerCase().includes(q) ||
        (g.body ?? "").toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [guidelines, q]);

  const matchedPrompts = useMemo(() => {
    if (!q) return [];
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [prompts, q]);

  const matchedBanners = useMemo(() => {
    if (!q) return [];
    return banners.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q),
    );
  }, [banners, q]);

  const matchedNotices = useMemo(() => {
    if (!q) return [];
    return notices.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        (n.description ?? "").toLowerCase().includes(q),
    );
  }, [notices, q]);

  const totalCount =
    matchedAssets.length +
    matchedGuidelines.length +
    matchedPrompts.length +
    matchedBanners.length +
    matchedNotices.length;

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      {/* 헤더 + 검색 폼 */}
      <div>
        <h1 className="text-h1 font-semibold text-on-surface mb-md">통합 검색</h1>
        <form onSubmit={handleSubmit} className="relative">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[22px]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="에셋·가이드라인·프롬프트·템플릿에서 검색 (Enter)"
            className="w-full bg-white border border-outline-variant rounded-xl pl-12 pr-md py-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
            autoFocus
          />
        </form>
        {q ? (
          <p className="text-body-sm text-secondary mt-sm">
            <span className="font-semibold text-on-surface">"{query}"</span> 검색 결과 ·{" "}
            {loading ? "검색 중…" : `총 ${totalCount}건`}
          </p>
        ) : (
          <p className="text-body-sm text-secondary mt-sm">
            검색어를 입력하고 Enter를 눌러주세요.
          </p>
        )}
      </div>

      {/* 결과 */}
      {!q ? (
        <div className="bg-surface-container-low rounded-xl p-xl text-center">
          <Icon name="search" className="text-secondary text-[40px] mb-md block mx-auto" />
          <p className="text-body-base text-secondary">
            검색어를 입력하면 디자인 에셋·가이드라인·AI 프롬프트·템플릿을 한 번에 찾을 수 있습니다.
          </p>
        </div>
      ) : loading ? (
        <div className="bg-surface-container-low rounded-xl p-xl text-center text-secondary">
          불러오는 중…
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-xl text-center">
          <Icon name="search_off" className="text-secondary text-[40px] mb-md block mx-auto" />
          <p className="text-body-base font-semibold mb-xs">검색 결과가 없습니다</p>
          <p className="text-body-sm text-on-surface-variant mb-md">
            다른 키워드로 다시 검색해보거나, 디자인 팀에 직접 요청해보세요.
          </p>
          <Link
            href="/my-requests/new"
            className="inline-flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
          >
            <Icon name="add" className="text-[16px]" />
            새 디자인 요청
          </Link>
        </div>
      ) : (
        <div className="space-y-xl">
          {matchedAssets.length > 0 ? (
            <ResultSection
              icon="inventory_2"
              title="에셋"
              count={matchedAssets.length}
              moreHref={`/assets?q=${encodeURIComponent(query)}`}
            >
              <div className="grid grid-cols-3 gap-md">
                {matchedAssets.slice(0, PER_SECTION).map((a) => (
                  <Link
                    key={a.id}
                    href={`/assets/${a.id}`}
                    className="bg-white card-shadow rounded-xl p-md flex gap-md hover:border-primary border border-transparent transition-all"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-base font-semibold truncate">{a.title}</p>
                      <p className="text-label-sm text-secondary truncate">
                        {getAssetCategoryLabel(a.category)} · {a.formats.join(", ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </ResultSection>
          ) : null}

          {matchedGuidelines.length > 0 ? (
            <ResultSection
              icon="menu_book"
              title="가이드라인"
              count={matchedGuidelines.length}
              moreHref="/guidelines"
            >
              <div className="grid grid-cols-2 gap-md">
                {matchedGuidelines.slice(0, PER_SECTION).map((g) => (
                  <Link
                    key={g.id}
                    href={`/guidelines/${g.id}`}
                    className="bg-white card-shadow rounded-xl p-md hover:border-primary border border-transparent transition-all"
                  >
                    <p className="text-body-base font-semibold">{g.title}</p>
                    <p className="text-label-sm text-secondary mt-xs">
                      {g.version} · {g.category} · {g.pages}p
                    </p>
                    {g.notes ? (
                      <p className="text-body-sm text-on-surface-variant mt-xs line-clamp-2">
                        {g.notes}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </ResultSection>
          ) : null}

          {matchedPrompts.length > 0 ? (
            <ResultSection
              icon="lightbulb"
              title="AI 프롬프트"
              count={matchedPrompts.length}
              moreHref="/design/prompts"
            >
              <div className="grid grid-cols-2 gap-md">
                {matchedPrompts.slice(0, PER_SECTION).map((p) => (
                  <Link
                    key={p.id}
                    href={`/design/prompts#${p.id}`}
                    className="bg-white card-shadow rounded-xl p-md hover:border-primary border border-transparent transition-all"
                  >
                    <div className="flex items-center gap-xs mb-xs">
                      <span className="px-xs py-[2px] bg-secondary-container text-on-secondary-fixed-variant text-label-sm rounded">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-body-base font-semibold">{p.title}</p>
                    {p.description ? (
                      <p className="text-body-sm text-on-surface-variant mt-xs line-clamp-2">
                        {p.description}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </ResultSection>
          ) : null}

          {matchedBanners.length > 0 ? (
            <ResultSection
              icon="image"
              title="배너(현수막) 템플릿"
              count={matchedBanners.length}
              moreHref="/design/banner"
            >
              <div className="grid grid-cols-3 gap-md">
                {matchedBanners.slice(0, PER_SECTION).map((b) => (
                  <Link
                    key={b.id}
                    href={`/design/banner/${b.id}`}
                    className="bg-white card-shadow rounded-xl p-md flex gap-md hover:border-primary border border-transparent transition-all"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-base font-semibold truncate">{b.name}</p>
                      <p className="text-label-sm text-secondary">
                        {b.width} × {b.height}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </ResultSection>
          ) : null}

          {matchedNotices.length > 0 ? (
            <ResultSection
              icon="campaign"
              title="사내 게시물 템플릿"
              count={matchedNotices.length}
              moreHref="/design/notice"
            >
              <div className="grid grid-cols-3 gap-md">
                {matchedNotices.slice(0, PER_SECTION).map((n) => (
                  <Link
                    key={n.id}
                    href={`/design/notice/${n.id}`}
                    className="bg-white card-shadow rounded-xl p-md flex gap-md hover:border-primary border border-transparent transition-all"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={n.image} alt={n.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-base font-semibold truncate">{n.name}</p>
                      <p className="text-label-sm text-secondary">
                        {n.width} × {n.height}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </ResultSection>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ResultSection({
  icon,
  title,
  count,
  moreHref,
  children,
}: {
  icon: string;
  title: string;
  count: number;
  moreHref: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-md">
        <h2 className="text-h2 font-semibold flex items-center gap-sm">
          <Icon name={icon} className="text-primary text-[24px]" />
          {title}
          <span className="text-secondary font-normal text-body-base">({count})</span>
        </h2>
        {count > PER_SECTION ? (
          <Link href={moreHref} className="text-label-sm text-primary font-semibold hover:underline flex items-center gap-xs">
            {title}에서 더 보기
            <Icon name="arrow_forward" className="text-[14px]" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
