# Design Management System · 디자인 관리 시스템 (Prototype)

기업 내부 브랜드 자산·가이드라인·디자인 요청 워크플로우 통합 포털 프로토타입.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (DESIGN.md 토큰 기반 theme.extend)
- Pretendard (jsDelivr CDN, Variable)
- Material Symbols Outlined (Google Fonts)

## 개발

```bash
npm install
npm run dev
# http://localhost:3000
```

## 빌드

```bash
npm run build
npm start
```

## Vercel 배포

1. 이 폴더를 GitHub 저장소에 푸시
2. Vercel에서 New Project → 해당 레포 선택 → 그대로 Deploy
3. 배포 후 자동 발급되는 `.vercel.app` URL 공유

## 라우트

| URL | 화면 | 상태 |
|---|---|---|
| `/` | 홈 대시보드 | ✅ |
| `/assets` | 에셋 라이브러리 | 4단계 예정 |
| `/assets/[id]` | 에셋 상세 | 4단계 예정 |
| `/guidelines` | 가이드라인 | 4단계 예정 |
| `/my-requests` | 내 요청 | 3단계 예정 |
| `/my-requests/new` | 새 요청 제출 | 3단계 예정 |
| `/preview` | 프리뷰 제작 | 5단계 예정 |
| `/admin` | 관리자 대시보드 | 5단계 예정 |
| `/login` | 로그인 | 3단계 예정 |

## 디자인 토큰

- 컬러: Material 3 토큰 체계 (`primary #3525cd`, `surface #fcf8ff` 등)
- 타이포: `text-h1`/`text-h2`/`text-h3`/`text-body-base`/`text-body-sm`/`text-label-caps`/`text-label-sm`
- 스페이싱: `xs(4)`/`sm(8)`/`md(16)`/`lg(24)`/`xl(32)`
- 라운드: `rounded-lg(4)`/`rounded-xl(8)`/`rounded-full(12)`
- 그림자: `shadow-card` 또는 `.card-shadow`
