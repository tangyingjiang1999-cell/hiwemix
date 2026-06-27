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
      className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white transition-all duration-200 ease-out hover:bg-white/15"
      aria-label={lang === "en" ? "Switch to Chinese" : "\u5207\u6362\u5230\u82f1\u6587"}
    >
      {lang === "en" ? "\u4e2d\u6587" : "EN"}
    </button>
  );
}
