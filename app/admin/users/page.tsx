"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/icon";
import { REQUEST_TYPE_LABEL, type RequestType } from "@/lib/data";
import {
  listAdminsWithSubscriptions,
  addAdmin,
  removeAdmin,
  setAdminSubscriptions,
  MAX_SUBSCRIBERS_PER_TYPE,
  type AdminWithSubscriptions,
} from "@/lib/store/admins";

const REQUEST_TYPES: RequestType[] = [
  "guide_inquiry",
  "asset_create",
  "production",
  "other",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Tab = "admin" | "viewer";

export default function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>("admin");
  const [items, setItems] = useState<AdminWithSubscriptions[]>([]);
  const [mounted, setMounted] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "admin") refresh();
  }, [tab]);

  async function refresh() {
    setMounted(false);
    const list = await listAdminsWithSubscriptions();
    setItems(list);
    setMounted(true);
  }

  async function handleAdd() {
    const email = newEmail.trim().toLowerCase();
    setError(null);
    if (!EMAIL_REGEX.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (items.some((a) => a.email === email)) {
      setError("이미 등록된 관리자입니다.");
      return;
    }
    setAdding(true);
    const created = await addAdmin(email, newName.trim());
    setAdding(false);
    if (!created) {
      setError("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setNewEmail("");
    setNewName("");
    await refresh();
  }

  function handleEmailKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  async function handleDelete(id: string) {
    await removeAdmin(id);
    setConfirmDeleteId(null);
    await refresh();
  }

  async function toggleSubscription(admin: AdminWithSubscriptions, type: RequestType) {
    const currentSubscribers = items.filter((a) => a.subscriptions.includes(type)).length;
    const isCurrentlySubscribed = admin.subscriptions.includes(type);
    if (!isCurrentlySubscribed && currentSubscribers >= MAX_SUBSCRIBERS_PER_TYPE) {
      setError(
        `이 항목은 최대 ${MAX_SUBSCRIBERS_PER_TYPE}명까지 알림을 받을 수 있습니다. (${REQUEST_TYPE_LABEL[type]})`,
      );
      return;
    }
    setError(null);
    const next = isCurrentlySubscribed
      ? admin.subscriptions.filter((t) => t !== type)
      : [...admin.subscriptions, type];
    // 낙관적 업데이트
    setItems((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, subscriptions: next } : a)),
    );
    await setAdminSubscriptions(admin.id, next);
  }

  const subscriberCountByType = REQUEST_TYPES.reduce(
    (acc, t) => {
      acc[t] = items.filter((a) => a.subscriptions.includes(t)).length;
      return acc;
    },
    {} as Record<RequestType, number>,
  );

  return (
    <div className="max-w-[1080px] mx-auto space-y-lg">
      <div>
        <h1 className="text-h1 font-semibold text-on-surface">사용자 관리</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          관리자 권한과 알림 수신 대상자를 관리합니다. 일반 사용자 관리 기능은 SSO 연동 후 활성화됩니다.
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-sm p-xs bg-surface-container-low rounded-xl w-fit">
        <button
          onClick={() => setTab("admin")}
          className={
            "px-md py-sm text-label-sm rounded-lg transition-colors " +
            (tab === "admin"
              ? "bg-white text-primary card-shadow font-semibold"
              : "text-secondary hover:bg-white/50")
          }
        >
          관리자
        </button>
        <button
          onClick={() => setTab("viewer")}
          className={
            "px-md py-sm text-label-sm rounded-lg transition-colors " +
            (tab === "viewer"
              ? "bg-white text-primary card-shadow font-semibold"
              : "text-secondary hover:bg-white/50")
          }
        >
          일반 사용자
        </button>
      </div>

      {tab === "admin" ? (
        <>
          <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant border-dashed">
            <p className="text-label-sm text-on-surface-variant flex items-start gap-xs">
              <Icon name="info" className="text-primary text-[16px] mt-[1px]" />
              <span>
                여기 등록된 이메일은 <strong>관리자 권한</strong>을 갖고 관리자 메뉴에 접근할 수 있습니다.
                각 요청 유형별로 알림 수신 여부를 체크하세요. 항목당 최대 {MAX_SUBSCRIBERS_PER_TYPE}명까지 가능합니다.
                <br />
                <span className="text-secondary">(SSO 연동 후에도 동일하게 작동합니다.)</span>
              </span>
            </p>
          </div>

          {/* 신규 관리자 추가 */}
          <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-lg">
            <h3 className="text-h3 font-semibold mb-md">신규 관리자 추가</h3>
            <div className="grid grid-cols-12 gap-sm">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleEmailKey}
                placeholder="email@company.com"
                className="col-span-5 px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleEmailKey}
                placeholder="이름 (선택)"
                className="col-span-4 px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding || !newEmail.trim()}
                className="col-span-3 px-lg py-sm bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
              >
                <Icon name={adding ? "hourglass_empty" : "person_add"} className="text-[18px]" />
                {adding ? "추가 중..." : "관리자 추가"}
              </button>
            </div>
            {error ? (
              <div className="mt-sm bg-error-container text-on-error-container p-sm rounded-lg flex items-center gap-sm text-body-sm">
                <Icon name="error_outline" className="text-[18px]" />
                {error}
              </div>
            ) : null}
          </div>

          {/* 관리자 목록 + 알림 매트릭스 */}
          <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant/30 bg-surface-container-low/50">
              <h3 className="text-h3 font-semibold">관리자 목록 ({items.length}명)</h3>
              <p className="text-label-sm text-on-surface-variant mt-xs">
                각 행의 체크박스로 알림 수신 여부를 설정합니다. 헤더 아래 숫자는 해당 항목의 현재 수신자 수입니다.
              </p>
            </div>

            {!mounted ? (
              <div className="p-xl text-center text-secondary">불러오는 중...</div>
            ) : items.length === 0 ? (
              <div className="p-xl text-center text-secondary">
                아직 등록된 관리자가 없습니다. 위에서 추가하세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-body-sm">
                  <thead className="bg-surface-container-low/50">
                    <tr className="text-left">
                      <th className="px-lg py-sm font-semibold text-on-surface-variant">이름</th>
                      <th className="px-lg py-sm font-semibold text-on-surface-variant">이메일</th>
                      {REQUEST_TYPES.map((t) => (
                        <th
                          key={t}
                          className="px-sm py-sm font-semibold text-on-surface-variant text-center"
                        >
                          <div>{REQUEST_TYPE_LABEL[t]}</div>
                          <div className="text-label-sm text-secondary font-normal">
                            {subscriberCountByType[t]} / {MAX_SUBSCRIBERS_PER_TYPE}
                          </div>
                        </th>
                      ))}
                      <th className="px-sm py-sm w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {items.map((admin) => (
                      <tr key={admin.id} className="hover:bg-surface-container-low/30">
                        <td className="px-lg py-md">
                          <span className="font-medium">
                            {admin.name ?? admin.email.split("@")[0]}
                          </span>
                        </td>
                        <td className="px-lg py-md font-mono text-label-sm text-on-surface-variant">
                          {admin.email}
                        </td>
                        {REQUEST_TYPES.map((t) => (
                          <td key={t} className="px-sm py-md text-center">
                            <input
                              type="checkbox"
                              checked={admin.subscriptions.includes(t)}
                              onChange={() => toggleSubscription(admin, t)}
                              className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                            />
                          </td>
                        ))}
                        <td className="px-sm py-md">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(admin.id)}
                            className="p-xs hover:bg-error-container/40 rounded-lg text-secondary hover:text-error transition-colors"
                            title="삭제"
                          >
                            <Icon name="delete" className="text-[18px]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        // 일반 사용자 탭 — placeholder
        <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-xl">
          <div className="flex flex-col items-center text-center py-xl">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-md">
              <Icon name="group" className="text-secondary text-[32px]" />
            </div>
            <h3 className="text-h2 font-semibold mb-sm">일반 사용자 관리</h3>
            <p className="text-body-base text-on-surface-variant max-w-md mb-lg">
              사내 SSO 연동 후 활성화됩니다.
              <br />
              사용자 계정 자체는 사내 인증 시스템에서 관리되며, 여기서는 접속 이력과 요청 빈도 정도만 조회하게 됩니다.
            </p>
            <div className="bg-surface-container-low rounded-lg p-md text-left max-w-md w-full">
              <p className="text-label-caps text-on-surface-variant mb-xs">예정 항목</p>
              <ul className="text-body-sm text-on-surface-variant space-y-xs">
                <li>· 사용자 접속 이력</li>
                <li>· 요청 제출 빈도</li>
                <li>· 최근 활동 통계</li>
              </ul>
            </div>
          </div>
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
                <h3 className="text-h3 font-semibold mb-xs">관리자에서 제외할까요?</h3>
                <p className="text-body-sm text-on-surface-variant">
                  해당 사용자는 관리자 권한을 잃고 모든 알림 구독도 해제됩니다. 이 작업은 즉시 적용됩니다.
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
                제외
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
