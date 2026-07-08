"use client";

import { useState, useEffect } from "react";
import type { AppSettings } from "@/types";

export default function SettingsPanel() {
  const [finishesText, setFinishesText] = useState("");
  const [typesText, setTypesText] = useState("");
  const [yearMin, setYearMin] = useState(1990);
  const [yearMax, setYearMax] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AppSettings | null) => {
        if (data) {
          setFinishesText(data.finishes.join("\n"));
          setTypesText(data.types.join("\n"));
          setYearMin(data.yearMin);
          setYearMax(data.yearMax);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const finishes = finishesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const types = typesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finishes, types, yearMin, yearMax }),
    });
    setSaving(false);
    setMessage(res.ok ? "保存成功" : "保存失败");
  }

  if (loading) return <div className="text-center text-xs text-gray-500">加载中...</div>;

  return (
    <div className="max-w-2xl rounded border border-gray-200 bg-white p-6">
      <p className="mb-5 text-[11px] text-gray-500">
        漆面类型和配方类型每行一个值。漆面类型首字母大写（如 Solid），搜索面板会自动转小写匹配数据库。
      </p>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-700">漆面类型（每行一个）</label>
          <textarea
            value={finishesText}
            onChange={(e) => setFinishesText(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]"
            placeholder={"Solid\nMetallic\nPearl\nMatte\nCandy\nSpecial"}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">配方类型（每行一个）</label>
          <textarea
            value={typesText}
            onChange={(e) => setTypesText(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]"
            placeholder={"Basecoat\nClearcoat\nSingle Stage\nPrimer\nTopcoat"}
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">最小年份</label>
            <input
              type="number"
              value={yearMin}
              onChange={(e) => setYearMin(Number(e.target.value))}
              className="mt-1 w-32 rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">最大年份</label>
            <input
              type="number"
              value={yearMax}
              onChange={(e) => setYearMax(Number(e.target.value))}
              className="mt-1 w-32 rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#0D9488]"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E] disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存设置"}
          </button>
          {message && (
            <span className={`text-xs ${message === "保存成功" ? "text-green-600" : "text-red-600"}`}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
