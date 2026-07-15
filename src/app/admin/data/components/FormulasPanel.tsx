"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Formula,
  FormulaComponent,
  FormulaType,
  ComponentGroup,
  Color,
  ColorVariant,
} from "@/types";
import type { Toner, CarMake } from "@/types";
import { generateFormulaId } from "@/lib/id-generator";
import { TONERS } from "@/data/toners";
import { FONT, HEADER_BG, HEADER_FONT_SIZE, CELL_FONT_SIZE, COLUMN_BG, ROW_BG, tableContainerSx, tableSx, cellSx, headerCellSx, getRowSx } from "@/components/admin-table-styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const PAINT_SYSTEMS = ["1K", "2K"] as const;
const FORMULA_TYPES: FormulaType[] = ["Single Stage", "Two Stages", "Pearl Paint"];
const AUTO_2K_TYPE: FormulaType = "Single Stage";
const MANUAL_1K_TYPES: FormulaType[] = ["Two Stages", "Pearl Paint"];
const PEARL_GROUPS: ComponentGroup[] = ["Pearl Paint", "Ground Paint"];

const EMPTY_COMPONENT: FormulaComponent = {
  toner_code: "",
  toner_name: "",
  percentage: 0,
  grams_per_100g: 0,
};

// hex → RGB 转换
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

// 模糊匹配色母（空查询时返回全部）
function matchingToners(query: string): Toner[] {
  const q = query.toLowerCase().trim();
  if (!q) return TONERS;
  return TONERS.filter(
    (t) =>
      t.code.toLowerCase().includes(q) ||
      t.tradeName.toLowerCase().includes(q) ||
      t.nameZh.includes(q)
  );
}

// 模糊匹配颜色
function matchingColors(query: string, colors: Color[], brands: CarMake[]): Color[] {
  const q = query.toLowerCase().trim();
  if (!q) return colors;
  const brandMap = new Map(brands.map((b) => [b.id, b.name]));
  return colors.filter((c) => {
    if (c.color_code.toLowerCase().includes(q)) return true;
    if (c.color_name.toLowerCase().includes(q)) return true;
    if (c.color_type.toLowerCase().includes(q)) return true;
    const brandName = brandMap.get(c.make_id) ?? "";
    if (brandName.toLowerCase().includes(q)) return true;
    return false;
  });
}

