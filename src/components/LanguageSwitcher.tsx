"use client";

import { useLang } from "@/components/LanguageContext";
import type { Lang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  function handleToggle() {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="rounded-full border border-[#006565] px-3 py-1 text-sm font-semibold text-[#006565] transition-all duration-200 ease-out hover:bg-[#006565]/10"
      aria-label={lang === "en" ? "Switch to Chinese" : "切换到英文"}
    >
      {lang === "en" ? "中文" : "EN"}
    </button>
  );
}
