"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/components/LanguageContext";
import type { FormulaTableRow } from "@/types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

export interface SearchResultsProps {
  rows: FormulaTableRow[];
  isLoading: boolean;
  hasSearched: boolean;
  onOpenFormula: (row: FormulaTableRow) => void;
}

const FONT = 'var(--font-inter), var(--font-noto), "Helvetica Neue", Arial, sans-serif';
const HEADER_FONT_SIZE = "0.8125rem";
const CELL_FONT_SIZE = "0.9375rem";
const CAPTION_FONT_SIZE = "0.875rem";

// 列宽定义，确保间距均匀
const COLUMN_WIDTHS = {
  colorType: 80,
  manufacturer: 150,
  carModel: 150,
  formulaVariants: 130,
  code: 100,
  colorName: 150,
  years: 120,
  version: 100,
  action: 60,
};

// 列背景色 - 偶数列加淡灰背景以区分列边界
const COLUMN_BG = {
  odd: "transparent",           // 奇数列：透明（跟随行色）
  even: "rgba(0, 0, 0, 0.025)", // 偶数列：2.5% 黑色透明度
};

function colorSwatchStyle(hex: string): React.CSSProperties {
  return {
    backgroundColor: hex,
    backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 16%, rgba(0,0,0,0) 32%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.50) 50%, rgba(255,255,255,0.28) 58%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.12) 84%, rgba(0,0,0,0.32) 100%)",
  };
}

function SkeletonRows() {
  return (
    <TableBody>
      {[0, 1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="rounded" width={40} height={20} /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" width={80} height={24} /></TableCell>
          <TableCell><Skeleton variant="text" width="60%" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" width={40} /></TableCell>
          <TableCell><Skeleton variant="text" width={60} /></TableCell>
          <TableCell><Skeleton variant="circular" width={28} height={28} /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function SearchResults({
  rows,
  isLoading,
  hasSearched,
  onOpenFormula,
}: SearchResultsProps) {
  const { t } = useLang();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [rows]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontFamily: FONT, fontSize: CAPTION_FONT_SIZE, mb: 1 }}>
          <Skeleton variant="text" width={180} />
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
          <Table size="small">
            <SkeletonRows />
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (!hasSearched) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t.searchHint}
        </Typography>
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, p: 3 }}>
        <SearchOffIcon sx={{ fontSize: 56, color: "grey.300", mb: 2 }} />
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontFamily: FONT, fontSize: CELL_FONT_SIZE }}>
          {t.noResults}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontFamily: FONT, fontSize: CAPTION_FONT_SIZE, mt: 0.5 }}>
          {t.noResultsHint}
        </Typography>
      </Box>
    );
  }

  const pageRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", fontFamily: FONT, fontSize: "1.0625rem", fontWeight: 600, mb: 1 }}>
        {t.foundFormulas(rows.length)}
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: "1px solid", borderColor: "grey.200" }}>
        <Table sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a1a" }}>
              <TableCell sx={{ width: COLUMN_WIDTHS.colorType, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.colorType}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.manufacturer, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.manufacturerLabel}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.carModel, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.carModelLabel}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.formulaVariants, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.formulaVariants}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.code, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.codeLabel}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.colorName, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.colorName}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.years, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.yearsLabel}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.version, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5 }}>{t.versionLabel}</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.action }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row, index) => (
              <TableRow
                key={row.formula.id}
                sx={{
                  borderBottom: "1px solid #e5e7eb",
                  bgcolor: index % 2 === 0 ? "#ffffff" : "#fafafa",
                  "&:last-child td": { borderBottom: "none" },
                  "&:hover": { bgcolor: "#f5f5f5" },
                  transition: "background-color 0.15s ease",
                }}
              >
                {/* col 0: colorType (odd) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.odd }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 16,
                      borderRadius: 0.5,
                      border: 1,
                      borderColor: "grey.200",
                    }}
                    style={colorSwatchStyle(row.color.hex_preview)}
                  />
                </TableCell>
                {/* col 1: manufacturer (even) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.even }}>
                  <Typography variant="body2" noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, fontWeight: 500, color: "#1a1a1a" }}>{row.makeName}</Typography>
                </TableCell>
                {/* col 2: carModel (odd) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.odd }}>
                  <Typography variant="body2" noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151" }}>
                    {row.color.car_model || "—"}
                  </Typography>
                </TableCell>
                {/* col 3: formulaVariants (even) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.even }}>
                  <Chip
                    label={row.variant?.name ?? row.formula.variant_id}
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => onOpenFormula(row)}
                    sx={{
                      fontFamily: FONT,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      height: 24,
                      "&:hover": { bgcolor: "primary.main", color: "white" },
                    }}
                  />
                </TableCell>
                {/* col 4: code (odd) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.odd }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151", fontWeight: 500 }}>
                    {row.color.color_code}
                  </Typography>
                </TableCell>
                {/* col 5: colorName (even) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.even }}>
                  <Typography variant="body2" noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#1a1a1a" }}>{row.color.color_name}</Typography>
                </TableCell>
                {/* col 6: years (odd) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.odd }}>
                  <Typography variant="body2" sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#9ca3af" }}>
                    {row.variant?.year_range ?? "-"}
                  </Typography>
                </TableCell>
                {/* col 7: version (even) */}
                <TableCell sx={{ py: 2, bgcolor: COLUMN_BG.even }}>
                  <Typography variant="body2" sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151", fontWeight: 500 }}>{row.formula.version}</Typography>
                </TableCell>
                {/* col 8: action (odd) */}
                <TableCell align="center" sx={{ py: 2, bgcolor: COLUMN_BG.odd }}>
                  <IconButton
                    onClick={() => onOpenFormula(row)}
                    size="small"
                    sx={{ color: "#9ca3af", "&:hover": { bgcolor: "rgba(13,148,136,0.08)", color: "primary.main" } }}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage={t.pageSizeLabel}
        />
      </TableContainer>
    </Box>
  );
}
