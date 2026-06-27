"use client";

import { useState } from "react";
import { mockColors, mockCarMakes } from "@/lib/mock-data";
import { useLang } from "@/components/LanguageContext";
import type { Color } from "@/types";

// 颜色卡片组件
function ColorCard({ color, onClick }: { color: Color; onClick: (color: Color) => void }) {
  const { t } = useLang();

  const typeLabels: Record<string, string> = {
    solid: t.colorTypeSolidLabel,
    metallic: t.colorTypeMetallicLabel,
    pearl: t.colorTypePearlLabel,
    special: t.colorTypeSpecialLabel,
  };

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-teal-600 hover:shadow-lg"
      onClick={() => onClick(color)}
    >
      {/* 颜色预览 */}
      <div
        className="mb-3 h-32 rounded-md"
        style={{ backgroundColor: color.hex_preview }}
      />

      {/* 颜色信息 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{color.color_code}</span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {typeLabels[color.color_type] || color.color_type}
          </span>
        </div>
        <p className="text-sm text-gray-700">{color.color_name}</p>
      </div>
    </div>
  );
}

// 颜色详情弹窗
function ColorDetailModal({ color, onClose }: { color: Color; onClose: () => void }) {
  const { t } = useLang();
  const make = mockCarMakes.find((m) => m.id === color.make_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button onClick={onClose} className="mb-4 text-gray-500 hover:text-gray-700">
          ✕ Close
        </button>

        {/* 颜色预览 */}
        <div
          className="mb-6 h-48 rounded-lg"
          style={{ backgroundColor: color.hex_preview }}
        />

        {/* 颜色信息 */}
        <h2 className="mb-4 text-2xl font-bold">{color.color_name}</h2>
        <div className="space-y-2 text-sm">
          <p><strong>{t.makeLabel}:</strong> {make?.name || color.make_id}</p>
          <p><strong>{t.codeLabel}:</strong> {color.color_code}</p>
          <p><strong>{t.typeLabel}:</strong> {color.color_type}</p>
        </div>

        {/* 变体信息 */}
        <div className="mt-6">
          <h3 className="mb-2 font-semibold">{t.formulaVariants}</h3>
          {color.variants.map((variant) => (
            <div key={variant.id} className="mb-2 rounded border p-3">
              <p className="font-medium">{variant.name}</p>
              <p className="text-sm text-gray-600">{t.yearsLabel}: {variant.year_range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 主页面
export default function ColorLibraryPage() {
  const { t } = useLang();
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [filterMake, setFilterMake] = useState("");
  const [filterType, setFilterType] = useState("");

  // 筛选逻辑
  const filteredColors = mockColors.filter((color) => {
    if (filterMake && color.make_id !== filterMake) return false;
    if (filterType && color.color_type !== filterType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 */}
      <header className="bg-gradient-to-r from-purple-600 to-teal-700 p-6 text-white">
        <h1 className="text-3xl font-extrabold">HAIWEN MIX</h1>
        <p className="mt-1 text-lg">Color Visual Library</p>
      </header>

      {/* 导航 */}
      <nav className="border-b bg-white px-6 py-3">
        <a href="/" className="mr-6 text-sm text-gray-600 hover:text-teal-600">Formula Search</a>
        <a href="/color-library" className="mr-6 border-b-2 border-teal-600 pb-3 text-sm font-semibold text-teal-600">Color Visual Library</a>
        <a href="/application-guide" className="text-sm text-gray-600 hover:text-teal-600">Application Guide</a>
      </nav>

      {/* 筛选栏 */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <select
            value={filterMake}
            onChange={(e) => setFilterMake(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">{t.allMakes}</option>
            {mockCarMakes.map((make) => (
              <option key={make.id} value={make.id}>{make.name}</option>
            ))}
          </select>

          <div className="flex gap-2">
            {["", "solid", "metallic", "pearl"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                  filterType === type
                    ? "border-gray-800 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-teal-600"
                }`}
              >
                {type === "" ? t.colorTypeAll : 
                 type === "solid" ? t.colorTypeSolid :
                 type === "metallic" ? t.colorTypeMetallic :
                 type === "pearl" ? t.colorTypePearl : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 颜色网格 */}
      <div className="grid grid-cols-4 gap-6 p-6">
        {filteredColors.map((color) => (
          <ColorCard key={color.id} color={color} onClick={setSelectedColor} />
        ))}
      </div>

      {/* 颜色详情弹窗 */}
      {selectedColor && (
        <ColorDetailModal color={selectedColor} onClose={() => setSelectedColor(null)} />
      )}
    </div>
  );
}
