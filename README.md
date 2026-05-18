# SDMS · Design Management System

사내 디자인 에셋·가이드라인·요청 워크플로우를 한 곳에서 관리하는 포털.

- 일반 사용자: 에셋 다운로드, 가이드라인 열람, 배너·게시물 제작, AI 프롬프트 검색, 디자인 요청 제출
- 관리자: 에셋·템플릿·가이드라인·프롬프트 관리, 요청 처리, 카테고리·알림 설정

---

## 1. 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프론트엔드 | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| UI 토큰 | Material 3 컬러·타이포·스페이싱, Pretendard, Material Symbols |
| DB | Supabase (PostgreSQL) |
| 파일 저장 | Supabase Storage |
| 이메일 | Resend |
| 배포 | Vercel |

---

## 2. 디렉토리 구조

```
DMS/
├── app/
│   ├── (user)/              사용자 영역 (홈·에셋·가이드라인·요청·디자인 제작)
│   ├── admin/               관리자 영역
│   ├── api/notify/          이메일 알림 API 라우트
│   └── login/, logout/      인증
├── components/              공용 컴포넌트 (sidebar, form, slot-editor 등)
├── lib/
│   ├── data.ts              타입 정의 및 공용 상수
│   ├── auth.ts, auth-client.ts  쿠키 기반 가짜 인증 (SSO 대체 예정)
│   ├── supabase/            Supabase 클라이언트
│   └── store/               DB 접근 계층 (assets, requests, prompts 등)
├── supabase/                DB 마이그레이션 SQL
│   ├── 01_assets.sql
│   └── 02_asset_categories.sql
└── README.md
```

---

## 3. 환경 변수

`.env.local` 파일을 프로젝트 루트에 만들고 다음 값들을 채웁니다.

```env
# Supabase (Settings → API 에서 확인)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Resend (Dashboard → API Keys)
RESEND_API_KEY=re_xxxxx
RESEND_FROM=SDMS <noreply@yourdomain.com>

# 관리자 알림 받을 이메일 (선택, 없으면 알림 매핑에서 처리)
ADMIN_NOTIFY_EMAIL=admin@yourdomain.com
```

Vercel 배포 시에도 동일한 변수를 **Project Settings → Environment Variables** 에 등록해야 합니다.

---

## 4. 로컬 개발

```bash
npm install
npm run dev
# http://localhost:3000
```

빌드 테스트:

```bash
npm run build
npm start
```

---

## 5. Supabase DB 셋업 (최초 1회)

Supabase Dashboard → SQL Editor 에서 다음 순서대로 실행합니다.

### 5-1. 기본 테이블 (Phase G2)
`supabase/01_assets.sql` 전체 복사 → 붙여넣기 → RUN

### 5-2. 그 외 테이블
아래 테이블들은 별도 SQL 파일로 정리되어 있지 않지만, 운영 중인 DB에 이미 생성되어 있습니다. 새 환경에서 처음 셋업하는 경우 Supabase Dashboard에서 직접 만들거나 운영 DB를 dump 떠서 복원하세요.

- `categories` (id, domain, label, sort_order)
- `requests`, `request_activities`
- `guidelines`
- `banner_templates`, `notice_templates`
- `prompts`
- `notification_settings`

### 5-3. 에셋 카테고리 마이그레이션 (Phase K)
`supabase/02_asset_categories.sql` 전체 복사 → 붙여넣기 → RUN

### Storage 버킷
- `assets` — 에셋 이미지
- `guidelines` — 가이드라인 PDF·커버
- `banner-templates` — 배너 템플릿 원본
- `notice-templates` — 사내 게시물 템플릿 원본
- `request-attachments` — 요청 첨부파일

모두 **Public** 접근 허용으로 생성. Dashboard → Storage → New Bucket.

---

## 6. Vercel 배포

1. GitHub 저장소에 푸시
2. Vercel → New Project → 저장소 선택 → Import
3. **Environment Variables** 에 위 3개의 환경변수 전부 등록
4. Deploy 클릭
5. 이후 `git push origin main` 만으로 자동 재배포

