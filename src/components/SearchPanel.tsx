"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { COLOR_TYPE_OPTIONS } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, SearchParams, AppSettings } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Search, RotateCcw, ChevronDown } from "lucide-react";

export interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  onFocusCapture?: () => void;
  onBlurCapture?: () => void;
}

// ===== 可搜索下拉选择器：Popover + Input 模糊过滤 =====
function SearchableSelect({
  placeholder,
  value,
  onValueChange,
  options,
  className,
}: {
  placeholder: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开时清空搜索词并 focus
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 模糊过滤：匹配 label（不区分大小写）
  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // 当前选中项的 label（用于显示在触发器上）
  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={className}
        render={
          <button
            type="button"
            className="flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm whitespace-nowrap outline-none transition-colors hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              className={
                selectedLabel
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
            >
              {selectedLabel || placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="z-50 w-(--anchor-width) p-0"
      >
        {/* 搜索输入 */}
        <div className="border-b border-border p-1.5">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-7 border-0 bg-muted/50 text-xs shadow-none focus-visible:ring-0"
          />
        </div>

        {/* 选项列表 */}
        <div className="max-h-[160px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No results
            </p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onValueChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors ${
                  o.value === value
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function SearchPanel({
  onSearch,
  isLoading,
  onSubmitRef,
  onFocusCapture,
  onBlurCapture,
}: SearchPanelProps) {
  const { t } = useLang();

  const [makeId, setMakeId] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState("");
  const [year, setYear] = useState("");
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [colorTypeOptions, setColorTypeOptions] = useState<
    { value: string; label: string }[]
  >(COLOR_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })));
  const [allYears, setAllYears] = useState<number[]>([]);

  // 构建品牌选项列表（id -> name）
  const makeOptions = [
    { value: "", label: t.make },
    ...carMakes.map((m) => ({ value: m.id, label: m.name })),
  ];

  // 构建年份选项列表
  const yearOptions = allYears.map((y) => ({
    value: String(y),
    label: String(y),
  }));

  // 获取品牌列表
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: CarMake[]) => setCarMakes(d))
      .catch(() => setCarMakes([]));
  }, []);

  // 获取漆面类型 + 年份范围
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AppSettings | null) => {
        if (data?.finishes?.length) {
          setColorTypeOptions([
            { value: "", label: t.colorTypeAll },
            ...data.finishes.map((f: string) => ({
              value: f.toLowerCase(),
              label: f,
            })),
          ]);
        }
        // 从 settings 生成年份列表
        if (data?.yearMin && data?.yearMax) {
          const years: number[] = [];
          for (let y = data.yearMax; y >= data.yearMin; y--) {
            years.push(y);
          }
          setAllYears(years);
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
      {/* 2×3 网格布局，标签内嵌到输入框/下拉框的 placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-full">
        {/* Make — 可搜索下拉 */}
        <SearchableSelect
          placeholder={t.make}
          value={makeId}
          onValueChange={setMakeId}
          options={makeOptions}
          className="w-full"
        />

        {/* Color Code */}
        <Input
          value={colorCode}
          onChange={(e) =>
            setColorCode(e.target.value.replace(/\s/g, "").toUpperCase())
          }
          placeholder={t.colorCode}
          className="h-9 rounded-lg"
          maxLength={20}
        />

        {/* Color Type — 可搜索下拉 */}
        <SearchableSelect
          placeholder={t.colorType}
          value={colorType}
          onValueChange={setColorType}
          options={colorTypeOptions}
          className="w-full"
        />

        {/* Color Name */}
        <Input
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
          placeholder={t.colorName}
          className="h-9 rounded-lg"
        />

        {/* Year — 可搜索下拉 */}
        <SearchableSelect
          placeholder={t.year}
          value={year}
          onValueChange={setYear}
          options={yearOptions}
          className="w-full"
        />

        {/* 搜索 + 重置按钮 */}
        <div className="flex items-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="h-9 flex-1 rounded-xl bg-primary text-2xs font-semibold hover:bg-primary/80"
          >
            <Search className="size-4" />
            {isLoading ? t.searching : t.search}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            className="h-9 flex-1 rounded-xl text-2xs font-semibold"
          >
            <RotateCcw className="size-4" />
            {t.reset}
          </Button>
        </div>
      </div>

      {isCodeTooLong && (
        <div
          role="alert"
          className="mt-2 text-xs font-medium text-yellow-600"
        >
          {t.codeTooLong}
        </div>
      )}
    </form>
  );
}
