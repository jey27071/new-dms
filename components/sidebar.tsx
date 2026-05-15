"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { primaryNav, adminNav, type NavItem } from "@/lib/nav";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={
        "flex items-center gap-md h-10 transition-colors active:scale-[0.98] " +
        (active
          ? "text-primary font-semibold border-l-[3px] border-primary pl-[17px]"
          : "text-secondary pl-[20px] hover:bg-surface-container-highest")
      }
    >
      <Icon name={item.icon} className="text-[22px]" />
      <span className="text-[14px]">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() || "/";
  const isActive = (item: NavItem) =>
    item.match ? item.match(pathname) : pathname.startsWith(item.href);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-surface-container-low flex flex-col py-lg gap-sm z-40 border-r border-outline-variant/40">
      <div className="px-lg mb-xl">
        <Link href="/" className="block">
          <h1 className="text-h2 font-bold text-on-surface tracking-tight">DMS</h1>
          <p className="text-label-sm text-secondary mt-xs">기업용 디자인 관리 시스템</p>
        </Link>
      </div>

      <nav className="flex flex-col gap-xs">
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} />
        ))}
      </nav>

      <div className="mt-lg px-lg">
        <div className="text-label-caps text-on-surface-variant uppercase tracking-wider mb-sm">
          관리자 설정
        </div>
      </div>
      <nav className="flex flex-col gap-xs">
        {adminNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} />
        ))}
      </nav>

      <div className="px-lg mt-auto flex flex-col gap-sm">
        <Link
          href="/my-requests/new"
          className="w-full py-sm px-md bg-primary text-on-primary text-[13px] font-semibold rounded-xl hover:opacity-90 transition-opacity text-center"
        >
          새 에셋 요청
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-md h-10 text-secondary pl-[20px] hover:bg-surface-container-highest transition-colors rounded-lg"
        >
          <Icon name="account_circle" className="text-[22px]" />
          <span className="text-[14px]">사용자 프로필</span>
        </Link>
      </div>
    </aside>
  );
}
