import {
  CarMake,
  Color,
  ColorVariant,
  Formula,
  FormulaComponent,
  SearchParams,
  SearchResult,
} from "../types";

// ============================================================
// 车辆品牌
// ============================================================
export const mockCarMakes: CarMake[] = [
  { id: "toyota",    name: "Toyota",       region: "JPN" },
  { id: "bmw",       name: "BMW",          region: "EUR" },
  { id: "mercedes",  name: "Mercedes-Benz", region: "EUR" },
  { id: "honda",     name: "Honda",        region: "JPN" },
  { id: "volkswagen", name: "Volkswagen",  region: "EUR" },
];

// ============================================================
// 颜色变体
// ============================================================
const v_toy_std  = { id: "v_toy_std",  name: "Standard",    year_range: "2020-2024" };
const v_toy_pearl = { id: "v_toy_pearl", name: "Pearl Effect", year_range: "2020-2024" };
const v_bmw_std   = { id: "v_bmw_std",  name: "Standard",    year_range: "2018-2024" };
const v_bmw_var   = { id: "v_bmw_var",  name: "Individual",  year_range: "2019-2023" };
const v_merc_std  = { id: "v_merc_std", name: "Standard",    year_range: "2017-2024" };
const v_merc_met  = { id: "v_merc_met", name: "Metallic Finish", year_range: "2017-2024" };
const v_hon_std   = { id: "v_hon_std",  name: "Standard",    year_range: "2019-2024" };
const v_hon_pearl = { id: "v_hon_pearl", name: "Premium Pearl", year_range: "2019-2024" };
const v_vw_std    = { id: "v_vw_std",   name: "Standard",    year_range: "2015-2024" };
const v_vw_met    = { id: "v_vw_met",   name: "Metallic",    year_range: "2015-2024" };

