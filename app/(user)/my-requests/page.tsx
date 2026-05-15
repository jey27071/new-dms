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
import { getClientEmail } from "@/lib/auth-client";

const TABS: { key: "all" | RequestStatus; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "review", label: "검토 중" },
  { key: "in_progress", label: "진행 중" },
  { key: "completed", label: "완료됨" },
  { key: "rejected", label: "반려됨" },
];

export default function MyRequestsPage() {
  const [items, setItems] = useState<DesignRequest[]>([]);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"all" | RequestStatus>("all");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getClientEmail());
  }, []);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    (async () => {
      const result = await listRequests({ requesterEmail: email });
      if (!cancelled) {
        setItems(result);
        setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((r) => r.status === tab);
  }, [items, tab]);

  const counts = useMemo(() => {
    const c = {
      all: items.length,
      review: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      urgent: 0,
    };
    items.forEach((r) => {
      c[r.status]++;
      if (r.deadline && new Date(r.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000) {
        if (r.status === "review" || r.status === "in_progress") c.urgent++;
      }
    });
    return c;
  }, [items]);

  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">내 요청</h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            본인이 제출한 디자인 요청을 추적합니다.
          </p>
        </div>
        <Link
          href="/my-requests/new"
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all"
        >
          <Icon name="add" className="text-[20px]" />새 요청
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-lg">
        <StatCard label="전체 요청" value={counts.all} hint="누적" />
        <StatCard label="검토 대기" value={counts.review} dot />
        <StatCard
          label="완료됨"
          value={counts.completed}
          hintClass="text-emerald-600"
          hint="누적 완료"
        />
        <StatCard label="마감 임박" value={counts.urgent} warning />
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

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest">
              <tr>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  요청 번호
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  제목·유형
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  상태
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  마감
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  담당자
                </th>
                <th className="px-lg py-md text-label-caps text-on-surface-variant border-b border-outline-variant">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {!mounted ? (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-secondary">
                    {tab === "all"
                      ? "아직 제출한 요청이 없습니다."
                      : "해당 상태의 요청이 없습니다."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const s = statusMeta[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-lg text-body-sm font-semibold text-primary">
                        #{r.id}
                      </td>
                      <td className="px-lg py-lg">
                        <div className="text-body-base font-semibold text-on-surface">
                          {r.title}
                        </div>
                        <div className="text-body-sm text-secondary">
                          {REQUEST_TYPE_LABEL[r.type]}
                        </div>
                      </td>
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-sm">
                          <div className={`w-2 h-2 rounded-full ${s.dotClass}`} />
                          <span className="text-body-sm">{s.label}</span>
                        </div>
                      </td>
                      <td className="px-lg py-lg text-body-sm text-secondary">
                        {r.deadline ?? "—"}
                      </td>
                      <td className="px-lg py-lg text-body-sm text-secondary">
                        {r.assigneeName || r.assigneeEmail || "미배정"}
                      </td>
                      <td className="px-lg py-lg">
                        <Link
                          href={`/my-requests/${r.id}`}
                          className="text-label-sm text-primary hover:underline flex items-center gap-xs"
                        >
                          상세 보기
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

function StatCard({
  label,
  value,
  hint,
  hintClass,
  dot,
  warning,
}: {
  label: string;
  value: number;
  hint?: string;
  hintClass?: string;
  dot?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="bg-white p-lg rounded-xl card-shadow flex flex-col gap-xs">
      <span className="text-label-caps text-secondary">{label}</span>
      <div className="flex items-baseline gap-sm">
        <span className={"text-h1 font-semibold " + (warning ? "text-tertiary" : "")}>
          {String(value).padStart(2, "0")}
        </span>
        {hint ? (
          <span className={"text-label-sm " + (hintClass ?? "text-secondary")}>{hint}</span>
        ) : null}
        {dot ? <span className="w-2 h-2 rounded-full bg-primary-container" /> : null}
        {warning ? <Icon name="warning" className="text-tertiary text-[16px]" /> : null}
      </div>
    </div>
  );
}
