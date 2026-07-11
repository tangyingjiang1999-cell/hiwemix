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
  });
  const [components, setComponents] = useState<FormulaComponent[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const idManuallyEdited = useRef(false);

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
    });
    setComponents(formula.components.map((c) => ({ ...c })));
    setError("");
    setMessage("");
    setColorQuery("");
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
    });
    setComponents([]);
    setError("");
    setMessage("");
    setColorQuery("");
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

  function renderComponentTable(group?: ComponentGroup) {
    const title = group ?? "色母组件";
    const filtered = group
      ? components.filter((c) => c.component_group === group)
      : components;
    return (
      <div className="mt-4" key={group ?? "regular"}>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-700">{title}</h4>
          <button
            onClick={() => addComponent(group)}
            className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
          >
            + 添加色母
          </button>
        </div>
        <div className="min-h-[320px] overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[10px] uppercase text-gray-500">
                <th className="px-2 py-2">色母编号</th>
                <th className="px-2 py-2">名称</th>
                <th className="px-2 py-2">百分比</th>
                <th className="px-2 py-2">RGB</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-4 text-center text-[11px] text-gray-400"
                  >
                    暂无色母，点击「添加色母」
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const globalIndex = components.indexOf(c);
                return (
                  <tr key={globalIndex} className="border-b border-gray-100 last:border-0">
                    {/* 色母编号 — 带模糊搜索下拉 */}
                    <td className="relative px-2 py-1">
                      <input
                        type="text"
                        value={c.toner_code}
                        onChange={(e) => {
                          updateComponent(globalIndex, "toner_code", e.target.value);
                          setTonerQuery(e.target.value);
                        }}
                        onFocus={() => openTonerDropdown(globalIndex, c.toner_code)}
                        onBlur={() => scheduleCloseTonerDropdown()}
                        className="w-20 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]"
                      />
                      {tonerDropdownFor === globalIndex &&
                        matchingToners(tonerQuery).length > 0 && (
                          <div className="absolute left-0 top-full z-50 mt-0.5 max-h-60 w-56 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
                            {matchingToners(tonerQuery).map((toner) => (
                              <button
                                key={toner.code}
                                type="button"
                                onMouseDown={() => {
                                  selectToner(globalIndex, toner);
                                  setTonerDropdownFor(null);
                                }}
                                className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-teal-50"
                              >
                                <div
                                  className="h-4 w-6 shrink-0 rounded border border-gray-200"
                                  style={{ backgroundColor: toner.hex }}
                                />
                                <span className="font-mono text-gray-700">
                                  {toner.code}
                                </span>
                                <span className="text-gray-500">{toner.tradeName}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </td>
                    {/* 名称 */}
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={c.toner_name}
                        onChange={(e) =>
                          updateComponent(globalIndex, "toner_name", e.target.value)
                        }
                        className="w-24 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]"
                      />
                    </td>
                    {/* 百分比 — 手动输入 */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={c.percentage}
                        onChange={(e) =>
                          updateComponent(globalIndex, "percentage", Number(e.target.value))
                        }
                        className="w-16 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]"
                      />
                    </td>
                    {/* RGB — 自动填入（也可手动修改） */}
                    <td className="px-2 py-1">
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={c.rgb_r ?? ""}
                          onChange={(e) =>
                            updateComponent(
                              globalIndex,
                              "rgb_r",
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                          className="w-12 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]"
                          placeholder="R"
                        />
                        <input
                          type="number"
                          value={c.rgb_g ?? ""}
                          onChange={(e) =>
                            updateComponent(
                              globalIndex,
                              "rgb_g",
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                          className="w-12 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]"
                          placeholder="G"
                        />
                        <input
                          type="number"
                          value={c.rgb_b ?? ""}
                          onChange={(e) =>
                            updateComponent(
                              globalIndex,
                              "rgb_b",
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                          className="w-12 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]"
                          placeholder="B"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => removeComponent(globalIndex)}
                        className="text-[11px] text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center text-xs text-gray-500">加载中...</div>;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* 左栏：配方列表 */}
      <div className="w-full shrink-0 lg:w-64">
        <button
          onClick={newFormula}
          className="mb-3 w-full rounded bg-[#0D9488] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]"
        >
          + 新增配方
        </button>
        <div className="max-h-[600px] overflow-y-auto rounded border border-gray-200 bg-white">
          {formulas.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFormula(f)}
              className={`block w-full border-b border-gray-100 px-3 py-2 text-left text-xs last:border-0 ${
                selectedId === f.id
                  ? "bg-teal-50 font-semibold text-teal-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="block">{f.id}</span>
              <span className="block text-[10px] text-gray-400">
                {colors.find((c) => c.id === f.color_id)?.color_code || f.color_id}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 右栏：配方编辑 */}
      <div className="flex-1 rounded border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600">
              配方 ID（自动生成，可手动修改）
            </label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => {
                idManuallyEdited.current = true;
                setForm({ ...form, id: e.target.value });
              }}
              disabled={!!selectedId}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none disabled:bg-gray-100 focus:border-[#0D9488]"
            />
          </div>
          {/* 关联颜色 — 模糊搜索 */}
          <div className="relative">
            <label className="block text-[11px] font-medium text-gray-600">关联颜色</label>
            <input
              type="text"
              value={colorQuery}
              onChange={(e) => {
                setColorQuery(e.target.value);
                setColorDropdownOpen(true);
                if (colorBlurRef.current) { clearTimeout(colorBlurRef.current); colorBlurRef.current = null; }
              }}
              onFocus={() => {
                setColorDropdownOpen(true);
                if (colorBlurRef.current) { clearTimeout(colorBlurRef.current); colorBlurRef.current = null; }
              }}
              onBlur={() => {
                colorBlurRef.current = setTimeout(() => setColorDropdownOpen(false), 150);
              }}
              placeholder={colorDisplay || "搜索颜色代码、名称、品牌、类型..."}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]"
            />
            {colorDropdownOpen && matchingColors(colorQuery, colors, brands).length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-0.5 max-h-48 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
                {matchingColors(colorQuery, colors, brands).map((c) => {
                  const brandName = brandMap.get(c.make_id) ?? c.make_id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => {
                        setForm((prev) => ({ ...prev, color_id: c.id }));
                        setColorQuery("");
                        setColorDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-teal-50 ${
                        c.id === form.color_id ? "bg-teal-100" : ""
                      }`}
                    >
                      <div
                        className="h-4 w-5 shrink-0 rounded border border-gray-200"
                        style={{ backgroundColor: c.hex_preview }}
                      />
                      <span className="font-mono text-gray-700">{c.color_code}</span>
                      <span className="text-gray-600 truncate">{c.color_name}</span>
                      <span className="ml-auto text-[10px] text-gray-400">{brandName}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {/* 已选中颜色预览 */}
            {selectedColor && (
              <p className="mt-0.5 truncate text-[10px] text-teal-600">
                {colorDisplay}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">关联变体（可选）</label>
            <select
              value={form.variant_id}
              onChange={(e) => setForm({ ...form, variant_id: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]"
            >
              <option value="">无</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.year_range})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">版本</label>
            <input
              type="text"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">体系</label>
            <select
              value={form.paint_system}
              onChange={(e) =>
                handlePaintSystemChange(e.target.value as Formula["paint_system"])
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]"
            >
              {PAINT_SYSTEMS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">配方类型</label>
            {form.paint_system === "2K" ? (
              <input
                type="text"
                value={AUTO_2K_TYPE}
                disabled
                className="mt-1 w-full rounded border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs text-gray-600 outline-none"
              />
            ) : (
              <select
                value={form.formula_type}
                onChange={(e) => handleFormulaTypeChange(e.target.value as FormulaType)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]"
              >
                {MANUAL_1K_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-[11px] font-medium text-gray-600">施工备注</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]"
          />
        </div>

        {/* 色母组件表 */}
        {form.formula_type === "Pearl Paint" ? (
          <div className="flex flex-col gap-4">
            {PEARL_GROUPS.map((g) => renderComponentTable(g))}
          </div>
        ) : (
          renderComponentTable()
        )}

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        {message && <p className="mt-3 text-xs text-green-600">{message}</p>}

        <div className="mt-4 flex justify-end gap-3">
          {selectedId && (
            <button
              onClick={handleDelete}
              className="rounded border border-red-300 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              删除配方
            </button>
          )}
          <button
            onClick={handleSave}
            className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]"
          >
            保存配方
          </button>
        </div>
      </div>
    </div>
  );
}
