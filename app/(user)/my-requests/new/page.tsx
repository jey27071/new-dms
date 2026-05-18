"use client";

import {
  Suspense,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import {
  REQUEST_TYPE_LABEL,
  REQUEST_TYPE_ICON,
  type RequestType,
} from "@/lib/data";
import {
  createRequest,
  uploadRequestAttachment,
  type RequestInput,
} from "@/lib/store/requests";
import { getApproversFor } from "@/lib/store/admins";
import { listCategories, type Category } from "@/lib/store/categories";
import { getClientEmail } from "@/lib/auth-client";

const TYPES: RequestType[] = ["guide_inquiry", "asset_create", "production", "other"];

const STEPS = [
  { label: "제출 완료", desc: "DMS 대기열에 즉시 등록됩니다.", state: "done" },
  { label: "분류 및 검토", desc: "브랜드 매니저가 기술 사양을 검토합니다.", state: "active" },
  { label: "디자인 제작", desc: "크리에이티브 팀이 에셋 제작을 시작합니다.", state: "pending" },
  { label: "최종 승인", desc: "에셋이 DMS 포털에 공개됩니다.", state: "pending" },
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubmitRequestPageWrapper() {
  // useSearchParams 는 Next.js 14 빌드 정적화에서 Suspense 경계가 필요
  return (
    <Suspense fallback={null}>
      <SubmitRequestPage />
    </Suspense>
  );
}

function SubmitRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type") as RequestType | null;
  const initialType: RequestType = TYPES.includes(queryType as RequestType)
    ? (queryType as RequestType)
    : "guide_inquiry";
  const [type, setType] = useState<RequestType>(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [deadline, setDeadline] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [requesterEmail, setRequesterEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 자동 승인자 미리보기 (다대다 — 최대 10명)
  const [approvers, setApprovers] = useState<{ email: string; name?: string }[]>([]);
  const [approverLoading, setApproverLoading] = useState(true);

  // CC 이메일
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");

  useEffect(() => {
    setRequesterEmail(getClientEmail());
  }, []);

  // 요청 카테고리 목록 로드 (관리자 카테고리 설정에서 관리)
  useEffect(() => {
    let cancelled = false;
    listCategories("request").then((list) => {
      if (cancelled) return;
      setCategories(list);
      if (list.length > 0 && !category) {
        setCategory(list[0]!.label);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 요청 유형 바뀔 때마다 구독 관리자 목록 조회
  useEffect(() => {
    let cancelled = false;
    setApproverLoading(true);
    getApproversFor(type).then((result) => {
      if (!cancelled) {
        setApprovers(result);
        setApproverLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  function addCcEmail() {
    const value = ccInput.trim().toLowerCase();
    if (!value) return;
    if (!EMAIL_REGEX.test(value)) {
      setError(`올바른 이메일 형식이 아닙니다: ${value}`);
      return;
    }
    if (ccEmails.includes(value)) {
      setCcInput("");
      return;
    }
    setError(null);
    setCcEmails((prev) => [...prev, value]);
    setCcInput("");
  }

  function handleCcKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCcEmail();
    } else if (e.key === "Backspace" && ccInput === "" && ccEmails.length > 0) {
      setCcEmails((prev) => prev.slice(0, -1));
    }
  }

  function removeCc(email: string) {
    setCcEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    setFiles((prev) => [...prev, ...Array.from(selected)]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("요청 제목을 입력해주세요.");
    if (!description.trim()) return setError("상세 내용을 입력해주세요.");
    if (!requesterEmail) return setError("로그인 정보가 없습니다. 다시 로그인해주세요.");

    setSubmitting(true);
    try {
      const attachments: string[] = [];
      for (const f of files) {
        const url = await uploadRequestAttachment(f);
        if (!url) {
          setError(`첨부 파일 업로드 실패: ${f.name}`);
          setSubmitting(false);
          return;
        }
        attachments.push(url);
      }

      const payload: RequestInput = {
        title: title.trim(),
        type,
        description: description.trim(),
        category,
        deadline: deadline || undefined,
        attachments,
        requesterEmail,
        requesterName: requesterEmail.split("@")[0],
        ccEmails,
      };
      const result = await createRequest(payload);
      if (!result) {
        setError("요청 제출에 실패했습니다.");
        setSubmitting(false);
        return;
      }
      router.push(`/my-requests/${result.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("요청 제출 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1040px] mx-auto">
      <div className="flex items-center gap-xs text-secondary mb-xs">
        <Link href="/my-requests" className="text-label-sm hover:text-primary">
          요청 목록
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-label-sm font-semibold text-primary">새 요청</span>
      </div>
      <h1 className="text-h1 font-semibold text-on-surface mb-xl">디자인 요청 제출</h1>

      <div className="flex flex-col lg:flex-row gap-xl items-start">
        <section className="flex-1 max-w-[760px] bg-white rounded-xl card-shadow p-xl">
          <form className="space-y-lg" onSubmit={handleSubmit}>
            <div className="space-y-md">
              <label className="text-label-caps text-on-surface-variant">요청 유형</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {TYPES.map((t) => (
                  <label
                    key={t}
                    className={
                      "flex flex-col items-center gap-sm p-md border rounded-xl cursor-pointer transition-colors " +
                      (type === t
                        ? "border-primary bg-primary-fixed/40"
                        : "border-outline-variant hover:bg-surface-container")
                    }
                  >
                    <input
                      type="radio"
                      name="req_type"
                      checked={type === t}
                      onChange={() => setType(t)}
                      className="hidden"
                    />
                    <Icon
                      name={REQUEST_TYPE_ICON[t]}
                      className={
                        type === t
                          ? "text-primary text-[28px]"
                          : "text-secondary text-[28px]"
                      }
                    />
                    <span className="text-label-sm text-center">{REQUEST_TYPE_LABEL[t]}</span>
                  </label>
                ))}
              </div>
              {/* 자동 승인자 미리보기 (다대다) */}
              {approverLoading ? (
                <div className="bg-surface-container-low rounded-lg p-md flex items-center gap-sm">
                  <Icon name="hourglass_empty" className="text-secondary text-[18px]" />
                  <span className="text-body-sm text-secondary">수신자 확인 중...</span>
                </div>
              ) : approvers.length > 0 ? (
                <div className="bg-primary-fixed/40 border border-primary/20 rounded-lg p-md">
                  <div className="flex items-center gap-sm mb-xs">
                    <Icon name="person_pin" className="text-primary text-[20px]" />
                    <span className="text-body-sm text-on-surface">
                      이 요청은 다음 {approvers.length}명의 관리자에게 전달됩니다
                    </span>
                  </div>
                  <ul className="ml-xl space-y-xs">
                    {approvers.map((a, idx) => (
                      <li key={a.email} className="text-body-sm text-on-surface">
                        <strong className="text-primary">
                          {a.name ?? a.email.split("@")[0]}
                        </strong>
                        <span className="text-secondary ml-xs font-mono text-label-sm">
                          ({a.email})
                        </span>
                        {idx === 0 ? (
                          <span className="ml-xs px-xs py-[1px] bg-primary text-on-primary text-label-sm rounded">
                            주담당
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-surface-container-low rounded-lg p-md flex items-center gap-sm">
                  <Icon name="info" className="text-secondary text-[18px]" />
                  <span className="text-body-sm text-secondary">
                    이 유형에 구독된 관리자가 없습니다. 관리자가 검토 후 직접 배정합니다.
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-xs">
              <label htmlFor="title" className="text-label-caps text-on-surface-variant">
                요청 제목 <span className="text-error">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: Q3 캠페인 메인 배너"
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all"
              />
            </div>

            <div className="space-y-xs">
              <label htmlFor="description" className="text-label-caps text-on-surface-variant">
                프로젝트 상세 내용 <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="타겟 오디언스 및 구체적인 산출물을 포함하여 요청 사항을 상세히 기재해 주세요..."
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant">기본 카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={categories.length === 0}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base disabled:opacity-60"
                >
                  {categories.length === 0 ? (
                    <option>(로딩 중...)</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.id} value={c.label}>
                        {c.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant">희망 마감일</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant">
                참조 (CC) 이메일
              </label>
              <div className="border border-outline-variant rounded-lg p-sm flex flex-wrap gap-xs items-center min-h-[48px]">
                {ccEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-xs bg-primary-fixed text-on-primary-fixed-variant px-sm py-xs rounded-full text-label-sm"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeCc(email)}
                      className="hover:text-error transition-colors"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  </span>
                ))}
                <input
                  type="email"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={handleCcKey}
                  onBlur={addCcEmail}
                  placeholder={
                    ccEmails.length === 0
                      ? "이메일 입력 후 Enter / 쉼표 — 진행 알림을 함께 받습니다"
                      : ""
                  }
                  className="flex-1 min-w-[200px] bg-transparent outline-none text-body-base px-xs font-mono text-body-sm"
                />
              </div>
              <p className="text-label-sm text-secondary">
                여기에 추가한 이메일은 요청 등록·상태 변경 시 모든 알림 메일에 CC로 함께 발송됩니다.
              </p>
            </div>

            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant">첨부 파일</label>
              <label
                htmlFor="req-files"
                className="block border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center gap-md hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="upload_file" className="text-primary text-[28px]" />
                </div>
                <div className="text-center">
                  <p className="text-body-base font-semibold text-on-surface">
                    클릭해서 파일 추가
                  </p>
                  <p className="text-label-sm text-secondary">여러 개 가능, 각 50MB 이하</p>
                </div>
                <input
                  id="req-files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {files.length > 0 ? (
                <ul className="mt-sm space-y-xs">
                  {files.map((f, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg"
                    >
                      <div className="flex items-center gap-sm min-w-0">
                        <Icon name="attach_file" className="text-secondary text-[18px]" />
                        <span className="text-body-sm truncate">{f.name}</span>
                        <span className="text-label-sm text-secondary flex-shrink-0">
                          ({(f.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-xs hover:text-error transition-colors"
                      >
                        <Icon name="close" className="text-[16px]" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {error ? (
              <div className="bg-error-container text-on-error-container p-md rounded-lg flex items-center gap-sm">
                <Icon name="error_outline" className="text-[20px]" />
                <span className="text-body-sm">{error}</span>
              </div>
            ) : null}

            <div className="pt-lg border-t border-outline-variant flex items-center justify-between">
              <Link
                href="/my-requests"
                className="text-body-base text-secondary hover:text-on-surface font-semibold"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-container text-on-primary px-xl py-md rounded-xl text-h3 font-semibold hover:opacity-90 transition-opacity flex items-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Icon
                  name={submitting ? "hourglass_empty" : "send"}
                  className="text-[20px]"
                />
                {submitting ? "제출 중..." : "요청 제출하기"}
              </button>
            </div>
          </form>
        </section>

        <aside className="w-full lg:w-[260px] space-y-lg">
          <div className="bg-secondary-container rounded-xl p-lg card-shadow">
            <h3 className="text-h3 font-semibold text-on-secondary-fixed mb-lg">제출 후 단계는?</h3>
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-outline-variant" />
              {STEPS.map((s, i) => (
                <div
                  key={s.label}
                  className={"relative flex items-start gap-md " + (i < STEPS.length - 1 ? "pb-xl" : "")}
                >
                  <div
                    className={
                      "relative z-10 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-secondary-container " +
                      (s.state === "done"
                        ? "bg-primary"
                        : s.state === "active"
                          ? "bg-surface-container-highest border-2 border-primary"
                          : "bg-white border-2 border-outline-variant")
                    }
                  >
                    {s.state === "done" ? (
                      <Icon name="check" className="text-[14px] text-white" />
                    ) : s.state === "active" ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <div>
                    <p
                      className={
                        "text-label-sm font-bold " +
                        (s.state === "active"
                          ? "text-primary"
                          : s.state === "done"
                            ? "text-on-surface"
                            : "text-on-surface-variant")
                      }
                    >
                      {s.label}
                    </p>
                    <p className="text-label-sm text-secondary">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant border-dashed">
            <div className="flex items-center gap-sm text-primary mb-sm">
              <Icon name="info" className="text-[20px]" />
              <span className="text-label-sm font-bold">요청자 정보</span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              현재 로그인 계정 <span className="font-mono">{requesterEmail || "(로딩...)"}</span>{" "}
              으로 등록됩니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
