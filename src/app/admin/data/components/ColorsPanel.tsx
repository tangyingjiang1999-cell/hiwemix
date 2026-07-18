"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { CarMake, Color, ColorVariant } from "@/types";
import { colorSwatchStyle } from "@/lib/utils";
import { generateColorId } from "@/lib/id-generator";
import { FONT, HEADER_BG, HEADER_FONT_SIZE, CELL_FONT_SIZE, COLUMN_BG, ROW_BG, HOVER_BG, HOVER_TRANSITION, tableContainerSx, tableSx, cellSx, headerCellSx, getRowSx, actionButtonSx, deleteButtonSx } from "@/components/admin-table-styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const COLOR_TYPES = ["solid", "metallic", "pearl", "matte", "candy", "special"] as const;

const CARD_STYLE = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "grey.200",
  overflow: "hidden",
};

const CARD_TITLE_STYLE = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#1a1a1a",
  mb: 2,
  pb: 1.5,
  borderBottom: "1px solid #e5e7eb",
};

const COLUMN_WIDTHS = {
  preview: 60,
  colorCode: 120,
  colorName: 150,
  carModel: 120,
  brand: 120,
  colorType: 80,
  yearCount: 80,
  actions: 100,
};

interface ExpandedColorRow {
  /** 颜色 ID（所有子行共享） */
  colorId: string;
  /** 在颜色组中的位置（0-based），0 = 第一行（渲染合并单元格） */
  groupIndex: number;
  /** 该颜色组的总行数，用作 rowSpan 值 */
  groupSize: number;
  /** 该子行的年份，或 undefined（无年份） */
  year: number | undefined;
  // ---- 以下为显示字段（仅 groupIndex === 0 时渲染） ----
  color_code: string;
  color_name: string;
  color_type: Color["color_type"];
  hex_preview: string;
  car_model?: string;
  brandName: string;
  yearCount: number;
  /** 原始 Color 对象引用（用于编辑/删除操作） */
  originalColor: Color;
}