---

## 7. 인증 모델 (현재 / 향후)

### 현재 (프로토타입)
쿠키 기반 가짜 인증.

- `admin@...` 으로 시작하는 이메일 → 관리자 권한
- 그 외 모든 이메일 → 일반 사용자
- 비밀번호 없음. 이메일만 입력하면 로그인됨.

`lib/auth.ts`, `lib/auth-client.ts`, `lib/auth-constants.ts` 참조.

### 향후 (사내망 이전 시)
SSO(SAML 또는 OIDC) 연동으로 교체. 회사 IT팀과 협의 필요.

---

## 8. 자주 하는 운영 작업

### 카테고리 추가/수정/삭제
관리자 페이지 → **카테고리 설정** 메뉴.
- 요청 카테고리, 프롬프트 카테고리, 에셋 카테고리 3개 탭에서 각각 관리.

### 알림 수신자 매핑 변경
관리자 페이지 → **알림 설정** 메뉴.
- 요청 유형(4종)별로 자동 배정될 승인자 이메일 등록.

### 새 SQL 마이그레이션 실행
1. `supabase/` 폴더에 SQL 파일 추가 또는 chat에서 받은 SQL 복사
2. Supabase Dashboard → SQL Editor → 붙여넣기 → RUN
3. 결과 확인 쿼리(있으면) 실행

### 코드 변경 배포
```bash
cd /Users/jey27071/Desktop/DMS_proto/DMS
git add .
git commit -m "변경 내용"
git push origin main
```
Vercel이 자동으로 1~2분 내에 재배포합니다.

---

## 9. 메일 알림 동작 방식

요청 생성·상태 변경·댓글 등의 이벤트가 발생하면 `app/api/notify/route.ts` 가 호출되어 Resend로 메일 발송.

- 수신자 구성: 요청자 + 자동 배정된 승인자 + CC 이메일 전원
- 자동 배정: `notification_settings` 테이블의 요청 유형별 매핑
- CC 중복 자동 제거

`RESEND_FROM` 의 도메인은 Resend 대시보드에서 검증된 도메인이어야 합니다.

---

## 10. 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| 카테고리 메뉴가 비어있음 | `categories` 테이블에 해당 domain 데이터가 없음 → 관리자 페이지에서 추가 또는 시드 SQL 실행 |
| 메일이 안 옴 | `RESEND_API_KEY` 또는 `RESEND_FROM` 환경변수 확인, Resend 도메인 검증 상태 확인 |
| 이미지 업로드 실패 | Supabase Storage 버킷의 RLS·Public 설정 확인 |
| 빌드 에러 (Vercel) | 로컬에서 `npm run build` 로 재현, 환경변수 등록 누락 여부 확인 |
| `relation "..." does not exist` | Supabase에 해당 테이블이 없음 → 5-2 항목 참고하여 테이블 생성 |

---

## 11. 향후 작업 (사내망 이전)

별도 검토 중. 주요 변경 항목:

- Vercel → 사내 서버 (Docker + Node.js)
- Supabase → 자가 호스팅 PostgreSQL
- Resend → 사내 SMTP 릴레이
- 가짜 인증 → SSO (SAML/OIDC)
- 외부 CDN 폰트·아이콘 → 사내 정적 호스팅

자세한 내용은 별도 인프라 계획서 참조.

---

## 12. 디자인 토큰 요약

- **컬러**: Material 3 토큰 (`primary #3525cd`, `surface #fcf8ff` 등)
- **타이포**: `text-h1` / `text-h2` / `text-h3` / `text-body-base` / `text-body-sm` / `text-label-caps` / `text-label-sm`
- **스페이싱**: `xs(4)` / `sm(8)` / `md(16)` / `lg(24)` / `xl(32)`
- **라운드**: `rounded-lg(4)` / `rounded-xl(8)` / `rounded-full(12)`
- **그림자**: `card-shadow`

상세 정의는 `tailwind.config.ts` 참조.
