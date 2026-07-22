// 共享的表格样式常量 - 供所有Data Management面板复用

export const FONT = 'var(--font-inter), var(--font-noto), "Helvetica Neue", Arial, sans-serif';
export const HEADER_BG = "grey.50";
export const HEADER_FONT_SIZE = "0.75rem";
export const CELL_FONT_SIZE = "0.875rem";
export const CELL_BORDER_COLOR = "grey.100";
export const HEADER_BORDER_COLOR = "grey.200";

// 斑马纹背景
export const COLUMN_BG = {
  odd: "transparent",
  even: "rgba(0, 0, 0, 0.02)",
};

export const ROW_BG = {
  odd: "#ffffff",
  even: "grey.50",
};

// 悬停效果
export const HOVER_BG = "grey.100";
export const HOVER_TRANSITION = "background-color 0.15s ease";

// 表头单元格样式（浅灰背景 + 深色粗体文字，现代SaaS风格）
export const headerCellSx = {
  fontWeight: 600,
  color: "grey.800",
  fontFamily: FONT,
  fontSize: HEADER_FONT_SIZE,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  borderBottom: "1px solid",
  borderBottomColor: "grey.200",
  py: 1.25,
  px: 1.5,
  textAlign: "center" as const,
};

// 基础单元格样式
export const cellSx = {
  py: 1.25,
  px: 1.5,
  textAlign: "center" as const,
  fontFamily: FONT,
  fontSize: CELL_FONT_SIZE,
  borderBottom: 1,
  borderColor: "grey.100",
  verticalAlign: "middle" as const,
};

// 带斑马纹的单元格样式
export const getCellSx = (colIndex: number, rowIndex: number, colBgOdd = COLUMN_BG.odd, colBgEven = COLUMN_BG.even) => ({
  ...cellSx,
  bgcolor: colIndex % 2 === 0 ? colBgOdd : colBgEven,
});

// 行样式
export const getRowSx = (_rowIndex: number) => ({
  borderBottom: 1,
  borderColor: "grey.100",
  "&:last-child td": { borderBottom: "none" },
  transition: HOVER_TRANSITION,
  "&:hover": { bgcolor: HOVER_BG },
});

// 表格容器样式（微圆角 + 极浅阴影 + 外边框，现代SaaS风格）
export const tableContainerSx = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  borderTop: "1px solid",
  borderTopColor: "primary.light",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
};

// 表格元素样式（移动端用最小宽度撑出横滚）
export const tableSx = {
  tableLayout: "fixed" as const,
  width: "100%",
  minWidth: { xs: 640, md: "100%" },
} as const;

// 编辑操作按钮（默认灰色，hover 显示圆形浅灰背景 + 主题蓝色）
export const actionButtonSx = {
  color: "text.disabled",
  borderRadius: "50%",
  transition: "color 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    bgcolor: "grey.100",
    color: "primary.main",
  },
};

// 删除操作按钮（默认灰色，hover 显示圆形浅红背景 + 错误红色 —— 安全感设计）
export const deleteButtonSx = {
  color: "text.disabled",
  borderRadius: "50%",
  transition: "color 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    bgcolor: "rgba(220,38,38,0.08)",
    color: "error.main",
  },
};

// 搜索输入框统一样式（微圆角白底 + 分割线边框，聚焦时主题蓝色）
export const SEARCH_INPUT_SX = {
  width: 260,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontSize: "0.8125rem",
    bgcolor: "background.paper",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "grey.400" },
    "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 1 },
  },
};

// 单元格文字样式（复用避免散落硬编码颜色）
export const CELL_TEXT_PRIMARY_SX = {
  fontFamily: FONT,
  fontSize: CELL_FONT_SIZE,
  color: "text.primary",
};

export const CELL_TEXT_SECONDARY_SX = {
  fontFamily: FONT,
  fontSize: CELL_FONT_SIZE,
  color: "text.secondary",
};
