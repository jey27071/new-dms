"use client";

import { Icon } from "@/components/icon";
import { type RequestActivity, statusMeta, type RequestStatus } from "@/lib/data";

type Props = {
  activities: RequestActivity[];
};

function ActivityIcon({ type }: { type: RequestActivity["type"] }) {
  if (type === "created") return <Icon name="add_circle" className="text-[16px] text-primary" />;
  if (type === "status_change")
    return <Icon name="swap_horiz" className="text-[16px] text-tertiary" />;
  if (type === "assignment")
    return <Icon name="person_add" className="text-[16px] text-primary" />;
  if (type === "comment")
    return <Icon name="chat_bubble" className="text-[16px] text-secondary" />;
  return null;
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return date.toISOString().slice(0, 10);
}

export function RequestTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <p className="text-body-sm text-secondary text-center py-md">
        아직 활동 기록이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-md">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-md">
          <div className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center flex-shrink-0">
            <ActivityIcon type={a.type} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-sm text-body-sm">
              <span className="font-semibold text-on-surface">
                {a.actorName || a.actorEmail}
              </span>
              <span className="text-secondary text-label-sm">{relativeTime(a.createdAt)}</span>
            </div>
            <div className="mt-xs">
              <ActivityBody activity={a} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityBody({ activity }: { activity: RequestActivity }) {
  const data = activity.data;
  if (activity.type === "created") {
    return <p className="text-body-sm text-on-surface-variant">요청을 생성했습니다.</p>;
  }
  if (activity.type === "status_change") {
    const from = (data.from as RequestStatus) || "review";
    const to = (data.to as RequestStatus) || "review";
    const note = (data.note as string) || "";
    return (
      <div>
        <p className="text-body-sm text-on-surface-variant flex items-center gap-xs flex-wrap">
          상태를{" "}
          <span
            className={
              "inline-flex items-center gap-xs px-sm py-[2px] rounded-full text-[10px] font-bold " +
              statusMeta[from].bgClass +
              " " +
              statusMeta[from].textClass
            }
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta[from].dotClass}`} />
            {statusMeta[from].label}
          </span>
          →
          <span
            className={
              "inline-flex items-center gap-xs px-sm py-[2px] rounded-full text-[10px] font-bold " +
              statusMeta[to].bgClass +
              " " +
              statusMeta[to].textClass
            }
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta[to].dotClass}`} />
            {statusMeta[to].label}
          </span>
          으로 변경했습니다.
        </p>
        {note ? (
          <p className="mt-xs text-body-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-lg p-sm">
            {note}
          </p>
        ) : null}
      </div>
    );
  }
  if (activity.type === "assignment") {
    const email = data.assigneeEmail as string;
    const name = (data.assigneeName as string) || email;
    return (
      <p className="text-body-sm text-on-surface-variant">
        담당자를 <span className="font-semibold text-on-surface">{name}</span>{" "}
        <span className="text-secondary text-label-sm">({email})</span> 으로 배정했습니다.
      </p>
    );
  }
  if (activity.type === "comment") {
    const content = (data.content as string) || "";
    return (
      <p className="text-body-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-lg p-sm whitespace-pre-wrap">
        {content}
      </p>
    );
  }
  return null;
}
