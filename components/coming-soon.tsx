import { Icon } from "@/components/icon";

export function ComingSoon({ title, step }: { title: string; step?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-md">
        <Icon name="schedule" className="text-primary text-[32px]" />
      </div>
      <h2 className="text-h1 font-semibold text-on-background mb-xs">{title}</h2>
      <p className="text-body-base text-on-surface-variant max-w-md">
        이 화면은 단계별 구현 중입니다. {step ? `(${step})` : ""} 디자인 사양에 맞춰 곧 채워집니다.
      </p>
    </div>
  );
}
