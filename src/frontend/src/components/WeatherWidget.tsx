const WEATHER_DATA = [
  {
    name: "Leh",
    temp: 12,
    condition: "Sunny",
    icon: "wb_sunny",
    wind: 12,
    humidity: 28,
  },
  {
    name: "Pangong Lake",
    temp: 4,
    condition: "Partly Cloudy",
    icon: "partly_cloudy_day",
    wind: 18,
    humidity: 35,
  },
  {
    name: "Nubra Valley",
    temp: 9,
    condition: "Clear",
    icon: "wb_sunny",
    wind: 8,
    humidity: 22,
  },
];

export function WeatherWidget() {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-amber-400 text-sm">
          wb_sunny
        </span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Live Weather
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {WEATHER_DATA.map((w) => (
          <div
            key={w.name}
            className="flex-shrink-0 bg-card border border-border rounded-xl px-4 py-3 min-w-[130px]"
          >
            <p className="text-xs font-semibold text-foreground mb-1">
              {w.name}
            </p>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-amber-400 text-xl">
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
        ))}
      </div>
    </div>
  );
}
