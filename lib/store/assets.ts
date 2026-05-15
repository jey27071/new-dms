// 에셋 데이터 접근 계층
// 목업 단계: seed(코드) + localStorage 합산
// 실 서비스 전환 시: 이 파일의 함수 내부만 백엔드/DB 호출로 교체

import {
  assets as seedAssets,
  type Asset,
  type AssetCategory,
  type AssetFormat,
} from "@/lib/data";

const STORAGE_KEY = "dms.assets.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

// ===== 내부: localStorage 헬퍼 =====

function readLocal(): Asset[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Asset[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Asset[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ===== 공개 API =====

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

/** 전체 에셋 (seed + 사용자 추가) — 브라우저 환경에서만 합산됨 */
export function listAssets(): Asset[] {
  return [...seedAssets, ...readLocal()];
}

/** seed인지 사용자 추가인지 구분 */
export function isUserAsset(asset: Asset): boolean {
  return readLocal().some((a) => a.id === asset.id);
}

/** ID 조회 */
export function getAsset(id: string): Asset | undefined {
  return listAssets().find((a) => a.id === id);
}

/** 새 에셋 생성 (localStorage에 저장) */
export function createAsset(input: AssetInput): Asset {
  const asset: Asset = {
    id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: input.title,
    category: input.category,
    formats: input.formats,
    image: input.image,
    description: input.description,
    uploader: input.uploader,
    uploadedAt: new Date().toISOString().slice(0, 10),
    downloads: "0",
    internal: input.internal,
    primary: input.primary,
  };
  const current = readLocal();
  writeLocal([asset, ...current]);
  return asset;
}

/** 사용자 추가 에셋 수정 (seed는 수정 불가) */
export function updateAsset(id: string, patch: Partial<AssetInput>): Asset | null {
  const current = readLocal();
  const idx = current.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const existing = current[idx];
  if (!existing) return null;
  const updated: Asset = {
    ...existing,
    ...patch,
    id: existing.id,
    uploadedAt: existing.uploadedAt,
  };
  const next = [...current];
  next[idx] = updated;
  writeLocal(next);
  return updated;
}

/** 사용자 추가 에셋 삭제 (seed는 삭제 불가) */
export function deleteAsset(id: string): boolean {
  const current = readLocal();
  const next = current.filter((a) => a.id !== id);
  if (next.length === current.length) return false;
  writeLocal(next);
  return true;
}

/** localStorage 전체 비우기 (디버그용) */
export function clearLocalAssets() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
