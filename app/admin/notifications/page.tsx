"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import {
  REQUEST_TYPE_LABEL,
  REQUEST_TYPE_ICON,
  type RequestType,
} from "@/lib/data";
import {
  listNotificationSettings,
  upsertNotificationSetting,
} from "@/lib/store/notification-settings";

const TYPES: RequestType[] = ["guide_inquiry", "asset_create", "production", "other"];

type Row = { email: string; name: string };

const EMPTY_ROWS: Record<RequestType, Row> = {
  guide_inquiry: { email: "", name: "" },
  asset_create: { email: "", name: "" },
  production: { email: "", name: "" },
  other: { email: "", name: "" },
};

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<Record<RequestType, Row>>(EMPTY_ROWS);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState<RequestType | null>(null);
  const [savedAt, setSavedAt] = useState<RequestType | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const list = await listNotificationSettings();
    const next: Record<RequestType, Row> = { ...EMPTY_ROWS };
    for (const s of list) {
      next[s.requestType] = {
        email: s.approverEmail,
        name: s.approverName ?? "",
      };
    }
    setRows(next);
    setMounted(true);
  }

  function updateRow(t: RequestType, patch: Partial<Row>) {
    setRows((prev) => ({ ...prev, [t]: { ...prev[t], ...patch } }));
  }

  async function save(t: RequestType) {
    setSaving(t);
    await upsertNotificationSetting(t, rows[t].email, rows[t].name || undefined);
    setSaving(null);
    setSavedAt(t);
    setTimeout(() => setSavedAt((prev) => (prev === t ? null : prev)), 1500);
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-lg">
      <div>
        <h1 className="text-h1 font-semibold text-on-surface">알림 설정</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          요청 유형별 자동 승인자를 지정합니다. 사용자가 요청을 제출하면 해당 유형에 매핑된 승인자에게 알림 메일이 발송됩니다.
        </p>
      </div>

      <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant border-dashed">
        <p className="text-label-sm text-on-surface-variant flex items-start gap-xs">
          <Icon name="info" className="text-primary text-[16px] mt-[1px]" />
          <span>
            매핑되지 않은 유형은 환경변수 <span className="font-mono">ADMIN_NOTIFY_EMAIL</span> 로 폴백 발송됩니다. 이메일을 비우고 저장하면 매핑이 해제되고, 다시 폴백으로 동작합니다.
          </span>
        </p>
      </div>

      <div className="space-y-md">
        {TYPES.map((t) => (
          <div
            key={t}
            className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-lg"
          >
            <div className="flex items-center gap-md mb-md">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                <Icon name={REQUEST_TYPE_ICON[t]} className="text-primary text-[22px]" />
              </div>
              <h3 className="text-h3 font-semibold">{REQUEST_TYPE_LABEL[t]}</h3>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant">
                  승인자 이메일
                </label>
                <input
                  type="email"
                  value={rows[t].email}
                  onChange={(e) => updateRow(t, { email: e.target.value })}
                  placeholder="approver@company.com"
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base font-mono"
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant">
                  표시 이름 (선택)
                </label>
                <input
                  type="text"
                  value={rows[t].name}
                  onChange={(e) => updateRow(t, { name: e.target.value })}
                  placeholder="예: 디자인팀장"
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-md mt-md">
              {savedAt === t ? (
                <span className="text-label-sm text-emerald-600 flex items-center gap-xs">
                  <Icon name="check" className="text-[16px]" />
                  저장됨
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => save(t)}
                disabled={saving === t || !mounted}
                className="px-lg py-sm rounded-lg bg-primary text-on-primary text-label-sm font-semibold hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-xs"
              >
                <Icon
                  name={saving === t ? "hourglass_empty" : rows[t].email.trim() ? "save" : "delete"}
                  className="text-[16px]"
                />
                {saving === t ? "저장 중..." : rows[t].email.trim() ? "저장" : "매핑 해제"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
