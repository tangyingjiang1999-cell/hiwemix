"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CarMake } from "@/types";
import { generateBrandId } from "@/lib/id-generator";

const REGIONS = ["JPN", "EUR", "USA", "CHN", "KOR"] as const;

export default function BrandsPanel() {
  const [brands, setBrands] = useState<CarMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CarMake | null>(null);
  const [form, setForm] = useState({ id: "", name: "", region: "JPN" as CarMake["region"] });
  const [error, setError] = useState("");
  const idManuallyEdited = useRef(false);

  // 新建时：名称变化自动生成 ID（手动编辑后停止自动覆盖）
  useEffect(() => {
    if (!editing && !idManuallyEdited.current && form.name) {
      setForm((prev) => ({ ...prev, id: generateBrandId(form.name) }));
    }
  }, [form.name, editing]);

  const fetchBrands = useCallback(async () => {
    const res = await fetch("/api/admin/brands");
    if (res.ok) setBrands(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  function openCreate() {
    setEditing(null);
    setForm({ id: "", name: "", region: "JPN" });
    setError("");
    idManuallyEdited.current = false;
    setShowModal(true);
  }

  function openEdit(brand: CarMake) {
    setEditing(brand);
    setForm({ id: brand.id, name: brand.name, region: brand.region });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.id || !form.name) {
      setError("ID 和名称不能为空");
      return;
    }
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/brands", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      fetchBrands();
    } else {
      const data = await res.json();
      setError(data.error || "保存失败");
    }
  }

  async function handleDelete(brand: CarMake) {
    if (!confirm(`确定删除品牌「${brand.name}」吗？\n这将级联删除其下所有颜色和配方，不可恢复。`)) return;
    const res = await fetch("/api/admin/brands", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: brand.id }),
    });
    if (res.ok) fetchBrands();
  }

  if (loading) return <div className="text-center text-xs text-gray-500">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]">
          + 新增品牌
        </button>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] uppercase text-gray-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">产地</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-xs text-gray-600">{brand.id}</td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-900">{brand.name}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{brand.region}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(brand)} className="mr-3 text-xs text-blue-600 hover:text-blue-800">编辑</button>
                  <button onClick={() => handleDelete(brand)} className="text-xs text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-[400px] rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">{editing ? "编辑品牌" : "新增品牌"}</h3>
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
                <label className="block text-xs font-medium text-gray-700">产地</label>
                <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value as CarMake["region"] })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]">
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
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
