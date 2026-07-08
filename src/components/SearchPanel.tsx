"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { COLOR_TYPE_OPTIONS } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, SearchParams } from "@/types";

export interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
}

function PillSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  widthClass,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  widthClass: string;
}) {
  return (
    <div className={`relative ${widthClass}`}>
      <div className="flex h-11 items-center border border-gray-300 bg-white px-4 transition-colors hover:border-[#0D9488]">
        <span className="shrink-0 text-xs text-gray-600">
          {label}
        </span>
        <span className="mx-3 h-4 w-px bg-gray-200 shrink-0" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full flex-1 appearance-none bg-transparent text-xs text-gray-900 outline-none cursor-pointer"
        >
          <option value="">{placeholder || "All"}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PillInput({
  label,
  value,
  onChange,
  placeholder,
  widthClass,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  widthClass: string;
  maxLength?: number;
}) {
  return (
    <div className={`relative ${widthClass}`}>
      <div className="flex h-11 items-center border border-gray-300 bg-white px-4 transition-colors hover:border-[#0D9488]">
        <span className="shrink-0 text-xs text-gray-600">
          {label}
        </span>
        <span className="mx-3 h-4 w-px bg-gray-200 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="h-full flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);

export default function SearchPanel({
  onSearch,
  isLoading,
  onSubmitRef,
}: SearchPanelProps) {
  const { t } = useLang();

  const [makeId, setMakeId] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState("");
  const [year, setYear] = useState("");
  // 品牌列表从公开 API 加载，使 Data Management 的增删改能同步到下拉框
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CarMake[]) => setCarMakes(data))
      .catch(() => setCarMakes([]));
  }, []);

  const isCodeTooLong = colorCode.replace(/\s/g, "").length > 10;

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      if (e) e.preventDefault();
      const params: SearchParams = {};
      if (makeId) params.make_id = makeId;
      if (colorCode.trim()) params.color_code = colorCode.replace(/\s/g, "");
      if (colorName.trim()) params.color_name = colorName.trim();
      if (colorType) params.color_type = colorType;
      if (year.trim()) params.year = year.trim();
      onSearch(params);
    },
    [makeId, colorCode, colorName, colorType, year, onSearch],
  );

  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = () => handleSubmit();
    }
    return () => {
      if (onSubmitRef) onSubmitRef.current = null;
    };
  }, [onSubmitRef, handleSubmit]);

  function handleReset() {
    setMakeId("");
    setColorCode("");
    setColorName("");
    setColorType("");
    setYear("");
  }

  function handleColorCodeChange(value: string) {
    setColorCode(value.replace(/\s/g, "").toUpperCase());
  }

  const labelMap: Record<string, string> = {
    "": t.colorTypeAll,
    solid: t.colorTypeSolid, metallic: t.colorTypeMetallic,
    pearl: t.colorTypePearl, matte: t.colorTypeMatte,
    candy: t.colorTypeCandy,
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PillSelect
          label={t.make}
          value={makeId}
          onChange={setMakeId}
          options={carMakes.map((m) => ({ value: m.id, label: m.name }))}
          placeholder=""
          widthClass="w-full"
        />
        <PillInput
label={t.colorCode}
          value={colorCode}
          onChange={handleColorCodeChange}
          placeholder={t.colorCodePlaceholder}
          widthClass="w-full"
          maxLength={20}
        />
        <PillInput
          label={t.colorName}
          value={colorName}
          onChange={(v) => setColorName(v)}
          placeholder={t.colorNamePlaceholder}
          widthClass="w-full"
        />
        <PillInput
          label={t.year}
          value={year}
          onChange={(v) => setYear(v)}
          placeholder={t.yearPlaceholder}
          widthClass="w-full"
          maxLength={9}
        />
      </div>

      {isCodeTooLong && (
        <p className="mt-2 text-[10px] font-medium text-orange-500">{t.codeTooLong}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {COLOR_TYPE_OPTIONS.map((opt) => {
            const isSelected = colorType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColorType(opt.value)}
                className={[
                  "rounded border px-3 py-1.5 transition-colors sm:px-4",
                  isSelected
                    ? "border-[#0D9488] bg-[#0D9488] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#0D9488]",
                ].join(" ")}
              >
                {labelMap[opt.value] ?? opt.label}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={[
            "flex items-center gap-2 rounded px-4 py-2.5 text-xs font-semibold text-white transition-colors sm:px-6",
            "bg-[#0D9488] hover:bg-[#0F766E]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          <SearchIcon />
          {isLoading ? t.searching : t.search}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className={[
            "flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition-colors sm:px-6",
            "hover:border-[#0D9488] hover:text-[#0D9488]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          <RefreshIcon />
          {t.reset}
        </button>
      </div>
    </form>
  );
}
