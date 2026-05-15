import { Icon } from "@/components/icon";

type TopbarProps = {
  role?: "뷰어" | "관리자";
  rightLabel?: string;
};

export function Topbar({ role = "뷰어", rightLabel }: TopbarProps) {
  const roleClass =
    role === "관리자"
      ? "bg-error-container text-on-error-container"
      : "bg-secondary-container text-on-secondary-fixed-variant";

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-xl z-30">
      <div className="flex items-center gap-lg flex-1 max-w-xl">
        <div className="relative w-full group">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
            placeholder="디자인 관리 시스템 검색..."
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
        <div className={`flex items-center gap-sm px-md py-xs rounded-full ${roleClass}`}>
          <span className="text-label-sm font-semibold uppercase tracking-wider">{role}</span>
        </div>
        {rightLabel ? (
          <span className="text-label-sm text-on-surface-variant ml-sm">{rightLabel}</span>
        ) : null}
      </div>
    </header>
  );
}
