// 요청 시스템 데이터 접근 계층

import { createClient } from "@/lib/supabase/client";
import {
  type DesignRequest,
  type RequestActivity,
  type RequestActivityType,
  type RequestStatus,
  type RequestType,
} from "@/lib/data";
import { getApproverFor } from "@/lib/store/notification-settings";

const STORAGE_BUCKET = "assets";

// fire-and-forget 알림 호출 (실패해도 요청 자체는 막지 않음)
function notify(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  fetch("/api/notify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch((err) => console.warn("[notify]", err));
}

export type RequestInput = {
  title: string;
  type: RequestType;
  description?: string;
  category?: string;
  deadline?: string;
  attachments?: string[];
  requesterEmail: string;
  requesterName?: string;
  assigneeEmail?: string;
  assigneeName?: string;
  ccEmails?: string[];
};

type RequestRow = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  status: string;
  category: string | null;
  deadline: string | null;
  attachments: string[];
  requester_email: string;
  requester_name: string | null;
  assignee_email: string | null;
  assignee_name: string | null;
  cc_emails: string[];
  submitted_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityRow = {
  id: string;
  request_id: string;
  type: string;
  actor_email: string;
  actor_name: string | null;
  data: Record<string, unknown>;
  created_at: string;
};

function fromRequestRow(row: RequestRow): DesignRequest {
  return {
    id: row.id,
    title: row.title,
    type: row.type as RequestType,
    description: row.description ?? undefined,
    status: row.status as RequestStatus,
    category: row.category ?? undefined,
    deadline: row.deadline ?? undefined,
    attachments: row.attachments,
    requesterEmail: row.requester_email,
    requesterName: row.requester_name ?? undefined,
    assigneeEmail: row.assignee_email ?? undefined,
    assigneeName: row.assignee_name ?? undefined,
    ccEmails: row.cc_emails ?? [],
    submittedAt: row.submitted_at,
    closedAt: row.closed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromActivityRow(row: ActivityRow): RequestActivity {
  return {
    id: row.id,
    requestId: row.request_id,
    type: row.type as RequestActivityType,
    actorEmail: row.actor_email,
    actorName: row.actor_name ?? undefined,
    data: row.data,
    createdAt: row.created_at,
  };
}

function genRequestId(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `REQ-${stamp}${rand}`;
}

function genActivityId(): string {
  return `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ===== 요청 CRUD =====

export async function listRequests(opts?: {
  requesterEmail?: string;
  status?: RequestStatus;
}): Promise<DesignRequest[]> {
  const supabase = createClient();
  let q = supabase.from("requests").select("*").order("created_at", { ascending: false });
  if (opts?.requesterEmail) q = q.eq("requester_email", opts.requesterEmail);
  if (opts?.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) {
    console.error("[listRequests]", error);
    return [];
  }
  return (data as RequestRow[]).map(fromRequestRow);
}

export async function getRequest(id: string): Promise<DesignRequest | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getRequest]", error);
    return undefined;
  }
  return data ? fromRequestRow(data as RequestRow) : undefined;
}

export async function createRequest(input: RequestInput): Promise<DesignRequest | null> {
  const supabase = createClient();
  const id = genRequestId();

  // 승인자 자동 조회: input에 없으면 notification_settings에서 매핑된 승인자 사용
  let assigneeEmail = input.assigneeEmail ?? null;
  let assigneeName = input.assigneeName ?? null;
  if (!assigneeEmail) {
    const setting = await getApproverFor(input.type);
    if (setting) {
      assigneeEmail = setting.approverEmail;
      assigneeName = setting.approverName ?? null;
    }
  }

  const row = {
    id,
    title: input.title,
    type: input.type,
    description: input.description ?? null,
    status: "review",
    category: input.category ?? null,
    deadline: input.deadline ?? null,
    attachments: input.attachments ?? [],
    requester_email: input.requesterEmail,
    requester_name: input.requesterName ?? null,
    assignee_email: assigneeEmail,
    assignee_name: assigneeName,
    cc_emails: input.ccEmails ?? [],
  };
  const { data, error } = await supabase.from("requests").insert(row).select().single();
  if (error) {
    console.error("[createRequest]", error);
    return null;
  }
  // 생성 활동 로그
  await logActivity({
    requestId: id,
    type: "created",
    actorEmail: input.requesterEmail,
    actorName: input.requesterName,
    data: {
      title: input.title,
      type: input.type,
    },
  });
  // 이메일 알림 — 자동 조회된 승인자 포함, CC도 함께
  notify({
    type: "request_created",
    requestId: id,
    title: input.title,
    description: input.description,
    requestType: input.type,
    category: input.category,
    deadline: input.deadline,
    requesterEmail: input.requesterEmail,
    requesterName: input.requesterName,
    assigneeEmail: assigneeEmail ?? undefined,
    assigneeName: assigneeName ?? undefined,
    ccEmails: input.ccEmails ?? [],
  });
  return fromRequestRow(data as RequestRow);
}

export async function changeStatus(
  requestId: string,
  toStatus: RequestStatus,
  actor: { email: string; name?: string },
  note?: string,
): Promise<DesignRequest | null> {
  const supabase = createClient();
  const current = await getRequest(requestId);
  if (!current) return null;
  const fromStatus = current.status;
  if (fromStatus === toStatus) return current;

  const update: Record<string, unknown> = {
    status: toStatus,
    updated_at: new Date().toISOString(),
  };
  if (toStatus === "completed" || toStatus === "rejected") {
    update.closed_at = new Date().toISOString().slice(0, 10);
  } else {
    update.closed_at = null;
  }

  const { data, error } = await supabase
    .from("requests")
    .update(update)
    .eq("id", requestId)
    .select()
    .single();
  if (error) {
    console.error("[changeStatus]", error);
    return null;
  }
  await logActivity({
    requestId,
    type: "status_change",
    actorEmail: actor.email,
    actorName: actor.name,
    data: { from: fromStatus, to: toStatus, note: note ?? null },
  });
  // 요청자 + 승인자 + CC 모두에게 상태 변경 알림
  notify({
    type: "status_changed",
    requestId,
    title: current.title,
    from: fromStatus,
    to: toStatus,
    note: note ?? null,
    requesterEmail: current.requesterEmail,
    requesterName: current.requesterName,
    assigneeEmail: current.assigneeEmail,
    assigneeName: current.assigneeName,
    ccEmails: current.ccEmails,
    actorEmail: actor.email,
  });
  return fromRequestRow(data as RequestRow);
}

export async function assignRequest(
  requestId: string,
  assignee: { email: string; name?: string },
  actor: { email: string; name?: string },
): Promise<DesignRequest | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .update({
      assignee_email: assignee.email,
      assignee_name: assignee.name ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();
  if (error) {
    console.error("[assignRequest]", error);
    return null;
  }
  await logActivity({
    requestId,
    type: "assignment",
    actorEmail: actor.email,
    actorName: actor.name,
    data: { assigneeEmail: assignee.email, assigneeName: assignee.name ?? null },
  });
  // 배정된 승인자 + CC에게 알림
  const updated = fromRequestRow(data as RequestRow);
  notify({
    type: "request_assigned",
    requestId,
    title: updated.title,
    assigneeEmail: assignee.email,
    assigneeName: assignee.name,
    requesterEmail: updated.requesterEmail,
    requesterName: updated.requesterName,
    ccEmails: updated.ccEmails,
  });
  return updated;
}

export async function addComment(
  requestId: string,
  content: string,
  actor: { email: string; name?: string },
): Promise<RequestActivity | null> {
  return logActivity({
    requestId,
    type: "comment",
    actorEmail: actor.email,
    actorName: actor.name,
    data: { content },
  });
}

export async function updateCcEmails(
  requestId: string,
  ccEmails: string[],
): Promise<DesignRequest | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .update({ cc_emails: ccEmails, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .select()
    .single();
  if (error) {
    console.error("[updateCcEmails]", error);
    return null;
  }
  return fromRequestRow(data as RequestRow);
}

// ===== 활동 로그 =====

export async function listActivities(requestId: string): Promise<RequestActivity[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("request_activities")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[listActivities]", error);
    return [];
  }
  return (data as ActivityRow[]).map(fromActivityRow);
}

async function logActivity(opts: {
  requestId: string;
  type: RequestActivityType;
  actorEmail: string;
  actorName?: string;
  data: Record<string, unknown>;
}): Promise<RequestActivity | null> {
  const supabase = createClient();
  const row = {
    id: genActivityId(),
    request_id: opts.requestId,
    type: opts.type,
    actor_email: opts.actorEmail,
    actor_name: opts.actorName ?? null,
    data: opts.data,
  };
  const { data, error } = await supabase
    .from("request_activities")
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error("[logActivity]", error);
    return null;
  }
  return fromActivityRow(data as ActivityRow);
}

// ===== 첨부 업로드 =====

export async function uploadRequestAttachment(file: File): Promise<string | null> {
  const supabase = createClient();
  const extRaw = (file.name.split(".").pop() ?? "").toLowerCase();
  const ext = /^[a-z0-9]+$/.test(extRaw) ? extRaw : "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 80);
  const path = `request-attachments/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) {
    console.error("[uploadRequestAttachment]", error);
    return null;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
