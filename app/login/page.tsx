import Link from "next/link";
import { Icon } from "@/components/icon";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-md relative bg-surface-container-lowest">
      {/* 배경 블러 장식 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary-fixed/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-surface-container-high/50 rounded-full blur-[100px]" />
      </div>

      <main className="w-full max-w-[400px]">
        <div className="card-shadow bg-white rounded-xl p-xl flex flex-col items-center">
          {/* 브랜딩 */}
          <div className="flex flex-col items-center gap-xs mb-xl">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-sm">
              <Icon name="auto_awesome" className="text-on-primary-container text-[28px]" />
            </div>
            <h1 className="text-h2 font-bold text-on-surface">DMS</h1>
            <p className="text-body-sm text-on-surface-variant">Corporate BMS</p>
          </div>

          {/* 로그인 폼 */}
          <form className="w-full flex flex-col gap-lg" action="/" method="get">
            <div className="flex flex-col gap-xs">
              <label htmlFor="email" className="text-label-sm text-on-surface-variant px-xs">
                이메일 주소
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="w-full px-md py-[10px] bg-white border border-outline-variant rounded-lg text-body-base text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline-variant"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center px-xs">
                <label htmlFor="password" className="text-label-sm text-on-surface-variant">
                  비밀번호
                </label>
                <Link href="#" className="text-label-sm text-primary hover:underline">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-md py-[10px] bg-white border border-outline-variant rounded-lg text-body-base text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline-variant"
              />
            </div>

            <div className="flex items-center gap-sm px-xs">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded-lg border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="remember" className="text-label-sm text-on-surface-variant cursor-pointer">
                로그인 상태 유지
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-container text-on-primary text-h3 font-semibold py-md rounded-xl hover:brightness-95 active:scale-[0.98] transition-all"
            >
              로그인
            </button>
          </form>

          <div className="mt-xl text-center">
            <p className="text-body-sm text-secondary">공인된 내부 사용자만 액세스 가능합니다.</p>
          </div>
        </div>
      </main>

      {/* 시스템 상태 (데스크탑 전용) */}
      <div className="hidden lg:block fixed right-xl bottom-xl">
        <div className="flex items-center gap-sm bg-white rounded-full px-md py-sm card-shadow">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-label-sm text-on-surface-variant">시스템 상태: 최적</span>
        </div>
      </div>
    </div>
  );
}
