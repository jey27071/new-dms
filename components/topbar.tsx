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
    // 토픽바 검색은 어디서든 에셋 라이브러리로 보내 검색어 적용
    const path = isAdmin ? "/admin/assets" : "/assets";
    router.push(`${path}?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-xl z-30">
      <form onSubmit={handleSubmit} className="flex items-center gap-lg flex-1 max-w-xl">
        <div className="relative w-full">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
            placeholder={isAdmin ? "리소스 검색..." : "에셋 검색 (제목·설명·카테고리)"}
            type="search"
          />
        </div>
      </form>

      <div className="flex items-center gap-md">
        <button className="relative p-sm rounded-full hover:bg-surface-container-high transition-colors">
          <Icon name="notifications" className="text-on-surface-variant text-[22px]" />
          <span className="absolute top-1 right-1 bg-error text-on-error text-[10px] font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
