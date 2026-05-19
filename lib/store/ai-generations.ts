// AI 이미지 생성 이력 + 일일 한도 추적

import { createClient } from "@/lib/supabase/client";

export const DAILY_QUOTA = 5;

export type AiGeneration = {
  id: string;
  userEmail: string;
  styleId?: string;
  styleName?: string;
  prompt: string;
  fullPrompt?: string;
  imageUrls: string[];
  selectedUrl?: string;
  status: "completed" | "failed" | "pending";
  errorMessage?: string;
  createdAt: string;
};

type Row = {
  id: string;
  user_email: string;
  style_id: string | null;
  style_name: string | null;
  prompt: string;
  full_prompt: string | null;
  image_urls: string[];
  selected_url: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
};

function fromRow(row: Row): AiGeneration {
  return {
    id: row.id,
    userEmail: row.user_email,
    styleId: row.style_id ?? undefined,
    styleName: row.style_name ?? undefined,
    prompt: row.prompt,
    fullPrompt: row.full_prompt ?? undefined,
    imageUrls: row.image_urls ?? [],
    selectedUrl: row.selected_url ?? undefined,
    status: row.status as AiGeneration["status"],
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
  };
}

function genId(): string {
  return `aig-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** 오늘 사용자가 사용한 생성 횟수 */
export async function countTodayForUser(email: string): Promise<number> {
  if (!email) return 0;
  const supabase = createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("ai_generations")
    .select("id", { count: "exact", head: true })
    .eq("user_email", email.toLowerCase())
    .eq("status", "completed")
    .gte("created_at", startOfDay.toISOString());
  if (error) {
    console.error("[countTodayForUser]", error);
    return 0;
  }
  return count ?? 0;
}

/** 사용자별 최근 이력 (기본 20건) */
export async function listRecentForUser(email: string, limit = 20): Promise<AiGeneration[]> {
  if (!email) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ai_generations")
    .select("*")
    .eq("user_email", email.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listRecentForUser]", error);
    return [];
  }
  return (data as Row[]).map(fromRow);
}

export type AiGenerationInput = {
  userEmail: string;
  styleId?: string;
  styleName?: string;
  prompt: string;
  fullPrompt?: string;
  imageUrls: string[];
};

export async function createAiGeneration(input: AiGenerationInput): Promise<AiGeneration | null> {
  const supabase = createClient();
  const row = {
    id: genId(),
    user_email: input.userEmail.toLowerCase(),
    style_id: input.styleId ?? null,
    style_name: input.styleName ?? null,
    prompt: input.prompt,
    full_prompt: input.fullPrompt ?? null,
    image_urls: input.imageUrls,
    selected_url: null,
    status: "completed" as const,
    error_message: null,
  };
  const { data, error } = await supabase.from("ai_generations").insert(row).select().single();
  if (error) {
    console.error("[createAiGeneration]", error);
    return null;
  }
  return fromRow(data as Row);
}

/** 사용자가 선택한 이미지 URL을 기록 (다운로드 트래킹용) */
export async function markSelected(id: string, url: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("ai_generations")
    .update({ selected_url: url })
    .eq("id", id);
  if (error) {
    console.error("[markSelected]", error);
    return false;
  }
  return true;
}
