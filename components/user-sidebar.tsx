"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { userNav, type NavItem, type NavSection } from "@/lib/nav";

/** 가장 안쪽 리프 메뉴 (depth 1·2·3 공통) */
function NavLink({
  item,
  active,
  depth,
}: {
  item: NavItem;
  active: boolean;
  depth: 1 | 2 | 3;
}) {
  const padByDepth = {
    1: "pl-[20px]",
    2: "pl-[36px]",
    3: "pl-[52px]",
  } as const;
  const activePadByDepth = {
    1: "pl-[17px]",
    2: "pl-[33px]",
    3: "pl-[49px]",
  } as const;
  const iconSize = depth === 1 ? "text-[22px]" : "text-[18px]";
  const basePad = padByDepth[depth];
  const activePad = activePadByDepth[depth];

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
      <Icon name={item.icon} className={iconSize} />
      <span className="text-[14px]">{item.label}</span>
    </Link>
  );
}

/** depth=2 항목 — children 이 있으면 펼침/접기 토글, 없으면 일반 링크 */
function NavItemWithChildren({
  item,
  pathname,
  isActive,
}: {
  item: NavItem;
  pathname: string;
  isActive: (item: NavItem) => boolean;
}) {
  const hasChildren = !!item.children && item.children.length > 0;
  const forceOpen =
    hasChildren &&
    !!item.children?.some((c) => isActive(c) || pathname.startsWith(c.href));
  const [manualOpen, setManualOpen] = useState(forceOpen);
  useEffect(() => {
    if (forceOpen) setManualOpen(true);
  }, [forceOpen]);

  if (!hasChildren) {
    return <NavLink item={item} active={isActive(item)} depth={2} />;
  }

  const headerActive = forceOpen || isActive(item);
  const isOpen = manualOpen;
  return (
    <div>
      <div
        className={
          "flex items-stretch h-10 " +
          (headerActive ? "border-l-[3px] border-primary" : "")
        }
      >
        <Link
          href={item.href}
          className={
            "flex-1 flex items-center gap-md transition-colors " +
            (headerActive
              ? "text-primary font-semibold pl-[33px]"
              : "text-secondary hover:bg-surface-container-highest pl-[36px]")
          }
        >
          <Icon name={item.icon} className="text-[18px]" />
          <span className="text-[14px]">{item.label}</span>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setManualOpen(!isOpen);
          }}
          className="px-md text-secondary hover:text-primary transition-colors"
          aria-label={isOpen ? "메뉴 접기" : "메뉴 펼치기"}
        >
          <Icon
            name={isOpen ? "expand_less" : "expand_more"}
            className="text-[18px]"
          />
        </button>
      </div>
      {isOpen ? (
        <div className="flex flex-col gap-xs mt-xs">
          {item.children!.map((child) => (
            <NavLink
              key={child.href}
              item={child}
              active={isActive(child)}
              depth={3}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CollapsibleSection({
  section,
  pathname,
  isActive,
}: {
  section: NavSection;
  pathname: string;
  isActive: (item: NavItem) => boolean;
}) {
  const forceOpen = section.openWhen?.(pathname) ?? false;
  const [manualOpen, setManualOpen] = useState(forceOpen);

  useEffect(() => {
    if (forceOpen) setManualOpen(true);
  }, [forceOpen]);

  const isOpen = manualOpen;
  const header = section.header;
  if (!header) return null;

  const headerActive = forceOpen;
  return (
    <div>
      <div
        className={
          "flex items-stretch h-10 " +
          (headerActive ? "border-l-[3px] border-primary" : "")
        }
      >
        {header.href ? (
          <Link
            href={header.href}
            className={
              "flex-1 flex items-center gap-md transition-colors " +
              (headerActive
                ? "text-primary font-semibold pl-[17px]"
                : "text-secondary hover:bg-surface-container-highest pl-[20px]")
            }
          >
            <Icon
              name={header.icon}
              className={headerActive ? "text-[22px]" : "text-[20px]"}
            />
            <span className="text-[14px]">{header.label}</span>
          </Link>
        ) : (
          <div className="flex-1 flex items-center gap-md pl-[20px] text-secondary">
            <Icon name={header.icon} className="text-[20px]" />
            <span className="text-[14px]">{header.label}</span>
          </div>
        )}
        {section.collapsible ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setManualOpen(!isOpen);
            }}
            className="px-md text-secondary hover:text-primary transition-colors"
            aria-label={isOpen ? "메뉴 접기" : "메뉴 펼치기"}
          >
            <Icon
              name={isOpen ? "expand_less" : "expand_more"}
              className="text-[20px]"
            />
          </button>
        ) : null}
      </div>
      {isOpen ? (
        <div className="flex flex-col gap-xs mt-xs">
          {section.items.map((item) => (
            <NavItemWithChildren
              key={item.href}
              item={item}
              pathname={pathname}
              isActive={isActive}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PlainSection({
  section,
  isActive,
}: {
  section: NavSection;
  isActive: (item: NavItem) => boolean;
}) {
  return (
    <div className="flex flex-col gap-xs">
      {section.items.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item)} depth={1} />
      ))}
    </div>
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
          <h1 className="text-[28px] font-bold text-on-surface tracking-tight leading-none">
            SDMS
          </h1>
          <p className="text-label-sm text-secondary mt-xs">Design Management System</p>
        </Link>
      </div>

      <nav className="flex flex-col gap-sm">
        {userNav.map((section, idx) => (
          <div key={idx}>
            {section.header ? (
              <CollapsibleSection section={section} pathname={pathname} isActive={isActive} />
            ) : (
              <PlainSection section={section} isActive={isActive} />
            )}
          </div>
        ))}
      </nav>

      <div className="px-lg mt-auto flex flex-col gap-sm">
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
