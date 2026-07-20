-- =====================================================================
-- 色母表（Toners）+ 122 条初始数据
-- 说明: 色母数据从前端 Mock Data 迁移到 Supabase，支持管理后台增删改
-- 用法: Supabase Dashboard → SQL Editor → 粘贴 → Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 建表
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.toners (
  code TEXT PRIMARY KEY,              -- 色母编号，如 2K-2001
  trade_name TEXT NOT NULL,           -- 英文商品名
  name_zh TEXT NOT NULL,              -- 中文品名
  category TEXT NOT NULL,             -- 分类枚举
  hex TEXT NOT NULL DEFAULT '#FFFFFF',-- 颜色预览 hex
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.toners IS '色母表（122 条初始数据）';

-- ---------------------------------------------------------------------
-- 2. RLS: 公开可读，写操作仅 service_role
-- ---------------------------------------------------------------------
ALTER TABLE public.toners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS toners_select_all ON public.toners;
CREATE POLICY toners_select_all ON public.toners FOR SELECT TO public USING (true);

-- ---------------------------------------------------------------------
-- 3. updated_at 触发器
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_toners_updated_at ON public.toners;
CREATE TRIGGER update_toners_updated_at
  BEFORE UPDATE ON public.toners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 4. 插入初始 122 条数据（幂等：ON CONFLICT DO NOTHING）
-- ---------------------------------------------------------------------

-- 2K Basecoat (30 条)
INSERT INTO public.toners (code, trade_name, name_zh, category, hex) VALUES
('2K-2001', 'White', '纯白', '2K_BASECOAT', '#FFFFFF'),
('2K-2002', 'Standard White', '优质纯白', '2K_BASECOAT', '#FFFFFF'),
('2K-2003', 'Super White', '顶级纯白', '2K_BASECOAT', '#FFFFFF'),
('2K-2004', 'Black', '经济型黑漆', '2K_BASECOAT', '#1A1A1A'),
('2K-2005', 'Jet Black', '通黑', '2K_BASECOAT', '#0D0D0D'),
('2K-2006', 'Extra Black', '深黑/特黑', '2K_BASECOAT', '#000000'),
('2K-2007', 'Bluish Black', '蓝相特黑', '2K_BASECOAT', '#0A0A1A'),
('2K-2008', 'Purplish Blue', '紫蓝/发红蓝', '2K_BASECOAT', '#4A3A8A'),
('2K-2009', 'Purple', '紫色', '2K_BASECOAT', '#800080'),
('2K-2010', 'Purple Red', '紫红', '2K_BASECOAT', '#C71585'),
('2K-2011', 'Rose Red', '玫瑰红', '2K_BASECOAT', '#FF69B4'),
('2K-2201', 'Matt White', '哑光白', '2K_BASECOAT', '#EEEEEE'),
('2K-2202', 'Matt White Puls', '优质哑光白', '2K_BASECOAT', '#EEEEEE'),
('2K-2204', 'Matt Black', '哑光黑', '2K_BASECOAT', '#2A2A2A'),
('2K-2205', 'Matt Black Puls', '优质哑光黑', '2K_BASECOAT', '#2A2A2A'),
('2K-2012', 'Red', '大红', '2K_BASECOAT', '#FF0000'),
('2K-2013', 'Vivid Red', '鲜红', '2K_BASECOAT', '#FF1A1A'),
('2K-2014', 'Ferrari Red', '法拉利红', '2K_BASECOAT', '#FF2800'),
('2K-2015', 'Orange Red', '橙红', '2K_BASECOAT', '#FF4500'),
('2K-2016', 'Iron Red', '铁红', '2K_BASECOAT', '#A0522D'),
('2K-2017', 'Medium Yellow', '中黄', '2K_BASECOAT', '#FFD700'),
('2K-2018', 'Yellow', '耐晒中黄', '2K_BASECOAT', '#FFDE00'),
('2K-2019', 'Lemon Yellow', '耐晒柠檬黄', '2K_BASECOAT', '#FFF44F'),
('2K-2020', 'Earthy Yellow', '土黄', '2K_BASECOAT', '#CC9933'),
('2K-2021', 'Vivid Yellow', '艳黄', '2K_BASECOAT', '#FFE500'),
('2K-2022', 'Yellowish Green', '黄相绿', '2K_BASECOAT', '#9ACD32'),
('2K-2023', 'Green', '通绿', '2K_BASECOAT', '#008000'),
('2K-2024', 'Blue', '标准蓝', '2K_BASECOAT', '#0000FF'),
('2K-2025', 'Greenish Blue', '通蓝/绿相兰', '2K_BASECOAT', '#0066CC'),
('2K-2026', 'Reddish Blue', '艳蓝/红相蓝', '2K_BASECOAT', '#4B0082')
ON CONFLICT (code) DO NOTHING;

-- 1K Basecoat (29 条)
INSERT INTO public.toners (code, trade_name, name_zh, category, hex) VALUES
('1K-3001', 'White', '纯白', '1K_BASECOAT', '#FFFFFF'),
('1K-3002', 'Super White', '纯白', '1K_BASECOAT', '#FFFFFF'),
('1K-3003', 'Transparent White', '霜雪蓝（宝石白）', '1K_BASECOAT', '#F0F8FF'),
('1K-3004', 'Black', '调色黑（蓝相）', '1K_BASECOAT', '#0A0A1A'),
('1K-3005', 'Bluish Black', '调色特蓝黑', '1K_BASECOAT', '#0A0A2A'),
('1K-3006', 'Jet Black', '通黑', '1K_BASECOAT', '#0D0D0D'),
('1K-3007', 'Extra Black', '深黑/特黑', '1K_BASECOAT', '#000000'),
('1K-3008', 'Bluish Dark Black', '蓝相特黑', '1K_BASECOAT', '#0A0A1A'),
('1K-3009', 'Super Black', '超级特黑', '1K_BASECOAT', '#000000'),
('1K-3010', 'Transoxide Brown', '透明氧化铁棕', '1K_BASECOAT', '#8B4513'),
('1K-3011', 'Purple', '紫色', '1K_BASECOAT', '#800080'),
('1K-3012', 'Purplish Red', '紫红', '1K_BASECOAT', '#C71585'),
('1K-3013', 'Rose Red', '玫瑰红', '1K_BASECOAT', '#FF69B4'),
('1K-3014', 'Brownness Red', '栗红', '1K_BASECOAT', '#8B0000'),
('1K-3015', 'Transoxide Red', '透明氧化铁红', '1K_BASECOAT', '#A0522D'),
('1K-3016', 'Bright Red', '鲜红/艳红', '1K_BASECOAT', '#FF1A1A'),
('1K-3017', 'Trans Red( Blue Phase)', '透明红（蓝相）', '1K_BASECOAT', '#1A1A2A'),
('1K-3018', 'Trans Red(Yellow Phase)', '透明红（黄相）', '1K_BASECOAT', '#DAA520'),
('1K-3019', 'Orange red', '橙红/钼红', '1K_BASECOAT', '#FF4500'),
('1K-3020', 'Iron Red', '铁红', '1K_BASECOAT', '#A0522D'),
('1K-3021', 'Medium Yellow', '中黄', '1K_BASECOAT', '#FFD700'),
('1K-3022', 'Lemon Yellow', '柠檬黄', '1K_BASECOAT', '#FFF44F'),
('1K-3023', 'Transparent Yellow', '透明黄', '1K_BASECOAT', '#FFFF99'),
('1K-3025', 'Transoxide Yellow', '透明氧化铁黄', '1K_BASECOAT', '#DAA520'),
('1K-3027', 'Fresh Green', '通绿', '1K_BASECOAT', '#008000'),
('1K-3029', 'olive-green', '橄榄绿', '1K_BASECOAT', '#556B2F'),
('1K-3031', 'Greenish Blue', '通蓝/绿相蓝', '1K_BASECOAT', '#0066CC'),
('1K-3033', 'Purple Blue', '紫蓝/发红蓝', '1K_BASECOAT', '#4A3A8A'),
('1K-3035', 'HQ Brownness Red', '超级栗红', '1K_BASECOAT', '#8B0000')
ON CONFLICT (code) DO NOTHING;

-- 1K Silver Basecoat (14 条)
INSERT INTO public.toners (code, trade_name, name_zh, category, hex) VALUES
('1K-4001', 'Diamond silver', '钻石银', '1K_SILVER_BASECOAT', '#D4D4D4'),
('1K-4002', 'Super white Diamond silver', '超白钻石银', '1K_SILVER_BASECOAT', '#D4D4D4'),
('1K-4003', 'Super Shining Medium silver', '幼闪银（仿电镀银）', '1K_SILVER_BASECOAT', '#C8C8C8'),
('1K-4004', 'Medium Fine White silver', '白中银', '1K_SILVER_BASECOAT', '#D8D8D8'),
('1K-4005', 'Extra Fine White silver', '幼白银', '1K_SILVER_BASECOAT', '#E0E0E0'),
('1K-4006', 'Fine silver', '细银', '1K_SILVER_BASECOAT', '#C0C0C0'),
('1K-4007', 'Fine White silver', '细白银', '1K_SILVER_BASECOAT', '#DCDCDC'),
('1K-4008', 'Fine Shining silver', '细闪银', '1K_SILVER_BASECOAT', '#AAAAAA'),
('1K-4009', 'Medium silver', '中银', '1K_SILVER_BASECOAT', '#B8B8B8'),
('1K-4010', 'Medium Shining silver', '中闪银', '1K_SILVER_BASECOAT', '#A8A8A8'),
('1K-4011', 'Medium Fine silver', '细白闪银', '1K_SILVER_BASECOAT', '#CCCCCC'),
('1K-4012', 'Medium Coarse silver', '中粗银', '1K_SILVER_BASECOAT', '#B0B0B0'),
('1K-4013', 'Coarse silver', '粗银', '1K_SILVER_BASECOAT', '#999999'),
('1K-4014', 'Coarse Shining silver', '特粗银', '1K_SILVER_BASECOAT', '#888888')
ON CONFLICT (code) DO NOTHING;

-- 1K Pearl Basecoat (36 条)
INSERT INTO public.toners (code, trade_name, name_zh, category, hex) VALUES
('1K-5001', 'Fine White pearl', '细白珍珠', '1K_PEARL_BASECOAT', '#FFF5EE'),
('1K-5002', 'super white pearl', '超白珍珠', '1K_PEARL_BASECOAT', '#FFF8F0'),
('1K-5003', 'Yellow and white resistant  pearl', '耐黄变超白珍珠', '1K_PEARL_BASECOAT', '#FFFFF0'),
('1K-5004', 'Coarse white pearl', '粗白珍珠', '1K_PEARL_BASECOAT', '#F5F0E8'),
('1K-5005', 'Red Pearl', '红珍珠', '1K_PEARL_BASECOAT', '#FF69B4'),
('1K-5006', 'Transparent Red Pearl', '干涉红珍珠', '1K_PEARL_BASECOAT', '#FF4080'),
('1K-5007', 'Crystal Purple Pearl', '水晶紫珍珠', '1K_PEARL_BASECOAT', '#DDA0DD'),
('1K-5008', 'Bright Red Pearl', '艳光红珍珠', '1K_PEARL_BASECOAT', '#FF3366'),
('1K-5009', 'Orange Red Pearl', '橙红珍珠', '1K_PEARL_BASECOAT', '#FF6B6B'),
('1K-5010', 'Golden Yellow Pearl', '黄金珍珠', '1K_PEARL_BASECOAT', '#FFD700'),
('1K-5011', 'Golden Yellow Pearl (green phase)', '黄金珍珠（绿相）', '1K_PEARL_BASECOAT', '#9ACD32'),
('1K-5012', 'Gold pearl', '干涉金黄珍珠', '1K_PEARL_BASECOAT', '#FFC125'),
('1K-5013', 'Green Pearl', '绿珍珠', '1K_PEARL_BASECOAT', '#98FF98'),
('1K-5014', 'Fine Green Pearl', '细绿珍珠', '1K_PEARL_BASECOAT', '#98FF98'),
('1K-5015', 'Blue Pearl', '蓝珍珠', '1K_PEARL_BASECOAT', '#87CEEB'),
('1K-5016', 'Fine Blue Pearl', '细蓝珍珠', '1K_PEARL_BASECOAT', '#87CEEB'),
('1K-5017', 'Blue Bright Silver', '蓝闪银', '1K_PEARL_BASECOAT', '#B0C4DE'),
('1K-5018', 'Purple pearl', '紫珍珠', '1K_PEARL_BASECOAT', '#D8BFD8'),
('1K-5019', 'Copper pearl', '铜珍珠', '1K_PEARL_BASECOAT', '#CD7F32'),
('1K-5020', 'Fine copper pearl', '细铜珍珠', '1K_PEARL_BASECOAT', '#CD7F32'),
('1K-5021', 'Middle Red Silver', '红中银', '1K_PEARL_BASECOAT', '#FF9999'),
('1K-5022', 'Gold Bright Silver', '金棕银', '1K_PEARL_BASECOAT', '#C5A35A'),
('1K-5023', 'Orange Red Silver', '橙红银', '1K_PEARL_BASECOAT', '#FF8855'),
('1K-5024', 'Crystal Green pearl', '水晶绿珍珠', '1K_PEARL_BASECOAT', '#7CCD7C'),
('1K-5025', 'Crystal Blue pearl', '水晶蓝珍珠（进口）', '1K_PEARL_BASECOAT', '#5B9BD5'),
('1K-5026', 'Crystal Red pearl', '水晶红珍珠', '1K_PEARL_BASECOAT', '#E06666'),
('1K-5027', 'Crystal white pearl', '水晶白珍珠', '1K_PEARL_BASECOAT', '#FFFFF5'),
('1K-5028', 'Super Crystal White Pearl', '水晶白珍珠（进口）', '1K_PEARL_BASECOAT', '#FFFFF5'),
('1K-5029', 'Crystal Gold Pearl', '水晶干涉金珍珠（进口）', '1K_PEARL_BASECOAT', '#EEC900'),
('1K-5030', 'Crystal Copper Pearl', '水晶铜珍珠（进口）', '1K_PEARL_BASECOAT', '#DA8A67'),
('1K-5031', 'HQ Crystal Blue Pearl', '电光蓝珍珠（进口）', '1K_PEARL_BASECOAT', '#4169E1'),
('1K-5032', 'Bright Blue Pearl', '艳蓝珍珠', '1K_PEARL_BASECOAT', '#4A90D9'),
('1K-5041', 'Glass Crystal White Pearl', '玻璃水晶白珍珠', '1K_PEARL_BASECOAT', '#FFFFF5'),
('1K-5042', 'White Pearl', '白珍珠', '1K_PEARL_BASECOAT', '#FFF5EE'),
('1K-5043', 'Small Grain White Pearl', '精细白珍珠', '1K_PEARL_BASECOAT', '#FFFAF0'),
('1K-5044', 'Fine Red Pearl', '细红珍珠', '1K_PEARL_BASECOAT', '#FF69B4')
ON CONFLICT (code) DO NOTHING;

-- 辅料 Supplementary (12 条)
INSERT INTO public.toners (code, trade_name, name_zh, category, hex) VALUES
('SUP-6001', 'Hardener (Fast)', '快干固化剂', 'SUPPLEMENTARY', '#E8E8E8'),
('SUP-6002', 'Hardener (Standard)', '标准固化剂', 'SUPPLEMENTARY', '#F0F0F0'),
('SUP-6003', 'Hardener (Slow)', '慢干固化剂', 'SUPPLEMENTARY', '#F5F5F5'),
('SUP-6004', 'Thinner (Fast)', '快干稀释剂', 'SUPPLEMENTARY', '#FAFAFA'),
('SUP-6005', 'Thinner (Standard)', '标准稀释剂', 'SUPPLEMENTARY', '#FCFCFC'),
('SUP-6006', 'Thinner (Slow)', '慢干稀释剂', 'SUPPLEMENTARY', '#F8F8F8'),
('SUP-6007', 'Clear Coat (High Gloss)', '高光清漆', 'SUPPLEMENTARY', '#E0E8F0'),
('SUP-6008', 'Clear Coat (Matte)', '哑光清漆', 'SUPPLEMENTARY', '#D8D8E0'),
('SUP-6009', 'Adhesion Promoter', '附着力促进剂/塑料底漆', 'SUPPLEMENTARY', '#FFF8DC'),
('SUP-6010', 'Primer (Grey)', '中涂底漆（灰）', 'SUPPLEMENTARY', '#C0C0C0'),
('SUP-6011', 'Primer (White)', '中涂底漆（白）', 'SUPPLEMENTARY', '#E8E8E8'),
('SUP-6012', 'Flex Additive', '柔软添加剂/保险杠专用', 'SUPPLEMENTARY', '#FFF0E0')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------
-- 5. 刷新 PostgREST schema cache
-- ---------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- 追加修复: 将 formula_types 中的 ID 同步到 color_variants
-- color_variant_map.variant_id FOREIGN KEY → color_variants(id)
-- 但管理后台通过 formula_types 表管理变体，导致 ID 不匹配
-- =====================================================================
INSERT INTO public.color_variants (id, name, year_range)
SELECT id, name, year_range FROM public.formula_types
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

NOTIFY pgrst, 'reload schema';
