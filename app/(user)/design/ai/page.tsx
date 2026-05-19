import Link from "next/link";
import { Icon } from "@/components/icon";

const TOOLS = [
  {
    title: "AI 프롬프트 라이브러리",
    description: "사내에서 검증된 ChatGPT·Midjourney·Claude 프롬프트를 검색·복사.",
    href: "/design/prompts",
    icon: "lightbulb",
    accentBg: "bg-secondary-container",
    accentText: "text-on-secondary-fixed-variant",
  },
  {
    title: "AI로 생성하기",
    description: "사내 정책에 맞게 큐레이션된 AI 이미지 생성 도구로 즉시 결과물을 만듭니다.",
    href: "/design/ai/generate",
    icon: "auto_awesome",
    accentBg: "bg-primary-fixed",
    accentText: "text-primary",
  },
];

export default function DesignAiHubPage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-xl">
      <div>
        <div className="flex items-center gap-sm text-secondary text-label-sm mb-xs">
          <Icon name="auto_fix_high" className="text-[14px]" />
          <span className="text-primary font-semibold">AI로 디자인 하기</span>
        </div>
        <h1 className="text-h1 font-semibold text-on-surface">AI로 디자인 하기</h1>
        <p className="text-body-base text-on-surface-variant mt-xs max-w-2xl">
          사내 정책에 부합하는 검증된 AI 프롬프트와 이미지 생성 도구를 한 곳에서 사용하세요.
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
    </div>
  );
}
