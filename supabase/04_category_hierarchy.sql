-- =====================================================
-- DMS · Phase O · 카테고리 계층 구조 (대분류/소분류)
-- 사용법: Supabase Dashboard → SQL Editor → 이 전체를 붙여넣고 RUN
--
-- 효과:
--   1) categories.parent_id 컬럼 추가 (NULL = 대분류, 값 있음 = 소분류)
--   2) 트리 쿼리를 위한 인덱스
--   3) 기존 데이터는 그대로 두면 모두 대분류(parent_id=null)로 동작
--
-- 안전성:
--   - 멱등하게 작성됨
--   - 기존 데이터 보존, 컬럼 추가만
-- =====================================================

-- 1) parent_id 컬럼 추가
alter table public.categories
  add column if not exists parent_id text references public.categories(id) on delete set null;

-- 2) 트리 탐색용 인덱스
create index if not exists idx_categories_parent on public.categories(parent_id);

-- 3) 자기 참조 방지 (parent_id = id 인 행이 생기지 않도록 체크)
alter table public.categories drop constraint if exists categories_no_self_parent;
alter table public.categories add constraint categories_no_self_parent
  check (parent_id is null or parent_id <> id);

-- 결과 확인 (선택)
-- select id, label, parent_id, domain, sort_order from public.categories order by domain, parent_id nulls first, sort_order;
