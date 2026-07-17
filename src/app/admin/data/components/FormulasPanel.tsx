"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

// 按体系过滤色母列表
function filterTonersBySystem(system: "1K" | "2K"): Toner[] {
  if (system === "2K") return TONERS.filter((t) => t.category === "2K_BASECOAT");
  return TONERS.filter((t) => t.category !== "2K_BASECOAT");
}

// 模糊匹配色母（空查询时返回全部）
function matchingToners(query: string, pool: Toner[]): Toner[] {
  const q = query.toLowerCase().trim();
  if (!q) return pool;
  return pool.filter(
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

  // 百分比输入框的原始字符串（允许输入中间态如 "5."）
  const [pctInputs, setPctInputs] = useState<Record<number, string>>({});

  // 计算百分比总和（按组件组或全部）
  const percentageSums = useMemo(() => {
    if (form.formula_type === "Pearl Paint") {
      return {
        "Pearl Paint": components
          .filter((c) => c.component_group === "Pearl Paint")
          .reduce((s, c) => s + c.percentage, 0),
        "Ground Paint": components
          .filter((c) => c.component_group === "Ground Paint")
          .reduce((s, c) => s + c.percentage, 0),
      } as Record<ComponentGroup, number>;
    }
    return { all: components.reduce((s, c) => s + c.percentage, 0) };
  }, [components, form.formula_type]);

  // 百分比是否全部合法（总和=100%）
  const percentageValid = useMemo(() => {
    if (components.length === 0) return false;
    if (form.formula_type === "Pearl Paint") {
      const sums = percentageSums as Record<ComponentGroup, number>;
      return Math.abs((sums["Pearl Paint"] ?? 0) - 100) < 0.01
        && Math.abs((sums["Ground Paint"] ?? 0) - 100) < 0.01;
    }
    return Math.abs(((percentageSums as { all: number }).all) - 100) < 0.01;
  }, [percentageSums, form.formula_type, components.length]);

  // 关联颜色搜索下拉
  const [colorQuery, setColorQuery] = useState("");
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const colorBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 色母搜索下拉
  const [tonerDropdownFor, setTonerDropdownFor] = useState<number | null>(null);
  const [tonerQuery, setTonerQuery] = useState("");
  const tonerBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 选中颜色后的预览文本
  // 根据体系过滤色母列表
  const tonerPool = useMemo(() => filterTonersBySystem(form.paint_system), [form.paint_system]);

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
    try {
      const res = await fetch("/api/admin/formulas");
      if (res.ok) setFormulas(await res.json());
    } catch { /* network error */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchFormulas();
    fetch("/api/admin/colors", { signal: ctrl.signal }).then((r) => r.ok ? r.json() : []).then(setColors).catch(() => {});
    fetch("/api/admin/variants", { signal: ctrl.signal }).then((r) => r.ok ? r.json() : []).then(setVariants).catch(() => {});
    fetch("/api/admin/brands", { signal: ctrl.signal }).then((r) => r.ok ? r.json() : []).then(setBrands).catch(() => {});
    return () => ctrl.abort();
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
    setComponents(formula.components.map((c) => ({
      ...c,
      grams_per_100g: c.percentage,
    })));
    setPctInputs({});
    setError("");
    setMessage("");

    // 回显关联颜色的显示文本
    const color = colors.find((c) => c.id === formula.color_id);
    if (color) {
      const bName = brandMap.get(color.make_id) ?? color.make_id;
      setColorQuery(`${color.color_code} - ${color.color_name} (${bName})`);
    } else {
      setColorQuery(formula.color_id);
    }

    // 加载选中颜色的可用年份
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
    setPctInputs({});
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
    // 切换体系时清空所有已选色母，避免数据不一致
    setComponents((prev) =>
      prev.map((c) => {
        const cleared = {
          ...c,
          toner_code: "",
          toner_name: "",
          percentage: 0,
          grams_per_100g: 0,
          rgb_r: undefined,
          rgb_g: undefined,
          rgb_b: undefined,
        };
        // 2K 模式不支持 component_group
        if (next === "2K") {
          const { component_group: _, ...rest } = cleared;
          return rest;
        }
        return cleared;
      })
    );
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
    const newComp: FormulaComponent = { ...EMPTY_COMPONENT, uid: crypto.randomUUID() };
    if (group) newComp.component_group = group;
    setComponents((prev) => [...prev, newComp]);
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
    // 清理该索引及之后的 pctInputs（因为删除后索引会前移）
    setPctInputs((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < index) next[ki] = v;
        if (ki > index) next[ki - 1] = v;
        // ki === index 的不保留（已删除）
      });
      return next;
    });
  }

  async function handleSave() {
    setError("");
    setMessage("");
    if (!form.id || !form.color_id) {
      setError("配方 ID 和关联颜色不能为空");
      return;
    }
    // 确保 grams_per_100g 始终从 percentage 派生
    const comps = components.map((c) => ({
      ...c,
      grams_per_100g: c.percentage,
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
    try {
      const res = await fetch("/api/admin/formulas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });
      if (res.ok) {
        newFormula();
        fetchFormulas();
      } else {
        setError("删除失败");
      }
    } catch { setError("网络错误，请重试"); }
  }

  // 输入框样式常量
  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "8px 12px",
    height: 38,
    fontSize: CELL_FONT_SIZE,
    fontFamily: FONT,
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const INPUT_FOCUS_HANDLER = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#3b82f6";
    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
  };
  const INPUT_BLUR_HANDLER = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#d1d5db";
    e.target.style.boxShadow = "none";
  };

  const INPUT_SMALL_STYLE: React.CSSProperties = {
    ...INPUT_STYLE,
    width: "100%",
    maxWidth: 130,
  };

  const RGB_INPUT_STYLE: React.CSSProperties = {
    ...INPUT_STYLE,
    width: "31%",
    padding: "8px 6px",
    textAlign: "center" as const,
  };

  function renderComponentTable(group?: ComponentGroup) {
    const title = group ?? "色母组件";
    const filtered = group
      ? components.filter((c) => c.component_group === group)
      : components;
    return (
      <Box key={group ?? "regular"} sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
      }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexShrink: 0 }}>
          <Box sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "#111827", fontFamily: FONT, letterSpacing: "-0.01em" }}>{title}</Box>
          <Button onClick={() => addComponent(group)} variant="outlined" size="small" sx={{
            fontFamily: FONT,
            fontSize: "0.8125rem",
            fontWeight: 500,
            borderRadius: "10px",
            px: 2,
            py: 0.75,
            textTransform: "none",
            borderColor: "#d1d5db",
            color: "#374151",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#3b82f6",
              color: "#2563eb",
              bgcolor: "rgba(59,130,246,0.04)",
              transform: "translateY(-1px)",
              boxShadow: "0 2px 6px rgba(59,130,246,0.1)",
            },
          }}>+ 添加色母</Button>
        </Box>
        <TableContainer component={Paper} variant="outlined" sx={{
          ...tableContainerSx,
          minHeight: 250,
        }}>
          <Table sx={tableSx}>
            <TableHead>
              <TableRow sx={{
                bgcolor: HEADER_BG,
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}>
                <TableCell sx={{
                  ...headerCellSx,
                  width: "22%",
                  position: "sticky",
                  top: 0,
                  bgcolor: HEADER_BG,
                  zIndex: 10,
                }}>色母编号</TableCell>
                <TableCell sx={{
                  ...headerCellSx,
                  width: "28%",
                  position: "sticky",
                  top: 0,
                  bgcolor: HEADER_BG,
                  zIndex: 10,
                }}>名称</TableCell>
                <TableCell sx={{
                  ...headerCellSx,
                  width: "15%",
                  position: "sticky",
                  top: 0,
                  bgcolor: HEADER_BG,
                  zIndex: 10,
                }}>百分比</TableCell>
                <TableCell sx={{
                  ...headerCellSx,
                  width: "25%",
                  position: "sticky",
                  top: 0,
                  bgcolor: HEADER_BG,
                  zIndex: 10,
                }}>RGB</TableCell>
                <TableCell sx={{
                  ...headerCellSx,
                  width: "10%",
                  position: "sticky",
                  top: 0,
                  bgcolor: HEADER_BG,
                  zIndex: 10,
                }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "#9ca3af", fontSize: "0.8125rem", fontFamily: FONT, py: 8, fontStyle: "italic" }}>
                    暂无色母，点击「+ 添加色母」开始
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c, rowIndex) => {
                const globalIndex = components.indexOf(c);
                return (
                  <TableRow key={c.uid ?? globalIndex} sx={getRowSx(rowIndex)}>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd, position: "relative" }}>
                      <input
                        type="text"
                        value={c.toner_code}
                        onChange={(e) => { updateComponent(globalIndex, "toner_code", e.target.value); setTonerQuery(e.target.value); }}
                        onFocus={(e) => { INPUT_FOCUS_HANDLER(e); openTonerDropdown(globalIndex, c.toner_code); }}
                        onBlur={(e) => { INPUT_BLUR_HANDLER(e); scheduleCloseTonerDropdown(); }}
                        style={INPUT_SMALL_STYLE}
                      />
                      {tonerDropdownFor === globalIndex && matchingToners(tonerQuery, tonerPool).length > 0 && (
                        <Paper sx={{ position: "absolute", left: 8, top: "100%", zIndex: 50, mt: 0.5, maxHeight: 240, width: 280, overflow: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                          {matchingToners(tonerQuery, tonerPool).map((toner) => (
                            <Button
                              key={toner.code}
                              onMouseDown={() => { selectToner(globalIndex, toner); setTonerDropdownFor(null); }}
                              fullWidth
                              sx={{ justifyContent: "flex-start", gap: 1, px: 1.5, py: 1, borderRadius: 0, fontSize: "0.8125rem", fontFamily: FONT, textTransform: "none", transition: "background-color 0.15s ease", "&:hover": { bgcolor: "rgba(59,130,246,0.06)" } }}
                            >
                              <Box sx={{ width: 32, height: 20, borderRadius: 0.5, border: 1, borderColor: "grey.200", flexShrink: 0, bgcolor: toner.hex }} />
                              <Box component="span" sx={{ color: "#1a1a1a", fontWeight: 500 }}>{toner.code}</Box>
                              <Box component="span" sx={{ fontWeight: 500, color: "#374151" }}>{toner.tradeName}</Box>
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
                        onFocus={INPUT_FOCUS_HANDLER}
                        onBlur={INPUT_BLUR_HANDLER}
                        style={INPUT_STYLE}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={globalIndex in pctInputs ? pctInputs[globalIndex] : (c.percentage || "")}
                        onChange={(e) => {
                          const raw = e.target.value;
                          // 只允许数字和小数点
                          if (raw !== "" && !/^[\d.]*$/.test(raw)) return;
                          setPctInputs((prev) => ({ ...prev, [globalIndex]: raw }));
                        }}
                        onFocus={INPUT_FOCUS_HANDLER}
                        onBlur={(e) => {
                          INPUT_BLUR_HANDLER(e);
                          const raw = pctInputs[globalIndex];
                          if (raw === undefined) return;
                          if (raw === "" || raw === ".") {
                            updateComponent(globalIndex, "percentage", 0);
                          } else {
                            const num = parseFloat(raw);
                            if (!isNaN(num)) {
                              const clamped = Math.round(Math.min(100, Math.max(0, num)) * 100) / 100;
                              updateComponent(globalIndex, "percentage", clamped);
                            }
                          }
                          setPctInputs((prev) => { const n = { ...prev }; delete n[globalIndex]; return n; });
                        }}
                        placeholder="0"
                        style={{
                          ...INPUT_SMALL_STYLE,
                          borderColor: c.percentage < 0 || c.percentage > 100 ? "#EF4444" : INPUT_SMALL_STYLE.borderColor,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even }}>
                      <Box sx={{ display: "flex", gap: 0.75 }}>
                        <input
                          type="number"
                          value={c.rgb_r ?? ""}
                          onChange={(e) => updateComponent(globalIndex, "rgb_r", e.target.value === "" ? undefined : Number(e.target.value))}
                          onFocus={INPUT_FOCUS_HANDLER}
                          onBlur={INPUT_BLUR_HANDLER}
                          placeholder="R"
                          style={RGB_INPUT_STYLE}
                        />
                        <input
                          type="number"
                          value={c.rgb_g ?? ""}
                          onChange={(e) => updateComponent(globalIndex, "rgb_g", e.target.value === "" ? undefined : Number(e.target.value))}
                          onFocus={INPUT_FOCUS_HANDLER}
                          onBlur={INPUT_BLUR_HANDLER}
                          placeholder="G"
                          style={RGB_INPUT_STYLE}
                        />
                        <input
                          type="number"
                          value={c.rgb_b ?? ""}
                          onChange={(e) => updateComponent(globalIndex, "rgb_b", e.target.value === "" ? undefined : Number(e.target.value))}
                          onFocus={INPUT_FOCUS_HANDLER}
                          onBlur={INPUT_BLUR_HANDLER}
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
                          minWidth: 0,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontFamily: FONT,
                          fontWeight: 500,
                          color: "#ef4444",
                          bgcolor: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.15)",
                          textTransform: "none",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "rgba(239,68,68,0.12)",
                            borderColor: "rgba(239,68,68,0.3)",
                            transform: "scale(1.03)",
                          },
                        }}
                      >
                        <Box component="svg" sx={{ width: 14, height: 14, mr: 0.5 }} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022 1.005 11.075A2.75 2.75 0 007.765 19h4.47a2.75 2.75 0 002.748-2.973L15.985 5.95l.149.022a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </Box>
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* 百分比总和提示 */}
        {(() => {
          const sum = group
            ? (percentageSums as Record<ComponentGroup, number>)[group] ?? 0
            : (percentageSums as { all: number }).all ?? 0;
          const isValid = Math.abs(sum - 100) < 0.01;
          const hasComponents = filtered.length > 0;
          if (!hasComponents) return null;
          return (
            <Box sx={{
              mt: 1.5,
              py: 1,
              px: 1.5,
              borderRadius: "10px",
              fontSize: "0.8125rem",
              fontFamily: FONT,
              fontWeight: 500,
              bgcolor: isValid ? "#f0fdf4" : "#fef2f2",
              border: isValid ? "1px solid #bbf7d0" : "1px solid #fecaca",
              color: isValid ? "#166534" : "#991b1b",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}>
              {isValid ? (
                <Box component="svg" sx={{ width: 18, height: 18, flexShrink: 0, color: "#22c55e" }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </Box>
              ) : (
                <Box component="svg" sx={{ width: 18, height: 18, flexShrink: 0, color: "#ef4444" }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </Box>
              )}
              <Box component="span" sx={{ fontWeight: 600 }}>百分比总和：{sum.toFixed(2)}%</Box>
              {!isValid && (
                <Box component="span" sx={{ ml: 0.5, fontWeight: 400 }}>
                  （必须等于 100%）
                </Box>
              )}
            </Box>
          );
        })()}
      </Box>
    );
  }

  if (loading) return <Box sx={{ textAlign: "center", py: 2 }}><Button disabled>加载中...</Button></Box>;

  return (
    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", lg: "row" }, minHeight: "calc(100vh - 140px)" }}>
      {/* 左栏：配方列表 */}
      <Box sx={{ width: { lg: 256 }, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0, maxHeight: { xs: 200, lg: "none" } }}>
        <Button onClick={newFormula} variant="contained" fullWidth sx={{ mb: 1.5, flexShrink: 0 }}>+ 新增配方</Button>
        <Paper variant="outlined" sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {formulas.map((f) => {
            const isSel = selectedId === f.id;
            return (
              <Button
                key={f.id} onClick={() => selectFormula(f)}
                fullWidth
                sx={{
                  display: "block", textAlign: "left", px: 2, py: 1.5, borderRadius: 0,
                  borderBottom: 1, borderColor: "grey.100", color: isSel ? "primary.main" : "text.primary",
                  bgcolor: isSel ? "rgba(36,135,202,0.06)" : "transparent",
                  fontWeight: isSel ? 600 : 400, fontSize: "0.8125rem", textTransform: "none",
                  "&:hover": { bgcolor: isSel ? "rgba(36,135,202,0.08)" : "grey.50" },
                }}
              >
                <Box component="span" sx={{ display: "block", fontWeight: 700, fontFamily: FONT, color: "#111827" }}>
                  {colors.find((c) => c.id === f.color_id)?.color_code || f.color_id}
                </Box>
                <Box component="span" sx={{ display: "block", fontWeight: 500, fontFamily: FONT, color: "text.disabled", fontSize: "0.75rem" }}>
                  {f.id}
                </Box>
              </Button>
            );
          })}
        </Paper>
      </Box>

      {/* 右栏：配方编辑 */}
      <Paper variant="outlined" sx={{
        flex: 1,
        p: 3,
        pb: 8,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
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
                      onMouseDown={() => { setForm((prev) => ({ ...prev, color_id: c.id, year: undefined })); setColorQuery(`${c.color_code} - ${c.color_name} (${brandName})`); setColorDropdownOpen(false); setAvailableYears(c.years || []); }}
                      fullWidth
                      sx={{
                        justifyContent: "flex-start", gap: 1, px: 1, py: 1, borderRadius: 0,
                        fontSize: "0.75rem", textTransform: "none",
                        bgcolor: c.id === form.color_id ? "rgba(36,135,202,0.08)" : "transparent",
                        "&:hover": { bgcolor: "rgba(36,135,202,0.06)" },
                      }}
                    >
                      <Box sx={{ width: 20, height: 16, borderRadius: 0.5, border: 1, borderColor: "grey.200", flexShrink: 0, bgcolor: c.hex_preview }} />
                      <Box component="span" sx={{ fontWeight: 500, color: "text.primary", fontSize: "0.75rem" }}>{c.color_code}</Box>
                      <Box component="span" sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis" }}>{c.color_name}</Box>
                      <Box component="span" sx={{ ml: "auto", color: "text.disabled", fontSize: "0.6875rem" }}>{brandName}</Box>
                    </Button>
                  );
                })}
              </Paper>
            )}
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
          <TextField select label="施工工艺（可选）" value={form.variant_id} onChange={(e) => setForm({ ...form, variant_id: e.target.value })} size="small" fullWidth>
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
        <TextField label="施工备注" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} size="small" multiline rows={2} fullWidth sx={{ mt: 2 }} />

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

        {/* 底部按钮区域 */}
        <Box sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          p: 2.5,
          mt: 3,
          borderTop: "1px solid #e5e7eb",
          bgcolor: "#fafafa",
          borderRadius: "0 0 16px 16px",
          mx: -3,
          mb: -8,
          px: 3,
        }}>
          {selectedId && (
            <Button onClick={handleDelete} variant="outlined" color="error" size="small" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 500, px: 2.5 }}>删除配方</Button>
          )}
          <Button
            onClick={handleSave}
            variant="contained"
            size="small"
            disabled={!percentageValid}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              transition: "all 0.2s ease",
              "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.18)", transform: "translateY(-1px)" },
              "&.Mui-disabled": {
                bgcolor: "#d1d5db",
                color: "#fff",
              },
            }}
          >
            保存配方
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
