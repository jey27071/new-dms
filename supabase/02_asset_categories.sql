-- =====================================================
-- DMS · Phase K · 에셋 카테고리 DB화
-- 사용법: Supabase Dashboard → SQL Editor → 이 전체를 붙여넣고 RUN
--
-- 효과:
--   1) assets.category 의 CHECK 제약을 제거하여 사용자 정의 카테고리 허용
--   2) categories 테이블에 domain='asset' 기본 7개 항목 추가
--   3) 기존 영문 키("logo" 등)를 한글 라벨("로고" 등)로 일괄 변환
--
-- 안전성:
--   - on conflict / where 절로 멱등(idempotent)하게 작성됨
--   - 여러 번 실행해도 동일한 결과
-- =====================================================

-- 1) assets.category CHECK 제약 제거
--    제약 이름은 PostgreSQL이 자동 생성(assets_category_check)했을 가능성이 높음
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.assets'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%category%';
  if cname is not null then
    execute format('alter table public.assets drop constraint %I', cname);
  end if;
end $$;

-- 2) categories 테이블에 에셋 카테고리 기본값 7개 추가
--    (Phase I에서 만든 categories 테이블 재사용)
insert into public.categories (id, domain, label, sort_order) values
  ('ac-seed-logo',       'asset', '로고',         1),
  ('ac-seed-icon',       'asset', '아이콘',       2),
  ('ac-seed-photo',      'asset', '사진',         3),
  ('ac-seed-template',   'asset', '템플릿',       4),
  ('ac-seed-social',     'asset', '소셜 미디어',  5),
  ('ac-seed-typography', 'asset', '타이포그래피', 6),
  ('ac-seed-style',      'asset', '스타일 가이드', 7)
on conflict (id) do nothing;

-- 3) 기존 assets 데이터의 영문 키를 한글 라벨로 변환
update public.assets set category = '로고'         where category = 'logo';
update public.assets set category = '아이콘'       where category = 'icon';
update public.assets set category = '사진'         where category = 'photo';
update public.assets set category = '템플릿'       where category = 'template';
update public.assets set category = '소셜 미디어'  where category = 'social';
update public.assets set category = '타이포그래피' where category = 'typography';
update public.assets set category = '스타일 가이드' where category = 'style';

-- 4) 결과 확인 (선택)
-- select category, count(*) from public.assets group by category order by category;
-- select * from public.categories where domain = 'asset' order by sort_order;
