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
  // Primary tabs always visible; secondary accessible via scrollable row above
  const MAX_PRIMARY = 5;
  const primaryItems = items.slice(0, MAX_PRIMARY);
  const secondaryItems = items.slice(MAX_PRIMARY);

  const activeIsSecondary = secondaryItems.some((i) => i.id === active);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "oklch(10% 0.008 22 / 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid oklch(22% 0.018 28)",
      }}
    >
      {/* Secondary tabs row - shown only when there are secondary items */}
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
                  ? "text-primary border-primary"
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
        {primaryItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
              active === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            type="button"
            data-ocid={`nav.${item.id}.link`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                active === item.id ? "text-primary" : ""
              }`}
            >
              {item.icon}
            </span>
            <span className="text-[9px] font-medium leading-none truncate max-w-full">
              {item.label}
            </span>
            {active === item.id && (
              <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
            )}
          </button>
        ))}
        {/* Show a dot indicator if active tab is in secondary row */}
        {activeIsSecondary && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary opacity-60" />
        )}
      </div>
    </nav>
  );
}
