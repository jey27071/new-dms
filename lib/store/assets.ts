// 에셋 데이터 접근 계층 (Supabase)
// 실 DB(PostgreSQL via Supabase)에 직접 쓰고 읽습니다.

import { createClient } from "@/lib/supabase/client";
import { type Asset, type AssetCategory, type AssetFormat } from "@/lib/data";

export type AssetInput = {
  title: string;
  category: AssetCategory;
  formats: AssetFormat[];
  image: string;
  description?: string;
  uploader: string;
  internal?: boolean;
  primary?: boolean;
};

// ===== DB row ↔ Asset 변환 =====

type AssetRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  formats: string[];
  image: string;
  downloads: string;
  uploader: string;
  uploaded_at: string;
  is_internal: boolean | null;
  is_primary: boolean | null;
  is_seed: boolean;
  related: string[] | null;
};

function fromRow(row: AssetRow): Asset {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category as AssetCategory,
    formats: row.formats as AssetFormat[],
    image: row.image,
    downloads: row.downloads,
    uploader: row.uploader,
    uploadedAt: row.uploaded_at,
    internal: row.is_internal ?? undefined,
    primary: row.is_primary ?? undefined,
    related: row.related ?? undefined,
    seed: row.is_seed,
  };
}

// ===== 공개 API =====

export async function listAssets(): Promise<Asset[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("uploaded_at", { ascending: false });
  if (error) {
    console.error("[listAssets]", error);
    return [];
  }
  return (data as AssetRow[]).map(fromRow);
}

export async function getAsset(id: string): Promise<Asset | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getAsset]", error);
    return undefined;
  }
  return data ? fromRow(data as AssetRow) : undefined;
}

export function isUserAsset(asset: Asset): boolean {
  return !asset.seed;
}

export async function createAsset(input: AssetInput): Promise<Asset | null> {
  const supabase = createClient();
  const id = `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const insertRow = {
    id,
    title: input.title,
    description: input.description ?? null,
    category: input.category,
    formats: input.formats,
    image: input.image,
    uploader: input.uploader,
    downloads: "0",
    uploaded_at: new Date().toISOString().slice(0, 10),
    is_internal: input.internal ?? false,
    is_primary: input.primary ?? false,
    is_seed: false,
  };
  const { data, error } = await supabase
    .from("assets")
    .insert(insertRow)
    .select()
    .single();
  if (error) {
    console.error("[createAsset]", error);
    return null;
  }
  return fromRow(data as AssetRow);
}

export async function updateAsset(
  id: string,
  patch: Partial<AssetInput>,
): Promise<Asset | null> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.description !== undefined) update.description = patch.description ?? null;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.formats !== undefined) update.formats = patch.formats;
  if (patch.image !== undefined) update.image = patch.image;
  if (patch.uploader !== undefined) update.uploader = patch.uploader;
  if (patch.internal !== undefined) update.is_internal = patch.internal;
  if (patch.primary !== undefined) update.is_primary = patch.primary;

  const { data, error } = await supabase
    .from("assets")
    .update(update)
    .eq("id", id)
    .eq("is_seed", false) // seed는 수정 불가
    .select()
    .single();
  if (error) {
    console.error("[updateAsset]", error);
    return null;
  }
  return fromRow(data as AssetRow);
}

export async function deleteAsset(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", id)
    .eq("is_seed", false); // seed는 삭제 불가
  if (error) {
    console.error("[deleteAsset]", error);
    return false;
  }
  return true;
}
