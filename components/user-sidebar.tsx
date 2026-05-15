"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { userNav, type NavItem } from "@/lib/nav";

function NavLink({
  item,
  active,
  indent,
}: {
  item: NavItem;
  active: boolean;
  indent: boolean;
}) {
  const basePad = indent ? "pl-[36px]" : "pl-[20px]";
  const activePad = indent ? "pl-[33px]" : "pl-[17px]";
  return (
    <Link
      href={item.href}
      className={
        "flex items-center gap-md h-10 transition-colors active:scale-[0.98] " +
        (active
          ? `text-primary font-semibold border-l-[3px] border-primary ${activePad}`
          : `text-secondary ${basePad} hover:bg-surface-container-highest`)
      }
    >
      <Icon name={item.icon} className={indent ? "text-[18px]" : "text-[22px]"} />
      <span className="text-[14px]">{item.label}</span>
    </Link>
  );
}

export function UserSidebar({ role, email }: { role: "admin" | "viewer"; email: string }) {
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
        {userNav.map((section, idx) => (
          <div key={idx} className={idx > 0 ? "mt-md" : ""}>
            {section.header ? (
              <div className="px-lg pt-xs pb-sm flex items-center gap-sm">
                <Icon
                  name={section.header.icon}
                  className="text-on-surface-variant text-[16px]"
                />
                <span className="text-label-caps text-on-surface-variant uppercase tracking-wider">
                  {section.header.label}
                </span>
              </div>
            ) : null}
            <div className="flex flex-col gap-xs">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item)}
                  indent={!!section.header}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-lg mt-auto flex flex-col gap-sm">
        <Link
          href="/my-requests/new"
          className="w-full py-sm px-md bg-primary text-on-primary text-[13px] font-semibold rounded-xl hover:opacity-90 transition-opacity text-center"
        >
          새 에셋 요청
        </Link>

        {role === "admin" ? (
          <Link
            href="/admin"
            className="flex items-center justify-between gap-sm px-md py-sm border border-error-container bg-error-container/30 hover:bg-error-container/50 transition-colors rounded-xl group"
          >
            <span className="flex items-center gap-sm">
              <Icon name="verified_user" className="text-on-error-container text-[18px]" />
              <span className="text-[13px] font-semibold text-on-error-container">관리자 페이지</span>
            </span>
            <Icon
              name="arrow_forward"
              className="text-on-error-container text-[18px] group-hover:translate-x-[2px] transition-transform"
            />
          </Link>
        ) : null}

        <div className="border-t border-outline-variant/60 pt-md mt-xs">
          <div className="flex items-center gap-sm px-xs mb-sm">
            <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center text-[12px] font-bold">
              {(email || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-label-sm font-semibold text-on-surface truncate">
                {email || "사용자"}
              </p>
              <p className="text-[10px] text-secondary uppercase tracking-wider">
                {role === "admin" ? "관리자" : "뷰어"}
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
