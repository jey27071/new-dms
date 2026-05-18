// 요청 유형별 자동 승인자 매핑 데이터 접근 계층

import { createClient } from "@/lib/supabase/client";
import { type RequestType } from "@/lib/data";

export type NotificationSetting = {
  requestType: RequestType;
  approverEmail: string;
  approverName?: string;
};

type Row = {
  request_type: string;
  approver_email: string;
  approver_name: string | null;
  updated_at: string;
};

function fromRow(row: Row): NotificationSetting {
  return {
    requestType: row.request_type as RequestType,
    approverEmail: row.approver_email,
    approverName: row.approver_name ?? undefined,
  };
}

export async function listNotificationSettings(): Promise<NotificationSetting[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("notification_settings").select("*");
  if (error) {
    console.error("[listNotificationSettings]", error);
    return [];
  }
  return (data as Row[]).map(fromRow);
}

export async function getApproverFor(
  type: RequestType,
): Promise<NotificationSetting | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("request_type", type)
    .maybeSingle();
  if (error || !data) return null;
  return fromRow(data as Row);
}

export async function upsertNotificationSetting(
  type: RequestType,
  email: string,
  name?: string,
): Promise<NotificationSetting | null> {
  const supabase = createClient();
  // 이메일이 비어 있으면 해당 row 삭제 (매핑 해제)
  if (!email.trim()) {
    await supabase.from("notification_settings").delete().eq("request_type", type);
    return null;
  }
  const row = {
    request_type: type,
    approver_email: email.trim(),
    approver_name: name?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("notification_settings")
    .upsert(row, { onConflict: "request_type" })
    .select()
    .single();
  if (error) {
    console.error("[upsertNotificationSetting]", error);
    return null;
  }
  return fromRow(data as Row);
}
