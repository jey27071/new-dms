"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type BannerTemplate } from "@/lib/data";
import {
  listBannerTemplates,
  isUserBannerTemplate,
  deleteBannerTemplate,
} from "@/lib/store/banner-templates";

export default function AdminBannerTemplatesPage() {
  const [items, setItems] = useState<BannerTemplate[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const result = await listBannerTemplates();
    setItems(result);
    setMounted(true);
  }

  async function handleDelete(id: string) {
    await deleteBannerTemplate(id);
    setConfirmDeleteId(null);
    await refresh();
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">배너 템플릿</h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            일반 사용자가 텍스트를 얹어 사용할 배경 이미지 템플릿을 등록·관리합니다.
          </p>
        </div>
        <Link
          href="/admin/banner-templates/new"
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all"
        >
          <Icon name="add" className="text-[20px]" />새 템플릿
        </Link>
      </div>

      {!mounted ? (
        <div className="grid grid-cols-3 gap-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden animate-pulse">
              <div className="aspect-[3/1] bg-surface-container" />
              <div className="p-md">
                <div className="h-5 bg-surface-container rounded mb-xs w-2/3" />
                <div className="h-3 bg-surface-container rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-xl rounded-xl card-shadow border border-outline-variant/30 text-center">
          <Icon name="image" className="text-secondary text-[48px] mb-md" />
          <h3 className="text-h3 font-semibold mb-xs">등록된 배너 템플릿이 없습니다</h3>
          <p className="text-body-base text-on-surface-variant mb-lg">
            첫 템플릿을 등록하면 사용자가 "디자인 제작 → 배너 제작" 에서 선택할 수 있습니다.
          </p>
          <Link
            href="/admin/banner-templates/new"
            className="inline-flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all"
          >
            <Icon name="add" className="text-[20px]" />첫 템플릿 등록
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-lg">
          {items.map((t) => {
            const isUser = isUserBannerTemplate(t);
            const aspect = t.height > 0 ? t.width / t.height : 3;
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden group"
              >
                <div
                  className="bg-surface-container relative overflow-hidden"
                  style={{ aspectRatio: `${aspect}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-sm right-sm">
                    {isUser ? (
                      <span className="px-xs py-[2px] bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wider rounded">
                        사용자
                      </span>
                    ) : (
                      <span className="px-xs py-[2px] bg-surface-container-high text-secondary text-[10px] font-bold uppercase tracking-wider rounded">
                        샘플
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-md">
                  <h4 className="text-h3 font-semibold text-on-surface mb-xs">{t.name}</h4>
                  <p className="text-label-sm text-secondary mb-sm">
                    {t.width} × {t.height} px
                  </p>
                  {t.description ? (
                    <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-md">
                      {t.description}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-xs pt-md border-t border-outline-variant">
                    {isUser ? (
                      <>
                        <Link
                          href={`/admin/banner-templates/${t.id}`}
                          className="flex-1 flex items-center justify-center gap-xs py-xs text-label-sm text-secondary hover:bg-surface-container-low hover:text-primary rounded-lg transition-colors"
                        >
                          <Icon name="edit" className="text-[16px]" />
                          수정
                        </Link>
                        <button
                          onClick={() => setConfirmDeleteId(t.id)}
                          className="flex-1 flex items-center justify-center gap-xs py-xs text-label-sm text-secondary hover:bg-surface-container-low hover:text-error rounded-lg transition-colors"
                        >
                          <Icon name="delete" className="text-[16px]" />
                          삭제
                        </button>
                      </>
                    ) : (
                      <span className="flex-1 text-center text-[10px] text-outline italic py-xs">
                        샘플 — 읽기 전용
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDeleteId ? (
        <div className="fixed inset-0 bg-on-background/40 z-50 flex items-center justify-center p-md">
          <div className="bg-white rounded-xl card-shadow border border-outline-variant max-w-md w-full p-xl">
            <div className="flex items-start gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
                <Icon name="warning" className="text-on-error-container text-[22px]" />
              </div>
              <div>
                <h3 className="text-h3 font-semibold mb-xs">템플릿을 삭제할까요?</h3>
                <p className="text-body-sm text-on-surface-variant">
                  사용자 측 배너 제작 화면에서 즉시 사라집니다. 이미 다운로드한 결과물엔 영향 없습니다.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-sm mt-lg">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-lg py-sm rounded-lg text-secondary hover:bg-surface-container-low transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-lg py-sm rounded-lg bg-error text-on-error font-semibold hover:brightness-95 transition-all"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
