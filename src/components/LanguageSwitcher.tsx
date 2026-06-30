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
      className="rounded-full border border-white/30 px-3 py-1 text-muji-micro font-muji-600 text-white transition-all duration-200 ease-out hover:bg-white/15"
      aria-label={lang === "en" ? "Switch to Chinese" : "切换到英文"}
    >
      {lang === "en" ? "中文" : "EN"}
    </button>
  );
}
