// ============================================================
// 国际化文案中英对照表
// ============================================================

export type Lang = "en" | "zh" | "de" | "fr" | "es" | "it" | "ru" | "ar" | "tr" | "he" | "nl" | "pt";

export const i18n = {
  en: {
    // Header
    brandName: "HIWE Formula Search",
    brandNameShort: "HIWE",
    navSearch: "Search",
    navProducts: "Products",
    navAbout: "About",
    langEN: "EN",
    langZH: "中文",

    // SearchPanel
    panelTitle: "Formula Search",
    make: "Make",
    colorCode: "Color Code",
    colorName: "Color Name",
    colorType: "Color Type",
    allMakes: "All Makes",
    colorTypeAll: "All",
    colorTypeSolid: "Solid",
    colorTypeMetallic: "Metallic",
    colorTypePearl: "Pearl",
    search: "Search",
    searching: "Searching...",
    reset: "Reset",
    codeTooLong: "Color code is usually <= 10 chars, please check",
    colorCodePlaceholder: "e.g. 040, NH731P",
    colorNamePlaceholder: "e.g. Super White",
    year: "Year",
    yearPlaceholder: "e.g. 2020 or 2018-2022",

    // ColorCard
    formulasCount: (n: number) => `${n} formula${n > 1 ? "s" : ""}`,
    detail: "Detail",
    expand: "Expand",
    collapse: "Collapse",
    version: "Version",
    paintSystemNotes: "Notes",

    // FormulaComponentsTable
    volume: "Volume",
    tonerCode: "Toner Code",
    tonerName: "Toner Name",
    percentage: "Percentage(%)",
    actualAmount: "Actual Amount(g)",

    // FormulaDrawer
    colorInfo: "Color Info",
    formulaVariants: "Formula Variants",
    components: "Components",
    makeLabel: "Make",
    typeLabel: "Type",
    yearsLabel: "Years",
    codeLabel: "Code",
    print: "Print",
    copy: "Copy",
    notesLabel: "Notes",
    updatedLabel: "Updated",
    colorTypeSolidLabel: "Solid",
    colorTypeMetallicLabel: "Metallic",
    colorTypePearlLabel: "Pearl",
    colorTypeSpecialLabel: "Special",
    copySuccess: "Copied to clipboard",
    copyFail: "Copy failed, please retry",

    // SearchResults
    searchHint: "Enter search criteria on the left",
    noResults: "No matching colors found",
    noResultsHint: "Try a different make or color code",
    foundCount: (n: number) => `Found ${n} color${n > 1 ? "s" : ""}`,
    truncatedHint: (max: number) =>
      `Showing first ${max} results. Please refine your search.`,
    totalFormula: (c: number, f: number) =>
      `Found ${c} color${c > 1 ? "s" : ""}, ${f} formula${f > 1 ? "s" : ""}`,
    colorsBadge: (n: number) => `${n} Colors`,
    formulasBadge: (n: number) => `${n} Formulas`,
  },

  zh: {
    brandName: "HIWE 配方搜索",
    brandNameShort: "HIWE",
    navSearch: "配方搜索",
    navProducts: "产品",
    navAbout: "关于",
    langEN: "EN",
    langZH: "中文",

    panelTitle: "配方搜索",
    make: "品牌",
    colorCode: "颜色代码",
    colorName: "颜色名称",
    colorType: "漆面类型",
    allMakes: "全部品牌",
    colorTypeAll: "全部",
    colorTypeSolid: "实色",
    colorTypeMetallic: "金属",
    colorTypePearl: "珠光",
    search: "搜索",
    searching: "搜索中...",
    reset: "重置",
    codeTooLong: "颜色代码通常不超过 10 个字符，请检查输入",
    colorCodePlaceholder: "例如 040, NH731P",
    colorNamePlaceholder: "例如 Super White, 珍珠白",
    year: "年份",
    yearPlaceholder: "例如 2020 或 2018-2022",

    formulasCount: (n: number) => `${n} 个配方`,
    detail: "详情",
    expand: "展开",
    collapse: "收起",
    version: "版本",
    paintSystemNotes: "备注",

    volume: "用量",
    tonerCode: "色母编号",
    tonerName: "色母名称",
    percentage: "百分比(%)",
    actualAmount: "实际用量(g)",

    colorInfo: "颜色信息",
    formulaVariants: "配方变体",
    components: "配方成分",
    makeLabel: "品牌",
    typeLabel: "类型",
    yearsLabel: "适用年份",
    codeLabel: "颜色代码",
    print: "打印配方",
    copy: "复制为文本",
    notesLabel: "备注",
    updatedLabel: "更新于",
    colorTypeSolidLabel: "实色",
    colorTypeMetallicLabel: "金属漆",
    colorTypePearlLabel: "珠光漆",
    colorTypeSpecialLabel: "特殊漆",
    copySuccess: "已复制到剪贴板",
    copyFail: "复制失败，请重试",

    searchHint: "请在左侧输入搜索条件",
    noResults: "未找到匹配的颜色配方",
    noResultsHint: "请尝试更换品牌或颜色代码",
    foundCount: (n: number) => `找到 ${n} 个匹配颜色`,
    truncatedHint: (max: number) => `显示前 ${max} 条结果，请细化搜索条件`,
    totalFormula: (c: number, f: number) =>
      `找到 ${c} 个颜色，共 ${f} 个配方`,
    colorsBadge: (n: number) => `${n} 个颜色`,
    formulasBadge: (n: number) => `${n} 个配方`,
  },
} as const satisfies Record<string, unknown>;
