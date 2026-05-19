"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { adminNav, type NavItem } from "@/lib/nav";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={
        "flex items-center gap-md h-10 transition-colors active:scale-[0.98] " +
        (active
          ? "text-on-error-container font-semibold border-l-[3px] border-error-container pl-[17px] bg-error-container/30"
          : "text-secondary pl-[20px] hover:bg-surface-container-highest")
      }
    >
      <Icon name={item.icon} className="text-[22px]" />
      <span className="text-[14px]">{item.label}</span>
    </Link>
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname() || "/admin";
  const isActive = (item: NavItem) =>
    item.match ? item.match(pathname) : pathname.startsWith(item.href);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-surface-container-low flex flex-col py-lg gap-sm z-40 border-r border-outline-variant/40">
      <div className="px-lg mb-lg">
        <Link href="/admin" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sdms_signiture.png"
            alt="SDMS · S-1 Design Management System"
            className="w-full max-w-[160px] h-auto"
          />
        </Link>
      </div>

      <Link
        href="/"
        className="mx-lg mb-md flex items-center gap-sm text-secondary hover:text-primary transition-colors"
      >
        <Icon name="arrow_back" className="text-[18px]" />
        <span className="text-[13px]">사용자 페이지로</span>
      </Link>

      <nav className="flex flex-col gap-xs">
        {adminNav.flatMap((section) =>
          section.items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item)} />
          )),
        )}
      </nav>

      <div className="px-lg mt-auto flex flex-col gap-sm">
        <div className="border-t border-outline-variant/60 pt-md mt-xs">
          <div className="flex items-center gap-sm px-xs mb-sm">
            <div className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center text-[12px] font-bold">
              {(email || "A").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-label-sm font-semibold text-on-surface truncate">
                {email || "관리자"}
              </p>
              <p className="text-[10px] text-on-error-container uppercase tracking-wider font-bold">
                관리자
              </p>
            </div>
          </div>
          <a
            href="/logout"
            className="flex items-center gap-md h-9 text-secondary pl-[20px] hover:bg-surface-container-highest transition-colors rounded-lg text-[13px]"
          >
            <Icon name="logout" className="text-[18px]" />
            로그아웃
          </a>
        </div>
      </div>
    </aside>
  );
}
