// 사내 게시물 템플릿 데이터 접근 계층 (배너와 동일 패턴, 다른 테이블)

import { createClient } from "@/lib/supabase/client";
import { type NoticeTemplate, type BannerSlot, computeDefaultSlots } from "@/lib/data";

const STORAGE_BUCKET = "assets";

export type NoticeTemplateInput = {
  name: string;
  description?: string;
  image: string;
  width: number;
  height: number;
  createdBy?: string;
  headlineSlot: BannerSlot;
  subtitleSlot: BannerSlot;
};

type Row = {
  id: string;
  name: string;
  description: string | null;
  image: string;
  width: number;
  height: number;
  created_by: string | null;
  created_at: string;
  is_seed: boolean;
  headline_slot: BannerSlot | null;
  subtitle_slot: BannerSlot | null;
};

function fromRow(row: Row): NoticeTemplate {
  const defaults = computeDefaultSlots(row.width, row.height);
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    image: row.image,
    width: row.width,
    height: row.height,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    seed: row.is_seed,
    headlineSlot: row.headline_slot ?? defaults.headline,
    subtitleSlot: row.subtitle_slot ?? defaults.subtitle,
  };
}

function genId(): string {
  return `nt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function listNoticeTemplates(): Promise<NoticeTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notice_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listNoticeTemplates]", error);
    return [];
  }
  return (data as Row[]).map(fromRow);
}

export async function getNoticeTemplate(id: string): Promise<NoticeTemplate | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notice_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getNoticeTemplate]", error);
    return undefined;
  }
  return data ? fromRow(data as Row) : undefined;
}

export function isUserNoticeTemplate(t: NoticeTemplate): boolean {
  return !t.seed;
}

export async function createNoticeTemplate(
  input: NoticeTemplateInput,
): Promise<NoticeTemplate | null> {
  const supabase = createClient();
  const row = {
    id: genId(),
    name: input.name,
    description: input.description ?? null,
    image: input.image,
    width: input.width,
    height: input.height,
    created_by: input.createdBy ?? null,
    is_seed: false,
    headline_slot: input.headlineSlot,
    subtitle_slot: input.subtitleSlot,
  };
  const { data, error } = await supabase
    .from("notice_templates")
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error("[createNoticeTemplate]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function updateNoticeTemplate(
  id: string,
  patch: Partial<NoticeTemplateInput>,
): Promise<NoticeTemplate | null> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description ?? null;
  if (patch.image !== undefined) update.image = patch.image;
  if (patch.width !== undefined) update.width = patch.width;
  if (patch.height !== undefined) update.height = patch.height;
  if (patch.headlineSlot !== undefined) update.headline_slot = patch.headlineSlot;
  if (patch.subtitleSlot !== undefined) update.subtitle_slot = patch.subtitleSlot;

  const { data, error } = await supabase
    .from("notice_templates")
    .update(update)
    .eq("id", id)
    .eq("is_seed", false)
    .select()
    .single();
  if (error) {
    console.error("[updateNoticeTemplate]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function deleteNoticeTemplate(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("notice_templates")
    .delete()
    .eq("id", id)
    .eq("is_seed", false);
  if (error) {
    console.error("[deleteNoticeTemplate]", error);
    return false;
  }
  return true;
}

export async function uploadNoticeTemplateImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const extRaw = (file.name.split(".").pop() ?? "").toLowerCase();
  const ext = /^[a-z0-9]+$/.test(extRaw) ? extRaw : "jpg";
  const path = `notice-templates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) {
    console.error("[uploadNoticeTemplateImage]", error);
    return null;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
