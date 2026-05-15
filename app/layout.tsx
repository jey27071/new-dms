import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DMS · 디자인 관리 시스템",
  description: "기업 브랜드 자산·가이드라인·요청 워크플로우 통합 포털",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-background text-on-background antialiased">
        {children}
      </body>
    </html>
  );
}
