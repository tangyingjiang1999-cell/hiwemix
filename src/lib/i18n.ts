// ============================================================
// 国际化文案 — 支持 12 种语言
// ============================================================

export type Lang = "en" | "zh" | "fr" | "ru" | "ar" | "es" | "pt" | "it" | "sl" | "he" | "de" | "tr" | "nl";

// 语言元信息：显示名、国旗 ISO 代码（用于 SVG 图标）、文本方向
export interface LangMeta {
  code: Lang;
  name: string;       // 用当地文字显示
  flag: string;       // 国旗 ISO 3166-1 alpha-2 代码，如 "GB"
  dir: "ltr" | "rtl";
}

export const LANGS: LangMeta[] = [
  { code: "en", name: "English",   flag: "GB", dir: "ltr" },
  { code: "zh", name: "中文",      flag: "CN", dir: "ltr" },
  { code: "fr", name: "Français",  flag: "FR", dir: "ltr" },
  { code: "de", name: "Deutsch",   flag: "DE", dir: "ltr" },
  { code: "es", name: "Español",   flag: "ES", dir: "ltr" },
  { code: "pt", name: "Português", flag: "PT", dir: "ltr" },
  { code: "it", name: "Italiano",  flag: "IT", dir: "ltr" },
  { code: "ru", name: "Русский",   flag: "RU", dir: "ltr" },
  { code: "sl", name: "Slovenščina", flag: "SI", dir: "ltr" },
  { code: "tr", name: "Türkçe",    flag: "TR", dir: "ltr" },
  { code: "he", name: "עברית",     flag: "IL", dir: "rtl" },
  { code: "ar", name: "العربية",   flag: "SA", dir: "rtl" },
];

// 单一文案结构（必须 12 种语言都提供所有 key）
interface I18nDict {
  // Header
  brandName: string;
  brandNameShort: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  navSearch: string;
  navProducts: string;
  navAbout: string;

  // Navigation
  navFormulaSearch: string;
  navColorLibrary: string;
  navAppGuide: string;
  navAdmin: string;
  userManagement: string;
  logout: string;

  // Login
  loginWelcome: string;
  loginSubtitle: string;
  loginEmail: string;
  loginPassword: string;
  loginPlaceholderEmail: string;
  loginPlaceholderPassword: string;
  loginButton: string;
  loginSigningIn: string;
  login: string;
  close: string;
  brandSlogan: string;
  officialWebsite: string;
  loginMobileTitle: string;
  loginErrorEmpty: string;
  loginErrorNetwork: string;
  loginErrorFailed: string;
  loginRegisterLink: string;
  registerWelcome: string;
  registerSubtitle: string;
  registerTitle: string;
  registerButton: string;
  registerConfirmLabel: string;
  registerConfirmPlaceholder: string;
  registerSuccess: string;
  backToLogin: string;
  haveAccount: string;
  loginLink: string;
  registerErrorExists: string;
  registerErrorFormat: string;
  registerErrorPassword: string;
  registerErrorMismatch: string;
  registerLoginLink: string;
  registerErrorFailed: string;

  // SearchPanel
  panelTitle: string;
  make: string;
  colorCode: string;
  colorName: string;
  colorType: string;
  allMakes: string;
  colorTypeAll: string;
  colorTypeSolid: string;
  colorTypeMetallic: string;
  colorTypePearl: string;
  colorTypeMatte: string;
  colorTypeCandy: string;
  search: string;
  searching: string;
  reset: string;
  codeTooLong: string;
  colorCodePlaceholder: string;
  colorNamePlaceholder: string;
  year: string;
  yearPlaceholder: string;

  // ColorCard
  formulasCount: (n: number) => string;
  detail: string;
  expand: string;
  collapse: string;
  version: string;
  paintSystemNotes: string;

  // FormulaComponentsTable
  volume: string;
  tonerCode: string;
  tonerName: string;
  percentage: string;
  actualAmount: string;

  // FormulaDrawer
  colorInfo: string;
  formulaVariants: string;
  components: string;
  makeLabel: string;
  typeLabel: string;
  yearsLabel: string;
  codeLabel: string;
  print: string;
  copy: string;
  notesLabel: string;
  updatedLabel: string;
  colorTypeSolidLabel: string;
  colorTypeMetallicLabel: string;
  colorTypePearlLabel: string;
  colorTypeMatteLabel: string;
  colorTypeCandyLabel: string;
  colorTypeSpecialLabel: string;
  copySuccess: string;
  copyFail: string;

  // Kapci-style formula modal
  weight: string;
  accum: string;
  massTone: string;
  colorPreview: string;
  hexInputLabel: string;
  tabColorInfo: string;
  tabColorDocs: string;
  tabPlasticParts: string;
  manufacturerLabel: string;
  emptyState: string;
  totalWeightLabel: string;

  // SearchResults
  searchHint: string;
  noResults: string;
  noResultsHint: string;
  foundCount: (n: number) => string;
  truncatedHint: (max: number) => string;
  totalFormula: (c: number, f: number) => string;
  colorsBadge: (n: number) => string;
  formulasBadge: (n: number) => string;

  // SearchResults table
  versionLabel: string;
  pageSizeLabel: string;
  previousPage: string;
  nextPage: string;
  pageOf: (current: number, total: number) => string;
  foundFormulas: (n: number) => string;

  // Guide
  guideSearchPlaceholder: string;
  guideCategories: string;
  guideAllCategories: string;
  guideListLabel: string;
  guideSelectHint: string;

  // Admin (User Management)
  adminTitle: string;
  adminNewUser: string;
  adminNoPermission: string;
  adminPasswordRequired: string;
  adminCannotDeleteAdmin: string;
  adminLoading: string;
  adminColId: string;
  adminColUsername: string;
  adminColRole: string;
  adminColCreatedAt: string;
  adminColActions: string;
  adminRoleAdmin: string;
  adminRoleUser: string;
  adminEdit: string;
  adminDelete: string;
  adminEditTitle: string;
  adminLabelPassword: string;
  adminPasswordHint: string;
  adminPasswordPlaceholder: string;
  adminLabelRole: string;
  adminCancel: string;
  adminSave: string;
  adminCreate: string;
  adminConfirmDelete: (username: string) => string;
}

// 通用复数（粗略按 n>1 处理）
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

const dict = (d: Omit<I18nDict,
  "formulasCount" | "foundCount" | "truncatedHint" | "totalFormula" | "colorsBadge" | "formulasBadge"
  | "loginEmail" | "loginPlaceholderEmail"
  | "loginRegisterLink" | "registerWelcome" | "registerSubtitle" | "registerTitle"
  | "registerButton" | "registerConfirmLabel" | "registerConfirmPlaceholder" | "registerSuccess"
  | "registerErrorExists" | "registerErrorFormat" | "registerErrorPassword" | "registerErrorMismatch"
  | "registerLoginLink" | "registerErrorFailed" | "backToLogin" | "haveAccount" | "loginLink"
  | "weight" | "accum" | "massTone" | "colorPreview" | "hexInputLabel"
  | "tabColorInfo" | "tabColorDocs" | "tabPlasticParts"
  | "manufacturerLabel" | "emptyState" | "totalWeightLabel"
  | "versionLabel" | "pageSizeLabel" | "previousPage" | "nextPage" | "pageOf" | "foundFormulas"
> & {
  formulasCount?: (n: number) => string;
  foundCount?: (n: number) => string;
  truncatedHint?: (max: number) => string;
  totalFormula?: (c: number, f: number) => string;
  colorsBadge?: (n: number) => string;
  formulasBadge?: (n: number) => string;
  loginEmail?: string;
  loginPlaceholderEmail?: string;
  loginRegisterLink?: string;
  registerWelcome?: string;
  registerSubtitle?: string;
  registerTitle?: string;
  registerButton?: string;
  registerConfirmLabel?: string;
  registerConfirmPlaceholder?: string;
  registerSuccess?: string;
  backToLogin?: string;
  haveAccount?: string;
  loginLink?: string;
  registerErrorExists?: string;
  registerErrorFormat?: string;
  registerErrorPassword?: string;
  registerErrorMismatch?: string;
  registerLoginLink?: string;
  registerErrorFailed?: string;
  weight?: string;
  accum?: string;
  massTone?: string;
  colorPreview?: string;
  hexInputLabel?: string;
  tabColorInfo?: string;
  tabColorDocs?: string;
  tabPlasticParts?: string;
  manufacturerLabel?: string;
  emptyState?: string;
  totalWeightLabel?: string;
  versionLabel?: string;
  pageSizeLabel?: string;
  previousPage?: string;
  nextPage?: string;
  pageOf?: (current: number, total: number) => string;
  foundFormulas?: (n: number) => string;
}): I18nDict => ({
  formulasCount: d.formulasCount ?? ((n) => plural(n, "formula", "formulas")),
  foundCount: d.foundCount ?? ((n) => `Found ${n} color${n > 1 ? "s" : ""}`),
  truncatedHint: d.truncatedHint ?? ((max) => `Showing first ${max} results. Please refine your search.`),
  totalFormula: d.totalFormula ?? ((c, f) => `Found ${c} color${c > 1 ? "s" : ""}, ${f} formula${f > 1 ? "s" : ""}`),
  colorsBadge: d.colorsBadge ?? ((n) => `${n} Colors`),
  formulasBadge: d.formulasBadge ?? ((n) => `${n} Formulas`),
  // 登录标签与注册相关文案：默认英文，各语言可覆盖（见 zh）
  loginEmail: d.loginEmail ?? "Username",
  loginPlaceholderEmail: d.loginPlaceholderEmail ?? "Enter your username",
  loginRegisterLink: d.loginRegisterLink ?? "No account? Register",
  registerWelcome: d.registerWelcome ?? "Welcome New Friend",
  registerSubtitle: d.registerSubtitle ?? "Create your account to get started",
  registerTitle: d.registerTitle ?? "Create account",
  registerButton: d.registerButton ?? "Register",
  registerConfirmLabel: d.registerConfirmLabel ?? "Confirm Password",
  registerConfirmPlaceholder: d.registerConfirmPlaceholder ?? "Re-enter password",
  registerSuccess: d.registerSuccess ?? "Registration successful, signing in...",
  registerErrorExists: d.registerErrorExists ?? "Username already exists",
  registerErrorFormat: d.registerErrorFormat ?? "Username must be 3-20 chars: start with a letter, only letters/numbers/_",
  registerErrorPassword: d.registerErrorPassword ?? "Password must be at least 8 characters",
  registerErrorMismatch: d.registerErrorMismatch ?? "Passwords do not match",
  registerLoginLink: d.registerLoginLink ?? "Already have an account? Sign in",
  registerErrorFailed: d.registerErrorFailed ?? "Registration failed",
  backToLogin: d.backToLogin ?? "Back to login",
  haveAccount: d.haveAccount ?? "Already have an account?",
  loginLink: d.loginLink ?? "Log in",
  // Kapci-style formula modal defaults
  weight: d.weight ?? "Weight",
  accum: d.accum ?? "Accum",
  massTone: d.massTone ?? "Mass Tone",
  colorPreview: d.colorPreview ?? "Color Preview",
  hexInputLabel: d.hexInputLabel ?? "Hex Color",
  tabColorInfo: d.tabColorInfo ?? "Color Information",
  tabColorDocs: d.tabColorDocs ?? "Color Documents",
  tabPlasticParts: d.tabPlasticParts ?? "Plastic Parts",
  manufacturerLabel: d.manufacturerLabel ?? "Manufacturer",
  emptyState: d.emptyState ?? "No data available",
  totalWeightLabel: d.totalWeightLabel ?? "Total",
  versionLabel: d.versionLabel ?? "Version",
  pageSizeLabel: d.pageSizeLabel ?? "Rows per page",
  previousPage: d.previousPage ?? "Previous",
  nextPage: d.nextPage ?? "Next",
  pageOf: d.pageOf ?? ((current, total) => `Page ${current} of ${total}`),
  foundFormulas: d.foundFormulas ?? ((n) => `Found ${n} formula${n > 1 ? "s" : ""}`),
  ...d,
});

