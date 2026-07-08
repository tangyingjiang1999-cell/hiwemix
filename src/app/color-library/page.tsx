"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/components/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import type { CarMake, Color } from "@/types";

function ColorCard({ color, onClick }: { color: Color; onClick: (color: Color) => void }) {
  const { t } = useLang();

  const typeLabels: Record<string, string> = {
    solid: t.colorTypeSolidLabel, metallic: t.colorTypeMetallicLabel,
    pearl: t.colorTypePearlLabel, matte: t.colorTypeMatteLabel,
    candy: t.colorTypeCandyLabel, special: t.colorTypeSpecialLabel,
  };

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-teal-600 hover:shadow-lg"
      onClick={() => onClick(color)}
    >
      <div
        className="mb-3 h-32 rounded-md"
        style={{ backgroundColor: color.hex_preview }}
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{color.color_code}</span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 font-medium text-gray-600">
            {typeLabels[color.color_type] || color.color_type}
          </span>
        </div>
        <p className="text-xs text-gray-700">{color.color_name}</p>
      </div>
    </div>
  );
}

function ColorDetailModal({ color, onClose, carMakes }: { color: Color; onClose: () => void; carMakes: CarMake[] }) {
  const { t } = useLang();
  const make = carMakes.find((m) => m.id === color.make_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 sm:mx-0 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="mb-4 text-xs text-gray-500 hover:text-gray-700">
          {t.close}
        </button>

        <div
          className="mb-6 h-48 rounded-lg"
          style={{ backgroundColor: color.hex_preview }}
        />

        <h2 className="mb-4 text-sm font-semibold font-bold text-gray-900">{color.color_name}</h2>
        <div className="space-y-2 text-xs">
          <p><strong>{t.makeLabel}:</strong> {make?.name || color.make_id}</p>
          <p><strong>{t.codeLabel}:</strong> {color.color_code}</p>
          <p><strong>{t.typeLabel}:</strong> {color.color_type}</p>
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold font-semibold">{t.formulaVariants}</h3>
          {color.variants.map((variant) => (
            <div key={variant.id} className="mb-2 rounded border p-3">
              <p className="text-xs font-semibold">{variant.name}</p>
              <p className="text-[11px] text-gray-500 text-gray-600">{t.yearsLabel}: {variant.year_range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ColorLibraryPage() {
  const { t } = useLang();
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [filterMake, setFilterMake] = useState("");
  const [filterType, setFilterType] = useState("");
  // 从公开 API 加载，使 Data Management 的增删改能同步
  const [colors, setColors] = useState<Color[]>([]);
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/colors").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/brands").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([c, m]: [Color[], CarMake[]]) => {
        setColors(c);
        setCarMakes(m);
      })
      .catch(() => {
        setColors([]);
        setCarMakes([]);
      });
  }, []);

  const filteredColors = colors.filter((color) => {
    if (filterMake && color.make_id !== filterMake) return false;
    if (filterType && color.color_type !== filterType) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <Navigation />

      <div className="bg-gray-50 border-b border-gray-200 px-4 pt-20 pb-3 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <select
            value={filterMake}
            onChange={(e) => setFilterMake(e.target.value)}
            className="rounded border px-3 py-2 text-xs"
          >
            <option value="">{t.allMakes}</option>
            {carMakes.map((make) => (
              <option key={make.id} value={make.id}>{make.name}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {(["", "solid", "metallic", "pearl", "matte", "candy"] as const).map((type) => {
              const labels: Record<string, string> = {
                "": t.colorTypeAll, solid: t.colorTypeSolid, metallic: t.colorTypeMetallic,
                pearl: t.colorTypePearl, matte: t.colorTypeMatte, candy: t.colorTypeCandy,
              };
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-full border px-4 py-1.5 transition-all ${
                    filterType === type
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-teal-600"
                  }`}
                >
                  {labels[type] ?? type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 content-start gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:p-6">
        {filteredColors.map((color) => (
          <ColorCard key={color.id} color={color} onClick={setSelectedColor} />
        ))}
      </div>

      {selectedColor && (
        <ColorDetailModal color={selectedColor} onClose={() => setSelectedColor(null)} carMakes={carMakes} />
      )}
      <Footer />
    </div>
  );
}
