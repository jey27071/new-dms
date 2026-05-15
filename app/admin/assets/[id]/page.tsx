"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { AssetForm } from "@/components/asset-form";
import { getAsset, isUserAsset } from "@/lib/store/assets";
import type { Asset } from "@/lib/data";

export default function EditAssetPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [asset, setAsset] = useState<Asset | undefined | null>(undefined);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const found = await getAsset(id);
      if (cancelled) return;
      if (!found || !isUserAsset(found)) {
        setAsset(null);
        return;
      }
      setAsset(found);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (asset === undefined) {
    return (
      <div className="max-w-[820px] mx-auto">
        <div className="animate-pulse space-y-md">
          <div className="h-6 bg-surface-container rounded w-1/3" />
          <div className="h-64 bg-surface-container rounded-xl" />
        </div>
      </div>
    );
  }

  if (asset === null) {
    return (
      <div className="max-w-[820px] mx-auto pt-xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-md">
          <Icon name="lock" className="text-on-error-container text-[32px]" />
        </div>
        <h1 className="text-h1 font-semibold mb-xs">수정할 수 없는 에셋입니다</h1>
        <p className="text-body-base text-on-surface-variant mb-lg">
          존재하지 않거나, 샘플 데이터라 수정·삭제가 제한됩니다.
        </p>
        <Link
          href="/admin/assets"
          className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
        >
          에셋 관리로
        </Link>
      </div>
    );
  }

  return <AssetForm mode="edit" initial={asset} uploader={asset.uploader} />;
}
