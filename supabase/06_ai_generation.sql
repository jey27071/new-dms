-- =====================================================
-- DMS · Phase S · AI 생성 기능
-- 사용법: Supabase Dashboard → SQL Editor → 이 전체를 붙여넣고 RUN
--
-- 효과:
--   1) ai_styles: 관리자가 항목별 스타일 가이드/시스템 프롬프트 등록
--   2) ai_generations: 사용자별 생성 이력 + 일일 한도 추적
--   3) 기본 스타일 3종 시드 (배너/아이콘/사진)
--
-- 멱등 처리됨.
-- =====================================================

-- 1) ai_styles 테이블
create table if not exists public.ai_styles (
  id text primary key,
  name text not null,
  description text,
  system_prompt text not null,
  negative_prompt text,
  sample_image text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ai_styles enable row level security;
drop policy if exists "ai_styles_select" on public.ai_styles;
drop policy if exists "ai_styles_insert" on public.ai_styles;
drop policy if exists "ai_styles_update" on public.ai_styles;
drop policy if exists "ai_styles_delete" on public.ai_styles;
create policy "ai_styles_select" on public.ai_styles for select using (true);
create policy "ai_styles_insert" on public.ai_styles for insert with check (true);
create policy "ai_styles_update" on public.ai_styles for update using (true) with check (true);
create policy "ai_styles_delete" on public.ai_styles for delete using (true);

-- 2) ai_generations 테이블 (사용량·이력)
create table if not exists public.ai_generations (
  id text primary key,
  user_email text not null,
  style_id text references public.ai_styles(id) on delete set null,
  style_name text,                       -- 스타일 삭제돼도 이름은 남기기 위해 스냅샷
  prompt text not null,
  full_prompt text,
  image_urls text[] not null default '{}',
  selected_url text,
  status text not null default 'completed',  -- completed/failed/pending
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_ai_generations_user_date on public.ai_generations(user_email, created_at);

alter table public.ai_generations enable row level security;
drop policy if exists "ai_gen_select" on public.ai_generations;
drop policy if exists "ai_gen_insert" on public.ai_generations;
drop policy if exists "ai_gen_update" on public.ai_generations;
drop policy if exists "ai_gen_delete" on public.ai_generations;
create policy "ai_gen_select" on public.ai_generations for select using (true);
create policy "ai_gen_insert" on public.ai_generations for insert with check (true);
create policy "ai_gen_update" on public.ai_generations for update using (true) with check (true);
create policy "ai_gen_delete" on public.ai_generations for delete using (true);

-- 3) 기본 스타일 3종 시드
insert into public.ai_styles (id, name, description, system_prompt, negative_prompt, sort_order) values
  (
    'ai-style-banner',
    '배너(현수막)',
    '광고·캠페인용 가로 배너. 굵은 타이포·강한 색 대비·브랜드 컬러 강조.',
    'Modern minimalist banner design, bold typography, clean composition, vibrant brand colors, high contrast, horizontal layout, professional corporate style',
    'cluttered, low quality, watermark, text artifacts, blurry, distorted text',
    1
  ),
  (
    'ai-style-icon',
    '아이콘',
    '심플 픽토그램·라인 아이콘. 단일 색·흰 배경·중앙 정렬.',
    'Simple flat icon, single color line art, minimalist pictogram, centered composition, white background, vector style, professional',
    'photorealistic, 3d render, complex shadows, multiple objects, gradient, decorative',
    2
  ),
  (
    'ai-style-photo',
    '사진/이미지',
    '브랜드 톤 일반 이미지. 프로페셔널 사진 스타일.',
    'High quality professional photograph, soft natural lighting, brand-aligned color palette, clean composition, sharp focus, modern aesthetic',
    'cartoon, illustration, anime, low quality, blurry, oversaturated, amateur',
    3
  )
on conflict (id) do nothing;