// ============================================================
// 颜色
// ============================================================
export const mockColors: Color[] = [
  // ---- Toyota ----
  {
    id: "col_toy_040",
    make_id: "toyota",
    color_code: "040",
    color_name: "Super White / 超白",
    color_type: "solid",
    hex_preview: "#F8F8F5",
    variants: [v_toy_std],
  },
  {
    id: "col_toy_070",
    make_id: "toyota",
    color_code: "070",
    color_name: "Blizzard Pearl / 珍珠白",
    color_type: "pearl",
    hex_preview: "#F0F0E8",
    variants: [v_toy_std, v_toy_pearl],
  },
  {
    id: "col_toy_202",
    make_id: "toyota",
    color_code: "202",
    color_name: "Black / 纯黑",
    color_type: "solid",
    hex_preview: "#1A1A1A",
    variants: [v_toy_std],
  },
  {
    id: "col_toy_1G3",
    make_id: "toyota",
    color_code: "1G3",
    color_name: "Magnetic Gray Metallic / 金属灰",
    color_type: "metallic",
    hex_preview: "#7A7E82",
    variants: [v_toy_std],
  },
  {
    id: "col_toy_3R3",
    make_id: "toyota",
    color_code: "3R3",
    color_name: "Barcelona Red Metallic / 金属红",
    color_type: "metallic",
    hex_preview: "#C12B2B",
    variants: [v_toy_std, v_toy_pearl],
  },
  // ---- BMW ----
  {
    id: "col_bmw_300",
    make_id: "bmw",
    color_code: "300",
    color_name: "Alpine White / 阿尔卑斯白",
    color_type: "solid",
    hex_preview: "#F9F9F5",
    variants: [v_bmw_std],
  },
  {
    id: "col_bmw_475",
    make_id: "bmw",
    color_code: "475",
    color_name: "Black Sapphire Metallic / 宝石黑",
    color_type: "metallic",
    hex_preview: "#1C1C1E",
    variants: [v_bmw_std, v_bmw_var],
  },
  {
    id: "col_bmw_A96",
    make_id: "bmw",
    color_code: "A96",
    color_name: "Mineral White Metallic / 矿石白",
    color_type: "metallic",
    hex_preview: "#EEEEE8",
    variants: [v_bmw_std],
  },
  {
    id: "col_bmw_C31",
    make_id: "bmw",
    color_code: "C31",
    color_name: "Portimao Blue Metallic / 波尔蒂芒蓝",
    color_type: "metallic",
    hex_preview: "#1E4B8C",
    variants: [v_bmw_std, v_bmw_var],
  },
  {
    id: "col_bmw_P7S",
    make_id: "bmw",
    color_code: "P7S",
    color_name: "San Marino Blue / 圣马力诺蓝",
    color_type: "special",
    hex_preview: "#0D3B6E",
    variants: [v_bmw_var],
  },
  // ---- Mercedes-Benz ----
  {
    id: "col_merc_040",
    make_id: "mercedes",
    color_code: "040",
    color_name: "Black / 黑色",
    color_type: "solid",
    hex_preview: "#16181A",
    variants: [v_merc_std],
  },
  {
    id: "col_merc_149",
    make_id: "mercedes",
    color_code: "149",
    color_name: "Polar White / 极地白",
    color_type: "solid",
    hex_preview: "#F6F7F3",
    variants: [v_merc_std],
  },
  {
    id: "col_merc_775",
    make_id: "mercedes",
    color_code: "775",
    color_name: "Iridium Silver Metallic / 铱银色",
    color_type: "metallic",
    hex_preview: "#C0C4C8",
    variants: [v_merc_std, v_merc_met],
  },
  {
    id: "col_merc_996",
    make_id: "mercedes",
    color_code: "996",
    color_name: "Hyacinth Red Metallic / 风信子红",
    color_type: "metallic",
    hex_preview: "#8B2228",
    variants: [v_merc_met],
  },
  // ---- Honda ----
  {
    id: "col_hon_NH731P",
    make_id: "honda",
    color_code: "NH731P",
    color_name: "Crystal Black Pearl / 晶黑珍珠",
    color_type: "pearl",
    hex_preview: "#1B1B1F",
    variants: [v_hon_std, v_hon_pearl],
  },
  {
    id: "col_hon_NH883P",
    make_id: "honda",
    color_code: "NH883P",
    color_name: "Platinum White Pearl / 铂金白",
    color_type: "pearl",
    hex_preview: "#EFEFEA",
    variants: [v_hon_std, v_hon_pearl],
  },
  {
    id: "col_hon_B593M",
    make_id: "honda",
    color_code: "B593M",
    color_name: "Modern Steel Metallic / 现代钢",
    color_type: "metallic",
    hex_preview: "#828588",
    variants: [v_hon_std],
  },
  {
    id: "col_hon_R513",
    make_id: "honda",
    color_code: "R513",
    color_name: "Rallye Red / 拉力红",
    color_type: "solid",
    hex_preview: "#DA0B1E",
    variants: [v_hon_std],
  },
  {
    id: "col_hon_B592P",
    make_id: "honda",
    color_code: "B592P",
    color_name: "Sonic Gray Pearl / 音波灰",
    color_type: "pearl",
    hex_preview: "#9EA2A6",
    variants: [v_hon_std, v_hon_pearl],
  },
  // ---- Volkswagen ----
  {
    id: "col_vw_LB9A",
    make_id: "volkswagen",
    color_code: "LB9A",
    color_name: "Pure White / 纯白",
    color_type: "solid",
    hex_preview: "#F7F8F4",
    variants: [v_vw_std],
  },
  {
    id: "col_vw_L041",
    make_id: "volkswagen",
    color_code: "L041",
    color_name: "Deep Black Pearl / 深黑珍珠",
    color_type: "pearl",
    hex_preview: "#191A1D",
    variants: [v_vw_std, v_vw_met],
  },
  {
    id: "col_vw_LD7R",
    make_id: "volkswagen",
    color_code: "LD7R",
    color_name: "Oryx White Pearl / 羚羊白",
    color_type: "pearl",
    hex_preview: "#F0F1EB",
    variants: [v_vw_std, v_vw_met],
  },
  {
    id: "col_vw_LY3D",
    make_id: "volkswagen",
    color_code: "LY3D",
    color_name: "Tornado Red / 旋风红",
    color_type: "solid",
    hex_preview: "#C61226",
    variants: [v_vw_std],
  },
  {
    id: "col_vw_LH5X",
    make_id: "volkswagen",
    color_code: "LH5X",
    color_name: "Atlantic Blue Metallic / 大西洋蓝",
    color_type: "metallic",
    hex_preview: "#2A4A7E",
    variants: [v_vw_std, v_vw_met],
  },
  {
    id: "col_vw_LN1Z",
    make_id: "volkswagen",
    color_code: "LN1Z",
    color_name: "Indium Gray Metallic / 铟灰",
    color_type: "metallic",
    hex_preview: "#8A8D90",
    variants: [v_vw_met],
  },
];

