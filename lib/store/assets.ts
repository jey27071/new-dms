// 에셋 데이터 접근 계층 (Supabase)
// 실 DB(PostgreSQL via Supabase)에 직접 쓰고 읽습니다.

import { createClient } from "@/lib/supabase/client";
import { type Asset, type AssetFormat } from "@/lib/data";

export type AssetInput = {
  title: string;
  /** 카테고리 라벨 (DB categories 테이블, domain='asset') */
  category: string;
  formats: AssetFormat[];
  image: string;
  /** 포맷별 다운로드 파일 URL 매핑 */
  files?: Record<string, string>;
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
  files: Record<string, string> | null;
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
    category: row.category,
    formats: row.formats as AssetFormat[],
    image: row.image,
    files: row.files ?? undefined,
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
    files: input.files ?? {},
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
  if (patch.files !== undefined) update.files = patch.files ?? {};
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

// ===== Storage =====

const STORAGE_BUCKET = "assets";

/** 파일을 assets 버킷에 업로드하고 퍼블릭 URL을 반환 */
export async function uploadAssetImage(file: File): Promise<string | null> {
  return uploadAssetFile(file);
}

/**
 * 임의의 파일(이미지 외 AI/PDF/ZIP 등 포함)을 assets 버킷에 업로드.
 * 확장자는 파일명에서 추출, 영숫자만 허용. 그 외엔 'bin' 으로 저장.
 */
export async function uploadAssetFile(file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) {
    console.error("[uploadAssetFile]", error);
    return null;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
