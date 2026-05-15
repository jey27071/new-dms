"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { GuidelineForm } from "@/components/guideline-form";
import { getGuideline, isUserGuideline } from "@/lib/store/guidelines";
import type { Guideline } from "@/lib/data";

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default function EditGuidelinePage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const id = rawId ? safeDecode(rawId) : undefined;
  const [guideline, setGuideline] = useState<Guideline | undefined | null>(undefined);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const found = await getGuideline(id);
      if (cancelled) return;
      if (!found || !isUserGuideline(found)) {
        setGuideline(null);
        return;
      }
      setGuideline(found);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (guideline === undefined) {
    return (
      <div className="max-w-[900px] mx-auto">
        <div className="animate-pulse space-y-md">
          <div className="h-6 bg-surface-container rounded w-1/3" />
          <div className="h-64 bg-surface-container rounded-xl" />
        </div>
      </div>
    );
  }

  if (guideline === null) {
    return (
      <div className="max-w-[900px] mx-auto pt-xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-md">
          <Icon name="lock" className="text-on-error-container text-[32px]" />
        </div>
        <h1 className="text-h1 font-semibold mb-xs">수정할 수 없는 가이드라인입니다</h1>
        <p className="text-body-base text-on-surface-variant mb-lg">
          존재하지 않거나, 샘플 데이터라 수정·삭제가 제한됩니다.
        </p>
        <Link
          href="/admin/guidelines"
          className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
        >
          가이드라인 관리로
        </Link>
      </div>
    );
  }

  return <GuidelineForm mode="edit" initial={guideline} />;
}