export default function ColorsPanel() {
  const [colors, setColors] = useState<Color[]>([]);
  const [brands, setBrands] = useState<CarMake[]>([]);
  const [allVariants, setAllVariants] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [form, setForm] = useState({ id: "", make_id: "", color_code: "", color_name: "", color_type: "solid" as Color["color_type"], hex_preview: "#FFFFFF", car_model: "" });
  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const idManuallyEdited = useRef(false);
  const yearInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing && !idManuallyEdited.current && form.make_id && form.color_code) {
      setForm((prev) => ({ ...prev, id: generateColorId(form.make_id, form.color_code) }));
    }
  }, [form.make_id, form.color_code, editing]);

  const fetchColors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/colors");
      if (res.ok) setColors(await res.json());
    } catch { /* network error */ }
    setLoading(false);
  }, []);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchColors();
    fetch("/api/admin/brands", { signal: ctrl.signal }).then((r) => r.ok ? r.json() : []).then(setBrands).catch(() => {});
    fetch("/api/admin/variants", { signal: ctrl.signal }).then((r) => r.ok ? r.json() : []).then(setAllVariants).catch(() => {});
    return () => ctrl.abort();
  }, [fetchColors]);

  useEffect(() => {
    setPage(0);
  }, [colors]);

  function openCreate() {
    setEditing(null); setForm({ id: "", make_id: "", color_code: "", color_name: "", color_type: "solid", hex_preview: "#FFFFFF", car_model: "" });
    setVariantIds([]); setYears([]); setError(""); idManuallyEdited.current = false; setShowModal(true);
  }
  function openEdit(c: Color) {
    setEditing(c); setForm({ id: c.id, make_id: c.make_id, color_code: c.color_code, color_name: c.color_name, color_type: c.color_type, hex_preview: c.hex_preview, car_model: c.car_model ?? "" });
    setVariantIds(c.variants.map((v) => v.id)); setYears(c.years || []); setError(""); setShowModal(true);
  }
  async function handleSave() {
    setError("");
    if (!form.id || !form.make_id || !form.color_code || !form.color_name) { setError("所有字段不能为空"); return; }
    try {
      const m = editing ? "PUT" : "POST";
      const res = await fetch("/api/admin/colors", { method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, variantIds, years }) });
      if (res.ok) { setShowModal(false); fetchColors(); }
      else { const d = await res.json(); setError(d.error || "保存失败"); }
    } catch { setError("网络错误，请重试"); }
  }
  async function handleDelete(c: Color) {
    if (!confirm(`确定删除颜色「${c.color_name}」吗？`)) return;
    try {
      await fetch("/api/admin/colors", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) });
      fetchColors();
    } catch { /* network error */ }
  }
  function toggleVariant(id: string) { setVariantIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]); }

  const brandMap = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);

  // 将 colors 转换为展开后的行数组
  const allExpandedRows: ExpandedColorRow[] = useMemo(() => colors.flatMap((c) => {
    const brandName = brandMap.get(c.make_id) ?? c.make_id;
    const sortedYears = [...(c.years ?? [])].sort((a, b) => a - b);
    const groupSize = Math.max(sortedYears.length, 1);

    if (sortedYears.length === 0) {
      // 没有年份：单行，year = undefined
      return [{
        colorId: c.id,
        groupIndex: 0,
        groupSize: 1,
        year: undefined,
        color_code: c.color_code,
        color_name: c.color_name,
        color_type: c.color_type,
        hex_preview: c.hex_preview,
        car_model: c.car_model,
        brandName,
        yearCount: 0,
        originalColor: c,
      }];
    }

    // 有年份：每个年份一行
    return sortedYears.map((year, i): ExpandedColorRow => ({
      colorId: c.id,
      groupIndex: i,
      groupSize: sortedYears.length,
      year,
      color_code: c.color_code,
      color_name: c.color_name,
      color_type: c.color_type,
      hex_preview: c.hex_preview,
      car_model: c.car_model,
      brandName,
      yearCount: sortedYears.length,
      originalColor: c,
    }));
  }), [colors, brandMap]);

  // 按搜索关键词过滤（先过滤，再分页）
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allExpandedRows;
    return allExpandedRows.filter((row) => {
      if (row.color_code.toLowerCase().includes(q)) return true;
      if (row.color_name.toLowerCase().includes(q)) return true;
      if (row.car_model?.toLowerCase().includes(q)) return true;
      if (row.brandName.toLowerCase().includes(q)) return true;
      if (row.color_type.toLowerCase().includes(q)) return true;
      if (row.year !== undefined && String(row.year).includes(q)) return true;
      return false;
    });
  }, [allExpandedRows, searchQuery]);

  // 搜索时回到第一页
  useEffect(() => { setPage(0); }, [searchQuery]);

  // 分页展开后的行
  const pageRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 1.5, gap: 1.5 }}>
        <TextField
          size="small"
          placeholder="搜索颜色、车型、品牌..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <Box component="span" sx={{ display: "flex", alignItems: "center", mr: 0.75, color: "text.disabled" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </Box>
              ),
            },
          }}
          sx={{
            width: 260,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "0.8125rem",
              bgcolor: "#fff",
              "& fieldset": { borderColor: "#3b82f6", borderWidth: 2 },
              "&:hover fieldset": { borderColor: "#2563eb" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
            },
          }}
        />
        <Button onClick={openCreate} variant="contained" size="small">+ 新增颜色</Button>
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 1, border: "1px solid", borderColor: "grey.200" }}
      >
        <Table sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a1a" }}>
              <TableCell sx={{ width: COLUMN_WIDTHS.preview, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5, textAlign: "center" }}>预览</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.colorCode, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5, textAlign: "center" }}>颜色代码</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.colorName, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5, textAlign: "center" }}>颜色名称</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.carModel, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5, textAlign: "center" }}>车型</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.brand, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5, textAlign: "center" }}>品牌</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.colorType, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5, textAlign: "center" }}>类型</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.yearCount, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: HEADER_FONT_SIZE, borderBottom: "2px solid #333", py: 1.5, textAlign: "center" }}>年份</TableCell>
              <TableCell sx={{ width: COLUMN_WIDTHS.actions, borderBottom: "2px solid #333", py: 1.5 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row, index) => (
              <TableRow
                key={`${row.colorId}-${row.year ?? 'none'}`}
                sx={{
                  borderBottom: "1px solid #e5e7eb",
                  "&:last-child td": { borderBottom: "none" },
                }}
              >
                <TableCell sx={{ py: 1.4, bgcolor: COLUMN_BG.odd, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Box
                    sx={{ width: 40, height: 24, borderRadius: 0.5, border: 1, borderColor: "grey.200" }}
                    style={colorSwatchStyle(row.hex_preview)}
                  />
                </TableCell>
                <TableCell sx={{ py: 1.4, bgcolor: COLUMN_BG.even, textAlign: "center" }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151", fontWeight: 500 }}>
                    {row.color_code}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.4, bgcolor: COLUMN_BG.odd, textAlign: "center" }}>
                  <Typography variant="body2" noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#1a1a1a" }}>
                    {row.color_name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.4, bgcolor: COLUMN_BG.even, textAlign: "center" }}>
                  <Typography variant="body2" noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151" }}>
                    {row.car_model || "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.4, bgcolor: COLUMN_BG.odd, textAlign: "center" }}>
                  <Typography variant="body2" noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, fontWeight: 500, color: "#1a1a1a" }}>
                    {row.brandName}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.4, bgcolor: COLUMN_BG.even, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151" }}>
                    {row.color_type}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.4, bgcolor: COLUMN_BG.even, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#9ca3af" }}>
                    {row.year ?? ""}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1.4, bgcolor: COLUMN_BG.odd }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                    <IconButton onClick={() => openEdit(row.originalColor)} size="small" sx={{ color: "#9ca3af", "&:hover": { bgcolor: "rgba(36,135,202,0.08)", color: "primary.main" } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.originalColor)} size="small" sx={{ color: "#9ca3af", "&:hover": { bgcolor: "rgba(239,68,68,0.08)", color: "error.main" } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="每页行数"
        />
      </TableContainer>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #e5e7eb", pb: 2, mb: 0 }}>
          {editing ? "编辑颜色" : "新增颜色"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <Stack spacing={3}>
            {/* 卡片1：基本信息 */}
            <Paper variant="outlined" sx={CARD_STYLE}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={CARD_TITLE_STYLE}>基本信息</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="ID"
                    value={form.id}
                    onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }}
                    disabled={!!editing}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    select
                    label="品牌"
                    value={form.make_id}
                    onChange={(e) => setForm({ ...form, make_id: e.target.value })}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">请选择品牌</MenuItem>
                    {brands.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                  </TextField>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="颜色代码"
                      value={form.color_code}
                      onChange={(e) => setForm({ ...form, color_code: e.target.value })}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="颜色名称"
                      value={form.color_name}
                      onChange={(e) => setForm({ ...form, color_name: e.target.value })}
                      size="small"
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      select
                      label="类型"
                      value={form.color_type}
                      onChange={(e) => setForm({ ...form, color_type: e.target.value as Color["color_type"] })}
                      size="small"
                      fullWidth
                    >
                      {COLOR_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                    <TextField
                      label="预览色"
                      type="color"
                      value={form.hex_preview}
                      onChange={(e) => setForm({ ...form, hex_preview: e.target.value })}
                      size="small"
                      fullWidth
                      sx={{ "& input": { height: 32, p: 0.5 } }}
                    />
                  </Stack>
                  <TextField
                    label="车型"
                    value={form.car_model}
                    onChange={(e) => setForm({ ...form, car_model: e.target.value })}
                    placeholder="例如 Camry / Corolla"
                    size="small"
                    fullWidth
                  />
                </Stack>
              </CardContent>
            </Paper>

            {/* 卡片2：适用年份 */}
            <Paper variant="outlined" sx={CARD_STYLE}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={CARD_TITLE_STYLE}>适用年份</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {years.map((year) => (
                    <Chip
                      key={year}
                      label={year}
                      onDelete={() => setYears(years.filter((y) => y !== year))}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {years.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      暂无年份
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1} useFlexGap>
                  <TextField
                    label="添加年份"
                    type="number"
                    size="small"
                    sx={{ width: 120 }}
                    slotProps={{ htmlInput: { min: 1900, max: 2100, ref: yearInputRef } }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement;
                        const val = parseInt(target.value, 10);
                        if (val >= 1900 && val <= 2100 && !years.includes(val)) {
                          setYears([...years, val].sort((a, b) => a - b));
                          target.value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const input = yearInputRef.current;
                      if (input) {
                        const val = parseInt(input.value, 10);
                        if (val >= 1900 && val <= 2100 && !years.includes(val)) {
                          setYears([...years, val].sort((a, b) => a - b));
                          input.value = "";
                        }
                      }
                    }}
                  >
                    添加
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  按 Enter 或点击「添加」按钮添加年份
                </Typography>
              </CardContent>
            </Paper>

            {/* 卡片3：关联变体 */}
            <Paper variant="outlined" sx={CARD_STYLE}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={CARD_TITLE_STYLE}>关联变体</Typography>
                <Box
                  sx={{
                    maxHeight: 200,
                    overflow: "auto",
                    border: 1,
                    borderColor: "grey.200",
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  {allVariants.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      暂无变体
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {allVariants.map((v) => (
                        <FormControlLabel
                          key={v.id}
                          control={
                            <Checkbox
                              checked={variantIds.includes(v.id)}
                              onChange={() => toggleVariant(v.id)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {v.name} <Typography variant="caption" color="text.secondary">({v.year_range})</Typography>
                            </Typography>
                          }
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Paper>

            {error && (
              <Box sx={{ color: "error.main", fontSize: "0.8125rem" }}>{error}</Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #e5e7eb", pt: 2, pb: 2.5, px: 3 }}>
          <Button onClick={() => setShowModal(false)} variant="outlined" sx={{ borderRadius: 2 }}>取消</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2 }}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