export default function FormulasPanel() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [brands, setBrands] = useState<CarMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    color_id: "",
    variant_id: "",
    version: "v1",
    paint_system: "2K" as Formula["paint_system"],
    formula_type: AUTO_2K_TYPE,
    notes: "",
    year: undefined as number | undefined,
  });
  const [components, setComponents] = useState<FormulaComponent[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const idManuallyEdited = useRef(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // 关联颜色搜索下拉
  const [colorQuery, setColorQuery] = useState("");
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const colorBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 色母搜索下拉
  const [tonerDropdownFor, setTonerDropdownFor] = useState<number | null>(null);
  const [tonerQuery, setTonerQuery] = useState("");
  const tonerBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 选中颜色后的预览文本
  const selectedColor = colors.find((c) => c.id === form.color_id);
  const brandMap = new Map(brands.map((b) => [b.id, b.name]));
  const colorDisplay = selectedColor
    ? `${selectedColor.color_code} - ${selectedColor.color_name} (${brandMap.get(selectedColor.make_id) ?? selectedColor.make_id})`
    : "";

  function openTonerDropdown(index: number, currentCode: string) {
    if (tonerBlurRef.current) { clearTimeout(tonerBlurRef.current); tonerBlurRef.current = null; }
    setTonerDropdownFor(index);
    setTonerQuery(currentCode);
  }
  function scheduleCloseTonerDropdown() {
    tonerBlurRef.current = setTimeout(() => setTonerDropdownFor(null), 150);
  }

  // 新建时：颜色 + 变体 + 版本变化自动生成 ID
  useEffect(() => {
    if (!selectedId && !idManuallyEdited.current && form.color_id && form.version) {
      setForm((prev) => ({
        ...prev,
        id: generateFormulaId(form.color_id, form.variant_id, form.version),
      }));
    }
  }, [form.color_id, form.variant_id, form.version, selectedId]);

  const fetchFormulas = useCallback(async () => {
    const res = await fetch("/api/admin/formulas");
    if (res.ok) setFormulas(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFormulas();
    fetch("/api/admin/colors")
      .then((r) => (r.ok ? r.json() : []))
      .then(setColors);
    fetch("/api/admin/variants")
      .then((r) => (r.ok ? r.json() : []))
      .then(setVariants);
    fetch("/api/admin/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then(setBrands);
  }, [fetchFormulas]);

  function selectFormula(formula: Formula) {
    setSelectedId(formula.id);
    setForm({
      id: formula.id,
      color_id: formula.color_id,
      variant_id: formula.variant_id || "",
      version: formula.version,
      paint_system: formula.paint_system,
      formula_type: formula.formula_type,
      notes: formula.notes,
      year: formula.year,
    });
    setComponents(formula.components.map((c) => ({ ...c })));
    setError("");
    setMessage("");
    setColorQuery("");

    // 加载选中颜色的可用年份
    const color = colors.find((c) => c.id === formula.color_id);
    setAvailableYears(color?.years || []);
  }

  function newFormula() {
    setSelectedId(null);
    setForm({
      id: "",
      color_id: "",
      variant_id: "",
      version: "v1",
      paint_system: "2K",
      formula_type: AUTO_2K_TYPE,
      notes: "",
      year: undefined,
    });
    setComponents([]);
    setError("");
    setMessage("");
    setColorQuery("");
    setAvailableYears([]);
    idManuallyEdited.current = false;
  }

  function handlePaintSystemChange(next: "1K" | "2K") {
    setForm((prev) => {
      const nextType = next === "2K" ? AUTO_2K_TYPE : prev.formula_type;
      return { ...prev, paint_system: next, formula_type: nextType };
    });
    if (next === "2K") {
      setComponents((prev) =>
        prev.map((c) => {
          const { component_group: _, ...rest } = c;
          return rest;
        })
      );
    }
  }

  function handleFormulaTypeChange(next: FormulaType) {
    setForm((prev) => ({ ...prev, formula_type: next }));
    if (next !== "Pearl Paint") {
      setComponents((prev) =>
        prev.map((c) => {
          const { component_group: _, ...rest } = c;
          return rest;
        })
      );
    }
  }

  function addComponent(group?: ComponentGroup) {
    setComponents((prev) => [
      ...prev,
      group ? { ...EMPTY_COMPONENT, component_group: group } : { ...EMPTY_COMPONENT },
    ]);
  }

  function updateComponent(
    index: number,
    field: keyof FormulaComponent,
    value: string | number | undefined
  ) {
    setComponents((prev) =>
      prev.map((c, i) =>
        i === index ? ({ ...c, [field]: value } as FormulaComponent) : c
      )
    );
  }

  function selectToner(index: number, toner: Toner) {
    const rgb = hexToRgb(toner.hex);
    setComponents((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        return {
          ...c,
          toner_code: toner.code,
          toner_name: toner.tradeName,
          rgb_r: rgb?.r,
          rgb_g: rgb?.g,
          rgb_b: rgb?.b,
        };
      })
    );
  }

  function removeComponent(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    setMessage("");
    if (!form.id || !form.color_id) {
      setError("配方 ID 和关联颜色不能为空");
      return;
    }
    // 自动补齐 grams_per_100g
    const comps = components.map((c) => ({
      ...c,
      grams_per_100g: c.grams_per_100g || c.percentage,
    }));
    const payload: Formula = {
      ...form,
      variant_id: form.variant_id || "",
      components: comps,
      updated_at: "",
      year: form.year,
    };
    const method = selectedId ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/formulas", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("保存成功");
        fetchFormulas();
        setSelectedId(payload.id);
      } else {
        const data = await res.json();
        setError(data.error || "保存失败");
      }
    } catch {
      setError("网络错误，请重试");
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirm(`确定删除配方「${selectedId}」吗？`)) return;
    const res = await fetch("/api/admin/formulas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId }),
    });
    if (res.ok) {
      newFormula();
      fetchFormulas();
    }
  }

  // 输入框样式常量
  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    border: "1px solid #E5E7EB",
    borderRadius: 4,
    padding: "8px 12px",
    fontSize: CELL_FONT_SIZE,
    fontFamily: FONT,
    outline: "none",
  };

  const INPUT_SMALL_STYLE: React.CSSProperties = {
    ...INPUT_STYLE,
    width: 100,
  };

  const RGB_INPUT_STYLE: React.CSSProperties = {
    ...INPUT_STYLE,
    width: 72,
    padding: "8px 8px",
  };

  function renderComponentTable(group?: ComponentGroup) {
    const title = group ?? "色母组件";
    const filtered = group
      ? components.filter((c) => c.component_group === group)
      : components;
    return (
      <Box key={group ?? "regular"} sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box sx={{ fontWeight: 600, fontSize: CELL_FONT_SIZE, color: "#1a1a1a", fontFamily: FONT }}>{title}</Box>
          <Button onClick={() => addComponent(group)} variant="outlined" size="small" sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE }}>+ 添加色母</Button>
        </Box>
        <TableContainer component={Paper} variant="outlined" sx={tableContainerSx}>
          <Table sx={tableSx}>
            <TableHead>
              <TableRow sx={{ bgcolor: HEADER_BG }}>
                <TableCell sx={{ ...headerCellSx, width: "25%" }}>色母编号</TableCell>
                <TableCell sx={{ ...headerCellSx, width: "30%" }}>名称</TableCell>
                <TableCell sx={{ ...headerCellSx, width: "15%" }}>百分比</TableCell>
                <TableCell sx={{ ...headerCellSx, width: "25%" }}>RGB</TableCell>
                <TableCell sx={{ ...headerCellSx, width: "5%" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "#9ca3af", fontSize: CELL_FONT_SIZE, fontFamily: FONT, py: 6 }}>
                    暂无色母，点击「添加色母」
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c, rowIndex) => {
                const globalIndex = components.indexOf(c);
                return (
                  <TableRow key={globalIndex} sx={getRowSx(rowIndex)}>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd, position: "relative" }}>
                      <input
                        type="text"
                        value={c.toner_code}
                        onChange={(e) => { updateComponent(globalIndex, "toner_code", e.target.value); setTonerQuery(e.target.value); }}
                        onFocus={() => openTonerDropdown(globalIndex, c.toner_code)}
                        onBlur={() => scheduleCloseTonerDropdown()}
                        style={INPUT_SMALL_STYLE}
                      />
                      {tonerDropdownFor === globalIndex && matchingToners(tonerQuery).length > 0 && (
                        <Paper sx={{ position: "absolute", left: 8, top: "100%", zIndex: 50, mt: 0.5, maxHeight: 240, width: 280, overflow: "auto", boxShadow: 3 }}>
                          {matchingToners(tonerQuery).map((toner) => (
                            <Button
                              key={toner.code}
                              onMouseDown={() => { selectToner(globalIndex, toner); setTonerDropdownFor(null); }}
                              fullWidth
                              sx={{ justifyContent: "flex-start", gap: 1, px: 1.5, py: 1, borderRadius: 0, fontSize: CELL_FONT_SIZE, fontFamily: FONT, textTransform: "none", "&:hover": { bgcolor: "rgba(13,148,136,0.06)" } }}
                            >
                              <Box sx={{ width: 32, height: 20, borderRadius: 0.5, border: 1, borderColor: "grey.200", flexShrink: 0, bgcolor: toner.hex }} />
                              <Box component="span" sx={{ fontFamily: "monospace", color: "#1a1a1a", fontWeight: 500 }}>{toner.code}</Box>
                              <Box component="span" sx={{ color: "#374151" }}>{toner.tradeName}</Box>
                            </Button>
                          ))}
                        </Paper>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even }}>
                      <input
                        type="text"
                        value={c.toner_name}
                        onChange={(e) => updateComponent(globalIndex, "toner_name", e.target.value)}
                        style={INPUT_STYLE}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd }}>
                      <input
                        type="number"
                        value={c.percentage}
                        onChange={(e) => updateComponent(globalIndex, "percentage", Number(e.target.value))}
                        style={INPUT_SMALL_STYLE}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <input
                          type="number"
                          value={c.rgb_r ?? ""}
                          onChange={(e) => updateComponent(globalIndex, "rgb_r", e.target.value === "" ? undefined : Number(e.target.value))}
                          placeholder="R"
                          style={RGB_INPUT_STYLE}
                        />
                        <input
                          type="number"
                          value={c.rgb_g ?? ""}
                          onChange={(e) => updateComponent(globalIndex, "rgb_g", e.target.value === "" ? undefined : Number(e.target.value))}
                          placeholder="G"
                          style={RGB_INPUT_STYLE}
                        />
                        <input
                          type="number"
                          value={c.rgb_b ?? ""}
                          onChange={(e) => updateComponent(globalIndex, "rgb_b", e.target.value === "" ? undefined : Number(e.target.value))}
                          placeholder="B"
                          style={RGB_INPUT_STYLE}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd, textAlign: "center" }}>
                      <Button
                        onClick={() => removeComponent(globalIndex)}
                        size="small"
                        sx={{
                          color: "#9ca3af",
                          fontSize: CELL_FONT_SIZE,
                          fontFamily: FONT,
                          "&:hover": {
                            bgcolor: "rgba(239,68,68,0.08)",
                            color: "error.main",
                          },
                        }}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (loading) return <Box sx={{ textAlign: "center", py: 2 }}><Button disabled>加载中...</Button></Box>;

  return (
    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", lg: "row" } }}>
      {/* 左栏：配方列表 */}
      <Box sx={{ width: { lg: 256 }, flexShrink: 0 }}>
        <Button onClick={newFormula} variant="contained" fullWidth sx={{ mb: 1.5 }}>+ 新增配方</Button>
        <Paper variant="outlined" sx={{ maxHeight: 600, overflow: "auto" }}>
          {formulas.map((f) => {
            const isSel = selectedId === f.id;
            return (
              <Button
                key={f.id} onClick={() => selectFormula(f)}
                fullWidth
                sx={{
                  display: "block", textAlign: "left", px: 2, py: 1.5, borderRadius: 0,
                  borderBottom: 1, borderColor: "grey.100", color: isSel ? "primary.main" : "text.primary",
                  bgcolor: isSel ? "rgba(13,148,136,0.06)" : "transparent",
                  fontWeight: isSel ? 600 : 400, fontSize: "0.8125rem", textTransform: "none",
                  "&:hover": { bgcolor: isSel ? "rgba(13,148,136,0.08)" : "grey.50" },
                }}
              >
                <Box component="span" sx={{ display: "block" }}>{f.id}</Box>
                <Box component="span" sx={{ display: "block", color: "text.disabled", fontSize: "0.75rem" }}>
                  {colors.find((c) => c.id === f.color_id)?.color_code || f.color_id}
                </Box>
              </Button>
            );
          })}
        </Paper>
      </Box>

      {/* 右栏：配方编辑 */}
      <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
          <TextField label="配方 ID（自动生成）" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!selectedId} size="small" fullWidth />
          <Box sx={{ position: "relative" }}>
            <TextField
              label="关联颜色" value={colorQuery}
              onChange={(e) => { setColorQuery(e.target.value); setColorDropdownOpen(true); if (colorBlurRef.current) { clearTimeout(colorBlurRef.current); colorBlurRef.current = null; } }}
              onFocus={() => { setColorDropdownOpen(true); if (colorBlurRef.current) { clearTimeout(colorBlurRef.current); colorBlurRef.current = null; } }}
              onBlur={() => { colorBlurRef.current = setTimeout(() => setColorDropdownOpen(false), 150); }}
              placeholder={colorDisplay || "搜索颜色代码、名称、品牌、类型..."}
              size="small" fullWidth
            />
            {colorDropdownOpen && matchingColors(colorQuery, colors, brands).length > 0 && (
              <Paper sx={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 50, mt: 0.5, maxHeight: 192, overflow: "auto" }}>
                {matchingColors(colorQuery, colors, brands).map((c) => {
                  const brandName = brandMap.get(c.make_id) ?? c.make_id;
                  return (
                    <Button
                      key={c.id}
                      onMouseDown={() => { setForm((prev) => ({ ...prev, color_id: c.id, year: undefined })); setColorQuery(""); setColorDropdownOpen(false); setAvailableYears(c.years || []); }}
                      fullWidth
                      sx={{
                        justifyContent: "flex-start", gap: 1, px: 1, py: 1, borderRadius: 0,
                        fontSize: "0.75rem", textTransform: "none",
                        bgcolor: c.id === form.color_id ? "rgba(13,148,136,0.08)" : "transparent",
                        "&:hover": { bgcolor: "rgba(13,148,136,0.06)" },
                      }}
                    >
                      <Box sx={{ width: 20, height: 16, borderRadius: 0.5, border: 1, borderColor: "grey.200", flexShrink: 0, bgcolor: c.hex_preview }} />
                      <Box component="span" sx={{ fontFamily: "monospace", color: "text.primary", fontSize: "0.75rem" }}>{c.color_code}</Box>
                      <Box component="span" sx={{ color: "text.secondary", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis" }}>{c.color_name}</Box>
                      <Box component="span" sx={{ ml: "auto", color: "text.disabled", fontSize: "0.6875rem" }}>{brandName}</Box>
                    </Button>
                  );
                })}
              </Paper>
            )}
            {selectedColor && <Box sx={{ mt: 0.25, color: "primary.main", fontSize: "0.6875rem", overflow: "hidden", textOverflow: "ellipsis" }}>{colorDisplay}</Box>}
          </Box>
          <TextField
            select
            label="适用年份（可选）"
            value={form.year || ""}
            onChange={(e) => setForm({ ...form, year: e.target.value ? parseInt(e.target.value, 10) : undefined })}
            size="small"
            fullWidth
            disabled={!form.color_id}
          >
            <MenuItem value="">所有年份</MenuItem>
            {availableYears.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
          <TextField select label="关联变体（可选）" value={form.variant_id} onChange={(e) => setForm({ ...form, variant_id: e.target.value })} size="small" fullWidth>
            <MenuItem value="">无</MenuItem>
            {variants.map((v) => <MenuItem key={v.id} value={v.id}>{v.name} ({v.year_range})</MenuItem>)}
          </TextField>
          <TextField label="版本" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} size="small" fullWidth />
          <TextField select label="体系" value={form.paint_system} onChange={(e) => handlePaintSystemChange(e.target.value as Formula["paint_system"])} size="small" fullWidth>
            {PAINT_SYSTEMS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField select label="配方类型" value={form.paint_system === "2K" ? AUTO_2K_TYPE : form.formula_type}
            onChange={(e) => handleFormulaTypeChange(e.target.value as FormulaType)}
            disabled={form.paint_system === "2K"} size="small" fullWidth
          >
            {(form.paint_system === "2K" ? [AUTO_2K_TYPE] : MANUAL_1K_TYPES).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Box>
        <TextField label="施工备注" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} size="small" multiline rows={2} fullWidth sx={{ mt: 1.5 }} />

        {/* 色母组件表 */}
        {form.formula_type === "Pearl Paint" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {PEARL_GROUPS.map((g) => renderComponentTable(g))}
          </Box>
        ) : (
          renderComponentTable()
        )}

        {error && <Box sx={{ color: "error.main", fontSize: "0.8125rem", mt: 2 }}>{error}</Box>}
        {message && <Box sx={{ color: "success.main", fontSize: "0.8125rem", mt: 2 }}>{message}</Box>}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
          {selectedId && (
            <Button onClick={handleDelete} variant="outlined" color="error" size="small">删除配方</Button>
          )}
          <Button onClick={handleSave} variant="contained" size="small">保存配方</Button>
        </Box>
      </Paper>
    </Box>
  );
}
