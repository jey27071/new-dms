// 카테고리 데이터 접근 계층 (요청·프롬프트·에셋 카테고리)

import { createClient } from "@/lib/supabase/client";

export type CategoryDomain = "request" | "prompt" | "asset";

export type Category = {
  id: string;
  domain: CategoryDomain;
  label: string;
  sortOrder: number;
};

type Row = {
  id: string;
  domain: string;
  label: string;
  sort_order: number;
  created_at: string;
};

function fromRow(row: Row): Category {
  return {
    id: row.id,
    domain: row.domain as CategoryDomain,
    label: row.label,
    sortOrder: row.sort_order,
  };
}

function genId(domain: CategoryDomain): string {
  const prefix = domain === "request" ? "rc" : domain === "prompt" ? "pc" : "ac";
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function listCategories(domain: CategoryDomain): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("domain", domain)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[listCategories]", error);
    return [];
  }
  return (data as Row[]).map(fromRow);
}

export async function createCategory(
  domain: CategoryDomain,
  label: string,
): Promise<Category | null> {
  const supabase = createClient();
  // 새 항목은 끝에 추가 (max sort_order + 1)
  const { data: existing } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("domain", domain)
    .order("sort_order", { ascending: false })
    .limit(1);
  const order = ((existing as { sort_order: number }[] | null)?.[0]?.sort_order ?? 0) + 1;

  const row = {
    id: genId(domain),
    domain,
    label: label.trim(),
    sort_order: order,
  };
  const { data, error } = await supabase
    .from("categories")
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error("[createCategory]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function updateCategory(
  id: string,
  patch: { label?: string; sortOrder?: number },
): Promise<Category | null> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.label !== undefined) update.label = patch.label.trim();
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder;
  const { data, error } = await supabase
    .from("categories")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[updateCategory]", error);
    return null;
  }
  return fromRow(data as Row);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[deleteCategory]", error);
    return false;
  }
  return true;
}

/** 두 항목의 sort_order를 맞바꿈 (위/아래 이동용) */
export async function swapSortOrder(
  a: { id: string; sortOrder: number },
  b: { id: string; sortOrder: number },
): Promise<void> {
  const supabase = createClient();
  // 같은 unique 제약을 피하기 위해 임시 음수 사용
  await supabase.from("categories").update({ sort_order: -1 }).eq("id", a.id);
  await supabase.from("categories").update({ sort_order: a.sortOrder }).eq("id", b.id);
  await supabase.from("categories").update({ sort_order: b.sortOrder }).eq("id", a.id);
}
