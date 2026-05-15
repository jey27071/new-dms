"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { assetCategoryLabel, type Asset } from "@/lib/data";
import { listAssets, isUserAsset, deleteAsset } from "@/lib/store/assets";

export default function AdminAssetsPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setItems(listAssets());
    setMounted(true);
  }

  function handleDelete(id: string) {
    deleteAsset(id);
    setConfirmDeleteId(null);
    refresh();
  }

  const seedCount = items.filter((a) => !isUserAsset(a)).length;
  const userCount = items.length - seedCount;

  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">에셋 관리</h1>
          <p className="text-body-base text-on-surface-variant mt-xs">
            브랜드 에셋을 등록·수정·삭제합니다. 시드(샘플) 에셋은 읽기 전용입니다.
          </p>
        </div>
        <Link
          href="/admin/assets/new"
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all"
        >
          <Icon name="add" className="text-[20px]" />새 에셋 등록
        </Link>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-lg">
        <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
          <span className="text-label-caps text-secondary">총 에셋</span>
          <p className="text-h1 font-semibold mt-xs">{mounted ? items.length : "–"}</p>
        </div>
        <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
          <span className="text-label-caps text-secondary">샘플 (읽기 전용)</span>
          <p className="text-h1 font-semibold mt-xs text-secondary">{mounted ? seedCount : "–"}</p>
        </div>
        <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
          <span className="text-label-caps text-secondary">사용자 등록</span>
          <p className="text-h1 font-semibold mt-xs text-primary">{mounted ? userCount : "–"}</p>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase">
              <tr>
                <th className="px-lg py-md w-[80px]">프리뷰</th>
                <th className="px-lg py-md">제목</th>
                <th className="px-lg py-md">카테고리</th>
                <th className="px-lg py-md">포맷</th>
                <th className="px-lg py-md">업로더</th>
                <th className="px-lg py-md">등록일</th>
                <th className="px-lg py-md">출처</th>
                <th className="px-lg py-md text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {!mounted ? (
                <tr>
                  <td colSpan={8} className="px-lg py-xl text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-lg py-xl text-center text-secondary">
                    등록된 에셋이 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((a) => {
                  const isUser = isUserAsset(a);
                  return (
                    <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.image}
                          alt={a.title}
                          className="w-12 h-12 rounded-lg object-cover bg-surface-container"
                        />
                      </td>
                      <td className="px-lg py-md font-semibold text-on-surface">
                        <Link href={`/assets/${a.id}`} className="hover:text-primary transition-colors">
                          {a.title}
                        </Link>
                      </td>
                      <td className="px-lg py-md text-secondary">{assetCategoryLabel[a.category]}</td>
                      <td className="px-lg py-md">
                        <div className="flex flex-wrap gap-xs">
                          {a.formats.map((f) => (
                            <span
                              key={f}
                              className="px-xs py-[2px] text-[10px] bg-surface-container-high text-on-surface-variant rounded"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-lg py-md text-secondary">{a.uploader}</td>
                      <td className="px-lg py-md text-secondary">{a.uploadedAt}</td>
                      <td className="px-lg py-md">
                        {isUser ? (
                          <span className="px-xs py-[2px] bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wider rounded">
                            사용자
                          </span>
                        ) : (
                          <span className="px-xs py-[2px] bg-surface-container-high text-secondary text-[10px] font-bold uppercase tracking-wider rounded">
                            샘플
                          </span>
                        )}
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-xs justify-end">
                          {isUser ? (
                            <>
                              <Link
                                href={`/admin/assets/${a.id}`}
                                className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-primary transition-colors"
                                title="수정"
                              >
                                <Icon name="edit" className="text-[18px]" />
                              </Link>
                              <button
                                onClick={() => setConfirmDeleteId(a.id)}
                                className="p-xs hover:bg-surface-container rounded-lg text-secondary hover:text-error transition-colors"
                                title="삭제"
                              >
                                <Icon name="delete" className="text-[18px]" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-outline italic">읽기 전용</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {confirmDeleteId ? (
        <div className="fixed inset-0 bg-on-background/40 z-50 flex items-center justify-center p-md">
          <div className="bg-white rounded-xl card-shadow border border-outline-variant max-w-md w-full p-xl">
            <div className="flex items-start gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
                <Icon name="warning" className="text-on-error-container text-[22px]" />
              </div>
              <div>
                <h3 className="text-h3 font-semibold mb-xs">에셋을 삭제할까요?</h3>
                <p className="text-body-sm text-on-surface-variant">
                  사용자 화면에서도 즉시 사라집니다. 이 작업은 되돌릴 수 없습니다.
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