// ============================================================
// 配方专用的色母组件辅助函数
// ============================================================
function comp(
  toner_code: string,
  toner_name: string,
  grams_per_100g: number,
): FormulaComponent {
  return { toner_code, toner_name, grams_per_100g, percentage: grams_per_100g };
}

// ============================================================
// 调漆配方
// ============================================================
export const mockFormulas: Formula[] = [
  // ---- Toyota 040 Super White ----
  {
    id: "fml_toy_040_std",
    color_id: "col_toy_040", variant_id: v_toy_std.id,
    version: "v1.0", paint_system: "2K",
    components: [
      comp("HW-2001", "Titanium White / 钛白",      60.0),
      comp("HW-3001", "Black / 黑色",                 0.5),
      comp("HW-5002", "Yellow Oxide / 氧化黄",        1.5),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   38.0),
    ],
    notes: "建议喷涂2遍底色，遮盖力优秀",
    updated_at: "2024-06-15",
  },
  // ---- Toyota 070 Blizzard Pearl ----
  {
    id: "fml_toy_070_std",
    color_id: "col_toy_070", variant_id: v_toy_std.id,
    version: "v1.1", paint_system: "2K",
    components: [
      comp("HW-2001", "Titanium White / 钛白",       55.0),
      comp("HW-2103", "Pearl White / 珍珠白",        12.0),
      comp("HW-3001", "Black / 黑色",                 0.8),
      comp("HW-5002", "Yellow Oxide / 氧化黄",        2.2),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   30.0),
    ],
    notes: "珍珠白需喷涂3遍底色 + 1遍清漆，侧视角度珍珠光泽明显",
    updated_at: "2024-07-20",
  },
  {
    id: "fml_toy_070_pearl",
    color_id: "col_toy_070", variant_id: v_toy_pearl.id,
    version: "v1.2", paint_system: "2K",
    components: [
      comp("HW-2001", "Titanium White / 钛白",       48.0),
      comp("HW-2103", "Pearl White / 珍珠白",        18.0),
      comp("HW-2105", "Crystal Pearl / 水晶珍珠",     5.0),
      comp("HW-3001", "Black / 黑色",                 0.5),
      comp("HW-5002", "Yellow Oxide / 氧化黄",        1.5),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   27.0),
    ],
    notes: "珍珠强化版，适合要求高光泽度的修复场景",
    updated_at: "2024-08-01",
  },
  // ---- BMW 475 Black Sapphire ----
  {
    id: "fml_bmw_475_std",
    color_id: "col_bmw_475", variant_id: v_bmw_std.id,
    version: "v2.0", paint_system: "2K",
    components: [
      comp("HW-3001", "Black / 黑色",                42.0),
      comp("HW-3102", "Carbon Black / 碳黑",          10.0),
      comp("HW-4101", "Metallic Flake Fine / 细银粉",  3.0),
      comp("HW-4202", "Blue Shade / 蓝相调节",         5.0),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",    40.0),
    ],
    notes: "细银粉需均匀分散，避免发花",
    updated_at: "2024-06-01",
  },
  {
    id: "fml_bmw_475_var",
    color_id: "col_bmw_475", variant_id: v_bmw_var.id,
    version: "v2.1", paint_system: "2K",
    components: [
      comp("HW-3001", "Black / 黑色",                45.0),
      comp("HW-3102", "Carbon Black / 碳黑",           8.0),
      comp("HW-4102", "Metallic Flake Medium / 中银粉", 2.5),
      comp("HW-4202", "Blue Shade / 蓝相调节",         3.5),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",    41.0),
    ],
    notes: "Individual 版本色母配比略有调整，偏冷调",
    updated_at: "2024-07-12",
  },
  // ---- BMW C31 Portimao Blue ----
  {
    id: "fml_bmw_C31_std",
    color_id: "col_bmw_C31", variant_id: v_bmw_std.id,
    version: "v1.0", paint_system: "2K",
    components: [
      comp("HW-4001", "Ultramarine Blue / 群青蓝",   35.0),
      comp("HW-4010", "Phthalo Blue / 酞菁蓝",       18.0),
      comp("HW-4101", "Metallic Flake Fine / 细银粉",  4.0),
      comp("HW-3001", "Black / 黑色",                 5.0),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   38.0),
    ],
    notes: "蓝色系银粉需低速搅拌防止发黑",
    updated_at: "2024-08-22",
  },
  {
    id: "fml_bmw_C31_var",
    color_id: "col_bmw_C31", variant_id: v_bmw_var.id,
    version: "v1.1", paint_system: "2K",
    components: [
      comp("HW-4001", "Ultramarine Blue / 群青蓝",   31.0),
      comp("HW-4010", "Phthalo Blue / 酞菁蓝",       20.0),
      comp("HW-4015", "Violet Shade / 紫相调节",      3.0),
      comp("HW-4102", "Metallic Flake Medium / 中银粉", 3.5),
      comp("HW-3001", "Black / 黑色",                 4.5),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   38.0),
    ],
    notes: "Individual 版本加入了紫相调节使颜色更饱满",
    updated_at: "2024-09-01",
  },
  // ---- Mercedes 775 Iridium Silver ----
  {
    id: "fml_merc_775_std",
    color_id: "col_merc_775", variant_id: v_merc_std.id,
    version: "v1.5", paint_system: "2K",
    components: [
      comp("HW-2001", "Titanium White / 钛白",       30.0),
      comp("HW-4102", "Metallic Flake Medium / 中银粉", 16.0),
      comp("HW-3001", "Black / 黑色",                 1.5),
      comp("HW-5003", "Red Oxide / 氧化红",            0.5),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   52.0),
    ],
    notes: "银粉含量较高，施工时注意持枪角度保持一致",
    updated_at: "2024-05-10",
  },
  {
    id: "fml_merc_775_met",
    color_id: "col_merc_775", variant_id: v_merc_met.id,
    version: "v1.6", paint_system: "2K",
    components: [
      comp("HW-2001", "Titanium White / 钛白",       28.0),
      comp("HW-4102", "Metallic Flake Medium / 中银粉", 18.0),
      comp("HW-4103", "Metallic Flake Coarse / 粗银粉",  2.0),
      comp("HW-3001", "Black / 黑色",                 1.0),
      comp("HW-5003", "Red Oxide / 氧化红",            0.5),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   50.5),
    ],
    notes: "加入了粗银粉增强金属质感",
    updated_at: "2024-06-20",
  },
  // ---- Honda NH731P Crystal Black Pearl ----
  {
    id: "fml_hon_NH731P_std",
    color_id: "col_hon_NH731P", variant_id: v_hon_std.id,
    version: "v1.3", paint_system: "2K",
    components: [
      comp("HW-3001", "Black / 黑色",                50.0),
      comp("HW-3102", "Carbon Black / 碳黑",          8.0),
      comp("HW-2101", "Pearl Blue / 珍珠蓝",          6.0),
      comp("HW-2102", "Pearl Green / 珍珠绿",         2.0),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   34.0),
    ],
    notes: "在强光下珍珠蓝绿色颗粒可见，建议喷涂2遍底色 + 清漆",
    updated_at: "2024-07-18",
  },
  {
    id: "fml_hon_NH731P_pearl",
    color_id: "col_hon_NH731P", variant_id: v_hon_pearl.id,
    version: "v1.4", paint_system: "2K",
    components: [
      comp("HW-3001", "Black / 黑色",                46.0),
      comp("HW-3102", "Carbon Black / 碳黑",          10.0),
      comp("HW-2101", "Pearl Blue / 珍珠蓝",          8.0),
      comp("HW-2102", "Pearl Green / 珍珠绿",         3.0),
      comp("HW-2104", "Glass Flake / 玻璃鳞片",       2.0),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   31.0),
    ],
    notes: "Premium Pearl 版加入玻璃鳞片增强闪烁效果",
    updated_at: "2024-08-10",
  },
  // ---- Honda R513 Rallye Red ----
  {
    id: "fml_hon_R513_std",
    color_id: "col_hon_R513", variant_id: v_hon_std.id,
    version: "v1.0", paint_system: "2K",
    components: [
      comp("HW-5001", "Bright Red / 亮红",           52.0),
      comp("HW-5003", "Red Oxide / 氧化红",           8.0),
      comp("HW-5004", "Magenta / 品红",               5.0),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   35.0),
    ],
    notes: "遮盖力偏弱，建议使用同色中涂底漆",
    updated_at: "2024-04-28",
  },
  // ---- VW LB9A Pure White ----
  {
    id: "fml_vw_LB9A_std",
    color_id: "col_vw_LB9A", variant_id: v_vw_std.id,
    version: "v1.0", paint_system: "2K",
    components: [
      comp("HW-2001", "Titanium White / 钛白",       62.0),
      comp("HW-3001", "Black / 黑色",                 0.3),
      comp("HW-5002", "Yellow Oxide / 氧化黄",        1.2),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   36.5),
    ],
    notes: "纯白配方，遮盖力强，2遍底色即可",
    updated_at: "2024-03-15",
  },
  // ---- VW L041 Deep Black Pearl ----
  {
    id: "fml_vw_L041_std",
    color_id: "col_vw_L041", variant_id: v_vw_std.id,
    version: "v1.2", paint_system: "2K",
    components: [
      comp("HW-3001", "Black / 黑色",                 48.0),
      comp("HW-3102", "Carbon Black / 碳黑",          8.0),
      comp("HW-2101", "Pearl Blue / 珍珠蓝",          5.0),
      comp("HW-2102", "Pearl Green / 珍珠绿",         1.0),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   38.0),
    ],
    notes: "标准黑珍珠效果，阳光下泛蓝绿光泽",
    updated_at: "2024-07-05",
  },
  {
    id: "fml_vw_L041_met",
    color_id: "col_vw_L041", variant_id: v_vw_met.id,
    version: "v1.3", paint_system: "1K",
    components: [
      comp("HW-3001", "Black / 黑色",                 52.0),
      comp("HW-3102", "Carbon Black / 碳黑",          6.0),
      comp("HW-2101", "Pearl Blue / 珍珠蓝",          4.0),
      comp("HW-2102", "Pearl Green / 珍珠绿",         1.5),
      comp("HW-9002", "1K Binder / 1K 树脂",         36.5),
    ],
    notes: "1K 版本，干燥速度快，适合快速修补",
    updated_at: "2024-08-15",
  },
  // ---- VW LH5X Atlantic Blue ----
  {
    id: "fml_vw_LH5X_std",
    color_id: "col_vw_LH5X", variant_id: v_vw_std.id,
    version: "v1.0", paint_system: "2K",
    components: [
      comp("HW-4010", "Phthalo Blue / 酞菁蓝",       30.0),
      comp("HW-4003", "Indanthrone Blue / 阴丹士林蓝", 15.0),
      comp("HW-4101", "Metallic Flake Fine / 细银粉",  5.0),
      comp("HW-3001", "Black / 黑色",                 4.0),
      comp("HW-5003", "Red Oxide / 氧化红",            1.0),
      comp("HW-9001", "Binder Resin / 树脂黏合剂",   45.0),
    ],
    notes: "标准配方，2遍底色即可",
    updated_at: "2024-06-28",
  },
];

