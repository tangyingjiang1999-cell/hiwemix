"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { i18n, type Lang } from "@/lib/i18n";

// 服务器端和客户端首次渲染统一用 "en"，避免 hydration mismatch
// 真实语言在 useEffect 中从 localStorage 读取

// ============================================================
// Language Context
// ============================================================
type Translations = typeof i18n.en;

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  // 客户端挂载后从 localStorage 读取真实语言，避免 SSR/客户端不一致
  useEffect(() => {
    try {
      const stored = localStorage.getItem("site-language");
      if (stored && stored !== lang) {
        setLangState(stored as Lang);
      }
    } catch { /* noop */ }
  }, []);

  // 调试：语言变化时打印日志
  useEffect(() => {
    console.log('[LanguageContext] language changed to:', lang);
  }, [lang]);

  // 不支持的语言回退到英文翻译
  const translations = (i18n as Record<string, unknown>)[lang] ?? i18n.en;

  const value: LanguageContextValue = {
    lang,
    t: translations as unknown as Translations,
    setLang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
