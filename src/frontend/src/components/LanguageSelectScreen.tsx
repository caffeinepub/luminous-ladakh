import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../i18n/translations";

export function LanguageSelectScreen() {
  const { setLanguage, setLanguageSelected, t } = useLanguage();
  const [selected, setSelected] = useState("en");

  const handleContinue = () => {
    setLanguage(selected);
    setLanguageSelected(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "#0a0a0a" }}
      data-ocid="language_select.page"
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <img
          src="/assets/ladakh-connect-logo.png"
          alt="Ladakh Connect"
          className="w-20 h-20 mb-4"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <h1
          className="text-3xl font-bold text-amber-400 text-center"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontStyle: "italic",
          }}
        >
          Ladakh Connect
        </h1>
        <p className="text-zinc-400 text-sm mt-2 text-center">
          {t("welcomeSubtitle")}
        </p>
      </div>

      {/* Language Cards */}
      <div
        className="w-full max-w-sm space-y-3 mb-8"
        data-ocid="language_select.list"
      >
        {LANGUAGES.map((lang, i) => (
          <button
            key={lang.code}
            type="button"
            data-ocid={`language_select.item.${i + 1}`}
            onClick={() => setSelected(lang.code)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
              selected === lang.code
                ? "border-amber-400 bg-amber-400/10"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="flex-1">
              <p
                className={`text-lg font-bold leading-tight ${
                  selected === lang.code ? "text-amber-400" : "text-white"
                }`}
              >
                {lang.nativeName}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{lang.name}</p>
            </div>
            {selected === lang.code && (
              <span className="text-amber-400 text-xl">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        data-ocid="language_select.submit_button"
        onClick={handleContinue}
        className="w-full max-w-sm py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-lg transition-all active:scale-95"
      >
        {t("continueBtn")}
      </button>
    </div>
  );
}
