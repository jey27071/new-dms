// 관리자 + 알림 구독 데이터 접근 계층
//
// - admins: 관리자 계정 (= 관리자 권한 + 알림 수신 대상 후보)
// - admin_notification_subscriptions: 관리자 × 요청 유형 다대다 매핑
//
// 권한 모델:
//   현재 — 이메일이 admins 테이블에 있으면 관리자
//   향후 — SSO 연동 후에도 동일한 로직 사용 (auth 소스만 SSO로 교체)

import { createClient } from "@/lib/supabase/client";
import { type RequestType } from "@/lib/data";

export type Admin = {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
};

export type AdminWithSubscriptions = Admin & {
  subscriptions: RequestType[];
};

type AdminRow = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
};

type SubscriptionRow = {
  admin_id: string;
  request_type: string;
};

function fromAdminRow(row: AdminRow): Admin {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
    createdAt: row.created_at,
  };
}

function genAdminId(email: string): string {
  // 이메일 기반 결정적 ID — 같은 이메일에 같은 ID
  // 클라이언트에서 generic hash 어렵기 때문에 timestamp + 임의값으로 대체
  const slug = email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toLowerCase();
  return `adm-${slug}-${Date.now().toString(36).slice(-4)}`;
}

// ===== 관리자 CRUD =====

export async function listAdminsWithSubscriptions(): Promise<AdminWithSubscriptions[]> {
  const supabase = createClient();
  const [adminsRes, subsRes] = await Promise.all([
    supabase.from("admins").select("*").order("created_at", { ascending: true }),
    supabase.from("admin_notification_subscriptions").select("*"),
  ]);

  if (adminsRes.error) {
    console.error("[listAdminsWithSubscriptions/admins]", adminsRes.error);
    return [];
  }
  if (subsRes.error) {
    console.error("[listAdminsWithSubscriptions/subs]", subsRes.error);
  }

  const subsByAdminId = new Map<string, RequestType[]>();
  for (const row of (subsRes.data ?? []) as SubscriptionRow[]) {
    const list = subsByAdminId.get(row.admin_id) ?? [];
    list.push(row.request_type as RequestType);
    subsByAdminId.set(row.admin_id, list);
  }

  return (adminsRes.data as AdminRow[]).map((row) => ({
    ...fromAdminRow(row),
    subscriptions: subsByAdminId.get(row.id) ?? [],
  }));
}

export async function isEmailAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) {
    console.error("[isEmailAdmin]", error);
    return false;
  }
  return !!data;
}

export async function addAdmin(email: string, name?: string): Promise<Admin | null> {
  const supabase = createClient();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  // 이미 있으면 그 row 반환
  const { data: existing } = await supabase
    .from("admins")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (existing) return fromAdminRow(existing as AdminRow);

  const row = {
    id: genAdminId(normalized),
    email: normalized,
    name: name?.trim() || null,
  };
  const { data, error } = await supabase.from("admins").insert(row).select().single();
  if (error) {
    console.error("[addAdmin]", error);
    return null;
  }
  return fromAdminRow(data as AdminRow);
}

export async function removeAdmin(id: string): Promise<boolean> {
  const supabase = createClient();
  // subscriptions는 on delete cascade로 자동 삭제됨
  const { error } = await supabase.from("admins").delete().eq("id", id);
  if (error) {
    console.error("[removeAdmin]", error);
    return false;
  }
  return true;
}

export async function updateAdminName(id: string, name: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("admins")
    .update({ name: name.trim() || null })
    .eq("id", id);
  if (error) {
    console.error("[updateAdminName]", error);
    return false;
  }
  return true;
}

// ===== 알림 구독 =====

/** 특정 관리자의 구독 유형 목록을 전부 교체 */
export async function setAdminSubscriptions(
  adminId: string,
  types: RequestType[],
): Promise<boolean> {
  const supabase = createClient();
  // 기존 행 모두 삭제 후 새로 insert (간단·안전)
  const delRes = await supabase
    .from("admin_notification_subscriptions")
    .delete()
    .eq("admin_id", adminId);
  if (delRes.error) {
    console.error("[setAdminSubscriptions/delete]", delRes.error);
    return false;
  }
  if (types.length === 0) return true;
  const rows = types.map((t) => ({ admin_id: adminId, request_type: t }));
  const { error } = await supabase.from("admin_notification_subscriptions").insert(rows);
  if (error) {
    console.error("[setAdminSubscriptions/insert]", error);
    return false;
  }
  return true;
}

/** 요청 유형별 알림 수신자 이메일·이름 목록 (최대 10명 권장) */
export async function getApproversFor(
  type: RequestType,
): Promise<{ email: string; name?: string }[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admin_notification_subscriptions")
    .select("admin_id, admins(email, name)")
    .eq("request_type", type);
  if (error) {
    console.error("[getApproversFor]", error);
    return [];
  }
  type Joined = { admins: { email: string; name: string | null } | null };
  return ((data ?? []) as Joined[])
    .map((r) => r.admins)
    .filter((a): a is { email: string; name: string | null } => !!a)
    .map((a) => ({ email: a.email, name: a.name ?? undefined }));
}

export const MAX_SUBSCRIBERS_PER_TYPE = 10;
