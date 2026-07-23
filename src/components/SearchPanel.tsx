"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { COLOR_TYPE_OPTIONS } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, SearchParams, AppSettings } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";

export interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  onFocusCapture?: () => void;
  onBlurCapture?: () => void;
}

export default function SearchPanel({ onSearch, isLoading, onSubmitRef, onFocusCapture, onBlurCapture }: SearchPanelProps) {
  const { t } = useLang();

  const [makeId, setMakeId] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState("");
  const [year, setYear] = useState("");
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [colorTypeOptions, setColorTypeOptions] = useState<{ value: string; label: string }[]>(
    COLOR_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
  );

  // Fetch brands
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: CarMake[]) => setCarMakes(d))
      .catch(() => setCarMakes([]));
  }, []);

  // Fetch settings (color types)
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AppSettings | null) => {
        if (data?.finishes?.length) {
          setColorTypeOptions([
            { value: "", label: t.colorTypeAll },
            ...data.finishes.map((f: string) => ({ value: f.toLowerCase(), label: f })),
          ]);
        }
      })
      .catch(() => {});
  }, [t.colorTypeAll]);

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
    [makeId, colorCode, colorName, colorType, year, onSearch]
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

  return (
    <form
      role="search"
      aria-label={t.search}
      onSubmit={(e) => handleSubmit(e)}
      onFocus={onFocusCapture}
      onBlur={onBlurCapture}
    >
      {/* 2×3 网格布局 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-full">
        {/* Row 1: Make | Color Code | Color Type */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700">{t.make}</Label>
          <Select value={makeId} onValueChange={(v) => setMakeId(v || "")}>
            <SelectTrigger className="h-9 w-full rounded-lg">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              <SelectItem value="all">All</SelectItem>
              {carMakes.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700">{t.colorCode}</Label>
          <Input
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value.replace(/\s/g, "").toUpperCase())}
            placeholder={t.colorCodePlaceholder}
            className="h-9 rounded-lg"
            maxLength={20}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700">{t.colorType}</Label>
          <Select value={colorType} onValueChange={(v) => setColorType(v || "")}>
            <SelectTrigger className="h-9 w-full rounded-lg">
              <SelectValue placeholder={t.colorTypeAll} />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {colorTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Color Name | Year | Search + Reset buttons */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700">{t.colorName}</Label>
          <Input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder={t.colorNamePlaceholder}
            className="h-9 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700">{t.year}</Label>
          <Input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={t.yearPlaceholder}
            className="h-9 rounded-lg"
            maxLength={9}
          />
        </div>

        {/* 按钮组，放在网格最后一个单元格 */}
        <div className="flex items-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="h-9 flex-1 rounded-xl bg-[#2487ca] text-[13px] font-semibold hover:bg-[#1d6fb0]"
          >
            <Search className="size-4" />
            {isLoading ? t.searching : t.search}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            className="h-9 flex-1 rounded-xl text-[13px] font-semibold"
          >
            <RotateCcw className="size-4" />
            {t.reset}
          </Button>
        </div>
      </div>

      {isCodeTooLong && (
        <div role="alert" className="mt-2 text-xs font-medium text-yellow-600">
          {t.codeTooLong}
        </div>
      )}
    </form>
  );
}
