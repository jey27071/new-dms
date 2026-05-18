-- =====================================================
-- DMS · Phase P · 에셋 포맷별 파일 (assets.files JSONB)
-- 사용법: Supabase Dashboard → SQL Editor → 이 전체를 붙여넣고 RUN
--
-- 효과:
--   1) assets.files JSONB 컬럼 추가 (포맷 → 파일 URL 매핑)
--   2) 기존 에셋의 image 를 첫 포맷 키로 자동 이관 (다운로드 호환 유지)
--
-- 멱등하게 작성됨. 여러 번 실행해도 안전.
-- =====================================================

-- 1) files 컬럼 추가
alter table public.assets
  add column if not exists files jsonb default '{}'::jsonb;

-- 2) 기존 에셋의 image 를 첫 포맷 키로 복사 (files 가 비어 있을 때만)
update public.assets
set files = jsonb_build_object(formats[1], image)
where (files is null or files = '{}'::jsonb)
  and image is not null and image <> ''
  and formats is not null and array_length(formats, 1) >= 1;

-- 결과 확인 (선택)
-- select id, title, formats, files from public.assets order by created_at desc limit 5;
