// 가이드라인 데이터 접근 계층 (Supabase)

import { createClient } from "@/lib/supabase/client";
import { type Guideline } from "@/lib/data";

const STORAGE_BUCKET = "guidelines";

export type GuidelineInput = {
  title: string;
  version: string;
  category: string;
  notes: string;
  body?: string;
  tags: string[];
  cover: string;
  owner?: string;
  attachment?: string;
  pages?: number;
};

type GuidelineRow = {
  id: string;
  title: string;
  version: string;
  category: string;
  updated_at: string;
  notes: string;
  body: string | null;
  tags: string[];
  cover: string;
  owner: string | null;
  attachment: string | null;
  pages: number;
  is_seed: boolean;
};

function fromRow(row: GuidelineRow): Guideline {
  return {
    id: row.id,
    title: row.title,
    version: row.version,
    category: row.category,
    updatedAt: row.updated_at,
    notes: row.notes,
    body: row.body ?? undefined,
    tags: row.tags,
    cover: row.cover,
    owner: row.owner ?? undefined,
    attachment: row.attachment ?? undefined,
    pages: row.pages,
    seed: row.is_seed,
  };
}

export async function listGuidelines(): Promise<Guideline[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("guidelines")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[listGuidelines]", error);
    return [];
  }
  return (data as GuidelineRow[]).map(fromRow);
}

export async function getGuideline(id: string): Promise<Guideline | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("guidelines")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getGuideline]", error);
    return undefined;
  }
  return data ? fromRow(data as GuidelineRow) : undefined;
}

export function isUserGuideline(g: Guideline): boolean {
  return !g.seed;
}

function generateId(title: string): string {
  // ASCII 전용 ID — 한국어 제목도 안전한 URL이 되도록
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return slug ? `${slug}-${suffix}` : `g-${suffix}`;
}

export async function createGuideline(input: GuidelineInput): Promise<Guideline | null> {
  const supabase = createClient();
  const id = generateId(input.title);
  const insertRow = {
    id,
    title: input.title,
    version: input.version || "v1.0",
    category: input.category,
    notes: input.notes,
    body: input.body ?? null,
    tags: input.tags,
    cover: input.cover,
    owner: input.owner ?? null,
    attachment: input.attachment ?? null,
    pages: input.pages ?? 0,
    is_seed: false,
    updated_at: new Date().toISOString().slice(0, 10),
  };
  const { data, error } = await supabase
    .from("guidelines")
    .insert(insertRow)
    .select()
    .single();
  if (error) {
    console.error("[createGuideline]", error);
    return null;
  }
  return fromRow(data as GuidelineRow);
}

export async function updateGuideline(
  id: string,
  patch: Partial<GuidelineInput>,
): Promise<Guideline | null> {
  const supabase = createClient();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString().slice(0, 10),
  };
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.version !== undefined) update.version = patch.version;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (patch.body !== undefined) update.body = patch.body ?? null;
  if (patch.tags !== undefined) update.tags = patch.tags;
  if (patch.cover !== undefined) update.cover = patch.cover;
  if (patch.owner !== undefined) update.owner = patch.owner ?? null;
  if (patch.attachment !== undefined) update.attachment = patch.attachment ?? null;
  if (patch.pages !== undefined) update.pages = patch.pages;

  const { data, error } = await supabase
    .from("guidelines")
    .update(update)
    .eq("id", id)
    .eq("is_seed", false)
    .select()
    .single();
  if (error) {
    console.error("[updateGuideline]", error);
    return null;
  }
  return fromRow(data as GuidelineRow);
}

export async function deleteGuideline(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("guidelines")
    .delete()
    .eq("id", id)
    .eq("is_seed", false);
  if (error) {
    console.error("[deleteGuideline]", error);
    return false;
  }
  return true;
}

// ===== Storage =====

async function uploadToGuidelines(file: File, prefix: string): Promise<string | null> {
  const supabase = createClient();
  const extRaw = (file.name.split(".").pop() ?? "").toLowerCase();
  const ext = /^[a-z0-9]+$/.test(extRaw) ? extRaw : "bin";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) {
    console.error("[uploadToGuidelines]", error);
    return null;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadGuidelineCover(file: File) {
  return uploadToGuidelines(file, "covers");
}

export function uploadGuidelineAttachment(file: File) {
  return uploadToGuidelines(file, "attachments");
}
