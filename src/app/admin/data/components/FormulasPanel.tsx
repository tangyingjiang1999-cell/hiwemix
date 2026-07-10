"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Formula, FormulaComponent, Color, ColorVariant } from "@/types";
import { generateFormulaId } from "@/lib/id-generator";

const PAINT_SYSTEMS = ["1K", "2K"] as const;
const FORMULA_TYPES = ["Basecoat", "Clearcoat", "Single Stage", "Primer", "Topcoat"] as const;

const EMPTY_COMPONENT: FormulaComponent = {
  toner_code: "",
  toner_name: "",
  percentage: 0,
  grams_per_100g: 0,
};

export default function FormulasPanel() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    color_id: "",
    variant_id: "",
    version: "v1",
    paint_system: "2K" as Formula["paint_system"],
    formula_type: "Basecoat" as Formula["formula_type"],
    notes: "",
  });
  const [components, setComponents] = useState<FormulaComponent[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const idManuallyEdited = useRef(false);

  // 新建时：颜色 + 变体 + 版本变化自动生成 ID
  useEffect(() => {
    if (!selectedId && !idManuallyEdited.current && form.color_id && form.version) {
      setForm((prev) => ({ ...prev, id: generateFormulaId(form.color_id, form.variant_id, form.version) }));
    }
  }, [form.color_id, form.variant_id, form.version, selectedId]);

  const fetchFormulas = useCallback(async () => {
    const res = await fetch("/api/admin/formulas");
    if (res.ok) setFormulas(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFormulas();
    fetch("/api/admin/colors").then((r) => (r.ok ? r.json() : [])).then(setColors);
    fetch("/api/admin/variants").then((r) => (r.ok ? r.json() : [])).then(setVariants);
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
  }

  function newFormula() {
    setSelectedId(null);
    setForm({
      id: "",
      color_id: "",
      variant_id: "",
      version: "v1",
      paint_system: "2K",
      formula_type: "Basecoat",
      notes: "",
    });
    setComponents([]);
    setError("");
    setMessage("");
    idManuallyEdited.current = false;
  }

  function addComponent() {
    setComponents((prev) => [...prev, { ...EMPTY_COMPONENT }]);
  }

  function updateComponent(index: number, field: keyof FormulaComponent, value: string | number | undefined) {
    setComponents((prev) =>
      prev.map((c, i) => (i === index ? ({ ...c, [field]: value } as FormulaComponent) : c))
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
    const payload: Formula = {
      ...form,
      variant_id: form.variant_id || "",
      components,
      updated_at: "",
    };
    const method = selectedId ? "PUT" : "POST";
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

  if (loading) return <div className="text-center text-xs text-gray-500">加载中...</div>;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* 左栏：配方列表 */}
      <div className="w-full shrink-0 lg:w-64">
        <button onClick={newFormula} className="mb-3 w-full rounded bg-[#0D9488] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]">
          + 新增配方
        </button>
        <div className="max-h-[600px] overflow-y-auto rounded border border-gray-200 bg-white">
          {formulas.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFormula(f)}
              className={`block w-full border-b border-gray-100 px-3 py-2 text-left text-xs last:border-0 ${
                selectedId === f.id ? "bg-teal-50 font-semibold text-teal-700" : "text-gray-700 hover:bg-gray-50"
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
            <label className="block text-[11px] font-medium text-gray-600">配方 ID（自动生成，可手动修改）</label>
            <input type="text" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!selectedId} className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none disabled:bg-gray-100 focus:border-[#0D9488]" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">关联颜色</label>
            <select value={form.color_id} onChange={(e) => setForm({ ...form, color_id: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]">
              <option value="">请选择</option>
              {colors.map((c) => <option key={c.id} value={c.id}>{c.color_code} - {c.color_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">关联变体（可选）</label>
            <select value={form.variant_id} onChange={(e) => setForm({ ...form, variant_id: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]">
              <option value="">无</option>
              {variants.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.year_range})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">版本</label>
            <input type="text" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">体系</label>
            <select value={form.paint_system} onChange={(e) => setForm({ ...form, paint_system: e.target.value as Formula["paint_system"] })} className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]">
              {PAINT_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600">配方类型</label>
            <select value={form.formula_type} onChange={(e) => setForm({ ...form, formula_type: e.target.value as Formula["formula_type"] })} className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]">
              {FORMULA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-[11px] font-medium text-gray-600">施工备注</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]" />
        </div>

        {/* 色母组件表 */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-700">色母组件</h4>
            <button onClick={addComponent} className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50">+ 添加色母</button>
          </div>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-[10px] uppercase text-gray-500">
                  <th className="px-2 py-2">色母编号</th>
                  <th className="px-2 py-2">名称</th>
                  <th className="px-2 py-2">百分比</th>
                  <th className="px-2 py-2">克/100g</th>
                  <th className="px-2 py-2">密度</th>
                  <th className="px-2 py-2">RGB</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {components.length === 0 && (
                  <tr><td colSpan={7} className="px-2 py-4 text-center text-[11px] text-gray-400">暂无色母，点击「添加色母」</td></tr>
                )}
                {components.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-1"><input type="text" value={c.toner_code} onChange={(e) => updateComponent(i, "toner_code", e.target.value)} className="w-20 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" /></td>
                    <td className="px-2 py-1"><input type="text" value={c.toner_name} onChange={(e) => updateComponent(i, "toner_name", e.target.value)} className="w-24 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" /></td>
                    <td className="px-2 py-1"><input type="number" value={c.percentage} onChange={(e) => updateComponent(i, "percentage", Number(e.target.value))} className="w-16 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" /></td>
                    <td className="px-2 py-1"><input type="number" value={c.grams_per_100g} onChange={(e) => updateComponent(i, "grams_per_100g", Number(e.target.value))} className="w-16 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" /></td>
                    <td className="px-2 py-1"><input type="number" value={c.density ?? ""} onChange={(e) => updateComponent(i, "density", e.target.value === "" ? undefined : Number(e.target.value))} className="w-14 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" /></td>
                    <td className="px-2 py-1">
                      <div className="flex gap-1">
                        <input type="number" value={c.rgb_r ?? ""} onChange={(e) => updateComponent(i, "rgb_r", e.target.value === "" ? undefined : Number(e.target.value))} className="w-12 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" placeholder="R" />
                        <input type="number" value={c.rgb_g ?? ""} onChange={(e) => updateComponent(i, "rgb_g", e.target.value === "" ? undefined : Number(e.target.value))} className="w-12 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" placeholder="G" />
                        <input type="number" value={c.rgb_b ?? ""} onChange={(e) => updateComponent(i, "rgb_b", e.target.value === "" ? undefined : Number(e.target.value))} className="w-12 rounded border border-gray-300 px-1 py-1 text-[11px] outline-none focus:border-[#0D9488]" placeholder="B" />
                      </div>
                    </td>
                    <td className="px-2 py-1"><button onClick={() => removeComponent(i)} className="text-[11px] text-red-600 hover:text-red-800">删除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        {message && <p className="mt-3 text-xs text-green-600">{message}</p>}

        <div className="mt-4 flex justify-end gap-3">
          {selectedId && (
            <button onClick={handleDelete} className="rounded border border-red-300 px-4 py-2 text-xs text-red-600 hover:bg-red-50">删除配方</button>
          )}
          <button onClick={handleSave} className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]">保存配方</button>
        </div>
      </div>
    </div>
  );
}
