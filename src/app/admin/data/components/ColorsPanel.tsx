"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CarMake, Color, ColorVariant } from "@/types";
import { generateColorId } from "@/lib/id-generator";

const COLOR_TYPES = ["solid", "metallic", "pearl", "matte", "candy", "special"] as const;

export default function ColorsPanel() {
  const [colors, setColors] = useState<Color[]>([]);
  const [brands, setBrands] = useState<CarMake[]>([]);
  const [allVariants, setAllVariants] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [form, setForm] = useState({
    id: "",
    make_id: "",
    color_code: "",
    color_name: "",
    color_type: "solid" as Color["color_type"],
    hex_preview: "#FFFFFF",
  });
  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const idManuallyEdited = useRef(false);

  // 新建时：品牌 + 颜色代码变化自动生成 ID
  useEffect(() => {
    if (!editing && !idManuallyEdited.current && form.make_id && form.color_code) {
      setForm((prev) => ({ ...prev, id: generateColorId(form.make_id, form.color_code) }));
    }
  }, [form.make_id, form.color_code, editing]);

  const fetchColors = useCallback(async () => {
    const res = await fetch("/api/admin/colors");
    if (res.ok) setColors(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchColors();
    fetch("/api/admin/brands").then((r) => (r.ok ? r.json() : [])).then(setBrands);
    fetch("/api/admin/variants").then((r) => (r.ok ? r.json() : [])).then(setAllVariants);
  }, [fetchColors]);

  function openCreate() {
    setEditing(null);
    setForm({ id: "", make_id: "", color_code: "", color_name: "", color_type: "solid", hex_preview: "#FFFFFF" });
    setVariantIds([]);
    setError("");
    idManuallyEdited.current = false;
    setShowModal(true);
  }

  function openEdit(color: Color) {
    setEditing(color);
    setForm({
      id: color.id,
      make_id: color.make_id,
      color_code: color.color_code,
      color_name: color.color_name,
      color_type: color.color_type,
      hex_preview: color.hex_preview,
    });
    setVariantIds(color.variants.map((v) => v.id));
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.id || !form.make_id || !form.color_code || !form.color_name) {
      setError("所有字段不能为空");
      return;
    }
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/colors", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, variantIds }),
    });
    if (res.ok) {
      setShowModal(false);
      fetchColors();
    } else {
      const data = await res.json();
      setError(data.error || "保存失败");
    }
  }

  async function handleDelete(color: Color) {
    if (!confirm(`确定删除颜色「${color.color_name}」吗？\n这将级联删除其下所有配方，不可恢复。`)) return;
    const res = await fetch("/api/admin/colors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: color.id }),
    });
    if (res.ok) fetchColors();
  }

  function toggleVariant(id: string) {
    setVariantIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  if (loading) return <div className="text-center text-xs text-gray-500">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]">
          + 新增颜色
        </button>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] uppercase text-gray-500">
              <th className="px-4 py-3">预览</th>
              <th className="px-4 py-3">颜色代码</th>
              <th className="px-4 py-3">颜色名称</th>
              <th className="px-4 py-3">品牌</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">变体数</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr key={color.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="h-6 w-6 rounded border border-gray-200" style={{ backgroundColor: color.hex_preview }} />
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-900">{color.color_code}</td>
                <td className="px-4 py-3 text-xs text-gray-700">{color.color_name}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{brands.find((b) => b.id === color.make_id)?.name || color.make_id}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{color.color_type}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{color.variants.length}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(color)} className="mr-3 text-xs text-blue-600 hover:text-blue-800">编辑</button>
                  <button onClick={() => handleDelete(color)} className="text-xs text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-[90%] max-w-[500px] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">{editing ? "编辑颜色" : "新增颜色"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">ID（自动从品牌+颜色代码生成，可手动修改）</label>
                <input type="text" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!editing} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none disabled:bg-gray-100 focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">品牌</label>
                <select value={form.make_id} onChange={(e) => setForm({ ...form, make_id: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]">
                  <option value="">请选择品牌</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">颜色代码</label>
                  <input type="text" value={form.color_code} onChange={(e) => setForm({ ...form, color_code: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">颜色名称</label>
                  <input type="text" value={form.color_name} onChange={(e) => setForm({ ...form, color_name: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">类型</label>
                  <select value={form.color_type} onChange={(e) => setForm({ ...form, color_type: e.target.value as Color["color_type"] })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]">
                    {COLOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">预览色</label>
                  <input type="color" value={form.hex_preview} onChange={(e) => setForm({ ...form, hex_preview: e.target.value })} className="mt-1 h-9 w-full rounded border border-gray-300 px-1 py-1 outline-none focus:border-[#0D9488]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">关联变体</label>
                <div className="mt-1 max-h-32 overflow-y-auto rounded border border-gray-300 p-2">
                  {allVariants.length === 0 && <span className="text-[11px] text-gray-400">暂无变体，请先在「变体」tab 创建</span>}
                  {allVariants.map((v) => (
                    <label key={v.id} className="flex items-center gap-2 py-1 text-xs text-gray-700">
                      <input type="checkbox" checked={variantIds.includes(v.id)} onChange={() => toggleVariant(v.id)} className="h-3 w-3" />
                      {v.name} <span className="text-gray-400">({v.year_range})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded border border-gray-300 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
