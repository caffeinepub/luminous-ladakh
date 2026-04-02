import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { WORLD_LANGUAGES } from "../i18n/worldLanguages";

export function WorldLanguageDownloader() {
  const { downloadedLanguages, downloadLanguage, setLanguage, isPWA } =
    useLanguage();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (!isPWA) return null;

  const filtered = WORLD_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="bg-card border border-border rounded-xl p-4"
      data-ocid="language.panel"
    >
      <button
        type="button"
        data-ocid="language.toggle"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-heading font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            public
          </span>
          More Languages
        </h3>
        <span className="material-symbols-outlined text-muted-foreground text-sm">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3" data-ocid="language.list">
          <input
            type="text"
            data-ocid="language.search_input"
            placeholder="Search languages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {filtered.map((lang, i) => {
              const isDownloaded = downloadedLanguages.includes(lang.code);
              return (
                <div
                  key={lang.code}
                  data-ocid={`language.item.${i + 1}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {lang.nativeName}
                    </p>
                    <p className="text-xs text-zinc-500">{lang.name}</p>
                  </div>
                  {isDownloaded ? (
                    <button
                      type="button"
                      data-ocid={`language.toggle.${i + 1}`}
                      onClick={() => {
                        setLanguage(lang.code);
                        toast.success(`Switched to ${lang.name}`);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                    >
                      Use
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`language.download_button.${i + 1}`}
                      onClick={() => {
                        downloadLanguage(lang.code);
                        setLanguage(lang.code);
                        toast.success(
                          `${lang.name} downloaded! The app now shows ${lang.name}.`,
                        );
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
                    >
                      Download
                    </button>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p
                className="text-sm text-zinc-500 text-center py-4"
                data-ocid="language.empty_state"
              >
                No languages found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
