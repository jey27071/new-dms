"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import {
  REQUEST_TYPE_LABEL,
  statusMeta,
  type DesignRequest,
  type RequestStatus,
} from "@/lib/data";
import { listRequests } from "@/lib/store/requests";

const TABS: { key: "all" | RequestStatus; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "review", label: "검토 중" },
  { key: "in_progress", label: "진행 중" },
  { key: "completed", label: "완료됨" },
  { key: "rejected", label: "반려됨" },
];

export default function AdminRequestsPage() {
  const [items, setItems] = useState<DesignRequest[]>([]);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"all" | RequestStatus>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listRequests();
      if (!cancelled) {
        setItems(result);
        setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.requesterEmail.toLowerCase().includes(q) ||
        (r.requesterName ?? "").toLowerCase().includes(q) ||
        (r.assigneeEmail ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, tab, query]);

  const counts = useMemo(() => {
    const c = { all: items.length, review: 0, in_progress: 0, completed: 0, rejected: 0 };
    items.forEach((r) => {
      c[r.status]++;
    });
    return c;
  }, [items]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      <div>
        <h1 className="text-h1 font-semibold text-on-surface">모든 요청</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          사용자가 제출한 디자인 요청을 검토·배정·처리합니다.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-lg">
        <Stat label="전체" value={counts.all} />
        <Stat label="검토 중" value={counts.review} accent="text-primary" />
        <Stat label="진행 중" value={counts.in_progress} accent="text-amber-600" />
        <Stat label="완료됨" value={counts.completed} accent="text-emerald-600" />
        <Stat label="반려됨" value={counts.rejected} accent="text-error" />
      </div>

      <div className="bg-white p-md rounded-xl card-shadow border border-outline-variant/30 space-y-md">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="요청 ID · 제목 · 요청자 · 담당자 · 카테고리 검색"
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-sm pl-10 pr-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-all"
          />
        </div>
        <div className="flex gap-sm p-xs bg-surface-container-low rounded-xl w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "px-md py-xs text-label-sm rounded-lg transition-colors " +
                (tab === t.key
                  ? "bg-white text-primary card-shadow font-semibold"
                  : "text-secondary hover:bg-white/50")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase">
              <tr>
                <th className="px-lg py-md">ID</th>
                <th className="px-lg py-md">제목·유형</th>
                <th className="px-lg py-md">요청자</th>
                <th className="px-lg py-md">담당자</th>
                <th className="px-lg py-md">마감</th>
                <th className="px-lg py-md">상태</th>
                <th className="px-lg py-md text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {!mounted ? (
                <tr>
                  <td colSpan={7} className="px-lg py-xl text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-lg py-xl text-center text-secondary">
                    {items.length === 0
                      ? "등록된 요청이 없습니다."
                      : "조건에 맞는 요청이 없습니다."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const s = statusMeta[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-md font-mono font-semibold text-primary">{r.id}</td>
                      <td className="px-lg py-md">
                        <div className="font-semibold text-on-surface">{r.title}</div>
                        <div className="text-body-sm text-secondary">
                          {REQUEST_TYPE_LABEL[r.type]} · {r.category ?? "—"}
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <div className="text-on-surface">
                          {r.requesterName ?? r.requesterEmail.split("@")[0]}
                        </div>
                        <div className="text-label-sm text-secondary">{r.requesterEmail}</div>
                      </td>
                      <td className="px-lg py-md text-secondary">
                        {r.assigneeName || r.assigneeEmail || (
                          <span className="text-error">미배정</span>
                        )}
                      </td>
                      <td className="px-lg py-md text-secondary">{r.deadline ?? "—"}</td>
                      <td className="px-lg py-md">
                        <span
                          className={`inline-flex items-center gap-xs px-sm py-xs rounded-full text-label-sm ${s.bgClass} ${s.textClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <Link
                          href={`/admin/requests/${r.id}`}
                          className="text-primary hover:underline flex items-center gap-xs justify-end"
                        >
                          처리
                          <Icon name="chevron_right" className="text-[16px]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
      <span className="text-label-caps text-secondary">{label}</span>
      <p className={`text-h1 font-semibold mt-xs ${accent ?? ""}`}>
        {String(value).padStart(2, "0")}
      </p>
    </div>
  );
}
