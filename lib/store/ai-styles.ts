// AI 생성 스타일 (관리자가 항목별 디자인 가이드를 등록)

import { createClient } from "@/lib/supabase/client";

export type AiStyle = {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  negativePrompt?: string;
  sampleImage?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  negative_prompt: string | null;
  sample_image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function fromRow(row: Row): AiStyle {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    systemPrompt: row.system_prompt,
    negativePrompt: row.negative_prompt ?? undefined,
    sampleImage: row.sample_image ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function genId(): string {
  return `ais-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function listAiStyles(includeInactive = false): Promise<AiStyle[]> {
  const supabase = createClient();
  const query = supabase.from("ai_styles").select("*").order("sort_order", { ascending: true });
  const { data, error } = includeInactive
    ? await query
    : await query.eq("is_active", true);
  if (error) {
    console.error("[listAiStyles]", error);
    return [];
  }
  return (data as Row[]).map(fromRow);
}

export async function getAiStyle(id: string): Promise<AiStyle | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("ai_styles").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return fromRow(data as Row);
}

export type AiStyleInput = {
  name: string;
  description?: string;
  systemPrompt: string;
  negativePrompt?: string;
  sampleImage?: string;
  isActive?: boolean;
};

export async function createAiStyle(input: AiStyleInput): Promise<AiStyle | null> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("ai_styles")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const order = ((existing as { sort_order: number }[] | null)?.[0]?.sort_order ?? 0) + 1;

  const row = {
    id: genId(),
    name: input.name.trim(),
    description: input.description?.trim() || null,
    system_prompt: input.systemPrompt,
    negative_prompt: input.negativePrompt?.trim() || null,
    sample_image: input.sampleImage || null,
    sort_order: order,
    is_active: input.isActive ?? true,
  };
  const { data, error } = await supabase.from("ai_styles").insert(row).select().single();
  if (error) {
    console.error("[createAiStyle]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function updateAiStyle(id: string, patch: Partial<AiStyleInput>): Promise<AiStyle | null> {
  const supabase = createClient();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.description !== undefined) update.description = patch.description?.trim() || null;
  if (patch.systemPrompt !== undefined) update.system_prompt = patch.systemPrompt;
  if (patch.negativePrompt !== undefined) update.negative_prompt = patch.negativePrompt?.trim() || null;
  if (patch.sampleImage !== undefined) update.sample_image = patch.sampleImage || null;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { data, error } = await supabase
    .from("ai_styles")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[updateAiStyle]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function deleteAiStyle(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("ai_styles").delete().eq("id", id);
  if (error) {
    console.error("[deleteAiStyle]", error);
    return false;
  }
  return true;
}
