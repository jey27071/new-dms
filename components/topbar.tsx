"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";

export function Topbar() {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");
  const role = isAdmin ? "관리자" : "뷰어";
  const roleClass = isAdmin
    ? "bg-error-container text-on-error-container"
    : "bg-secondary-container text-on-secondary-fixed-variant";

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-xl z-30">
      <div className="flex items-center gap-lg flex-1 max-w-xl">
        <div className="relative w-full">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
            placeholder={isAdmin ? "리소스 검색..." : "디자인 관리 시스템 검색..."}
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-md">
        <button className="relative p-sm rounded-full hover:bg-surface-container-high transition-colors">
          <Icon name="notifications" className="text-on-surface-variant text-[22px]" />
          <span className="absolute top-1 right-1 bg-error text-on-error text-[10px] font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">
            3
          </span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant mx-xs" />
        <div className={`flex items-center gap-xs px-md py-xs rounded-full ${roleClass}`}>
          {isAdmin ? <Icon name="verified_user" className="text-[16px]" /> : null}
          <span className="text-label-sm font-semibold uppercase tracking-wider">{role}</span>
        </div>
        {isAdmin ? (
          <>
            <div className="h-8 w-[1px] bg-outline-variant mx-xs" />
            <p className="text-body-base font-semibold text-on-surface">브랜드 관리 시스템</p>
          </>
        ) : null}
      </div>
    </header>
  );
}
