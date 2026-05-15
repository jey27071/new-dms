-- =====================================================
-- DMS · assets 테이블 생성 + 시드 데이터 + RLS
-- 사용법: Supabase Dashboard → SQL Editor → 이 전체를 붙여넣고 RUN
-- =====================================================

-- 1) 테이블
create table if not exists public.assets (
  id text primary key,
  title text not null,
  description text,
  category text not null check (category in ('logo','icon','photo','template','social','typography','style')),
  formats text[] not null,
  image text not null,
  downloads text not null default '0',
  uploader text not null,
  uploaded_at date not null default current_date,
  is_internal boolean default false,
  is_primary boolean default false,
  is_seed boolean default false,
  related text[],
  created_at timestamptz default now()
);

-- 2) Row Level Security 활성화
alter table public.assets enable row level security;

-- 3) RLS 정책 (G2 단계: 가짜 인증이라 모두 허용. G3에서 강화)
drop policy if exists "assets_select" on public.assets;
drop policy if exists "assets_insert" on public.assets;
drop policy if exists "assets_update" on public.assets;
drop policy if exists "assets_delete" on public.assets;

create policy "assets_select" on public.assets for select using (true);
create policy "assets_insert" on public.assets for insert with check (true);
create policy "assets_update" on public.assets for update using (true) with check (true);
create policy "assets_delete" on public.assets for delete using (true);

-- 4) 시드 데이터 (기존 mock 9건)
-- 한 번 더 실행해도 안전하도록 on conflict do nothing
insert into public.assets (id, title, description, category, formats, image, downloads, uploader, uploaded_at, is_internal, is_primary, is_seed, related) values
  (
    '1',
    '기업 로고 v1.2',
    '모든 주요 브랜드 커뮤니케이션에 이 마스터 파일을 사용하십시오. 로고 너비의 20%에 해당하는 최소 여백을 사방에 확보하십시오. 색상이나 비율을 변경하지 마십시오.',
    'logo',
    array['AI','PNG'],
    'https://picsum.photos/seed/asset-1/800/600',
    '2.4k',
    'Sarah Miller',
    '2026-04-22',
    true,
    true,
    true,
    array['2','5','6','7']
  ),
  (
    '2',
    '보조 브랜드 조합',
    null,
    'logo',
    array['SVG'],
    'https://picsum.photos/seed/asset-2/800/600',
    '1.8k',
    'Sarah Miller',
    '2026-04-15',
    false,
    false,
    true,
    null
  ),
  (
    '3',
    '아이코노그래피 세트 v2',
    null,
    'icon',
    array['AI','PDF'],
    'https://picsum.photos/seed/asset-3/800/600',
    '5.2k',
    'James Do',
    '2026-04-10',
    false,
    false,
    true,
    null
  ),
  (
    '4',
    '브랜드 변천사 키트',
    null,
    'template',
    array['AI'],
    'https://picsum.photos/seed/asset-4/800/600',
    '840',
    'Alex Chen',
    '2026-04-02',
    false,
    false,
    true,
    null
  ),
  (
    '5',
    '흑백 워드마크',
    null,
    'logo',
    array['PNG'],
    'https://picsum.photos/seed/asset-5/800/600',
    '1.1k',
    'Sarah Miller',
    '2026-03-28',
    false,
    false,
    true,
    null
  ),
  (
    '6',
    '파트너 에셋 팩',
    null,
    'photo',
    array['PNG'],
    'https://picsum.photos/seed/asset-6/800/600',
    '3.4k',
    'Beth H.',
    '2026-03-22',
    false,
    false,
    true,
    null
  ),
  (
    '7',
    'UI 아이콘 라이브러리',
    null,
    'icon',
    array['SVG','FIG'],
    'https://picsum.photos/seed/asset-7/800/600',
    '920',
    'James Do',
    '2026-03-15',
    false,
    false,
    true,
    null
  ),
  (
    '8',
    '소셜 미디어 키트',
    null,
    'social',
    array['ZIP','MP4'],
    'https://picsum.photos/seed/asset-8/800/600',
    '612',
    'Alex Chen',
    '2026-03-10',
    false,
    false,
    true,
    null
  ),
  (
    '9',
    '브랜드 컬러 팔레트',
    null,
    'style',
    array['PDF','ASE'],
    'https://picsum.photos/seed/asset-9/800/600',
    '488',
    'Sarah Miller',
    '2026-03-05',
    false,
    false,
    true,
    null
  )
on conflict (id) do nothing;
