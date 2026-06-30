"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { mockCarMakes } from "@/lib/mock-data";
import { COLOR_TYPE_OPTIONS } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import type { SearchParams } from "@/types";

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
      <div className="flex h-11 items-center border border-gray-300 bg-white px-4 transition-colors hover:border-blue-600">
        <span className="shrink-0 text-muji-body text-gray-600">
          {label}
        </span>
        <span className="mx-3 h-4 w-px bg-gray-200 shrink-0" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full flex-1 appearance-none bg-transparent text-muji-body text-gray-900 outline-none cursor-pointer"
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
      <div className="flex h-11 items-center border border-gray-300 bg-white px-4 transition-colors hover:border-blue-600">
        <span className="shrink-0 text-muji-body text-gray-600">
          {label}
        </span>
        <span className="mx-3 h-4 w-px bg-gray-200 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="h-full flex-1 bg-transparent text-muji-body text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

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
    solid: t.colorTypeSolid,
    metallic: t.colorTypeMetallic,
    pearl: t.colorTypePearl,
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PillSelect
          label={t.make}
          value={makeId}
          onChange={setMakeId}
          options={mockCarMakes.map((m) => ({ value: m.id, label: m.name }))}
          placeholder={t.allMakes}
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
        <p className="mt-2 text-muji-micro text-orange-500">{t.codeTooLong}</p>
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
                  "rounded border px-4 py-1.5 transition-colors",
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-600",
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
            "flex items-center gap-2 rounded px-6 py-2.5 text-muji-heading text-white transition-colors",
            "bg-blue-600 hover:bg-blue-700",
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
            "flex items-center gap-2 rounded border border-gray-300 bg-white px-6 py-2.5 text-muji-heading text-gray-700 transition-colors",
            "hover:border-blue-600 hover:text-blue-600",
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
