-- =====================================================================
-- 迁移：formula_type 值 'Pearl Paint' 更名为 'Three Stages'
-- 说明: 代码侧已统一使用 'Three Stages'，DB 约束和历史数据需同步
-- 注意: formula_components.component_group 仍保留 'Pearl Paint'/'Ground Paint'
--        那是图层名称，与 formula_type 无关，不做变更
-- 用法: Supabase Dashboard → SQL Editor → 粘贴 → Run
-- =====================================================================

-- 1. 迁移历史数据：'Pearl Paint' → 'Three Stages'
UPDATE public.formulas
  SET formula_type = 'Three Stages'
  WHERE formula_type = 'Pearl Paint';

-- 2. 替换 CHECK 约束
ALTER TABLE public.formulas
  DROP CONSTRAINT IF EXISTS formulas_formula_type_check;

ALTER TABLE public.formulas
  ADD CONSTRAINT formulas_formula_type_check
  CHECK (formula_type IN ('Single Stage', 'Two Stages', 'Three Stages'));

-- 3. 刷新 PostgREST schema cache
NOTIFY pgrst, 'reload schema';
