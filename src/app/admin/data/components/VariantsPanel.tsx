"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ColorVariant } from "@/types";
import { generateVariantId } from "@/lib/id-generator";

export default function VariantsPanel() {
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ColorVariant | null>(null);
  const [form, setForm] = useState({ id: "", name: "", year_range: "" });
  const [error, setError] = useState("");
  const idManuallyEdited = useRef(false);

  // 新建时：名称变化自动生成 ID
  useEffect(() => {
    if (!editing && !idManuallyEdited.current && form.name) {
      setForm((prev) => ({ ...prev, id: generateVariantId(form.name) }));
    }
  }, [form.name, editing]);

  const fetchVariants = useCallback(async () => {
    const res = await fetch("/api/admin/variants");
    if (res.ok) setVariants(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  function openCreate() {
    setEditing(null);
    setForm({ id: "", name: "", year_range: "" });
    setError("");
    idManuallyEdited.current = false;
    setShowModal(true);
  }

  function openEdit(variant: ColorVariant) {
    setEditing(variant);
    setForm({ id: variant.id, name: variant.name, year_range: variant.year_range });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.id || !form.name || !form.year_range) {
      setError("ID、名称、年份范围不能为空");
      return;
    }
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/variants", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      fetchVariants();
    } else {
      const data = await res.json();
      setError(data.error || "保存失败");
    }
  }

  async function handleDelete(variant: ColorVariant) {
    if (!confirm(`确定删除变体「${variant.name}」吗？`)) return;
    const res = await fetch("/api/admin/variants", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variant.id }),
    });
    if (res.ok) fetchVariants();
  }

  if (loading) return <div className="text-center text-xs text-gray-500">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]">
          + 新增变体
        </button>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] uppercase text-gray-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">年份范围</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-xs text-gray-600">{variant.id}</td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-900">{variant.name}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{variant.year_range}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(variant)} className="mr-3 text-xs text-blue-600 hover:text-blue-800">编辑</button>
                  <button onClick={() => handleDelete(variant)} className="text-xs text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-[400px] rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">{editing ? "编辑变体" : "新增变体"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">ID（自动从名称生成，可手动修改）</label>
                <input type="text" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!editing} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none disabled:bg-gray-100 focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">名称</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">年份范围（如 2018-2022）</label>
                <input type="text" value={form.year_range} onChange={(e) => setForm({ ...form, year_range: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
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
