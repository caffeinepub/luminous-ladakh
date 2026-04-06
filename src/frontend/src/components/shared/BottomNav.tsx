interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface Props {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
}

export function BottomNav({ items, active, onSelect }: Props) {
  // Split into primary (max 5) and secondary tabs
  const MAX_PRIMARY = 5;
  const primaryItems = items.slice(0, MAX_PRIMARY);
  const secondaryItems = items.slice(MAX_PRIMARY);

  const activeIsSecondary = secondaryItems.some((i) => i.id === active);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "oklch(10% 0.008 22 / 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid oklch(22% 0.018 28)",
      }}
    >
      {/* Secondary tabs row - scrollable */}
      {secondaryItems.length > 0 && (
        <div
          className="flex gap-0 overflow-x-auto scrollbar-hide border-b"
          style={{ borderColor: "oklch(22% 0.018 28)" }}
        >
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              type="button"
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium transition-all border-b-2 ${
                active === item.id
                  ? "text-primary border-primary bg-primary/8"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
              data-ocid={`nav.${item.id}.link`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Primary tabs row */}
      <div className="flex items-center justify-around py-1.5 max-w-lg mx-auto">
        {primaryItems.map((item) => {
          // Special "map" button — flat rectangular amber accent
          if (item.id === "map") {
            const isMapActive = active === "map";
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                type="button"
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all flex-1 ${
                  isMapActive
                    ? "text-amber-400 bg-amber-500/15 border border-amber-500/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
                data-ocid="nav.map.link"
                aria-label="Open map"
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${isMapActive ? "text-amber-400" : ""}`}
                >
                  map
                </span>
                <span className="text-[9px] font-medium leading-none">
                  {item.label}
                </span>
                {isMapActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </button>
            );
          }

          // Special "post" button — big glowing circle in the center
          if (item.id === "post") {
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                type="button"
                className="relative flex flex-col items-center justify-center flex-1"
                data-ocid="nav.post.link"
                aria-label="Create post"
              >
                <span
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(72% 0.17 55), oklch(62% 0.19 42))",
                    boxShadow:
                      "0 0 20px oklch(72% 0.17 55 / 0.5), 0 0 8px oklch(72% 0.17 55 / 0.3), 0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="material-symbols-outlined text-[26px] text-black font-bold">
                    add
                  </span>
                </span>
              </button>
            );
          }

          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 flex-1 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
              data-ocid={`nav.${item.id}.link`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? "text-primary" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[9px] font-medium leading-none truncate max-w-full">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
        {activeIsSecondary && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary opacity-60" />
        )}
      </div>
    </nav>
  );
}
