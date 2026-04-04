import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

// Simulated weather data per location (refreshed daily)
// In production this would come from a weather API via HTTP outcall
const BASE_WEATHER = [
  {
    name: "Leh",
    baseTemp: 12,
    icon: "wb_sunny",
    condition: "Sunny",
    wind: 12,
    humidity: 28,
  },
  {
    name: "Pangong Lake",
    baseTemp: 4,
    icon: "partly_cloudy_day",
    condition: "Partly Cloudy",
    wind: 18,
    humidity: 35,
  },
  {
    name: "Nubra Valley",
    baseTemp: 9,
    icon: "wb_sunny",
    condition: "Clear",
    wind: 8,
    humidity: 22,
  },
  {
    name: "Khardung La",
    baseTemp: -3,
    icon: "weather_snowy",
    condition: "Snow Risk",
    wind: 28,
    humidity: 55,
  },
];

function getDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getOrGenerateWeather() {
  const key = `lc_weather_${getDayKey()}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch {}
  // Generate daily variance (+/- 3 degrees, slight wind change)
  const variance = (Math.random() - 0.5) * 6;
  const generated = BASE_WEATHER.map((w) => ({
    ...w,
    temp: Math.round(w.baseTemp + variance),
    wind: Math.max(0, w.wind + Math.round((Math.random() - 0.5) * 6)),
    fetchedAt: new Date().toISOString(),
  }));
  // Cache for the day
  try {
    localStorage.setItem(key, JSON.stringify(generated));
    // Clean up yesterday's cache
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("lc_weather_") && k !== key) localStorage.removeItem(k);
    }
  } catch {}
  return generated;
}

export function WeatherWidget() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(getOrGenerateWeather);
  const [lastRefresh, setLastRefresh] = useState<string>(() => {
    const w = getOrGenerateWeather();
    return w[0]?.fetchedAt || new Date().toISOString();
  });

  // Auto-refresh every 24h
  useEffect(() => {
    const interval = setInterval(
      () => {
        const key = `lc_weather_${getDayKey()}`;
        // If the key changed (new day), clear and regenerate
        const existing = localStorage.getItem(key);
        if (!existing) {
          const fresh = getOrGenerateWeather();
          setWeather(fresh);
          setLastRefresh(new Date().toISOString());
        }
      },
      60 * 60 * 1000,
    ); // check every hour
    return () => clearInterval(interval);
  }, []);

  function formatRefresh(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  const iconMap: Record<string, string> = {
    wb_sunny: "text-amber-400",
    partly_cloudy_day: "text-sky-300",
    weather_snowy: "text-blue-300",
    cloudy: "text-zinc-400",
    rainy: "text-blue-400",
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-sm">
            wb_sunny
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("weatherTitle", "Today's Weather")}
          </span>
        </div>
        <span className="text-[10px] text-zinc-600">
          Updated {formatRefresh(lastRefresh)}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {weather.map(
          (w: {
            name: string;
            temp: number;
            icon: string;
            condition: string;
            wind: number;
            humidity: number;
          }) => (
            <div
              key={w.name}
              className="flex-shrink-0 bg-card border border-border rounded-xl px-4 py-3 min-w-[130px]"
            >
              <p className="text-xs font-semibold text-foreground mb-1 truncate">
                {w.name}
              </p>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`material-symbols-outlined text-xl ${iconMap[w.icon] || "text-amber-400"}`}
                >
                  {w.icon}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {w.temp}°
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{w.condition}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-blue-400 text-xs">
                  air
                </span>
                <span className="text-xs text-muted-foreground">
                  {w.wind} km/h
                </span>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
