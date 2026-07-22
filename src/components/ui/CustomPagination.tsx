"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface CustomPaginationProps {
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  unitName?: string;
}

const FONT = 'var(--font-inter), var(--font-noto), "Helvetica Neue", Arial, sans-serif';

export default function CustomPagination({
  totalCount,
  page,
  pageSize,
  onPageChange,
  unitName = "formulas",
}: CustomPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.5,
        px: 2,
        borderTop: "1px solid",
        borderColor: "grey.200",
      }}
    >
      {/* 左侧：统计文本 */}
      <Typography
        sx={{
          fontFamily: FONT,
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "primary.main",
        }}
        aria-live="polite"
      >
        Found {totalCount} {unitName}
      </Typography>

      {/* 右侧：极简翻页器 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: "0.8125rem",
            color: "text.secondary",
            mr: 0.5,
          }}
        >
          {page + 1} / {totalPages}
        </Typography>
        <IconButton
          size="small"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          sx={{
            color: "text.secondary",
            "&:hover": { color: "primary.main", bgcolor: "rgba(36,135,202,0.08)" },
            "&.Mui-disabled": { color: "grey.300" },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          sx={{
            color: "text.secondary",
            "&:hover": { color: "primary.main", bgcolor: "rgba(36,135,202,0.08)" },
            "&.Mui-disabled": { color: "grey.300" },
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
