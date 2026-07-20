"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLang } from "@/components/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { TONERS as DEFAULT_TONERS, TONER_CATEGORIES } from "@/data/toners";
import type { Toner, TonerCategory } from "@/types";
import { useAuth } from "@/components/AuthContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import Slider from "@mui/material/Slider";

const FONT = 'var(--font-inter), var(--font-noto), "Helvetica Neue", Arial, sans-serif';

// ==================== 工具函数 ====================

/** 判断颜色是否过浅（白色/接近白色），需要特殊处理边框 */
function isLightColor(hex: string): boolean {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return false;
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 220;
}

/** RGB 对象 → 十六进制颜色字符串（如 "#2A4B6C"） */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** 十六进制颜色字符串 → RGB 对象 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

/** 生成唯一色母代码（基于分类前缀 + 自增序号） */
function generateTonerCode(category: TonerCategory, existingCodes: string[]): string {
  const prefixMap: Record<TonerCategory, string> = {
    "2K_BASECOAT": "2K-",
    "1K_BASECOAT": "1K-",
    "1K_SILVER_BASECOAT": "1K-",
    "1K_PEARL_BASECOAT": "1K-",
    "SUPPLEMENTARY": "SUP-",
  };
  const prefix = prefixMap[category];
  // 找到该前缀下已有编号的最大值
  let maxNum = 0;
  for (const code of existingCodes) {
    if (code.startsWith(prefix)) {
      const suffix = code.slice(prefix.length);
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(4, "0")}`;
}

// ==================== 色母卡片组件 ====================

function TonerCard({ code, tradeName, hex }: { code: string; tradeName: string; hex: string }) {
  const swatchStyle: React.CSSProperties = {
    backgroundColor: hex,
    backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.16) 8%, rgba(0,0,0,0.04) 18%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.28) 38%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.28) 62%, rgba(255,255,255,0.08) 72%, rgba(0,0,0,0.04) 82%, rgba(0,0,0,0.16) 92%, rgba(0,0,0,0.30) 100%)",
  };

  const borderColor = isLightColor(hex) ? "#d1d5db" : hex;

  return (
    <Card sx={{
      cursor: "pointer",
      borderRadius: 0,
      boxShadow: "none",
      border: "1px solid",
      borderColor,
      transition: "all 0.2s ease",
      "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
    }}>
      <Box sx={{ height: 80, borderTopLeftRadius: "inherit", borderTopRightRadius: "inherit" }} style={swatchStyle} />
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.9375rem", color: "#111827", lineHeight: 1.3 }}>
          {code}
        </Typography>
        <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 500, fontSize: "0.75rem", color: "#9ca3af", mt: 0.5 }}>
          {tradeName}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ==================== 新增材料表单（次级弹窗） ====================

const ADD_FORM_INITIAL = {
  category: "" as TonerCategory | "",
  code: "",
  tradeName: "",
  nameZh: "",
  r: 128,
  g: 128,
  b: 128,
};

function AddMaterialDialog({
  open,
  onClose,
  onSave,
  existingCodes,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (toner: Toner) => void;
  existingCodes: string[];
}) {
  const [form, setForm] = useState(ADD_FORM_INITIAL);
  const [error, setError] = useState("");

  // 每次打开时重置表单 + 自动生成代码
  useEffect(() => {
    if (!open) return;
    setForm({ ...ADD_FORM_INITIAL });
    setError("");
  }, [open]);

  // 分类变更时自动生成代码
  useEffect(() => {
    if (!open || !form.category) return;
    const newCode = generateTonerCode(form.category, existingCodes);
    setForm((prev) => ({ ...prev, code: newCode }));
  }, [form.category, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentHex = rgbToHex(form.r, form.g, form.b);

  function handleSave() {
    setError("");
    if (!form.category) { setError("请选择所属分类"); return; }
    if (!form.code.trim()) { setError("产品代码不能为空"); return; }
    if (!form.tradeName.trim()) { setError("英文名称不能为空"); return; }
    if (!form.nameZh.trim()) { setError("中文名称不能为空"); return; }

    const newToner: Toner = {
      code: form.code.trim(),
      tradeName: form.tradeName.trim(),
      nameZh: form.nameZh.trim(),
      category: form.category as TonerCategory,
      hex: currentHex,
    };

    onSave(newToner);
    onClose();
  }

  const RGB_MAX = 255;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: "1px solid #e5e7eb", pb: 2, mb: 0, display: "flex", alignItems: "center", gap: 1 }}>
        <AddIcon sx={{ color: "primary.main" }} />
        新增材料
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        <Stack spacing={2.5}>

          {/* 分类选择 */}
          <TextField
            select
            label="所属分类"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as TonerCategory })}
            size="small"
            fullWidth
          >
            <MenuItem value="">请选择分类</MenuItem>
            {TONER_CATEGORIES.map((cat) => (
              <MenuItem key={cat.key} value={cat.key}>{cat.label}</MenuItem>
            ))}
          </TextField>

          {/* 产品代码（自动生成，可手动修改） */}
          <TextField
            label="产品代码"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            size="small"
            fullWidth
            helperText="选择分类后自动生成，也可手动修改"
          />

          {/* 英文名称 */}
          <TextField
            label="英文名称"
            value={form.tradeName}
            onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
            size="small"
            fullWidth
            placeholder="例如 Titanium White"
          />

          {/* 中文名称 */}
          <TextField
            label="中文名称"
            value={form.nameZh}
            onChange={(e) => setForm({ ...form, nameZh: e.target.value })}
            size="small"
            fullWidth
            placeholder="例如 纯白"
          />

          {/* RGB 颜色调节区 */}
          <Paper variant="outlined" sx={{ borderRadius: "0", border: "1px solid", borderColor: "grey.200", p: 2 }}>
            <Stack spacing={2}>
              {/* 实时颜色预览 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "0",
                    border: "2px solid",
                    borderColor: "grey.300",
                    flexShrink: 0,
                    transition: "background-color 0.15s",
                  }}
                  style={{ backgroundColor: currentHex }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                    {currentHex}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    R: {form.r} &nbsp; G: {form.g} &nbsp; B: {form.b}
                  </Typography>
                </Box>
              </Box>

              {/* R 通道 */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#ef4444", mb: 0.5 }}>
                  R — Red（红色）
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Slider
                    value={form.r}
                    onChange={(_, v) => setForm({ ...form, r: v as number })}
                    min={0}
                    max={RGB_MAX}
                    sx={{ flex: 1, color: "#ef4444", "& .MuiSlider-thumb": { borderRadius: "0" } }}
                  />
                  <TextField
                    type="number"
                    value={form.r}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) setForm({ ...form, r: v });
                    }}
                    size="small"
                    slotProps={{ htmlInput: { min: 0, max: RGB_MAX } }}
                    sx={{ width: 72 }}
                  />
                </Stack>
              </Box>

              {/* G 通道 */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#22c55e", mb: 0.5 }}>
                  G — Green（绿色）
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Slider
                    value={form.g}
                    onChange={(_, v) => setForm({ ...form, g: v as number })}
                    min={0}
                    max={RGB_MAX}
                    sx={{ flex: 1, color: "#22c55e", "& .MuiSlider-thumb": { borderRadius: "0" } }}
                  />
                  <TextField
                    type="number"
                    value={form.g}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) setForm({ ...form, g: v });
                    }}
                    size="small"
                    slotProps={{ htmlInput: { min: 0, max: RGB_MAX } }}
                    sx={{ width: 72 }}
                  />
                </Stack>
              </Box>

              {/* B 通道 */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#3b82f6", mb: 0.5 }}>
                  B — Blue（蓝色）
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Slider
                    value={form.b}
                    onChange={(_, v) => setForm({ ...form, b: v as number })}
                    min={0}
                    max={RGB_MAX}
                    sx={{ flex: 1, color: "#3b82f6", "& .MuiSlider-thumb": { borderRadius: "0" } }}
                  />
                  <TextField
                    type="number"
                    value={form.b}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) setForm({ ...form, b: v });
                    }}
                    size="small"
                    slotProps={{ htmlInput: { min: 0, max: RGB_MAX } }}
                    sx={{ width: 72 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* 错误提示 */}
          {error && (
            <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>{error}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ borderTop: "1px solid #e5e7eb", pt: 2, pb: 2.5, px: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 0 }}>取消</Button>
        <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 0 }}>保存提交</Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== 管理材料 Modal ====================

interface ManagementRow {
  original: Toner;
  displayCategory: string;
}

function ManagementModal({
  open,
  onClose,
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}: {
  open: boolean;
  onClose: () => void;
  items: Toner[];
  onUpdateItem: (toner: Toner) => void;
  onDeleteItem: (code: string) => void;
  onAddItem: (toner: Toner) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<Toner | null>(null);
  const [form, setForm] = useState({ code: "", tradeName: "", nameZh: "", category: "" as TonerCategory | "", hex: "#FFFFFF" });
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // 重置搜索/编辑状态
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setEditingItem(null);
      setError("");
    }
  }, [open]);

  const categoryLabel = useCallback((key: string) => {
    const cat = TONER_CATEGORIES.find((c) => c.key === key);
    return cat ? cat.label : key;
  }, []);

  const filteredRows: ManagementRow[] = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items
      .filter((toner) => {
        if (!q) return true;
        return (
          toner.code.toLowerCase().includes(q) ||
          toner.tradeName.toLowerCase().includes(q) ||
          toner.nameZh.includes(q) ||
          categoryLabel(toner.category).toLowerCase().includes(q)
        );
      })
      .map((toner) => ({
        original: toner,
        displayCategory: categoryLabel(toner.category),
      }));
  }, [items, searchQuery, categoryLabel]);

  function openEdit(item: Toner) {
    setEditingItem(item);
    setForm({
      code: item.code,
      tradeName: item.tradeName,
      nameZh: item.nameZh,
      category: item.category,
      hex: item.hex,
    });
    setError("");
  }

  function handleEditSave() {
    setError("");
    if (!form.code || !form.tradeName || !form.nameZh || !form.category) {
      setError("所有字段不能为空");
      return;
    }
    const updated: Toner = {
      code: form.code,
      tradeName: form.tradeName,
      nameZh: form.nameZh,
      category: form.category as TonerCategory,
      hex: form.hex,
    };
    onUpdateItem(updated);
    setEditingItem(null);
  }

  function handleDelete(item: Toner) {
    if (!confirm(`确定删除「${item.nameZh}（${item.code}）」吗？`)) return;
    onDeleteItem(item.code);
  }

  function handleAddItem(newToner: Toner) {
    onAddItem(newToner);
  }

  const existingCodes = useMemo(() => items.map((t) => t.code), [items]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ borderBottom: "1px solid #e5e7eb", pb: 2, mb: 0, display: "flex", alignItems: "center", gap: 1 }}>
        <SettingsIcon sx={{ color: "primary.main" }} />
        管理材料 — 数据管理中心
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        {/* 搜索 + 添加按钮 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <TextField
            size="small"
            placeholder="搜索色母代码、名称、分类..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <Box component="span" sx={{ display: "flex", alignItems: "center", mr: 0.75, color: "text.disabled" }}>
                    <SearchIcon sx={{ fontSize: 16 }} />
                  </Box>
                ),
              },
            }}
            sx={{
              width: 280,
              "& .MuiOutlinedInput-root": {
                borderRadius: "0",
                fontSize: "0.8125rem",
                bgcolor: "#fff",
                "& fieldset": { borderColor: "#3b82f6", borderWidth: 2 },
                "&:hover fieldset": { borderColor: "#2563eb" },
                "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
              },
            }}
          />

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              共 {filteredRows.length} 条记录
            </Typography>
            {/* ★ 添加材料按钮 */}
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
              sx={{
                borderRadius: "0",
                fontWeight: 600,
                fontSize: "0.8125rem",
                whiteSpace: "nowrap",
                bgcolor: "#2487ca",
                "&:hover": { bgcolor: "#1a6da8" },
              }}
            >
              添加材料
            </Button>
          </Stack>
        </Box>

        {/* 数据表格 */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 0, border: "1px solid", borderColor: "grey.200", borderTop: "2px solid #2487ca", maxHeight: 480, overflow: "auto" }}
        >
          <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#2487ca" }}>
                <TableCell sx={{ width: 56, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: "0.8125rem", borderBottom: "none", py: 1, textAlign: "center" }}>预览</TableCell>
                <TableCell sx={{ width: 110, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: "0.8125rem", borderBottom: "none", py: 1, textAlign: "center" }}>色母代码</TableCell>
                <TableCell sx={{ width: 160, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: "0.8125rem", borderBottom: "none", py: 1, textAlign: "center" }}>英文商品名</TableCell>
                <TableCell sx={{ width: 140, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: "0.8125rem", borderBottom: "none", py: 1, textAlign: "center" }}>中文品名</TableCell>
                <TableCell sx={{ width: 130, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, fontSize: "0.8125rem", borderBottom: "none", py: 1, textAlign: "center" }}>所属分类</TableCell>
                <TableCell sx={{ width: 100, borderBottom: "none", py: 1 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow
                  key={row.original.code}
                  sx={{
                    borderBottom: "1px solid #e5e7eb",
                    "&:last-child td": { borderBottom: "none" },
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  <TableCell sx={{ py: 1.2, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 20,
                        borderRadius: 0,
                        border: 1,
                        borderColor: "grey.200",
                        mx: "auto",
                      }}
                      style={{ backgroundColor: row.original.hex }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.2, textAlign: "center" }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.8125rem", fontWeight: 600, color: "#1a1a1a" }}>
                      {row.original.code}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.2, textAlign: "center" }}>
                    <Typography noWrap sx={{ fontFamily: FONT, fontSize: "0.8125rem", color: "#374151" }}>
                      {row.original.tradeName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.2, textAlign: "center" }}>
                    <Typography noWrap sx={{ fontFamily: FONT, fontSize: "0.8125rem", color: "#374151" }}>
                      {row.original.nameZh}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.2, textAlign: "center" }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6b7280" }}>
                      {row.displayCategory}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.2 }}>
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <IconButton
                        onClick={() => openEdit(row.original)}
                        size="small"
                        sx={{ color: "#9ca3af", "&:hover": { bgcolor: "rgba(36,135,202,0.08)", color: "primary.main" } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(row.original)}
                        size="small"
                        sx={{ color: "#9ca3af", "&:hover": { bgcolor: "rgba(239,68,68,0.08)", color: "error.main" } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">暂无匹配数据</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ borderTop: "1px solid #e5e7eb", pt: 2, pb: 2.5, px: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 0 }}>关闭</Button>
      </DialogActions>

      {/* ===== 编辑子弹窗 ===== */}
      <Dialog open={!!editingItem} onClose={() => setEditingItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #e5e7eb", pb: 2, mb: 0 }}>
          编辑色母 — {editingItem?.code}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <Stack spacing={2}>
            <TextField
              label="色母代码"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              disabled
              size="small"
              fullWidth
            />
            <TextField
              label="英文商品名"
              value={form.tradeName}
              onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="中文品名"
              value={form.nameZh}
              onChange={(e) => setForm({ ...form, nameZh: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              select
              label="所属分类"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as TonerCategory })}
              size="small"
              fullWidth
            >
              {TONER_CATEGORIES.map((cat) => (
                <MenuItem key={cat.key} value={cat.key}>{cat.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="预览色"
              type="color"
              value={form.hex}
              onChange={(e) => setForm({ ...form, hex: e.target.value })}
              size="small"
              fullWidth
              sx={{ "& input": { height: 32, p: 0.5 } }}
            />
            {error && (
              <Typography variant="body2" color="error">{error}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #e5e7eb", pt: 2, pb: 2.5, px: 3 }}>
          <Button onClick={() => setEditingItem(null)} variant="outlined" sx={{ borderRadius: 0 }}>取消</Button>
          <Button onClick={handleEditSave} variant="contained" sx={{ borderRadius: 0 }}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* ===== 新增材料子弹窗 ===== */}
      <AddMaterialDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddItem}
        existingCodes={existingCodes}
      />
    </Dialog>
  );
}

// ==================== 主页面 ====================

export default function TonerPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeCategory, setActiveCategory] = useState<TonerCategory>("2K_BASECOAT");
  const [searchQuery, setSearchQuery] = useState("");
  const [manageOpen, setManageOpen] = useState(false);

  // ★ 共享数据源：状态提升到页面级别，新增/编辑/删除联动刷新
  const [toners, setToners] = useState<Toner[]>(DEFAULT_TONERS);

  const filteredToners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return toners.filter((toner) => {
      if (toner.category !== activeCategory) return false;
      if (!q) return true;
      return toner.code.toLowerCase().includes(q) || toner.tradeName.toLowerCase().includes(q) || toner.nameZh.includes(q);
    });
  }, [toners, activeCategory, searchQuery]);

  // 管理弹窗回调
  const handleUpdateItem = useCallback((updated: Toner) => {
    setToners((prev) => prev.map((t) => t.code === updated.code ? updated : t));
  }, []);

  const handleDeleteItem = useCallback((code: string) => {
    setToners((prev) => prev.filter((t) => t.code !== code));
  }, []);

  const handleAddItem = useCallback((newToner: Toner) => {
    setToners((prev) => [...prev, newToner]);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <SiteHeader />

      {/* 顶部占位：为固定导航栏留出空间 */}
      <Box sx={{ height: 64 }} />

      <Box
        sx={{
          position: "sticky", top: 64, zIndex: 30, bgcolor: "#fff", borderBottom: 1, borderColor: "divider",
          px: { xs: 2, lg: 3 }, py: 1.5,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
          {/* 左侧：分类标签行 */}
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
            {TONER_CATEGORIES.filter((cat) => cat.key !== "SUPPLEMENTARY" || isAdmin).map((cat) => (
              <Chip
                key={cat.key}
                label={`${cat.label} ${toners.filter((t) => t.category === cat.key).length}`}
                onClick={() => setActiveCategory(cat.key)}
                variant={activeCategory === cat.key ? "filled" : "outlined"}
                color={activeCategory === cat.key ? "primary" : "default"}
                size="small"
                sx={{ borderRadius: "0", fontWeight: 500 }}
              />
            ))}
          </Stack>

          {/* 右侧：管理材料按钮（仅管理员可见）+ 搜索框 */}
          <Stack direction="row" spacing={1}>
            {isAdmin && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => setManageOpen(true)}
                sx={{
                  borderRadius: "0",
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                  whiteSpace: "nowrap",
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  "&:hover": { borderColor: "#2563eb", bgcolor: "rgba(36,135,202,0.04)" },
                }}
              >
                管理材料
              </Button>
            )}
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or name..."
              size="small"
              sx={{ width: { xs: "100%", sm: 256 } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, px: { xs: 2, lg: 3 }, py: 3 }}>
        {filteredToners.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, color: "text.disabled" }}>
            <Typography variant="body2">No toners found</Typography>
            <Typography variant="caption" sx={{ mt: 0.5 }}>Try a different search or category</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredToners.map((toner) => (
              <Grid key={toner.code} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <TonerCard code={toner.code} tradeName={toner.tradeName} hex={toner.hex} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Footer />

      {/* 管理材料 Modal — 传入共享状态和回调 */}
      <ManagementModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        items={toners}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onAddItem={handleAddItem}
      />
    </Box>
  );
}
