
// ============================================================
// 漆面类型映射：值 → { 中文标签, Badge 样式 }
// ============================================================
export const COLOR_TYPE_MAP: Record<
  string,
  { label: string; badge: string }
> = {
  solid:    { label: "实色",   badge: "bg-slate-100 text-slate-700" },
  metallic: { label: "金属漆", badge: "bg-blue-50 text-blue-700" },
  pearl:    { label: "珠光漆", badge: "bg-violet-50 text-violet-700" },
  matte:    { label: "哑光",   badge: "bg-gray-100 text-gray-700" },
  candy:    { label: "糖果漆", badge: "bg-amber-50 text-amber-700" },
  special:  { label: "特殊漆", badge: "bg-rose-50 text-rose-700" },
};

// ============================================================
// 漆面类型选项（供搜索面板 Toggle 使用）
// ============================================================
export const COLOR_TYPE_OPTIONS = [
  { value: "", label: "All / 全部" },
  { value: "solid", label: "Solid / 实色" },
  { value: "metallic", label: "Metallic / 金属" },
  { value: "pearl", label: "Pearl / 珠光" },
  { value: "matte", label: "Matte / 哑光" },
  { value: "candy", label: "Candy / 糖果" },
] as const;

// ============================================================
// 搜索结果上限
// ============================================================
export const MAX_SEARCH_RESULTS = 20;
