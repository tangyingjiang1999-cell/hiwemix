// 共享的表格样式常量 - 供所有Data Management面板复用

export const FONT = 'var(--font-inter), var(--font-noto), "Helvetica Neue", Arial, sans-serif';
export const HEADER_BG = "#2487ca";
export const HEADER_FONT_SIZE = "0.8125rem";
export const CELL_FONT_SIZE = "0.875rem";
export const CELL_BORDER_COLOR = "#e5e7eb";
export const HEADER_BORDER_COLOR = "#1d6ea8";

// 斑马纹背景
export const COLUMN_BG = {
  odd: "transparent",
  even: "rgba(0, 0, 0, 0.02)",
};

export const ROW_BG = {
  odd: "#ffffff",
  even: "#fafafa",
};

// 悬停效果
export const HOVER_BG = "#f9fafb";
export const HOVER_TRANSITION = "background-color 0.15s ease";

// 表头单元格样式
export const headerCellSx = {
  fontWeight: 700,
  color: "#f9fafb",
  fontFamily: FONT,
  fontSize: HEADER_FONT_SIZE,
  letterSpacing: "0.025em",
  textTransform: "uppercase" as const,
  borderBottom: "none",
  py: 1,
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
  borderBottom: `1px solid ${CELL_BORDER_COLOR}`,
  verticalAlign: "middle" as const,
};

// 带斑马纹的单元格样式
export const getCellSx = (colIndex: number, rowIndex: number, colBgOdd = COLUMN_BG.odd, colBgEven = COLUMN_BG.even) => ({
  ...cellSx,
  bgcolor: colIndex % 2 === 0 ? colBgOdd : colBgEven,
});

// 行样式
export const getRowSx = (_rowIndex: number) => ({
  borderBottom: `1px solid ${CELL_BORDER_COLOR}`,
  "&:last-child td": { borderBottom: "none" },
  transition: "background-color 0.15s ease",
  "&:hover": { bgcolor: HOVER_BG },
});

// 表格容器样式（移动端横向滚动）
export const tableContainerSx = {
  borderRadius: "0",
  border: "1px solid #e5e7eb",
  borderTop: "2px solid #2487ca",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  overflowX: "auto",
  overflowY: "hidden",
  "-webkit-overflow-scrolling": "touch",
};

// 表格元素样式（移动端用最小宽度撑出横滚）
export const tableSx = {
  tableLayout: "fixed" as const,
  width: "100%",
  minWidth: { xs: 640, md: "100%" },
} as const;

// 操作按钮通用样式
export const actionButtonSx = {
  color: "#9ca3af",
  "&:hover": {
    bgcolor: "rgba(36,135,202,0.08)",
    color: "primary.main",
  },
};

export const deleteButtonSx = {
  color: "#9ca3af",
  "&:hover": {
    bgcolor: "rgba(239,68,68,0.08)",
    color: "error.main",
  },
};
