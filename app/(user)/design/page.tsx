import Link from "next/link";
import { Icon } from "@/components/icon";

const TOOLS = [
  {
    title: "배너(현수막)",
    description: "관리자가 등록한 배너 템플릿을 선택해 문구만 수정하고 PNG로 즉시 다운로드.",
    href: "/design/banner",
    icon: "image",
    accentBg: "bg-primary-fixed",
    accentText: "text-primary",
  },
  {
    title: "사내 게시물",
    description: "공지·캠페인 템플릿 위에 텍스트를 얹어 게시용 이미지를 만듭니다.",
    href: "/design/notice",
    icon: "campaign",
    accentBg: "bg-tertiary-fixed",
    accentText: "text-tertiary",
  },
];

export default function DesignHubPage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-xl">
      <div>
        <div className="flex items-center gap-sm text-secondary text-label-sm mb-xs">
          <Icon name="dashboard_customize" className="text-[14px]" />
          <span className="text-primary font-semibold">디자인 템플릿</span>
        </div>
        <h1 className="text-h1 font-semibold text-on-surface">디자인 템플릿</h1>
        <p className="text-body-base text-on-surface-variant mt-xs max-w-2xl">
          관리자가 미리 세팅한 템플릿을 선택해 문구만 바꾸면 됩니다. 일관된 브랜드 톤을 유지하면서
          빠르게 출력물을 만들 수 있어요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-xl group hover:border-primary hover:shadow-lg transition-all flex flex-col"
          >
            <div
              className={`w-14 h-14 rounded-xl ${t.accentBg} flex items-center justify-center mb-md`}
            >
              <Icon name={t.icon} className={`${t.accentText} text-[28px]`} />
            </div>
            <h3 className="text-h2 font-semibold text-on-surface mb-sm group-hover:text-primary transition-colors">
              {t.title}
            </h3>
            <p className="text-body-base text-on-surface-variant leading-relaxed mb-lg flex-1">
              {t.description}
            </p>
            <span className="inline-flex items-center gap-xs text-label-sm text-primary font-semibold">
              시작하기
              <Icon
                name="arrow_forward"
                className="text-[16px] group-hover:translate-x-1 transition-transform"
              />
            </span>
          </Link>
        ))}
      </div>

      <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant border-dashed">
        <div className="flex items-start gap-md">
          <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
            <Icon name="lightbulb" className="text-primary text-[22px]" />
          </div>
          <div>
            <h4 className="text-h3 font-semibold mb-xs">템플릿이 부족한가요?</h4>
            <p className="text-body-sm text-on-surface-variant mb-sm">
              필요한 배너·게시물 템플릿이 라이브러리에 없다면, 디자인 팀에 새 템플릿 제작을 요청할 수
              있습니다.
            </p>
            <Link
              href="/my-requests/new"
              className="inline-flex items-center gap-xs text-label-sm text-primary font-semibold hover:underline"
            >
              새 요청 제출하기
              <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
