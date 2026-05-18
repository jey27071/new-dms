"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { type NoticeTemplate } from "@/lib/data";
import { listNoticeTemplates } from "@/lib/store/notice-templates";

export default function NoticePickerPage() {
  const [items, setItems] = useState<NoticeTemplate[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listNoticeTemplates();
      if (!cancelled) {
        setItems(result);
        setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto space-y-xl">
      <div>
        <div className="flex items-center gap-sm text-secondary text-label-sm mb-xs">
          <Icon name="auto_awesome" className="text-[14px]" />
          <span>디자인 템플릿</span>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-primary font-semibold">사내 게시물</span>
        </div>
        <h1 className="text-h1 font-semibold text-on-surface">사내 게시물</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          공지·캠페인 템플릿을 선택하고 문구만 수정해 PNG로 다운로드하세요.
        </p>
      </div>

      {!mounted ? (
        <div className="grid grid-cols-3 gap-lg">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-surface-container" />
              <div className="p-md">
                <div className="h-5 bg-surface-container rounded mb-xs w-2/3" />
                <div className="h-3 bg-surface-container rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-xl rounded-xl card-shadow border border-outline-variant/30 text-center">
          <Icon name="campaign" className="text-secondary text-[48px] mb-md" />
          <h3 className="text-h3 font-semibold mb-xs">아직 등록된 사내 게시물 템플릿이 없습니다</h3>
          <p className="text-body-base text-on-surface-variant">
            관리자가 템플릿을 등록하면 여기에서 선택하여 제작할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-lg">
          {items.map((t) => {
            const aspect = t.height > 0 ? t.width / t.height : 1;
            return (
              <Link
                key={t.id}
                href={`/design/notice/${t.id}`}
                className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden group hover:border-primary transition-all"
              >
                <div
                  className="bg-surface-container relative overflow-hidden"
                  style={{ aspectRatio: `${aspect}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-on-background/0 group-hover:bg-on-background/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-primary px-md py-sm rounded-lg font-semibold flex items-center gap-sm">
                      <Icon name="edit" className="text-[18px]" />
                      이 템플릿으로 제작
                    </span>
                  </div>
                </div>
                <div className="p-md">
                  <h4 className="text-h3 font-semibold text-on-surface mb-xs group-hover:text-primary transition-colors">
                    {t.name}
                  </h4>
                  <p className="text-label-sm text-secondary">
                    {t.width} × {t.height} px
                  </p>
                  {t.description ? (
                    <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-sm">
                      {t.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
