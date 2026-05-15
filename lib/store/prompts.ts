// AI 프롬프트 데이터 접근 계층

import { createClient } from "@/lib/supabase/client";
import { type Prompt } from "@/lib/data";

export type PromptInput = {
  title: string;
  category: string;
  tags: string[];
  prompt: string;
  description?: string;
  example?: string;
  createdBy?: string;
};

type Row = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  prompt: string;
  description: string | null;
  example: string | null;
  created_by: string | null;
  created_at: string;
  is_seed: boolean;
};

function fromRow(row: Row): Prompt {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tags: row.tags,
    prompt: row.prompt,
    description: row.description ?? undefined,
    example: row.example ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    seed: row.is_seed,
  };
}

function genId(): string {
  return `pr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function listPrompts(): Promise<Prompt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listPrompts]", error);
    return [];
  }
  return (data as Row[]).map(fromRow);
}

export async function getPrompt(id: string): Promise<Prompt | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getPrompt]", error);
    return undefined;
  }
  return data ? fromRow(data as Row) : undefined;
}

export function isUserPrompt(p: Prompt): boolean {
  return !p.seed;
}

export async function createPrompt(input: PromptInput): Promise<Prompt | null> {
  const supabase = createClient();
  const row = {
    id: genId(),
    title: input.title,
    category: input.category,
    tags: input.tags,
    prompt: input.prompt,
    description: input.description ?? null,
    example: input.example ?? null,
    created_by: input.createdBy ?? null,
    is_seed: false,
  };
  const { data, error } = await supabase
    .from("prompts")
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error("[createPrompt]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function updatePrompt(
  id: string,
  patch: Partial<PromptInput>,
): Promise<Prompt | null> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.tags !== undefined) update.tags = patch.tags;
  if (patch.prompt !== undefined) update.prompt = patch.prompt;
  if (patch.description !== undefined) update.description = patch.description ?? null;
  if (patch.example !== undefined) update.example = patch.example ?? null;

  const { data, error } = await supabase
    .from("prompts")
    .update(update)
    .eq("id", id)
    .eq("is_seed", false)
    .select()
    .single();
  if (error) {
    console.error("[updatePrompt]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function deletePrompt(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("prompts")
    .delete()
    .eq("id", id)
    .eq("is_seed", false);
  if (error) {
    console.error("[deletePrompt]", error);
    return false;
  }
  return true;
}
