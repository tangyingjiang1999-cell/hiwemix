"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Guide, GuideCategory } from "@/types";
import { generateGuideId, generateGuideCategoryId } from "@/lib/id-generator";

export default function GuidesPanel() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editing, setEditing] = useState<Guide | null>(null);
  const [form, setForm] = useState({ id: "", categoryId: "", title: "", titleZh: "", content: "", contentZh: "" });
  const [error, setError] = useState("");
  const [catForm, setCatForm] = useState({ id: "", name: "", nameZh: "" });
  const guideIdEdited = useRef(false);
  const catIdEdited = useRef(false);

  // 新建指南时：英文标题变化自动生成 ID
  useEffect(() => {
    if (!editing && !guideIdEdited.current && form.title) {
      setForm((prev) => ({ ...prev, id: generateGuideId(form.title) }));
    }
  }, [form.title, editing]);

  // 新建分类时：英文名变化自动生成 ID
  useEffect(() => {
    if (!catIdEdited.current && catForm.name) {
      setCatForm((prev) => ({ ...prev, id: generateGuideCategoryId(catForm.name) }));
    }
  }, [catForm.name]);

  const fetchGuides = useCallback(async () => {
    const res = await fetch("/api/admin/guides");
    if (res.ok) setGuides(await res.json());
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/guide-categories");
    if (res.ok) setCategories(await res.json());
  }, []);

  useEffect(() => {
    fetchGuides();
    fetchCategories();
  }, [fetchGuides, fetchCategories]);

  function openCreate() {
    setEditing(null);
    setForm({ id: "", categoryId: categories[0]?.id || "", title: "", titleZh: "", content: "", contentZh: "" });
    setError("");
    guideIdEdited.current = false;
    setShowModal(true);
  }

  function openEdit(guide: Guide) {
    setEditing(guide);
    setForm({
      id: guide.id,
      categoryId: guide.categoryId,
      title: guide.title,
      titleZh: guide.titleZh,
      content: guide.content,
      contentZh: guide.contentZh,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.id || !form.categoryId || !form.title || !form.titleZh) {
      setError("ID、分类、中英标题不能为空");
      return;
    }
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/guides", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: 0 }),
    });
    if (res.ok) {
      setShowModal(false);
      fetchGuides();
    } else {
      const data = await res.json();
      setError(data.error || "保存失败");
    }
  }

  async function handleDelete(guide: Guide) {
    if (!confirm(`确定删除指南「${guide.titleZh}」吗？`)) return;
    const res = await fetch("/api/admin/guides", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guide.id }),
    });
    if (res.ok) fetchGuides();
  }

  async function handleSaveCategory() {
    if (!catForm.id || !catForm.name || !catForm.nameZh) return;
    await fetch("/api/admin/guide-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...catForm, sortOrder: 0 }),
    });
    setCatForm({ id: "", name: "", nameZh: "" });
    catIdEdited.current = false;
    fetchCategories();
  }

  async function handleDeleteCategory(cat: GuideCategory) {
    if (!confirm(`确定删除分类「${cat.nameZh}」吗？\n这将删除该分类下所有指南。`)) return;
    const res = await fetch("/api/admin/guide-categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cat.id }),
    });
    if (res.ok) {
      fetchCategories();
      fetchGuides();
    }
  }

  const filteredGuides = filterCat ? guides.filter((g) => g.categoryId === filterCat) : guides;

  if (loading) return <div className="text-center text-xs text-gray-500">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-xs">
          <option value="">全部分类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nameZh}</option>)}
        </select>
        <button onClick={() => setShowCatModal(true)} className="rounded border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">管理分类</button>
        <div className="flex-1" />
        <button onClick={openCreate} className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E]">+ 新增指南</button>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] uppercase text-gray-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">中文标题</th>
              <th className="px-4 py-3">英文标题</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuides.map((guide) => (
              <tr key={guide.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-xs text-gray-600">{guide.id}</td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-900">{guide.titleZh}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{guide.title}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{categories.find((c) => c.id === guide.categoryId)?.nameZh || guide.categoryId}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(guide)} className="mr-3 text-xs text-blue-600 hover:text-blue-800">编辑</button>
                  <button onClick={() => handleDelete(guide)} className="text-xs text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 指南编辑 modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-[90%] max-w-[600px] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">{editing ? "编辑指南" : "新增指南"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">ID（自动从英文标题生成，可手动修改）</label>
                <input type="text" value={form.id} onChange={(e) => { guideIdEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!editing} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none disabled:bg-gray-100 focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">分类</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]">
                  <option value="">请选择</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nameZh}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">英文标题</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">中文标题</label>
                  <input type="text" value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">英文正文</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">中文正文</label>
                <textarea value={form.contentZh} onChange={(e) => setForm({ ...form, contentZh: e.target.value })} rows={5} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]" />
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

      {/* 分类管理 modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCatModal(false)}>
          <div className="w-[90%] max-w-[450px] rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">管理分类</h3>
            <div className="mb-4 max-h-48 overflow-y-auto rounded border border-gray-200">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-xs last:border-0">
                  <span className="text-gray-700">{cat.nameZh} <span className="text-gray-400">({cat.name})</span></span>
                  <button onClick={() => handleDeleteCategory(cat)} className="text-red-600 hover:text-red-800">删除</button>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded bg-gray-50 p-3">
              <div className="flex gap-2">
                <input type="text" value={catForm.id} onChange={(e) => { catIdEdited.current = true; setCatForm({ ...catForm, id: e.target.value }); }} placeholder="自动生成" className="w-20 rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]" />
                <input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="英文名" className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]" />
                <input type="text" value={catForm.nameZh} onChange={(e) => setCatForm({ ...catForm, nameZh: e.target.value })} placeholder="中文名" className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#0D9488]" />
              </div>
              <button onClick={handleSaveCategory} className="w-full rounded bg-[#0D9488] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F766E]">添加分类</button>
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => setShowCatModal(false)} className="rounded border border-gray-300 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
