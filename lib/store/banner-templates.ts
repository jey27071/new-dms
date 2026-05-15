// 배너 템플릿 데이터 접근 계층

import { createClient } from "@/lib/supabase/client";
import { type BannerTemplate } from "@/lib/data";

const STORAGE_BUCKET = "assets"; // 기존 버킷 재사용 (prefix로 구분)

export type BannerTemplateInput = {
  name: string;
  description?: string;
  image: string;
  width: number;
  height: number;
  createdBy?: string;
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
};

function fromRow(row: Row): BannerTemplate {
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
  };
}

function genId(): string {
  return `bt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function listBannerTemplates(): Promise<BannerTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("banner_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listBannerTemplates]", error);
    return [];
  }
  return (data as Row[]).map(fromRow);
}

export async function getBannerTemplate(id: string): Promise<BannerTemplate | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("banner_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getBannerTemplate]", error);
    return undefined;
  }
  return data ? fromRow(data as Row) : undefined;
}

export function isUserBannerTemplate(t: BannerTemplate): boolean {
  return !t.seed;
}

export async function createBannerTemplate(
  input: BannerTemplateInput,
): Promise<BannerTemplate | null> {
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
  };
  const { data, error } = await supabase
    .from("banner_templates")
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error("[createBannerTemplate]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function updateBannerTemplate(
  id: string,
  patch: Partial<BannerTemplateInput>,
): Promise<BannerTemplate | null> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description ?? null;
  if (patch.image !== undefined) update.image = patch.image;
  if (patch.width !== undefined) update.width = patch.width;
  if (patch.height !== undefined) update.height = patch.height;

  const { data, error } = await supabase
    .from("banner_templates")
    .update(update)
    .eq("id", id)
    .eq("is_seed", false)
    .select()
    .single();
  if (error) {
    console.error("[updateBannerTemplate]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function deleteBannerTemplate(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("banner_templates")
    .delete()
    .eq("id", id)
    .eq("is_seed", false);
  if (error) {
    console.error("[deleteBannerTemplate]", error);
    return false;
  }
  return true;
}

// ===== Storage =====

export async function uploadBannerTemplateImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const extRaw = (file.name.split(".").pop() ?? "").toLowerCase();
  const ext = /^[a-z0-9]+$/.test(extRaw) ? extRaw : "jpg";
  const path = `banner-templates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) {
    console.error("[uploadBannerTemplateImage]", error);
    return null;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
