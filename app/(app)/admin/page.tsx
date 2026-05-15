import Link from "next/link";
import { Icon } from "@/components/icon";

type AdminStat = {
  icon: string;
  iconClass: string;
  label: string;
  value: string;
  hint: string;
};

const adminStats: AdminStat[] = [
  { icon: "inventory", iconClass: "text-primary", label: "총 에셋", value: "248", hint: "개" },
  {
    icon: "description",
    iconClass: "text-tertiary",
    label: "가이드라인",
    value: "42",
    hint: "활성",
  },
  {
    icon: "priority_high",
    iconClass: "text-error",
    label: "대기 중인 요청",
    value: "7",
    hint: "미처리",
  },
  {
    icon: "person_outline",
    iconClass: "text-secondary",
    label: "사용자",
    value: "523",
    hint: "활성 계정",
  },
];

type AdminRequest = {
  id: string;
  user: string;
  type: string;
  status: "urgent" | "pending";
};

const recentRequests: AdminRequest[] = [
  { id: "REQ-9012", user: "Alex Miller", type: "소셜 배너", status: "urgent" },
  { id: "REQ-9011", user: "Sarah Chen", type: "로고 변형", status: "pending" },
  { id: "REQ-9010", user: "Jordan Lee", type: "이메일 헤더", status: "pending" },
  { id: "REQ-9009", user: "Elena Rodriguez", type: "프레젠테이션 템플릿", status: "pending" },
  { id: "REQ-9008", user: "Marcus Thorne", type: "브랜드 비디오 클립", status: "urgent" },
];

type Upload = {
  name: string;
  uploader: string;
  age: string;
  image: string;
};

const recentUploads: Upload[] = [
  {
    name: "Q2_Campaign_Kit.zip",
    uploader: "마케팅 팀장 업로드",
    age: "2분 전",
    image: "https://picsum.photos/seed/upload-1/96/96",
  },
  {
    name: "Typography_Guide_V3.pdf",
    uploader: "디자인 부서 업로드",
    age: "45분 전",
    image: "https://picsum.photos/seed/upload-2/96/96",
  },
  {
    name: "Global_Logo_Pack.svg",
    uploader: "관리자 업로드",
    age: "2시간 전",
    image: "https://picsum.photos/seed/upload-3/96/96",
  },
  {
    name: "Hardware_Icons_Set.png",
    uploader: "IT 자산팀 업로드",
    age: "5시간 전",
    image: "https://picsum.photos/seed/upload-4/96/96",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-[1040px] mx-auto space-y-lg">
      {/* 통계 4카드 */}
      <div className="grid grid-cols-4 gap-lg">
        {adminStats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30"
          >
            <div className="flex items-center justify-between mb-sm">
              <Icon name={s.icon} className={s.iconClass + " text-[24px]"} />
              <span className="text-label-sm text-secondary font-medium">{s.label}</span>
            </div>
            <p className="text-h1 font-semibold">{s.value}</p>
            <p className="text-label-sm text-secondary">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* 2컬럼: 최근 요청 + 최근 업로드 */}
      <div className="grid grid-cols-12 gap-lg items-start">
        {/* 최근 요청 */}
        <div className="col-span-8 bg-white rounded-xl card-shadow border border-outline-variant/30 overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="text-h3 font-semibold">최근 요청</h2>
            <Link href="/admin/requests" className="text-primary text-label-sm hover:underline">
              전체 보기
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase">
                <tr>
                  <th className="px-lg py-sm">요청 ID</th>
                  <th className="px-lg py-sm">사용자</th>
                  <th className="px-lg py-sm">에셋 유형</th>
                  <th className="px-lg py-sm">상태</th>
                  <th className="px-lg py-sm">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-sm">
                {recentRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-lg py-md font-medium">{r.id}</td>
                    <td className="px-lg py-md">{r.user}</td>
                    <td className="px-lg py-md">{r.type}</td>
                    <td className="px-lg py-md">
                      <div
                        className={
                          "flex items-center gap-xs " +
                          (r.status === "urgent" ? "" : "text-secondary")
                        }
                      >
                        <div
                          className={
                            "w-2 h-2 rounded-full " +
                            (r.status === "urgent" ? "bg-error" : "bg-outline")
                          }
                        />
                        <span>{r.status === "urgent" ? "긴급" : "대기 중"}</span>
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <Link
                        href={`/my-requests/BR-492`}
                        className="text-primary hover:underline"
                      >
                        검토
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 최근 업로드 */}
        <div className="col-span-4 bg-white rounded-xl card-shadow border border-outline-variant/30">
          <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="text-h3 font-semibold">최근 업로드된 파일</h2>
            <Icon name="refresh" className="text-on-surface-variant cursor-pointer text-[20px]" />
          </div>
          <div className="p-lg flex flex-col gap-lg">
            {recentUploads.map((u) => (
              <div key={u.name} className="flex items-start gap-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u.image}
                  alt={u.name}
                  className="w-12 h-12 rounded-lg bg-surface-container flex-shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-body-base font-semibold truncate">{u.name}</p>
                  <p className="text-label-sm text-secondary">{u.uploader}</p>
                  <p className="text-label-sm text-outline mt-xs">{u.age}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-lg pt-0">
            <Link
              href="/assets"
              className="block text-center w-full bg-secondary-container text-on-secondary-fixed-variant py-sm rounded-lg text-label-sm hover:opacity-90 transition-opacity"
            >
              에셋 라이브러리 보기
            </Link>
          </div>
        </div>
      </div>

      {/* 퀵 액션 */}
      <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant/30">
        <h3 className="text-h3 font-semibold mb-lg">관리자 퀵 액션</h3>
        <div className="flex flex-wrap gap-md">
          <Link
            href="/admin/assets"
            className="flex items-center gap-md bg-primary text-on-primary px-xl py-md rounded-lg text-h3 font-semibold hover:brightness-95 active:scale-95 transition-all"
          >
            <Icon name="cloud_upload" />
            에셋 업로드
          </Link>
          <Link
            href="/admin/guidelines"
            className="flex items-center gap-md bg-secondary-container text-on-secondary-fixed-variant px-xl py-md rounded-lg text-h3 font-semibold hover:brightness-95 active:scale-95 transition-all"
          >
            <Icon name="post_add" />
            가이드라인 추가
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-md bg-secondary-container text-on-secondary-fixed-variant px-xl py-md rounded-lg text-h3 font-semibold hover:brightness-95 active:scale-95 transition-all"
          >
            <Icon name="settings" />
            카테고리 관리
          </Link>
        </div>
      </div>
    </div>
  );
}
