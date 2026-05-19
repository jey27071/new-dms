import Link from "next/link";
import { Icon } from "@/components/icon";

export default function DesignAiGeneratePage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-lg">
      <div>
        <div className="flex items-center gap-sm text-secondary text-label-sm mb-xs">
          <Icon name="auto_fix_high" className="text-[14px]" />
          <Link href="/design/ai" className="hover:text-primary transition-colors">
            AI로 디자인 하기
          </Link>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-primary font-semibold">AI로 생성하기</span>
        </div>
        <h1 className="text-h1 font-semibold text-on-surface">AI로 생성하기</h1>
        <p className="text-body-base text-on-surface-variant mt-xs">
          텍스트 프롬프트로 이미지를 생성하는 도구. 사내 정책·브랜드 가이드에 맞춰 큐레이션된 모델이 적용됩니다.
        </p>
      </div>

      <div className="bg-white rounded-xl card-shadow border border-outline-variant/30 p-xl">
        <div className="flex flex-col items-center text-center py-xl">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-md">
            <Icon name="schedule" className="text-primary text-[32px]" />
          </div>
          <h3 className="text-h2 font-semibold mb-sm">곧 제공될 기능입니다</h3>
          <p className="text-body-base text-on-surface-variant max-w-md mb-lg">
            AI 이미지 생성 도구는 현재 사내 정책 검토와 모델 큐레이션을 진행 중입니다.
            <br />
            우선 <Link href="/design/prompts" className="text-primary hover:underline">AI 프롬프트 라이브러리</Link> 에서
            검증된 프롬프트를 외부 도구에 활용해주세요.
          </p>

          <div className="bg-surface-container-low rounded-lg p-md text-left max-w-md w-full">
            <p className="text-label-caps text-on-surface-variant mb-xs">예정 기능</p>
            <ul className="text-body-sm text-on-surface-variant space-y-xs">
              <li>· 텍스트 프롬프트 → 이미지 생성</li>
              <li>· 사내 검증된 모델·스타일 프리셋</li>
              <li>· 브랜드 가이드 자동 적용</li>
              <li>· 결과 이미지 에셋 라이브러리 저장</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
