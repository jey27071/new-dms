import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icon";
import { ROLE_COOKIE, EMAIL_COOKIE, roleFromEmail } from "@/lib/auth";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const role = roleFromEmail(email || "viewer@dms.local");
  const finalEmail = email || (role === "admin" ? "admin@dms.local" : "viewer@dms.local");
  const week = 60 * 60 * 24 * 7;
  cookies().set(ROLE_COOKIE, role, { path: "/", maxAge: week });
  cookies().set(EMAIL_COOKIE, finalEmail, { path: "/", maxAge: week });
  redirect("/");
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-md relative bg-surface-container-lowest">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary-fixed/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-surface-container-high/50 rounded-full blur-[100px]" />
      </div>

      <main className="w-full max-w-[400px]">
        <div className="card-shadow bg-white rounded-xl p-xl flex flex-col items-center">
          <div className="flex flex-col items-center gap-xs mb-xl">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-sm">
              <Icon name="auto_awesome" className="text-on-primary-container text-[28px]" />
            </div>
            <h1 className="text-[32px] font-bold text-on-surface tracking-tight leading-none">
              SDMS
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-xs">Design Management System</p>
          </div>

          <form action={loginAction} className="w-full flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <label htmlFor="email" className="text-label-sm text-on-surface-variant px-xs">
                이메일 주소
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                defaultValue="viewer@company.com"
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
                name="password"
                type="password"
                placeholder="••••••••"
                defaultValue="demo"
                className="w-full px-md py-[10px] bg-white border border-outline-variant rounded-lg text-body-base text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline-variant"
              />
            </div>

            <div className="flex items-center gap-sm px-xs">
              <input
                id="remember"
                name="remember"
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

          <div className="mt-lg text-center w-full px-xs">
            <div className="bg-surface-container-low border border-outline-variant border-dashed rounded-lg p-md text-left">
              <p className="text-label-caps text-on-surface-variant mb-xs">데모 안내</p>
              <p className="text-label-sm text-on-surface-variant leading-relaxed">
                이메일이 <span className="font-mono font-semibold text-primary">admin@</span>으로 시작하면
                <span className="font-semibold"> 관리자</span> 화면, 그 외엔
                <span className="font-semibold"> 일반 사용자</span> 화면으로 들어갑니다.
                비밀번호는 아무 값이나 가능합니다.
              </p>
            </div>
          </div>

          <div className="mt-md text-center">
            <p className="text-body-sm text-secondary">공인된 내부 사용자만 액세스 가능합니다.</p>
          </div>
        </div>
      </main>

      <div className="hidden lg:block fixed right-xl bottom-xl">
        <div className="flex items-center gap-sm bg-white rounded-full px-md py-sm card-shadow">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-label-sm text-on-surface-variant">시스템 상태: 최적</span>
        </div>
      </div>
    </div>
  );
}
