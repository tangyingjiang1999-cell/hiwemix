"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/components/LanguageContext";
import { LANGS, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  function pick(code: Lang) {
    setLang(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-[#0D9488] bg-white px-2 py-1.5 text-sm font-semibold text-[#0D9488] transition-all duration-200 hover:bg-[#0D9488]/5 sm:px-3"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {current.flag}
        </span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
        <svg
          className={["h-3.5 w-3.5 transition-transform", open ? "rotate-180" : ""].join(" ")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
          style={{ [lang === "ar" || lang === "he" ? "left" : "right"]: 0 }}
        >
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => pick(l.code)}
                  className={[
                    "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-[#0D9488]/10 text-[#0D9488] font-semibold"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                  role="option"
                  aria-selected={active}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {l.flag}
                  </span>
                  <span className="flex-1">{l.name}</span>
                  {active && (
                    <svg
                      className="h-4 w-4 text-[#0D9488]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
