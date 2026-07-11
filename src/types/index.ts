// 车辆品牌
export interface CarMake {
  id: string
  name: string          // 例如 "Toyota"、"BMW"
  region: "JPN" | "EUR" | "USA" | "CHN" | "KOR"
}

// 颜色变体（同一颜色代码在不同批次/工厂可能有微小差异）
export interface ColorVariant {
  id: string
  name: string           // 例如 "Standard"、"Pearl Effect"
  year_range: string     // 例如 "2018-2022"
}

// 颜色（每个车厂的 OEM 颜色）
export interface Color {
  id: string
  make_id: string
  color_code: string      // 官方颜色代码，例如 "040" "NH731P"
  color_name: string      // 中英文颜色名，例如 "Super White / 超白"
  color_type: "solid" | "metallic" | "pearl" | "matte" | "candy" | "special"
  hex_preview: string     // 颜色预览 hex，例如 "#F5F5F0"
  variants: ColorVariant[]
}

// 调漆配方中的单个色母用量
export interface FormulaComponent {
  toner_code: string      // 色母编号，例如 "HW-2001"
  toner_name: string      // 色母名称，例如 "Titanium White"
  percentage: number      // 在总配方中的百分比，例如 45.5
  grams_per_100g: number  // 每 100g 总漆的用量克数
  density?: number        // 密度
  rgb_r?: number          // RGB Red
  rgb_g?: number          // RGB Green
  rgb_b?: number          // RGB Blue
}

// 完整调漆配方
export interface Formula {
  id: string
  color_id: string
  variant_id: string
  version: string          // 配方版本号，例如 "v1.2"
  paint_system: "1K" | "2K"  // 1K 还是 2K 体系
  formula_type: "Basecoat" | "Clearcoat" | "Single Stage" | "Primer" | "Topcoat"
  components: FormulaComponent[]
  notes: string            // 施工备注，例如 "建议喷涂2遍底色"
  updated_at: string
}

// 搜索参数
export interface SearchParams {
  make_id?: string
  color_code?: string
  color_name?: string
  color_type?: string
  year?: string
}

// 搜索结果
export interface SearchResult {
  color: Color
  formulas: Formula[]
}

// 表格行：每个配方一行（展平 SearchResult）
export interface FormulaTableRow {
  color: Color
  formula: Formula
  variant: ColorVariant | undefined  // 通过 formula.variant_id 在 color.variants 中查找
  makeName: string                    // 通过 brands 解析 make_id -> name
}

// 系统设置
export interface AppSettings {
  finishes: string[]
  types: string[]
  yearMin: number
  yearMax: number
}

// 应用指南分类
export interface GuideCategory {
  id: string
  name: string           // 英文分类名
  nameZh: string         // 中文分类名
  sortOrder: number
}

// 色母分类
export type TonerCategory = "2K_BASECOAT" | "1K_BASECOAT" | "1K_SILVER_BASECOAT" | "1K_PEARL_BASECOAT";

// 色母
export interface Toner {
  code: string            // 色母编号，例如 "2K-2001"
  tradeName: string       // 英文商品名，例如 "White"
  nameZh: string          // 中文品名，例如 "纯白"
  category: TonerCategory
  hex: string             // 颜色预览 hex，例如 "#FFFFFF"
}

// 应用指南文章
export interface Guide {
  id: string
  categoryId: string
  title: string          // 英文标题
  titleZh: string        // 中文标题
  content: string        // 英文正文
  contentZh: string      // 中文正文
  sortOrder: number
  updatedAt: string
}
