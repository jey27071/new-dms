"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";

type TopbarProps = {
  area: "user" | "admin";
};

export function Topbar({ area }: TopbarProps) {
  const isAdmin = area === "admin";
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // 사용자 영역에서는 통합 검색 페이지, 관리자 영역에서는 에셋 관리로
    const path = isAdmin ? `/admin/assets?q=${encodeURIComponent(q)}` : `/search?q=${encodeURIComponent(q)}`;
    router.push(path);
  }

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-surface border-b border-outline-variant flex items-center justify-between gap-md px-xl z-30">
      <form onSubmit={handleSubmit} className="flex items-center gap-sm flex-1 max-w-xl">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
            placeholder={isAdmin ? "리소스 검색..." : "통합 검색 (에셋·가이드·프롬프트·템플릿)"}
            type="search"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-xl text-label-sm font-semibold hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Icon name="search" className="text-[18px]" />
          검색
        </button>
      </form>

      {isAdmin ? (
        <span className="inline-flex items-center gap-xs px-sm py-xs bg-error-container text-on-error-container text-label-sm font-bold uppercase tracking-wider rounded-lg flex-shrink-0">
          <Icon name="verified_user" className="text-[14px]" />
          ADMIN
        </span>
      ) : null}
    </header>
  );
}