// ============================================================
// 搜索函数：按品牌、颜色代码、颜色名称、类型、年份模糊匹配
// ============================================================
export function getMockSearchResults(params: SearchParams): SearchResult[] {
  let filteredColors = mockColors;

  // 按品牌过滤
  if (params.make_id) {
    filteredColors = filteredColors.filter(
      (c) => c.make_id === params.make_id,
    );
  }

  // 按颜色代码模糊匹配
  if (params.color_code) {
    const code = params.color_code.toUpperCase();
    filteredColors = filteredColors.filter((c) =>
      c.color_code.toUpperCase().includes(code),
    );
  }

  // 按颜色名称模糊匹配（匹配中文或英文部分）
  if (params.color_name) {
    const name = params.color_name.toLowerCase();
    filteredColors = filteredColors.filter((c) =>
      c.color_name.toLowerCase().includes(name),
    );
  }

  // 按颜色类型过滤
  if (params.color_type) {
    filteredColors = filteredColors.filter(
      (c) => c.color_type === params.color_type,
    );
  }

  // 按年份过滤（与变体的 year_range 模糊匹配）
  if (params.year) {
    filteredColors = filteredColors.filter((c) =>
      c.variants.some((v) => v.year_range.includes(params.year!)),
    );
  }

  // 组装结果：每个颜色匹配它拥有的配方
  return filteredColors.map((color) => ({
    color,
    formulas: mockFormulas.filter((f) => f.color_id === color.id),
  }));
}
