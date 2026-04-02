import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        data-ocid="language_switcher.toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
        title="Switch Language"
      >
        <span className="text-sm">{current.flag}</span>
        <span className="material-symbols-outlined text-zinc-400 text-[16px]">
          language
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
          data-ocid="language_switcher.dropdown_menu"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              data-ocid="language_switcher.tab"
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-zinc-800 ${
                language === lang.code ? "text-amber-400" : "text-zinc-300"
              }`}
            >
              <span>{lang.flag}</span>
              <span className="flex-1 text-left">{lang.nativeName}</span>
              {language === lang.code && (
                <span className="text-amber-400 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
