"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { listAssets } from "@/lib/store/assets";
import { listGuidelines } from "@/lib/store/guidelines";
import { listRequests } from "@/lib/store/requests";
import {
  type Asset,
  type DesignRequest,
  type Guideline,
  REQUEST_TYPE_LABEL,
  statusMeta,
} from "@/lib/data";

function relativeTime(date: string): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return date.slice(0, 10);
}

export default function AdminDashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAssets(), listGuidelines(), listRequests()]).then(
      ([a, g, r]) => {
        if (!cancelled) {
          setAssets(a);
          setGuidelines(g);
          setRequests(r);
          setMounted(true);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const reviewCount = requests.filter((r) => r.status === "review").length;
    const userEmails = new Set<string>();
    requests.forEach((r) => {
      userEmails.add(r.requesterEmail);
      if (r.assigneeEmail) userEmails.add(r.assigneeEmail);
      r.ccEmails.forEach((e) => userEmails.add(e));
    });
    return {
      assetCount: assets.length,
      guidelineCount: guidelines.length,
      reviewCount,
      userCount: userEmails.size,
    };
  }, [assets, guidelines, requests]);

  const recentRequests = useMemo(() => requests.slice(0, 5), [requests]);
  const recentAssets = useMemo(() => {
    const sorted = [...assets].sort((a, b) => {
      const ta = new Date(a.uploadedAt).getTime();
      const tb = new Date(b.uploadedAt).getTime();
      return tb - ta;
    });
    return sorted.slice(0, 4);
  }, [assets]);

  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      {/* 통계 4카드 */}
      <div className="grid grid-cols-4 gap-lg">
        <StatCard
          icon="inventory"
          iconClass="text-primary"
          label="총 에셋"
          value={mounted ? stats.assetCount : null}
          hint="등록된 에셋"
        />
        <StatCard
          icon="description"
          iconClass="text-tertiary"
          label="가이드라인"
          value={mounted ? stats.guidelineCount : null}
          hint="등록된 문서"
        />
        <StatCard
          icon="priority_high"
          iconClass={stats.reviewCount > 0 ? "text-error" : "text-secondary"}
          label="대기 중 요청"
          value={mounted ? stats.reviewCount : null}
          hint="검토 필요"
        />
        <StatCard
          icon="person_outline"
          iconClass="text-secondary"
          label="활성 사용자"
          value={mounted ? stats.userCount : null}
          hint="요청·승인 참여"
        />
      </div>

      {/* 2컬럼: 최근 요청 + 최근 업로드 */}
      <div className="grid grid-cols-12 gap-lg items-start">
        {/* 최근 요청 */}
        <div className="col-span-8 bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="text-h3 font-semibold">최근 요청</h2>
            <Link href="/admin/requests" className="text-primary text-label-sm hover:underline">
              전체 보기
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase">
                <tr>
                  <th className="px-lg py-sm">요청 ID</th>
                  <th className="px-lg py-sm">요청자</th>
                  <th className="px-lg py-sm">제목·유형</th>
                  <th className="px-lg py-sm">상태</th>
                  <th className="px-lg py-sm">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-sm">
                {!mounted ? (
                  <tr>
                    <td colSpan={5} className="px-lg py-xl text-center text-secondary">
                      불러오는 중...
                    </td>
                  </tr>
                ) : recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-lg py-xl text-center text-secondary">
                      아직 등록된 요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((r) => {
                    const s = statusMeta[r.status];
                    return (
                      <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-lg py-md font-mono font-medium text-primary">{r.id}</td>
                        <td className="px-lg py-md">
                          <div className="text-on-surface">
                            {r.requesterName ?? r.requesterEmail.split("@")[0]}
                          </div>
                          <div className="text-label-sm text-secondary">{r.requesterEmail}</div>
                        </td>
                        <td className="px-lg py-md">
                          <div className="text-on-surface font-medium">{r.title}</div>
                          <div className="text-label-sm text-secondary">
                            {REQUEST_TYPE_LABEL[r.type]}
                          </div>
                        </td>
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
                            className="text-primary hover:underline"
                          >
                            검토
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

        {/* 최근 업로드 */}
        <div className="col-span-4 bg-white rounded-xl card-shadow border border-outline-variant/30">
          <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="text-h3 font-semibold">최근 업로드된 에셋</h2>
            <Link href="/admin/assets" className="text-primary text-label-sm hover:underline">
              전체 보기
            </Link>
          </div>
          <div className="p-lg flex flex-col gap-lg">
            {!mounted ? (
              <p className="text-body-sm text-secondary text-center">불러오는 중...</p>
            ) : recentAssets.length === 0 ? (
              <p className="text-body-sm text-secondary text-center">아직 등록된 에셋이 없습니다.</p>
            ) : (
              recentAssets.map((a) => (
                <Link
                  key={a.id}
                  href={`/assets/${a.id}`}
                  className="flex items-start gap-md group hover:bg-surface-container-low/50 -mx-sm px-sm py-xs rounded-lg transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-12 h-12 rounded-lg bg-surface-container flex-shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-base font-semibold truncate group-hover:text-primary transition-colors">
                      {a.title}
                    </p>
                    <p className="text-label-sm text-secondary truncate">{a.uploader} 업로드</p>
                    <p className="text-label-sm text-outline mt-xs">{relativeTime(a.uploadedAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="p-lg pt-0">
            <Link
              href="/assets"
              className="block text-center w-full bg-secondary-container text-on-secondary-fixed-variant py-sm rounded-lg text-label-sm hover:opacity-90 transition-opacity"
            >
              에셋 라이브러리 보기
            </Link>
          </div>
        </div>
      </div>

      {/* 퀵 액션 */}
      <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
        <h3 className="text-h3 font-semibold mb-lg">관리자 퀵 액션</h3>
        <div className="flex flex-wrap gap-md">
          <Link
            href="/admin/assets/new"
            className="flex items-center gap-md bg-primary text-on-primary px-xl py-md rounded-lg text-h3 font-semibold hover:brightness-95 active:scale-95 transition-all"
          >
            <Icon name="cloud_upload" />
            에셋 업로드
          </Link>
          <Link
            href="/admin/guidelines/new"
            className="flex items-center gap-md bg-secondary-container text-on-secondary-fixed-variant px-xl py-md rounded-lg text-h3 font-semibold hover:brightness-95 active:scale-95 transition-all"
          >
            <Icon name="post_add" />
            가이드라인 추가
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-md bg-secondary-container text-on-secondary-fixed-variant px-xl py-md rounded-lg text-h3 font-semibold hover:brightness-95 active:scale-95 transition-all"
          >
            <Icon name="settings" />
            카테고리 관리
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-md bg-secondary-container text-on-secondary-fixed-variant px-xl py-md rounded-lg text-h3 font-semibold hover:brightness-95 active:scale-95 transition-all"
          >
            <Icon name="group" />
            사용자 관리
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: string;
  iconClass: string;
  label: string;
  value: number | null;
  hint: string;
}) {
  return (
    <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
      <div className="flex items-center justify-between mb-sm">
        <Icon name={icon} className={iconClass + " text-[24px]"} />
        <span className="text-label-sm text-secondary font-medium">{label}</span>
      </div>
      <p className="text-h1 font-semibold">{value === null ? "—" : value}</p>
      <p className="text-label-sm text-secondary">{hint}</p>
    </div>
  );
}