export const i18n: Record<Lang, I18nDict> = {
  // ========== English ==========
  en: dict({
    brandName: "HIWE Formula Search",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Find Your",
    heroTitleHighlight: "Perfect Match",
    login: "Login",
    close: "Close",
    brandSlogan: "CAR REFINISH FORMULA SYSTEM",
    officialWebsite: "Official website",
    loginMobileTitle: "Welcome to HAIWEN",
    guideSearchPlaceholder: "Search guides...",
    guideCategories: "Categories",
    guideAllCategories: "All Categories",
    guideListLabel: "Guide List",
    guideSelectHint: "Please select a guide from the left",
    navSearch: "Search", navProducts: "Products", navAbout: "About",

    navFormulaSearch: "Formula Search",
    navColorLibrary: "Toner",
    navAppGuide: "Application Guide",
    navAdmin: "Data Management",
    userManagement: "User Management",
    logout: "Logout",

    loginWelcome: "Welcome back",
    loginSubtitle: "Enter your credentials to access the system",
    loginEmail: "Username",
    loginPassword: "Password",
    loginPlaceholderEmail: "Enter your username",
    loginPlaceholderPassword: "Enter your password",
    loginButton: "Get started",
    loginSigningIn: "Signing in...",
    loginErrorEmpty: "Please enter username and password",
    loginErrorNetwork: "Network error, please retry",
    loginErrorFailed: "Login failed",
    loginRegisterLink: "No account? Register",
    registerWelcome: "Welcome New Friend",
    registerSubtitle: "Create your account to get started",
    registerTitle: "Create account",
    registerButton: "Register",
    registerConfirmLabel: "Confirm Password",
    registerConfirmPlaceholder: "Re-enter password",
    registerSuccess: "Registration successful, signing in...",
    registerErrorExists: "Username already exists",
    registerErrorFormat: "Username must be 3-20 chars: start with a letter, only letters/numbers/_",
    registerErrorPassword: "Password must be at least 8 characters",
    registerErrorMismatch: "Passwords do not match",
    registerLoginLink: "Already have an account? Sign in",
    registerErrorFailed: "Registration failed",
    backToLogin: "Back to login",
    haveAccount: "Already have an account?",
    loginLink: "Log in",

    panelTitle: "Formula Search",
    make: "Make", colorCode: "Color Code", colorName: "Color Name", colorType: "Color Type",
    allMakes: "All Makes",
    colorTypeAll: "All", colorTypeSolid: "Solid", colorTypeMetallic: "Metallic",
    colorTypePearl: "Pearl", colorTypeMatte: "Matte", colorTypeCandy: "Candy",
    search: "Search", searching: "Searching...", reset: "Reset",
    codeTooLong: "Color code is usually <= 10 chars, please check",
    colorCodePlaceholder: "e.g. 040, NH731P",
    colorNamePlaceholder: "e.g. Super White",
    year: "Year", yearPlaceholder: "e.g. 2020 or 2018-2022",

    detail: "Detail", expand: "Expand", collapse: "Collapse",
    version: "Version", paintSystemNotes: "Notes",

    volume: "Volume", tonerCode: "Toner Code", tonerName: "Toner Name",
    percentage: "Percentage(%)", actualAmount: "Actual Amount(g)",

    colorInfo: "Color Info", formulaVariants: "Formula Variants", components: "Components",
    makeLabel: "Make", typeLabel: "Type", yearsLabel: "Years", codeLabel: "Code",
    print: "Print", copy: "Copy", notesLabel: "Notes", updatedLabel: "Updated",
    colorTypeSolidLabel: "Solid", colorTypeMetallicLabel: "Metallic", colorTypePearlLabel: "Pearl",
    colorTypeMatteLabel: "Matte", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Special",
    copySuccess: "Copied to clipboard", copyFail: "Copy failed, please retry",

    weight: "Weight", accum: "Accum", massTone: "Mass Tone",
    colorPreview: "Color Preview", hexInputLabel: "Hex Color",
    tabColorInfo: "Color Information", tabColorDocs: "Color Documents", tabPlasticParts: "Plastic Parts",
    manufacturerLabel: "Manufacturer", emptyState: "No data available", totalWeightLabel: "Total",
    versionLabel: "Version", pageSizeLabel: "Rows per page", previousPage: "Previous", nextPage: "Next",
    pageOf: (current, total) => `Page ${current} of ${total}`,
    foundFormulas: (n) => `Found ${n} formula${n > 1 ? "s" : ""}`,

    searchHint: "Enter search criteria on the left",
    noResults: "No matching colors found",
    noResultsHint: "Try a different make or color code",
    adminTitle: "User List",
    adminNewUser: "New User",
    adminNoPermission: "No permission to access",
    adminPasswordRequired: "Password is required for new user",
    adminCannotDeleteAdmin: "Cannot delete super admin",
    adminLoading: "Loading...",
    adminColId: "ID",
    adminColUsername: "Username",
    adminColRole: "Role",
    adminColCreatedAt: "Created At",
    adminColActions: "Actions",
    adminRoleAdmin: "Admin",
    adminRoleUser: "User",
    adminEdit: "Edit",
    adminDelete: "Delete",
    adminEditTitle: "Edit User",
    adminLabelPassword: "Password",
    adminPasswordHint: "Leave blank to keep unchanged",
    adminPasswordPlaceholder: "Leave blank to keep unchanged",
    adminLabelRole: "Role",
    adminCancel: "Cancel",
    adminSave: "Save",
    adminCreate: "Create",
    adminConfirmDelete: (username: string) => `Are you sure you want to delete user "${username}"?`,
  }),

  // ========== 中文 ==========
  zh: dict({
    brandName: "HIWE 配方搜索",
    brandNameShort: "HIWE",
    heroTitlePrefix: "寻找你的",
    heroTitleHighlight: "完美匹配",
    login: "登录",
    close: "关闭",
    brandSlogan: "汽车修补漆配方系统",
    officialWebsite: "官方网站",
    loginMobileTitle: "欢迎使用 HAIWEN",
    guideSearchPlaceholder: "搜索指南...",
    guideCategories: "分类",
    guideAllCategories: "全部分类",
    guideListLabel: "指南列表",
    guideSelectHint: "请从左侧选择指南",
    navSearch: "配方搜索", navProducts: "产品", navAbout: "关于",

    navFormulaSearch: "Formula Search",
    navColorLibrary: "Toner",
    navAppGuide: "Application Guide",
    navAdmin: "Data Management",
    userManagement: "用户管理",
    logout: "退出",

    loginWelcome: "欢迎回来",
    loginSubtitle: "请输入账号信息登录系统",
    loginPassword: "密码",
    loginPlaceholderPassword: "请输入密码",
    loginButton: "登录", loginSigningIn: "登录中...",
    loginErrorEmpty: "请输入用户名和密码",
    loginErrorNetwork: "网络错误，请重试",
    loginErrorFailed: "登录失败",
    loginEmail: "用户名",
    loginPlaceholderEmail: "请输入用户名",
    loginRegisterLink: "还没有账号？立即注册",
    registerWelcome: "欢迎新朋友",
    registerSubtitle: "创建账号开始使用",
    registerTitle: "注册账号",
    registerButton: "注册",
    registerConfirmLabel: "确认密码",
    registerConfirmPlaceholder: "请再次输入密码",
    registerSuccess: "注册成功，正在登录...",
    registerErrorExists: "该用户名已被注册",
    registerErrorFormat: "用户名需 3-20 位：以字母开头，仅含字母、数字、下划线",
    registerErrorPassword: "密码至少 8 位",
    registerErrorMismatch: "两次输入的密码不一致",
    registerLoginLink: "已有账号？去登录",
    registerErrorFailed: "注册失败",
    backToLogin: "返回登录",
    haveAccount: "已有账号？",
    loginLink: "去登录",

    panelTitle: "配方搜索",
    make: "品牌", colorCode: "颜色代码", colorName: "颜色名称", colorType: "漆面类型",
    allMakes: "全部品牌",
    colorTypeAll: "全部", colorTypeSolid: "实色", colorTypeMetallic: "金属",
    colorTypePearl: "珠光", colorTypeMatte: "哑光", colorTypeCandy: "糖果漆",
    search: "搜索", searching: "搜索中...", reset: "重置",
    codeTooLong: "颜色代码通常不超过 10 个字符，请检查输入",
    colorCodePlaceholder: "例如 040, NH731P",
    colorNamePlaceholder: "例如 Super White, 珍珠白",
    year: "年份", yearPlaceholder: "例如 2020 或 2018-2022",

    detail: "详情", expand: "展开", collapse: "收起",
    version: "版本", paintSystemNotes: "备注",

    volume: "用量", tonerCode: "色母编号", tonerName: "色母名称",
    percentage: "百分比(%)", actualAmount: "实际用量(g)",

    colorInfo: "颜色信息", formulaVariants: "配方变体", components: "配方成分",
    makeLabel: "品牌", typeLabel: "类型", yearsLabel: "适用年份", codeLabel: "颜色代码",
    print: "打印配方", copy: "复制为文本", notesLabel: "备注", updatedLabel: "更新于",
    colorTypeSolidLabel: "实色", colorTypeMetallicLabel: "金属漆", colorTypePearlLabel: "珠光漆",
    colorTypeMatteLabel: "哑光", colorTypeCandyLabel: "糖果漆", colorTypeSpecialLabel: "特殊漆",
    copySuccess: "已复制到剪贴板", copyFail: "复制失败，请重试",

    weight: "用量(g)", accum: "累计(g)", massTone: "色相",
    colorPreview: "颜色预览", hexInputLabel: "色值",
    tabColorInfo: "颜色信息", tabColorDocs: "颜色文档", tabPlasticParts: "塑料件",
    manufacturerLabel: "品牌厂商", emptyState: "暂无数据", totalWeightLabel: "总计",
    versionLabel: "版本", pageSizeLabel: "每页", previousPage: "上一页", nextPage: "下一页",
    pageOf: (current, total) => `第 ${current} / ${total} 页`,
    foundFormulas: (n) => `找到 ${n} 个配方`,

    searchHint: "请在左侧输入搜索条件",
    noResults: "未找到匹配的颜色配方",
    noResultsHint: "请尝试更换品牌或颜色代码",
    adminTitle: "用户列表",
    adminNewUser: "新建用户",
    adminNoPermission: "无权限访问",
    adminPasswordRequired: "新建用户必须设置密码",
    adminCannotDeleteAdmin: "不能删除超级管理员",
    adminLoading: "加载中...",
    adminColId: "ID",
    adminColUsername: "用户名",
    adminColRole: "角色",
    adminColCreatedAt: "创建时间",
    adminColActions: "操作",
    adminRoleAdmin: "管理员",
    adminRoleUser: "普通用户",
    adminEdit: "编辑",
    adminDelete: "删除",
    adminEditTitle: "编辑用户",
    adminLabelPassword: "密码",
    adminPasswordHint: "（留空表示不修改）",
    adminPasswordPlaceholder: "留空则不修改",
    adminLabelRole: "角色",
    adminCancel: "取消",
    adminSave: "保存",
    adminCreate: "创建",
    adminConfirmDelete: (username: string) => `确定删除用户 "${username}" 吗？`,
    formulasCount: (n) => `${n} 个配方`,
    foundCount: (n) => `找到 ${n} 个匹配颜色`,
    truncatedHint: (max) => `显示前 ${max} 条结果，请细化搜索条件`,
    totalFormula: (c, f) => `找到 ${c} 个颜色，共 ${f} 个配方`,
    colorsBadge: (n) => `${n} 个颜色`,
    formulasBadge: (n) => `${n} 个配方`,
  }),

  // ========== Français ==========
  fr: dict({
    brandName: "HIWE Recherche de formule",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Trouvez votre",
    heroTitleHighlight: "correspondance parfaite",
    login: "Connexion",
    close: "Fermer",
    brandSlogan: "SYSTÈME DE FORMULE DE RETOUCHE AUTO",
    officialWebsite: "Site officiel",
    loginMobileTitle: "Bienvenue sur HAIWEN",
    guideSearchPlaceholder: "Rechercher des guides...",
    guideCategories: "Catégories",
    guideAllCategories: "Toutes les catégories",
    guideListLabel: "Liste des guides",
    guideSelectHint: "Veuillez sélectionner un guide à gauche",
    navSearch: "Recherche", navProducts: "Produits", navAbout: "À propos",
    navFormulaSearch: "Recherche de formule",
    navColorLibrary: "Toner",
    navAppGuide: "Guide d'application",
    navAdmin: "Gestion des données",
    userManagement: "Gestion des utilisateurs",
    logout: "Déconnexion",
    loginWelcome: "Bon retour",
    loginSubtitle: "Entrez vos identifiants pour accéder au système",
    loginEmail: "E-mail", loginPassword: "Mot de passe",
    loginPlaceholderEmail: "vous@exemple.com",
    loginPlaceholderPassword: "Entrez votre mot de passe",
    loginButton: "Commencer", loginSigningIn: "Connexion...",
    loginErrorEmpty: "Veuillez saisir le nom d'utilisateur et le mot de passe",
    loginErrorNetwork: "Erreur réseau, veuillez réessayer",
    loginErrorFailed: "Échec de la connexion",
    panelTitle: "Recherche de formule",
    make: "Marque", colorCode: "Code couleur", colorName: "Nom de la couleur", colorType: "Type de couleur",
    allMakes: "Toutes les marques",
    colorTypeAll: "Tous", colorTypeSolid: "Uni", colorTypeMetallic: "Métallisé",
    colorTypePearl: "Nacré", colorTypeMatte: "Mat", colorTypeCandy: "Candy",
    search: "Rechercher", searching: "Recherche...", reset: "Réinitialiser",
    codeTooLong: "Le code couleur ne dépasse généralement pas 10 caractères",
    colorCodePlaceholder: "ex. 040, NH731P",
    colorNamePlaceholder: "ex. Super White",
    year: "Année", yearPlaceholder: "ex. 2020 ou 2018-2022",
    detail: "Détail", expand: "Développer", collapse: "Réduire",
    version: "Version", paintSystemNotes: "Notes",
    volume: "Volume", tonerCode: "Code du toner", tonerName: "Nom du toner",
    percentage: "Pourcentage(%)", actualAmount: "Quantité réelle(g)",
    colorInfo: "Informations couleur", formulaVariants: "Variantes de formule", components: "Composants",
    makeLabel: "Marque", typeLabel: "Type", yearsLabel: "Années", codeLabel: "Code",
    print: "Imprimer", copy: "Copier", notesLabel: "Notes", updatedLabel: "Mis à jour",
    colorTypeSolidLabel: "Uni", colorTypeMetallicLabel: "Métallisé", colorTypePearlLabel: "Nacré",
    colorTypeMatteLabel: "Mat", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Spécial",
    copySuccess: "Copié dans le presse-papier", copyFail: "Échec de la copie",
    searchHint: "Saisissez les critères de recherche à gauche",
    noResults: "Aucune couleur correspondante trouvée",
    noResultsHint: "Essayez une autre marque ou un autre code couleur",
    adminTitle: "Liste des utilisateurs",
    adminNewUser: "Nouvel utilisateur",
    adminNoPermission: "Accès non autorisé",
    adminPasswordRequired: "Le mot de passe est requis pour un nouvel utilisateur",
    adminCannotDeleteAdmin: "Impossible de supprimer le super administrateur",
    adminLoading: "Chargement...",
    adminColId: "ID",
    adminColUsername: "Nom d'utilisateur",
    adminColRole: "Rôle",
    adminColCreatedAt: "Créé le",
    adminColActions: "Actions",
    adminRoleAdmin: "Admin",
    adminRoleUser: "Utilisateur",
    adminEdit: "Modifier",
    adminDelete: "Supprimer",
    adminEditTitle: "Modifier l'utilisateur",
    adminLabelPassword: "Mot de passe",
    adminPasswordHint: "Laisser vide pour ne pas modifier",
    adminPasswordPlaceholder: "Laisser vide pour conserver",
    adminLabelRole: "Rôle",
    adminCancel: "Annuler",
    adminSave: "Enregistrer",
    adminCreate: "Créer",
    adminConfirmDelete: (username: string) => `Voulez-vous vraiment supprimer l'utilisateur « ${username} » ?`,
    formulasCount: (n) => `${n} formule${n > 1 ? "s" : ""}`,
    foundCount: (n) => `${n} couleur${n > 1 ? "s" : ""} trouvée${n > 1 ? "s" : ""}`,
    truncatedHint: (max) => `Affichage des ${max} premiers résultats. Affinez votre recherche.`,
    totalFormula: (c, f) => `${c} couleur${c > 1 ? "s" : ""}, ${f} formule${f > 1 ? "s" : ""}`,
    colorsBadge: (n) => `${n} Couleurs`,
    formulasBadge: (n) => `${n} Formules`,
  }),

  // ========== Deutsch ==========
  de: dict({
    brandName: "HIWE Formelsuche",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Finden Sie Ihr",
    heroTitleHighlight: "perfektes Match",
    login: "Anmelden",
    close: "Schließen",
    brandSlogan: "AUTOLACKIER-FORMELSYSTEM",
    officialWebsite: "Offizielle Website",
    loginMobileTitle: "Willkommen bei HAIWEN",
    guideSearchPlaceholder: "Leitfäden suchen...",
    guideCategories: "Kategorien",
    guideAllCategories: "Alle Kategorien",
    guideListLabel: "Leitfadenliste",
    guideSelectHint: "Bitte links einen Leitfaden auswählen",
    navSearch: "Suche", navProducts: "Produkte", navAbout: "Über uns",
    navFormulaSearch: "Formelsuche",
    navColorLibrary: "Toner",
    navAppGuide: "Anwendungsleitfaden",
    navAdmin: "Datenverwaltung",
    userManagement: "Benutzerverwaltung",
    logout: "Abmelden",
    loginWelcome: "Willkommen zurück",
    loginSubtitle: "Geben Sie Ihre Anmeldedaten ein",
    loginEmail: "E-Mail", loginPassword: "Passwort",
    loginPlaceholderEmail: "sie@beispiel.com",
    loginPlaceholderPassword: "Geben Sie Ihr Passwort ein",
    loginButton: "Loslegen", loginSigningIn: "Anmelden...",
    loginErrorEmpty: "Bitte Benutzername und Passwort eingeben",
    loginErrorNetwork: "Netzwerkfehler, bitte erneut versuchen",
    loginErrorFailed: "Anmeldung fehlgeschlagen",
    panelTitle: "Formelsuche",
    make: "Marke", colorCode: "Farbcode", colorName: "Farbname", colorType: "Farbtyp",
    allMakes: "Alle Marken",
    colorTypeAll: "Alle", colorTypeSolid: "Uni", colorTypeMetallic: "Metallic",
    colorTypePearl: "Perleffekt", colorTypeMatte: "Matt", colorTypeCandy: "Candy",
    search: "Suchen", searching: "Suchen...", reset: "Zurücksetzen",
    codeTooLong: "Farbcode ist normalerweise <= 10 Zeichen",
    colorCodePlaceholder: "z. B. 040, NH731P",
    colorNamePlaceholder: "z. B. Super White",
    year: "Jahr", yearPlaceholder: "z. B. 2020 oder 2018-2022",
    detail: "Detail", expand: "Erweitern", collapse: "Einklappen",
    version: "Version", paintSystemNotes: "Notizen",
    volume: "Volumen", tonerCode: "Toner-Code", tonerName: "Toner-Name",
    percentage: "Prozent(%)", actualAmount: "Tatsächliche Menge(g)",
    colorInfo: "Farbinformationen", formulaVariants: "Formelvarianten", components: "Komponenten",
    makeLabel: "Marke", typeLabel: "Typ", yearsLabel: "Jahre", codeLabel: "Code",
    print: "Drucken", copy: "Kopieren", notesLabel: "Notizen", updatedLabel: "Aktualisiert",
    colorTypeSolidLabel: "Uni", colorTypeMetallicLabel: "Metallic", colorTypePearlLabel: "Perleffekt",
    colorTypeMatteLabel: "Matt", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Spezial",
    copySuccess: "In die Zwischenablage kopiert", copyFail: "Kopieren fehlgeschlagen",
    searchHint: "Geben Sie links Suchkriterien ein",
    noResults: "Keine passenden Farben gefunden",
    noResultsHint: "Versuchen Sie eine andere Marke oder einen anderen Farbcode",
    adminTitle: "Benutzerliste",
    adminNewUser: "Neuer Benutzer",
    adminNoPermission: "Kein Zugriff",
    adminPasswordRequired: "Passwort für neuen Benutzer erforderlich",
    adminCannotDeleteAdmin: "Super-Admin kann nicht gelöscht werden",
    adminLoading: "Wird geladen...",
    adminColId: "ID",
    adminColUsername: "Benutzername",
    adminColRole: "Rolle",
    adminColCreatedAt: "Erstellt am",
    adminColActions: "Aktionen",
    adminRoleAdmin: "Admin",
    adminRoleUser: "Benutzer",
    adminEdit: "Bearbeiten",
    adminDelete: "Löschen",
    adminEditTitle: "Benutzer bearbeiten",
    adminLabelPassword: "Passwort",
    adminPasswordHint: "Leer lassen, um unverändert zu belassen",
    adminPasswordPlaceholder: "Leer lassen, um beizubehalten",
    adminLabelRole: "Rolle",
    adminCancel: "Abbrechen",
    adminSave: "Speichern",
    adminCreate: "Erstellen",
    adminConfirmDelete: (username: string) => `Möchten Sie den Benutzer „${username}" wirklich löschen?`,
    formulasCount: (n) => `${n} Formel${n > 1 ? "n" : ""}`,
    foundCount: (n) => `${n} Farbe${n > 1 ? "n" : ""} gefunden`,
    truncatedHint: (max) => `Erste ${max} Ergebnisse. Bitte verfeinern Sie die Suche.`,
    totalFormula: (c, f) => `${c} Farbe${c > 1 ? "n" : ""}, ${f} Formel${f > 1 ? "n" : ""}`,
    colorsBadge: (n) => `${n} Farben`,
    formulasBadge: (n) => `${n} Formeln`,
  }),

  // ========== Español ==========
  es: dict({
    brandName: "HIWE Búsqueda de fórmulas",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Encuentra tu",
    heroTitleHighlight: "coincidencia perfecta",
    login: "Iniciar sesión",
    close: "Cerrar",
    brandSlogan: "SISTEMA DE FÓRMULAS DE RETOQUE AUTO",
    officialWebsite: "Sitio web oficial",
    loginMobileTitle: "Bienvenido a HAIWEN",
    guideSearchPlaceholder: "Buscar guías...",
    guideCategories: "Categorías",
    guideAllCategories: "Todas las categorías",
    guideListLabel: "Lista de guías",
    guideSelectHint: "Seleccione una guía a la izquierda",
    navSearch: "Buscar", navProducts: "Productos", navAbout: "Acerca de",
    navFormulaSearch: "Búsqueda de fórmulas",
    navColorLibrary: "Toner",
    navAppGuide: "Guía de aplicación",
    navAdmin: "Gestión de datos",
    userManagement: "Gestión de usuarios",
    logout: "Cerrar sesión",
    loginWelcome: "Bienvenido de nuevo",
    loginSubtitle: "Ingrese sus credenciales para acceder al sistema",
    loginEmail: "Correo electrónico", loginPassword: "Contraseña",
    loginPlaceholderEmail: "usted@ejemplo.com",
    loginPlaceholderPassword: "Ingrese su contraseña",
    loginButton: "Comenzar", loginSigningIn: "Iniciando sesión...",
    loginErrorEmpty: "Ingrese nombre de usuario y contraseña",
    loginErrorNetwork: "Error de red, inténtelo de nuevo",
    loginErrorFailed: "Inicio de sesión fallido",
    panelTitle: "Búsqueda de fórmulas",
    make: "Marca", colorCode: "Código de color", colorName: "Nombre del color", colorType: "Tipo de color",
    allMakes: "Todas las marcas",
    colorTypeAll: "Todos", colorTypeSolid: "Sólido", colorTypeMetallic: "Metálico",
    colorTypePearl: "Perla", colorTypeMatte: "Mate", colorTypeCandy: "Caramelo",
    search: "Buscar", searching: "Buscando...", reset: "Restablecer",
    codeTooLong: "El código de color suele tener <= 10 caracteres",
    colorCodePlaceholder: "ej. 040, NH731P",
    colorNamePlaceholder: "ej. Super White",
    year: "Año", yearPlaceholder: "ej. 2020 o 2018-2022",
    detail: "Detalle", expand: "Expandir", collapse: "Contraer",
    version: "Versión", paintSystemNotes: "Notas",
    volume: "Volumen", tonerCode: "Código de tóner", tonerName: "Nombre del tóner",
    percentage: "Porcentaje(%)", actualAmount: "Cantidad real(g)",
    colorInfo: "Información del color", formulaVariants: "Variantes de fórmula", components: "Componentes",
    makeLabel: "Marca", typeLabel: "Tipo", yearsLabel: "Años", codeLabel: "Código",
    print: "Imprimir", copy: "Copiar", notesLabel: "Notas", updatedLabel: "Actualizado",
    colorTypeSolidLabel: "Sólido", colorTypeMetallicLabel: "Metálico", colorTypePearlLabel: "Perla",
    colorTypeMatteLabel: "Mate", colorTypeCandyLabel: "Caramelo", colorTypeSpecialLabel: "Especial",
    copySuccess: "Copiado al portapapeles", copyFail: "Error al copiar",
    searchHint: "Ingrese criterios de búsqueda a la izquierda",
    noResults: "No se encontraron colores coincidentes",
    noResultsHint: "Pruebe con otra marca o código de color",
    adminTitle: "Lista de usuarios",
    adminNewUser: "Nuevo usuario",
    adminNoPermission: "Sin permiso de acceso",
    adminPasswordRequired: "La contraseña es obligatoria para el nuevo usuario",
    adminCannotDeleteAdmin: "No se puede eliminar el superadministrador",
    adminLoading: "Cargando...",
    adminColId: "ID",
    adminColUsername: "Nombre de usuario",
    adminColRole: "Rol",
    adminColCreatedAt: "Creado el",
    adminColActions: "Acciones",
    adminRoleAdmin: "Admin",
    adminRoleUser: "Usuario",
    adminEdit: "Editar",
    adminDelete: "Eliminar",
    adminEditTitle: "Editar usuario",
    adminLabelPassword: "Contraseña",
    adminPasswordHint: "Dejar en blanco para no modificar",
    adminPasswordPlaceholder: "Dejar en blanco para mantener",
    adminLabelRole: "Rol",
    adminCancel: "Cancelar",
    adminSave: "Guardar",
    adminCreate: "Crear",
    adminConfirmDelete: (username: string) => `¿Está seguro de eliminar al usuario "${username}"?`,
    formulasCount: (n) => `${n} fórmula${n > 1 ? "s" : ""}`,
    foundCount: (n) => `${n} color${n > 1 ? "es" : ""} encontrado${n > 1 ? "s" : ""}`,
    truncatedHint: (max) => `Mostrando los primeros ${max} resultados. Refine su búsqueda.`,
    totalFormula: (c, f) => `${c} color${c > 1 ? "es" : ""}, ${f} fórmula${f > 1 ? "s" : ""}`,
    colorsBadge: (n) => `${n} Colores`,
    formulasBadge: (n) => `${n} Fórmulas`,
  }),

  // ========== Português ==========
  pt: dict({
    brandName: "HIWE Pesquisa de fórmulas",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Encontre sua",
    heroTitleHighlight: "correspondência perfeita",
    login: "Entrar",
    close: "Fechar",
    brandSlogan: "SISTEMA DE FÓRMULAS DE RETOQUE AUTOMOTIVO",
    officialWebsite: "Site oficial",
    loginMobileTitle: "Bem-vindo à HAIWEN",
    guideSearchPlaceholder: "Pesquisar guias...",
    guideCategories: "Categorias",
    guideAllCategories: "Todas as categorias",
    guideListLabel: "Lista de guias",
    guideSelectHint: "Selecione um guia à esquerda",
    navSearch: "Pesquisar", navProducts: "Produtos", navAbout: "Sobre",
    navFormulaSearch: "Pesquisa de fórmulas",
    navColorLibrary: "Toner",
    navAppGuide: "Guia de aplicação",
    navAdmin: "Gestão de dados",
    userManagement: "Gestão de usuários",
    logout: "Sair",
    loginWelcome: "Bem-vindo de volta",
    loginSubtitle: "Insira suas credenciais para acessar o sistema",
    loginEmail: "E-mail", loginPassword: "Senha",
    loginPlaceholderEmail: "voce@exemplo.com",
    loginPlaceholderPassword: "Insira sua senha",
    loginButton: "Começar", loginSigningIn: "Entrando...",
    loginErrorEmpty: "Insira nome de usuário e senha",
    loginErrorNetwork: "Erro de rede, tente novamente",
    loginErrorFailed: "Falha no login",
    panelTitle: "Pesquisa de fórmulas",
    make: "Marca", colorCode: "Código da cor", colorName: "Nome da cor", colorType: "Tipo de cor",
    allMakes: "Todas as marcas",
    colorTypeAll: "Todos", colorTypeSolid: "Sólido", colorTypeMetallic: "Metálico",
    colorTypePearl: "Pérola", colorTypeMatte: "Fosco", colorTypeCandy: "Candy",
    search: "Pesquisar", searching: "Pesquisando...", reset: "Redefinir",
    codeTooLong: "O código de cor geralmente tem <= 10 caracteres",
    colorCodePlaceholder: "ex. 040, NH731P",
    colorNamePlaceholder: "ex. Super White",
    year: "Ano", yearPlaceholder: "ex. 2020 ou 2018-2022",
    detail: "Detalhe", expand: "Expandir", collapse: "Recolher",
    version: "Versão", paintSystemNotes: "Notas",
    volume: "Volume", tonerCode: "Código do toner", tonerName: "Nome do toner",
    percentage: "Percentagem(%)", actualAmount: "Quantidade real(g)",
    colorInfo: "Informação da cor", formulaVariants: "Variantes de fórmula", components: "Componentes",
    makeLabel: "Marca", typeLabel: "Tipo", yearsLabel: "Anos", codeLabel: "Código",
    print: "Imprimir", copy: "Copiar", notesLabel: "Notas", updatedLabel: "Atualizado",
    colorTypeSolidLabel: "Sólido", colorTypeMetallicLabel: "Metálico", colorTypePearlLabel: "Pérola",
    colorTypeMatteLabel: "Fosco", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Especial",
    copySuccess: "Copiado para a área de transferência", copyFail: "Falha ao copiar",
    searchHint: "Insira critérios de pesquisa à esquerda",
    noResults: "Nenhuma cor correspondente encontrada",
    noResultsHint: "Tente outra marca ou código de cor",
    adminTitle: "Lista de usuários",
    adminNewUser: "Novo usuário",
    adminNoPermission: "Sem permissão de acesso",
    adminPasswordRequired: "Senha obrigatória para novo usuário",
    adminCannotDeleteAdmin: "Não é possível excluir o superadministrador",
    adminLoading: "Carregando...",
    adminColId: "ID",
    adminColUsername: "Nome de usuário",
    adminColRole: "Função",
    adminColCreatedAt: "Criado em",
    adminColActions: "Ações",
    adminRoleAdmin: "Admin",
    adminRoleUser: "Usuário",
    adminEdit: "Editar",
    adminDelete: "Excluir",
    adminEditTitle: "Editar usuário",
    adminLabelPassword: "Senha",
    adminPasswordHint: "Deixe em branco para não alterar",
    adminPasswordPlaceholder: "Deixe em branco para manter",
    adminLabelRole: "Função",
    adminCancel: "Cancelar",
    adminSave: "Salvar",
    adminCreate: "Criar",
    adminConfirmDelete: (username: string) => `Tem certeza de que deseja excluir o usuário "${username}"?`,
    formulasCount: (n) => `${n} fórmula${n > 1 ? "s" : ""}`,
    foundCount: (n) => `${n} cor${n > 1 ? "es" : ""} encontrada${n > 1 ? "s" : ""}`,
    truncatedHint: (max) => `Mostrando os primeiros ${max} resultados. Refine sua pesquisa.`,
    totalFormula: (c, f) => `${c} cor${c > 1 ? "es" : ""}, ${f} fórmula${f > 1 ? "s" : ""}`,
    colorsBadge: (n) => `${n} Cores`,
    formulasBadge: (n) => `${n} Fórmulas`,
  }),

  // ========== Italiano ==========
  it: dict({
    brandName: "HIWE Ricerca formule",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Trova la tua",
    heroTitleHighlight: "corrispondenza perfetta",
    login: "Accedi",
    close: "Chiudi",
    brandSlogan: "SISTEMA DI FORMULE PER RITOUCHI AUTO",
    officialWebsite: "Sito ufficiale",
    loginMobileTitle: "Benvenuto su HAIWEN",
    guideSearchPlaceholder: "Cerca guide...",
    guideCategories: "Categorie",
    guideAllCategories: "Tutte le categorie",
    guideListLabel: "Elenco guide",
    guideSelectHint: "Seleziona una guida a sinistra",
    navSearch: "Cerca", navProducts: "Prodotti", navAbout: "Informazioni",
    navFormulaSearch: "Ricerca formule",
    navColorLibrary: "Toner",
    navAppGuide: "Guida all'applicazione",
    navAdmin: "Gestione dati",
    userManagement: "Gestione utenti",
    logout: "Esci",
    loginWelcome: "Bentornato",
    loginSubtitle: "Inserisci le tue credenziali per accedere al sistema",
    loginEmail: "E-mail", loginPassword: "Password",
    loginPlaceholderEmail: "tu@esempio.com",
    loginPlaceholderPassword: "Inserisci la tua password",
    loginButton: "Inizia", loginSigningIn: "Accesso in corso...",
    loginErrorEmpty: "Inserisci nome utente e password",
    loginErrorNetwork: "Errore di rete, riprova",
    loginErrorFailed: "Accesso non riuscito",
    panelTitle: "Ricerca formule",
    make: "Marca", colorCode: "Codice colore", colorName: "Nome colore", colorType: "Tipo colore",
    allMakes: "Tutte le marche",
    colorTypeAll: "Tutti", colorTypeSolid: "Solido", colorTypeMetallic: "Metallizzato",
    colorTypePearl: "Perla", colorTypeMatte: "Opaco", colorTypeCandy: "Candy",
    search: "Cerca", searching: "Ricerca...", reset: "Reimposta",
    codeTooLong: "Il codice colore di solito ha <= 10 caratteri",
    colorCodePlaceholder: "es. 040, NH731P",
    colorNamePlaceholder: "es. Super White",
    year: "Anno", yearPlaceholder: "es. 2020 o 2018-2022",
    detail: "Dettaglio", expand: "Espandi", collapse: "Riduci",
    version: "Versione", paintSystemNotes: "Note",
    volume: "Volume", tonerCode: "Codice toner", tonerName: "Nome toner",
    percentage: "Percentuale(%)", actualAmount: "Quantità effettiva(g)",
    colorInfo: "Info colore", formulaVariants: "Varianti formula", components: "Componenti",
    makeLabel: "Marca", typeLabel: "Tipo", yearsLabel: "Anni", codeLabel: "Codice",
    print: "Stampa", copy: "Copia", notesLabel: "Note", updatedLabel: "Aggiornato",
    colorTypeSolidLabel: "Solido", colorTypeMetallicLabel: "Metallizzato", colorTypePearlLabel: "Perla",
    colorTypeMatteLabel: "Opaco", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Speciale",
    copySuccess: "Copiato negli appunti", copyFail: "Copia non riuscita",
    searchHint: "Inserisci i criteri di ricerca a sinistra",
    noResults: "Nessun colore corrispondente trovato",
    noResultsHint: "Prova un'altra marca o codice colore",
    adminTitle: "Elenco utenti",
    adminNewUser: "Nuovo utente",
    adminNoPermission: "Accesso non autorizzato",
    adminPasswordRequired: "La password è obbligatoria per il nuovo utente",
    adminCannotDeleteAdmin: "Impossibile eliminare il super admin",
    adminLoading: "Caricamento...",
    adminColId: "ID",
    adminColUsername: "Nome utente",
    adminColRole: "Ruolo",
    adminColCreatedAt: "Creato il",
    adminColActions: "Azioni",
    adminRoleAdmin: "Admin",
    adminRoleUser: "Utente",
    adminEdit: "Modifica",
    adminDelete: "Elimina",
    adminEditTitle: "Modifica utente",
    adminLabelPassword: "Password",
    adminPasswordHint: "Lascia vuoto per non modificare",
    adminPasswordPlaceholder: "Lascia vuoto per mantenere",
    adminLabelRole: "Ruolo",
    adminCancel: "Annulla",
    adminSave: "Salva",
    adminCreate: "Crea",
    adminConfirmDelete: (username: string) => `Sei sicuro di voler eliminare l'utente "${username}"?`,
    formulasCount: (n) => `${n} formula${n > 1 ? "e" : ""}`,
    foundCount: (n) => `${n} color${n > 1 ? "i" : "e"} trovat${n > 1 ? "i" : "o"}`,
    truncatedHint: (max) => `Mostrando i primi ${max} risultati. Affina la ricerca.`,
    totalFormula: (c, f) => `${c} color${c > 1 ? "i" : "e"}, ${f} formula${f > 1 ? "e" : ""}`,
    colorsBadge: (n) => `${n} Colori`,
    formulasBadge: (n) => `${n} Formule`,
  }),

  // ========== Русский ==========
  ru: dict({
    brandName: "HIWE Поиск формул",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Найдите своё",
    heroTitleHighlight: "идеальное совпадение",
    login: "Войти",
    close: "Закрыть",
    brandSlogan: "СИСТЕМА ПОИСКА АВТОЭМАЛЕЙ",
    officialWebsite: "Официальный сайт",
    loginMobileTitle: "Добро пожаловать в HAIWEN",
    guideSearchPlaceholder: "Поиск руководств...",
    guideCategories: "Категории",
    guideAllCategories: "Все категории",
    guideListLabel: "Список руководств",
    guideSelectHint: "Выберите руководство слева",
    navSearch: "Поиск", navProducts: "Продукты", navAbout: "О нас",
    navFormulaSearch: "Поиск формул",
    navColorLibrary: "Toner",
    navAppGuide: "Руководство по применению",
    navAdmin: "Управление данными",
    userManagement: "Управление пользователями",
    logout: "Выход",
    loginWelcome: "С возвращением",
    loginSubtitle: "Введите свои учётные данные для входа",
    loginEmail: "Эл. почта", loginPassword: "Пароль",
    loginPlaceholderEmail: "вы@пример.com",
    loginPlaceholderPassword: "Введите пароль",
    loginButton: "Начать", loginSigningIn: "Вход...",
    loginErrorEmpty: "Введите имя пользователя и пароль",
    loginErrorNetwork: "Ошибка сети, повторите попытку",
    loginErrorFailed: "Не удалось войти",
    panelTitle: "Поиск формул",
    make: "Марка", colorCode: "Код цвета", colorName: "Название цвета", colorType: "Тип цвета",
    allMakes: "Все марки",
    colorTypeAll: "Все", colorTypeSolid: "Однотонный", colorTypeMetallic: "Металлик",
    colorTypePearl: "Перламутр", colorTypeMatte: "Матовый", colorTypeCandy: "Канди",
    search: "Поиск", searching: "Поиск...", reset: "Сброс",
    codeTooLong: "Код цвета обычно <= 10 символов",
    colorCodePlaceholder: "напр. 040, NH731P",
    colorNamePlaceholder: "напр. Super White",
    year: "Год", yearPlaceholder: "напр. 2020 или 2018-2022",
    detail: "Подробнее", expand: "Развернуть", collapse: "Свернуть",
    version: "Версия", paintSystemNotes: "Примечания",
    volume: "Объём", tonerCode: "Код тонера", tonerName: "Название тонера",
    percentage: "Процент(%)", actualAmount: "Факт. кол-во(г)",
    colorInfo: "Информация о цвете", formulaVariants: "Варианты формулы", components: "Компоненты",
    makeLabel: "Марка", typeLabel: "Тип", yearsLabel: "Годы", codeLabel: "Код",
    print: "Печать", copy: "Копировать", notesLabel: "Примечания", updatedLabel: "Обновлено",
    colorTypeSolidLabel: "Однотонный", colorTypeMetallicLabel: "Металлик", colorTypePearlLabel: "Перламутр",
    colorTypeMatteLabel: "Матовый", colorTypeCandyLabel: "Канди", colorTypeSpecialLabel: "Специальный",
    copySuccess: "Скопировано в буфер обмена", copyFail: "Не удалось скопировать",
    searchHint: "Введите критерии поиска слева",
    noResults: "Соответствующих цветов не найдено",
    noResultsHint: "Попробуйте другую марку или код цвета",
    adminTitle: "Список пользователей",
    adminNewUser: "Новый пользователь",
    adminNoPermission: "Нет доступа",
    adminPasswordRequired: "Для нового пользователя пароль обязателен",
    adminCannotDeleteAdmin: "Нельзя удалить суперадминистратора",
    adminLoading: "Загрузка...",
    adminColId: "ID",
    adminColUsername: "Имя пользователя",
    adminColRole: "Роль",
    adminColCreatedAt: "Создан",
    adminColActions: "Действия",
    adminRoleAdmin: "Админ",
    adminRoleUser: "Пользователь",
    adminEdit: "Изменить",
    adminDelete: "Удалить",
    adminEditTitle: "Изменить пользователя",
    adminLabelPassword: "Пароль",
    adminPasswordHint: "Оставьте пустым, чтобы не менять",
    adminPasswordPlaceholder: "Оставьте пустым, чтобы сохранить",
    adminLabelRole: "Роль",
    adminCancel: "Отмена",
    adminSave: "Сохранить",
    adminCreate: "Создать",
    adminConfirmDelete: (username: string) => `Вы уверены, что хотите удалить пользователя "${username}"?`,
    formulasCount: (n) => {
      const mod10 = n % 10, mod100 = n % 100;
      const word = mod10 === 1 && mod100 !== 11 ? "формула"
                 : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "формулы"
                 : "формул";
      return `${n} ${word}`;
    },
    foundCount: (n) => {
      const mod10 = n % 10, mod100 = n % 100;
      const word = mod10 === 1 && mod100 !== 11 ? "цвет"
                 : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "цвета"
                 : "цветов";
      return `Найдено ${n} ${word}`;
    },
    truncatedHint: (max) => `Показаны первые ${max} результатов. Уточните поиск.`,
    totalFormula: (c, f) => `${c} цветов, ${f} формул`,
    colorsBadge: (n) => `${n} Цв.`,
    formulasBadge: (n) => `${n} Формул`,
  }),

  // ========== Slovenščina ==========
  sl: dict({
    brandName: "HIWE Iskanje formul",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Poiščite svoje",
    heroTitleHighlight: "popolno ujemanje",
    login: "Prijava",
    close: "Zapri",
    brandSlogan: "SISTEM FORMUL ZA POPRAVILA LAKA",
    officialWebsite: "Uradna spletna stran",
    loginMobileTitle: "Dobrodošli v HAIWEN",
    guideSearchPlaceholder: "Iskanje vodnikov...",
    guideCategories: "Kategorije",
    guideAllCategories: "Vse kategorije",
    guideListLabel: "Seznam vodnikov",
    guideSelectHint: "Izberite vodnik na levi",
    navSearch: "Iskanje", navProducts: "Izdelki", navAbout: "O nas",
    navFormulaSearch: "Iskanje formul",
    navColorLibrary: "Toner",
    navAppGuide: "Vodnik za uporabo",
    navAdmin: "Upravljanje podatkov",
    userManagement: "Upravljanje uporabnikov",
    logout: "Odjava",
    loginWelcome: "Dobrodošli nazaj",
    loginSubtitle: "Vnesite poverilnice za dostop do sistema",
    loginEmail: "E-pošta", loginPassword: "Geslo",
    loginPlaceholderEmail: "vi@primer.com",
    loginPlaceholderPassword: "Vnesite geslo",
    loginButton: "Začni", loginSigningIn: "Prijavljanje...",
    loginErrorEmpty: "Vnesite uporabniško ime in geslo",
    loginErrorNetwork: "Omrežna napaka, poskusite znova",
    loginErrorFailed: "Prijava neuspešna",
    panelTitle: "Iskanje formul",
    make: "Znamka", colorCode: "Koda barve", colorName: "Ime barve", colorType: "Vrsta barve",
    allMakes: "Vse znamke",
    colorTypeAll: "Vse", colorTypeSolid: "Enobarvna", colorTypeMetallic: "Kovinska",
    colorTypePearl: "Biser", colorTypeMatte: "Mat", colorTypeCandy: "Candy",
    search: "Iskanje", searching: "Iskanje...", reset: "Ponastavi",
    codeTooLong: "Koda barve je običajno <= 10 znakov",
    colorCodePlaceholder: "npr. 040, NH731P",
    colorNamePlaceholder: "npr. Super White",
    year: "Leto", yearPlaceholder: "npr. 2020 ali 2018-2022",
    detail: "Podrobnosti", expand: "Razširi", collapse: "Strni",
    version: "Različica", paintSystemNotes: "Opombe",
    volume: "Prostornina", tonerCode: "Koda tonerja", tonerName: "Ime tonerja",
    percentage: "Odstotek(%)", actualAmount: "Dejanska količina(g)",
    colorInfo: "Podatki o barvi", formulaVariants: "Različice formul", components: "Sestavine",
    makeLabel: "Znamka", typeLabel: "Vrsta", yearsLabel: "Leta", codeLabel: "Koda",
    print: "Natisni", copy: "Kopiraj", notesLabel: "Opombe", updatedLabel: "Posodobljeno",
    colorTypeSolidLabel: "Enobarvna", colorTypeMetallicLabel: "Kovinska", colorTypePearlLabel: "Biser",
    colorTypeMatteLabel: "Mat", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Posebna",
    copySuccess: "Kopirano v odložišče", copyFail: "Kopiranje neuspešno",
    searchHint: "Vnesite iskalne kriterije na levi",
    noResults: "Ni ujemajočih se barv",
    noResultsHint: "Poskusite drugo znamko ali kodo barve",
    adminTitle: "Seznam uporabnikov",
    adminNewUser: "Nov uporabnik",
    adminNoPermission: "Ni dovoljenja za dostop",
    adminPasswordRequired: "Geslo je obvezno za novega uporabnika",
    adminCannotDeleteAdmin: "Super skrbnika ni mogoče izbrisati",
    adminLoading: "Nalaganje...",
    adminColId: "ID",
    adminColUsername: "Uporabniško ime",
    adminColRole: "Vloga",
    adminColCreatedAt: "Ustvarjeno",
    adminColActions: "Dejanja",
    adminRoleAdmin: "Admin",
    adminRoleUser: "Uporabnik",
    adminEdit: "Uredi",
    adminDelete: "Izbriši",
    adminEditTitle: "Uredi uporabnika",
    adminLabelPassword: "Geslo",
    adminPasswordHint: "Pustite prazno, da ne spremenite",
    adminPasswordPlaceholder: "Pustite prazno, da ohranite",
    adminLabelRole: "Vloga",
    adminCancel: "Prekliči",
    adminSave: "Shrani",
    adminCreate: "Ustvari",
    adminConfirmDelete: (username: string) => `Ali ste prepričani, da želite izbrisati uporabnika "${username}"?`,
    formulasCount: (n) => `${n} formul${n === 1 ? "a" : n === 2 ? "i" : n === 3 || n === 4 ? "e" : ""}`,
    foundCount: (n) => `Najdenih ${n} barv`,
    truncatedHint: (max) => `Prikazanih prvih ${max} rezultatov. Izpopolnite iskanje.`,
    totalFormula: (c, f) => `${c} barv, ${f} formul`,
    colorsBadge: (n) => `${n} Barv`,
    formulasBadge: (n) => `${n} Formul`,
  }),

  // ========== Türkçe ==========
  tr: dict({
    brandName: "HIWE Formül Arama",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Bul",
    heroTitleHighlight: "kusursuz eşleşme",
    login: "Giriş",
    close: "Kapat",
    brandSlogan: "OTO BOYA FORMÜL SİSTEMİ",
    officialWebsite: "Resmi web sitesi",
    loginMobileTitle: "HAIWEN'a hoş geldiniz",
    guideSearchPlaceholder: "Kılavuzları ara...",
    guideCategories: "Kategoriler",
    guideAllCategories: "Tüm Kategoriler",
    guideListLabel: "Kılavuz Listesi",
    guideSelectHint: "Soldan bir kılavuz seçin",
    navSearch: "Ara", navProducts: "Ürünler", navAbout: "Hakkında",
    navFormulaSearch: "Formül Arama",
    navColorLibrary: "Toner",
    navAppGuide: "Uygulama Kılavuzu",
    navAdmin: "Veri Yönetimi",
    userManagement: "Kullanıcı Yönetimi",
    logout: "Çıkış",
    loginWelcome: "Tekrar hoş geldiniz",
    loginSubtitle: "Sisteme erişmek için kimlik bilgilerinizi girin",
    loginEmail: "E-posta", loginPassword: "Parola",
    loginPlaceholderEmail: "siz@ornek.com",
    loginPlaceholderPassword: "Parolanızı girin",
    loginButton: "Başla", loginSigningIn: "Giriş yapılıyor...",
    loginErrorEmpty: "Kullanıcı adı ve parola girin",
    loginErrorNetwork: "Ağ hatası, tekrar deneyin",
    loginErrorFailed: "Giriş başarısız",
    panelTitle: "Formül Arama",
    make: "Marka", colorCode: "Renk Kodu", colorName: "Renk Adı", colorType: "Renk Tipi",
    allMakes: "Tüm Markalar",
    colorTypeAll: "Tümü", colorTypeSolid: "Düz", colorTypeMetallic: "Metalik",
    colorTypePearl: "Sedef", colorTypeMatte: "Mat", colorTypeCandy: "Candy",
    search: "Ara", searching: "Aranıyor...", reset: "Sıfırla",
    codeTooLong: "Renk kodu genellikle <= 10 karakterdir",
    colorCodePlaceholder: "örn. 040, NH731P",
    colorNamePlaceholder: "örn. Super White",
    year: "Yıl", yearPlaceholder: "örn. 2020 veya 2018-2022",
    detail: "Detay", expand: "Genişlet", collapse: "Daralt",
    version: "Sürüm", paintSystemNotes: "Notlar",
    volume: "Hacim", tonerCode: "Toner Kodu", tonerName: "Toner Adı",
    percentage: "Yüzde(%)", actualAmount: "Gerçek miktar(g)",
    colorInfo: "Renk Bilgisi", formulaVariants: "Formül Varyantları", components: "Bileşenler",
    makeLabel: "Marka", typeLabel: "Tip", yearsLabel: "Yıllar", codeLabel: "Kod",
    print: "Yazdır", copy: "Kopyala", notesLabel: "Notlar", updatedLabel: "Güncellendi",
    colorTypeSolidLabel: "Düz", colorTypeMetallicLabel: "Metalik", colorTypePearlLabel: "Sedef",
    colorTypeMatteLabel: "Mat", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Özel",
    copySuccess: "Panoya kopyalandı", copyFail: "Kopyalama başarısız",
    searchHint: "Sol tarafa arama kriterlerini girin",
    noResults: "Eşleşen renk bulunamadı",
    noResultsHint: "Farklı bir marka veya renk kodu deneyin",
    adminTitle: "Kullanıcı Listesi",
    adminNewUser: "Yeni Kullanıcı",
    adminNoPermission: "Erişim izni yok",
    adminPasswordRequired: "Yeni kullanıcı için parola zorunludur",
    adminCannotDeleteAdmin: "Süper yönetici silinemez",
    adminLoading: "Yükleniyor...",
    adminColId: "ID",
    adminColUsername: "Kullanıcı Adı",
    adminColRole: "Rol",
    adminColCreatedAt: "Oluşturulma",
    adminColActions: "İşlemler",
    adminRoleAdmin: "Yönetici",
    adminRoleUser: "Kullanıcı",
    adminEdit: "Düzenle",
    adminDelete: "Sil",
    adminEditTitle: "Kullanıcıyı Düzenle",
    adminLabelPassword: "Parola",
    adminPasswordHint: "Değiştirmemek için boş bırakın",
    adminPasswordPlaceholder: "Korumak için boş bırakın",
    adminLabelRole: "Rol",
    adminCancel: "İptal",
    adminSave: "Kaydet",
    adminCreate: "Oluştur",
    adminConfirmDelete: (username: string) => `"${username}" kullanıcısını silmek istediğinize emin misiniz?`,
    formulasCount: (n) => `${n} formül`,
    foundCount: (n) => `${n} renk bulundu`,
    truncatedHint: (max) => `İlk ${max} sonuç gösteriliyor. Lütfen aramayı daraltın.`,
    totalFormula: (c, f) => `${c} renk, ${f} formül`,
    colorsBadge: (n) => `${n} Renk`,
    formulasBadge: (n) => `${n} Formül`,
  }),

  // ========== עברית (RTL) ==========
  he: dict({
    brandName: "HIWE חיפוש פורמולות",
    brandNameShort: "HIWE",
    heroTitlePrefix: "מצא את",
    heroTitleHighlight: "ההתאמה המושלמת",
    login: "התחבר",
    close: "סגור",
    brandSlogan: "מערכת פורמולות לצבעי ריטאץ' אוטו",
    officialWebsite: "אתר רשמי",
    loginMobileTitle: "ברוכים הבאים ל-HAIWEN",
    guideSearchPlaceholder: "חיפוש מדריכים...",
    guideCategories: "קטגוריות",
    guideAllCategories: "כל הקטגוריות",
    guideListLabel: "רשימת מדריכים",
    guideSelectHint: "אנא בחר מדריך משמאל",
    navSearch: "חיפוש", navProducts: "מוצרים", navAbout: "אודות",
    navFormulaSearch: "חיפוש פורמולות",
    navColorLibrary: "Toner",
    navAppGuide: "מדריך יישום",
    navAdmin: "ניהול נתונים",
    userManagement: "ניהול משתמשים",
    logout: "יציאה",
    loginWelcome: "ברוך שובך",
    loginSubtitle: "הזן את האישורים שלך כדי לגשת למערכת",
    loginEmail: "דוא״ל", loginPassword: "סיסמה",
    loginPlaceholderEmail: "אתה@דוגמה.com",
    loginPlaceholderPassword: "הזן את הסיסמה שלך",
    loginButton: "התחל", loginSigningIn: "מתחבר...",
    loginErrorEmpty: "אנא הזן שם משתמש וסיסמה",
    loginErrorNetwork: "שגיאת רשת, אנא נסה שוב",
    loginErrorFailed: "ההתחברות נכשלה",
    panelTitle: "חיפוש פורמולות",
    make: "יצרן", colorCode: "קוד צבע", colorName: "שם הצבע", colorType: "סוג צבע",
    allMakes: "כל היצרנים",
    colorTypeAll: "הכל", colorTypeSolid: "אחיד", colorTypeMetallic: "מטאלי",
    colorTypePearl: "פנינה", colorTypeMatte: "מט", colorTypeCandy: "קנדי",
    search: "חפש", searching: "מחפש...", reset: "איפוס",
    codeTooLong: "קוד צבע הוא בדרך כלל <= 10 תווים",
    colorCodePlaceholder: "לדוגמה. 040, NH731P",
    colorNamePlaceholder: "לדוגמה. Super White",
    year: "שנה", yearPlaceholder: "לדוגמה. 2020 או 2018-2022",
    detail: "פרטים", expand: "הרחב", collapse: "צמצם",
    version: "גרסה", paintSystemNotes: "הערות",
    volume: "נפח", tonerCode: "קוד טונר", tonerName: "שם טונר",
    percentage: "אחוז(%)", actualAmount: "כמות בפועל(גר׳)",
    colorInfo: "מידע על הצבע", formulaVariants: "וריאציות פורמולה", components: "רכיבים",
    makeLabel: "יצרן", typeLabel: "סוג", yearsLabel: "שנים", codeLabel: "קוד",
    print: "הדפס", copy: "העתק", notesLabel: "הערות", updatedLabel: "עודכן",
    colorTypeSolidLabel: "אחיד", colorTypeMetallicLabel: "מטאלי", colorTypePearlLabel: "פנינה",
    colorTypeMatteLabel: "מט", colorTypeCandyLabel: "קנדי", colorTypeSpecialLabel: "מיוחד",
    copySuccess: "הועתק ללוח", copyFail: "ההעתקה נכשלה",
    searchHint: "הזן קריטריוני חיפוש משמאל",
    noResults: "לא נמצאו צבעים תואמים",
    noResultsHint: "נסה יצרן או קוד צבע אחר",
    adminTitle: "רשימת משתמשים",
    adminNewUser: "משתמש חדש",
    adminNoPermission: "אין הרשאת גישה",
    adminPasswordRequired: "סיסמה חובה למשתמש חדש",
    adminCannotDeleteAdmin: "לא ניתן למחוק את המנהל העל",
    adminLoading: "טוען...",
    adminColId: "מזהה",
    adminColUsername: "שם משתמש",
    adminColRole: "תפקיד",
    adminColCreatedAt: "נוצר ב",
    adminColActions: "פעולות",
    adminRoleAdmin: "מנהל",
    adminRoleUser: "משתמש",
    adminEdit: "ערוך",
    adminDelete: "מחק",
    adminEditTitle: "ערוך משתמש",
    adminLabelPassword: "סיסמה",
    adminPasswordHint: "השאר ריק כדי לא לשנות",
    adminPasswordPlaceholder: "השאר ריק כדי לשמור",
    adminLabelRole: "תפקיד",
    adminCancel: "בטל",
    adminSave: "שמור",
    adminCreate: "צור",
    adminConfirmDelete: (username: string) => `האם אתה בטוח שברצונך למחוק את המשתמש "${username}"?`,
    formulasCount: (n) => `${n} פורמולות`,
    foundCount: (n) => `נמצאו ${n} צבעים`,
    truncatedHint: (max) => `מציג את ${max} התוצאות הראשונות. אנא צמצם את החיפוש.`,
    totalFormula: (c, f) => `${c} צבעים, ${f} פורמולות`,
    colorsBadge: (n) => `${n} צבעים`,
    formulasBadge: (n) => `${n} פורמולות`,
  }),

  // ========== العربية (RTL) ==========
  ar: dict({
    brandName: "HIWE بحث التركيبات",
    brandNameShort: "HIWE",
    heroTitlePrefix: "ابحث عن",
    heroTitleHighlight: "التطابق المثالي",
    login: "تسجيل الدخول",
    close: "إغلاق",
    brandSlogan: "نظام تركيبات إصلاح طلاء السيارات",
    officialWebsite: "الموقع الرسمي",
    loginMobileTitle: "مرحبًا بك في HAIWEN",
    guideSearchPlaceholder: "ابحث عن أدلة...",
    guideCategories: "الفئات",
    guideAllCategories: "كل الفئات",
    guideListLabel: "قائمة الأدلة",
    guideSelectHint: "يرجى اختيار دليل من اليسار",
    navSearch: "بحث", navProducts: "منتجات", navAbout: "حول",
    navFormulaSearch: "بحث التركيبات",
    navColorLibrary: "Toner",
    navAppGuide: "دليل التطبيق",
    navAdmin: "إدارة البيانات",
    userManagement: "إدارة المستخدمين",
    logout: "تسجيل خروج",
    loginWelcome: "مرحبًا بعودتك",
    loginSubtitle: "أدخل بيانات اعتمادك للوصول إلى النظام",
    loginEmail: "البريد الإلكتروني", loginPassword: "كلمة المرور",
    loginPlaceholderEmail: "أنت@مثال.com",
    loginPlaceholderPassword: "أدخل كلمة المرور",
    loginButton: "ابدأ", loginSigningIn: "جارٍ تسجيل الدخول...",
    loginErrorEmpty: "يرجى إدخال اسم المستخدم وكلمة المرور",
    loginErrorNetwork: "خطأ في الشبكة، يرجى المحاولة مرة أخرى",
    loginErrorFailed: "فشل تسجيل الدخول",
    panelTitle: "بحث التركيبات",
    make: "الصانع", colorCode: "رمز اللون", colorName: "اسم اللون", colorType: "نوع اللون",
    allMakes: "جميع الصانعين",
    colorTypeAll: "الكل", colorTypeSolid: "صلب", colorTypeMetallic: "معدني",
    colorTypePearl: "لؤلؤي", colorTypeMatte: "غير لامع", colorTypeCandy: "حلوى",
    search: "بحث", searching: "جارٍ البحث...", reset: "إعادة تعيين",
    codeTooLong: "رمز اللون عادة <= 10 أحرف",
    colorCodePlaceholder: "مثال: 040, NH731P",
    colorNamePlaceholder: "مثال: Super White",
    year: "السنة", yearPlaceholder: "مثال: 2020 أو 2018-2022",
    detail: "تفاصيل", expand: "توسيع", collapse: "طي",
    version: "الإصدار", paintSystemNotes: "ملاحظات",
    volume: "الحجم", tonerCode: "رمز الحبر", tonerName: "اسم الحبر",
    percentage: "النسبة(٪)", actualAmount: "الكمية الفعلية(جم)",
    colorInfo: "معلومات اللون", formulaVariants: "متغيرات التركيبة", components: "المكونات",
    makeLabel: "الصانع", typeLabel: "النوع", yearsLabel: "السنوات", codeLabel: "الرمز",
    print: "طباعة", copy: "نسخ", notesLabel: "ملاحظات", updatedLabel: "تم التحديث",
    colorTypeSolidLabel: "صلب", colorTypeMetallicLabel: "معدني", colorTypePearlLabel: "لؤلؤي",
    colorTypeMatteLabel: "غير لامع", colorTypeCandyLabel: "حلوى", colorTypeSpecialLabel: "خاص",
    copySuccess: "تم النسخ إلى الحافظة", copyFail: "فشل النسخ",
    searchHint: "أدخل معايير البحث على اليسار",
    noResults: "لم يتم العثور على ألوان مطابقة",
    noResultsHint: "جرب صانعًا أو رمز لون مختلفًا",
    adminTitle: "قائمة المستخدمين",
    adminNewUser: "مستخدم جديد",
    adminNoPermission: "لا يوجد إذن وصول",
    adminPasswordRequired: "كلمة المرور مطلوبة للمستخدم الجديد",
    adminCannotDeleteAdmin: "لا يمكن حذف المدير العام",
    adminLoading: "جارٍ التحميل...",
    adminColId: "المعرف",
    adminColUsername: "اسم المستخدم",
    adminColRole: "الدور",
    adminColCreatedAt: "تاريخ الإنشاء",
    adminColActions: "الإجراءات",
    adminRoleAdmin: "مدير",
    adminRoleUser: "مستخدم",
    adminEdit: "تعديل",
    adminDelete: "حذف",
    adminEditTitle: "تعديل مستخدم",
    adminLabelPassword: "كلمة المرور",
    adminPasswordHint: "اتركه فارغًا لعدم التعديل",
    adminPasswordPlaceholder: "اتركه فارغًا للإبقاء",
    adminLabelRole: "الدور",
    adminCancel: "إلغاء",
    adminSave: "حفظ",
    adminCreate: "إنشاء",
    adminConfirmDelete: (username: string) => `هل أنت متأكد من رغبتك في حذف المستخدم "${username}"؟`,
    formulasCount: (n) => {
      if (n === 1) return "تركيبة واحدة";
      if (n === 2) return "تركيبتان";
      if (n >= 3 && n <= 10) return `${n} تركيبات`;
      return `${n} تركيبة`;
    },
    foundCount: (n) => {
      if (n === 1) return "تم العثور على لون واحد";
      if (n === 2) return "تم العثور على لونين";
      if (n >= 3 && n <= 10) return `تم العثور على ${n} ألوان`;
      return `تم العثور على ${n} لونًا`;
    },
    truncatedHint: (max) => `يتم عرض أول ${max} نتائج. يرجى تحسين البحث.`,
    totalFormula: (c, f) => `${c} ألوان، ${f} تركيبات`,
    colorsBadge: (n) => `${n} ألوان`,
    formulasBadge: (n) => `${n} تركيبات`,
  }),

  // ========== Nederlands ==========
  nl: dict({
    brandName: "HIWE Formule zoeken",
    brandNameShort: "HIWE",
    heroTitlePrefix: "Vind uw",
    heroTitleHighlight: "perfecte match",
    login: "Inloggen",
    close: "Sluiten",
    brandSlogan: "AUTORETOUCHE FORMULESYSTEEM",
    officialWebsite: "Officiële website",
    loginMobileTitle: "Welkom bij HAIWEN",
    guideSearchPlaceholder: "Gidsen zoeken...",
    guideCategories: "Categorieën",
    guideAllCategories: "Alle categorieën",
    guideListLabel: "Gidsenlijst",
    guideSelectHint: "Selecteer links een gids",
    navSearch: "Zoeken", navProducts: "Producten", navAbout: "Over ons",
    navFormulaSearch: "Formule zoeken",
    navColorLibrary: "Toner",
    navAppGuide: "Toepassingsgids",
    navAdmin: "Gegevensbeheer",
    userManagement: "Gebruikersbeheer",
    logout: "Afmelden",
    loginWelcome: "Welkom terug",
    loginSubtitle: "Voer uw inloggegevens in",
    loginEmail: "E-mail", loginPassword: "Wachtwoord",
    loginPlaceholderEmail: "u@voorbeeld.com",
    loginPlaceholderPassword: "Voer uw wachtwoord in",
    loginButton: "Starten", loginSigningIn: "Inloggen...",
    loginErrorEmpty: "Voer gebruikersnaam en wachtwoord in",
    loginErrorNetwork: "Netwerkfout, probeer opnieuw",
    loginErrorFailed: "Inloggen mislukt",
    panelTitle: "Formule zoeken",
    make: "Merk", colorCode: "Kleurcode", colorName: "Kleurnaam", colorType: "Kleurtype",
    allMakes: "Alle merken",
    colorTypeAll: "Alle", colorTypeSolid: "Effen", colorTypeMetallic: "Metallic",
    colorTypePearl: "Parelmoer", colorTypeMatte: "Mat", colorTypeCandy: "Candy",
    search: "Zoeken", searching: "Zoeken...", reset: "Resetten",
    codeTooLong: "Kleurcode is meestal <= 10 tekens",
    colorCodePlaceholder: "bijv. 040, NH731P",
    colorNamePlaceholder: "bijv. Super White",
    year: "Jaar", yearPlaceholder: "bijv. 2020 of 2018-2022",
    detail: "Detail", expand: "Uitklappen", collapse: "Inklappen",
    version: "Versie", paintSystemNotes: "Notities",
    volume: "Volume", tonerCode: "Tonercode", tonerName: "Toner naam",
    percentage: "Percentage(%)", actualAmount: "Werkelijke hoeveelheid(g)",
    colorInfo: "Kleurinfo", formulaVariants: "Formulevarianten", components: "Componenten",
    makeLabel: "Merk", typeLabel: "Type", yearsLabel: "Jaren", codeLabel: "Code",
    print: "Afdrukken", copy: "Kopiëren", notesLabel: "Notities", updatedLabel: "Bijgewerkt",
    colorTypeSolidLabel: "Effen", colorTypeMetallicLabel: "Metallic", colorTypePearlLabel: "Parelmoer",
    colorTypeMatteLabel: "Mat", colorTypeCandyLabel: "Candy", colorTypeSpecialLabel: "Speciaal",
    copySuccess: "Gekopieerd naar klembord", copyFail: "Kopiëren mislukt",
    searchHint: "Voer links zoekcriteria in",
    noResults: "Geen overeenkomende kleuren gevonden",
    noResultsHint: "Probeer een ander merk of kleurcode",
    adminTitle: "Gebruikerslijst",
    adminNewUser: "Nieuwe gebruiker",
    adminNoPermission: "Geen toegangsrechten",
    adminPasswordRequired: "Wachtwoord is verplicht voor nieuwe gebruiker",
    adminCannotDeleteAdmin: "Kan superbeheerder niet verwijderen",
    adminLoading: "Laden...",
    adminColId: "ID",
    adminColUsername: "Gebruikersnaam",
    adminColRole: "Rol",
    adminColCreatedAt: "Aangemaakt op",
    adminColActions: "Acties",
    adminRoleAdmin: "Beheerder",
    adminRoleUser: "Gebruiker",
    adminEdit: "Bewerken",
    adminDelete: "Verwijderen",
    adminEditTitle: "Gebruiker bewerken",
    adminLabelPassword: "Wachtwoord",
    adminPasswordHint: "Laat leeg om ongewijzigd te laten",
    adminPasswordPlaceholder: "Laat leeg om te behouden",
    adminLabelRole: "Rol",
    adminCancel: "Annuleren",
    adminSave: "Opslaan",
    adminCreate: "Aanmaken",
    adminConfirmDelete: (username: string) => `Weet u zeker dat u gebruiker "${username}" wilt verwijderen?`,
    formulasCount: (n) => `${n} formule${n > 1 ? "s" : ""}`,
    foundCount: (n) => `${n} kleur${n > 1 ? "en" : ""} gevonden`,
    truncatedHint: (max) => `Eerste ${max} resultaten weergegeven. Vernauw uw zoekopdracht.`,
    totalFormula: (c, f) => `${c} kleur${c > 1 ? "en" : ""}, ${f} formule${f > 1 ? "s" : ""}`,
    colorsBadge: (n) => `${n} Kleuren`,
    formulasBadge: (n) => `${n} Formules`,
  }),
};
