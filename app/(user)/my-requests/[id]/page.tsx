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
} from "@/lib/data";
import {
  getRequest,
  listActivities,
  addComment,
} from "@/lib/store/requests";
import { getClientEmail } from "@/lib/auth-client";

export default function MyRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [request, setRequest] = useState<DesignRequest | undefined | null>(undefined);
  const [activities, setActivities] = useState<RequestActivity[]>([]);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getClientEmail());
  }, []);

  const refresh = useCallback(async () => {
    if (!id) return;
    const [req, acts] = await Promise.all([getRequest(id), listActivities(id)]);
    setRequest(req ?? null);
    setActivities(acts);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleComment() {
    if (!id || !comment.trim() || !email) return;
    setPosting(true);
    await addComment(id, comment.trim(), {
      email,
      name: email.split("@")[0],
    });
    setComment("");
    await refresh();
    setPosting(false);
  }

  if (request === undefined) {
    return (
      <div className="max-w-[1040px] mx-auto">
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
          href="/my-requests"
          className="mt-md inline-block px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
        >
          요청 목록으로
        </Link>
      </div>
    );
  }

  const s = statusMeta[request.status];

  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      <div>
        <div className="flex items-center gap-xs text-secondary mb-xs">
          <Link href="/my-requests" className="text-label-sm hover:text-primary">
            요청 목록
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-label-sm font-semibold text-primary">#{request.id}</span>
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
              <Meta label="제출일">{request.submittedAt}</Meta>
              <Meta label="마감일">{request.deadline ?? "—"}</Meta>
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

          {/* 타임라인 */}
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md">활동 타임라인</h3>
            <RequestTimeline activities={activities} />

            <div className="mt-lg pt-lg border-t border-outline-variant">
              <label
                htmlFor="comment"
                className="text-label-caps text-on-surface-variant block mb-sm"
              >
                댓글 남기기
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="담당자에게 추가 정보를 전달하거나 진행 상황을 문의하세요."
                className="w-full bg-surface-bright border border-outline-variant rounded-lg p-md text-body-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none outline-none"
              />
              <div className="flex justify-end mt-sm">
                <button
                  type="button"
                  onClick={handleComment}
                  disabled={!comment.trim() || posting}
                  className="px-lg py-sm bg-primary text-on-primary rounded-lg hover:brightness-95 transition-all text-label-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-xs"
                >
                  <Icon name="send" className="text-[16px]" />
                  {posting ? "등록 중..." : "등록"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-lg">
          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md">담당자</h3>
            {request.assigneeEmail ? (
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                  {(request.assigneeName ?? request.assigneeEmail).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-body-base font-semibold truncate">
                    {request.assigneeName ?? request.assigneeEmail.split("@")[0]}
                  </p>
                  <p className="text-label-sm text-on-surface-variant truncate">
                    {request.assigneeEmail}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-secondary">아직 담당자가 배정되지 않았습니다.</p>
            )}
          </div>

          <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
            <h3 className="text-h3 font-semibold mb-md">요청자</h3>
            <p className="text-body-base">{request.requesterName ?? request.requesterEmail.split("@")[0]}</p>
            <p className="text-label-sm text-on-surface-variant">{request.requesterEmail}</p>
          </div>

          {request.ccEmails.length > 0 ? (
            <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
              <h3 className="text-h3 font-semibold mb-md flex items-center gap-sm">
                <Icon name="mail" className="text-primary text-[20px]" />
                참조 (CC)
              </h3>
              <ul className="space-y-xs">
                {request.ccEmails.map((email) => (
                  <li key={email} className="flex items-center gap-sm text-body-sm">
                    <Icon name="alternate_email" className="text-secondary text-[16px]" />
                    <span className="font-mono">{email}</span>
                  </li>
                ))}
              </ul>
              <p className="text-label-sm text-on-surface-variant mt-md">
                이 이메일들은 진행 상황 변경 시 알림을 함께 받습니다.
              </p>
            </div>
          ) : null}
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
