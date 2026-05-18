-- =====================================================
-- DMS · Phase J · 사용자 관리 (관리자 + 알림 다대다)
-- 사용법: Supabase Dashboard → SQL Editor → 이 전체를 붙여넣고 RUN
--
-- 효과:
--   1) admins 테이블 신설 (관리자 권한 + SSO 연동 시 동일하게 사용)
--   2) admin_notification_subscriptions 테이블 신설 (관리자 × 요청 유형 다대다)
--   3) 기존 notification_settings 데이터를 새 구조로 이관
--   4) 현재 사용자 이메일을 부트스트랩 관리자로 시드
--   5) notification_settings 테이블은 호환을 위해 일단 유지(이후 정리)
-- =====================================================

-- 1) admins 테이블
create table if not exists public.admins (
  id text primary key,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins_select" on public.admins;
drop policy if exists "admins_insert" on public.admins;
drop policy if exists "admins_update" on public.admins;
drop policy if exists "admins_delete" on public.admins;
create policy "admins_select" on public.admins for select using (true);
create policy "admins_insert" on public.admins for insert with check (true);
create policy "admins_update" on public.admins for update using (true) with check (true);
create policy "admins_delete" on public.admins for delete using (true);

-- 2) 관리자 × 요청 유형 알림 구독 (다대다)
create table if not exists public.admin_notification_subscriptions (
  admin_id text references public.admins(id) on delete cascade,
  request_type text not null,
  created_at timestamptz default now(),
  primary key (admin_id, request_type)
);

alter table public.admin_notification_subscriptions enable row level security;

drop policy if exists "ans_select" on public.admin_notification_subscriptions;
drop policy if exists "ans_insert" on public.admin_notification_subscriptions;
drop policy if exists "ans_update" on public.admin_notification_subscriptions;
drop policy if exists "ans_delete" on public.admin_notification_subscriptions;
create policy "ans_select" on public.admin_notification_subscriptions for select using (true);
create policy "ans_insert" on public.admin_notification_subscriptions for insert with check (true);
create policy "ans_update" on public.admin_notification_subscriptions for update using (true) with check (true);
create policy "ans_delete" on public.admin_notification_subscriptions for delete using (true);

-- 3) 기존 notification_settings → admins + subscriptions 로 이관
--    각 매핑 이메일을 admins에 등록 (중복은 스킵)
insert into public.admins (id, email, name)
select
  'adm-' || substr(md5(approver_email), 1, 12),
  approver_email,
  coalesce(approver_name, split_part(approver_email, '@', 1))
from public.notification_settings
where approver_email is not null and approver_email <> ''
on conflict (email) do nothing;

--    각 매핑을 구독으로 등록
insert into public.admin_notification_subscriptions (admin_id, request_type)
select
  a.id,
  n.request_type
from public.notification_settings n
join public.admins a on a.email = n.approver_email
on conflict (admin_id, request_type) do nothing;

-- 4) 부트스트랩: 현재 사용자를 관리자로 등록 (이미 있으면 스킵)
insert into public.admins (id, email, name) values
  ('adm-bootstrap', '2026rnd.s1@gmail.com', '운영파트')
on conflict (email) do nothing;

-- 5) 결과 확인 (선택)
-- select * from public.admins order by created_at;
-- select a.email, s.request_type from public.admin_notification_subscriptions s
--   join public.admins a on a.id = s.admin_id order by a.email, s.request_type;
