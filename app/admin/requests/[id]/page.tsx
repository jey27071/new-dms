"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { RequestTimeline } from "@/components/request-timeline";
import {
  REQUEST_TYPE_LABEL,
  statusMeta,
  type DesignRequest,
  type RequestActivity,
  type RequestStatus,
} from "@/lib/data";
import {
  getRequest,
  listActivities,
  changeStatus,
  assignRequest,
  addComment,
} from "@/lib/store/requests";
import { getClientEmail } from "@/lib/auth-client";

const STATUS_OPTIONS: { key: RequestStatus; label: string; icon: string }[] = [
  { key: "review", label: "검토 중", icon: "schedule" },
  { key: "in_progress", label: "진행 중", icon: "play_arrow" },
  { key: "completed", label: "완료", icon: "check_circle" },
  { key: "rejected", label: "반려", icon: "cancel" },
];

export default function AdminRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [request, setRequest] = useState<DesignRequest | undefined | null>(undefined);
  const [activities, setActivities] = useState<RequestActivity[]>([]);
  const [actorEmail, setActorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  // 상태 변경
  const [statusNote, setStatusNote] = useState("");
  const [statusChanging, setStatusChanging] = useState<RequestStatus | null>(null);

  // 담당자 배정
  const [assigneeInput, setAssigneeInput] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setActorEmail(getClientEmail());
  }, []);

  const refresh = useCallback(async () => {
    if (!id) return;
    const [req, acts] = await Promise.all([getRequest(id), listActivities(id)]);
    setRequest(req ?? null);
    setActivities(acts);
    if (req) {
      setAssigneeInput(req.assigneeEmail ?? "");
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleStatus(to: RequestStatus) {
    if (!id || !actorEmail) return;
    if (request?.status === to) return;
    setStatusChanging(to);
    await changeStatus(id, to, {
      email: actorEmail,
      name: actorEmail.split("@")[0],
    }, statusNote.trim() || undefined);
    setStatusNote("");
    await refresh();
    setStatusChanging(null);
  }

  async function handleAssign() {
    if (!id || !actorEmail || !assigneeInput.trim()) return;
    setAssigning(true);
    await assignRequest(
      id,
      { email: assigneeInput.trim(), name: assigneeInput.trim().split("@")[0] },
      { email: actorEmail, name: actorEmail.split("@")[0] },
    );
    await refresh();
    setAssigning(false);
  }

  async function handleComment() {
    if (!id || !comment.trim() || !actorEmail) return;
    setPosting(true);
    await addComment(id, comment.trim(), {
      email: actorEmail,
      name: actorEmail.split("@")[0],
    });
    setComment("");
    await refresh();
    setPosting(false);
  }

  if (request === undefined) {
    return (
      <div className="max-w-[1280px] mx-auto">
        <div className="animate-pulse space-y-md">
          <div className="h-6 bg-surface-container rounded w-1/3" />
          <div className="h-64 bg-surface-container rounded-xl" />
        </div>
      </div>
    );
  }

  if (request === null) {
    return (
      <div className="max-w-[900px] mx-auto pt-xl text-center">
        <Icon
          name="error_outline"
          className="text-on-error-container text-[32px] mx-auto mb-md block"
        />
        <h1 className="text-h1 font-semibold mb-xs">요청을 찾을 수 없습니다</h1>
        <Link
          href="/admin/requests"
          className="mt-md inline-block px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
        >
          요청 목록으로
        </Link>
      </div>
    );
  }

  const s = statusMeta[request.status];

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      <div>
        <div className="flex items-center gap-xs text-secondary mb-xs">
          <Link href="/admin/requests" className="text-label-sm hover:text-primary">
            모든 요청
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-label-sm font-semibold text-primary">{request.id}</span>
        </div>
        <div className="flex items-center justify-between gap-md">
          <h1 className="text-h1 font-semibold text-on-surface">{request.title}</h1>
          <span
            className={`inline-flex items-center gap-sm px-md py-xs rounded-full text-label-sm font-semibold ${s.bgClass} ${s.textClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${s.dotClass}`} />
            {s.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg items-start">
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md">요청 설명</h3>
            <p className="text-body-base text-on-surface-variant leading-relaxed whitespace-pre-wrap mb-lg">
              {request.description ?? "(설명 없음)"}
            </p>
            <div className="grid grid-cols-2 gap-xl pt-lg border-t border-outline-variant">
              <Meta label="유형">{REQUEST_TYPE_LABEL[request.type]}</Meta>
              <Meta label="카테고리">{request.category ?? "—"}</Meta>
              <Meta label="요청자">
                {request.requesterName ?? request.requesterEmail.split("@")[0]}
                <span className="text-label-sm text-secondary ml-xs">{request.requesterEmail}</span>
              </Meta>
              <Meta label="제출일">{request.submittedAt}</Meta>
              <Meta label="마감일">{request.deadline ?? "—"}</Meta>
              <Meta label="종료일">{request.closedAt ?? "—"}</Meta>
            </div>
          </div>

          {request.attachments.length > 0 ? (
            <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
              <h3 className="text-h3 font-semibold mb-md">첨부 파일</h3>
              <ul className="space-y-xs">
                {request.attachments.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      <Icon name="attach_file" className="text-primary text-[18px]" />
                      <span className="text-body-sm text-primary hover:underline truncate">
                        {decodeURIComponent(url.split("/").pop() ?? url)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md">활동 타임라인</h3>
            <RequestTimeline activities={activities} />
            <div className="mt-lg pt-lg border-t border-outline-variant">
              <label
                htmlFor="comment"
                className="text-label-caps text-on-surface-variant block mb-sm"
              >
                댓글 남기기 (요청자에게 전달됩니다)
              </label>
              <div className="relative">
                <textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="진행 상황·추가 정보 요청 등 자유롭게 작성"
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg p-md text-body-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none outline-none"
                />
                <button
                  type="button"
                  onClick={handleComment}
                  disabled={!comment.trim() || posting}
                  className="absolute bottom-2 right-2 px-md py-xs bg-primary text-on-primary rounded-lg hover:brightness-95 transition-all text-label-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-xs"
                >
                  <Icon name="send" className="text-[16px]" />
                  {posting ? "등록 중..." : "등록"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-lg">
          {/* 상태 변경 */}
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md flex items-center gap-sm">
              <Icon name="manage_accounts" className="text-primary text-[20px]" />
              상태 변경
            </h3>
            <div className="grid grid-cols-2 gap-sm mb-md">
              {STATUS_OPTIONS.map((opt) => {
                const active = request.status === opt.key;
                const meta = statusMeta[opt.key];
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleStatus(opt.key)}
                    disabled={active || statusChanging !== null}
                    className={
                      "p-sm rounded-lg border transition-all flex flex-col items-center gap-xs text-label-sm font-semibold " +
                      (active
                        ? `${meta.bgClass} ${meta.textClass} border-current`
                        : "bg-white text-secondary border-outline-variant hover:border-primary hover:text-primary disabled:opacity-50") +
                      (statusChanging === opt.key ? " opacity-50" : "")
                    }
                  >
                    <Icon name={opt.icon} className="text-[20px]" />
                    {statusChanging === opt.key ? "변경 중..." : opt.label}
                  </button>
                );
              })}
            </div>
            <div className="space-y-xs">
              <label className="text-label-sm text-on-surface-variant" htmlFor="status-note">
                메모 (선택, 타임라인에 함께 기록됨)
              </label>
              <input
                id="status-note"
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="다음 상태로 바꿀 때 같이 남길 메모"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-sm"
              />
            </div>
          </div>

          {/* 담당자 배정 */}
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md flex items-center gap-sm">
              <Icon name="person_add" className="text-primary text-[20px]" />
              담당자 배정
            </h3>
            {request.assigneeEmail ? (
              <div className="flex items-center gap-md mb-md p-sm bg-surface-container-low rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-sm font-bold">
                  {(request.assigneeName ?? request.assigneeEmail).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold truncate">
                    {request.assigneeName ?? request.assigneeEmail.split("@")[0]}
                  </p>
                  <p className="text-label-sm text-secondary truncate">{request.assigneeEmail}</p>
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-secondary mb-md">아직 배정된 담당자가 없습니다.</p>
            )}
            <div className="space-y-xs">
              <label className="text-label-sm text-on-surface-variant" htmlFor="assignee">
                담당자 이메일
              </label>
              <input
                id="assignee"
                type="email"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                placeholder="example@company.com"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-sm font-mono"
              />
              <button
                type="button"
                onClick={handleAssign}
                disabled={
                  assigning ||
                  !assigneeInput.trim() ||
                  assigneeInput.trim() === request.assigneeEmail
                }
                className="w-full bg-primary text-on-primary py-sm rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
              >
                <Icon name="check" className="text-[18px]" />
                {assigning
                  ? "배정 중..."
                  : request.assigneeEmail
                    ? "담당자 변경"
                    : "담당자 배정"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-label-caps text-secondary mb-xs">{label}</p>
      <p className="text-body-base text-on-surface">{children}</p>
    </div>
  );
}
