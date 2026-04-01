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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
      <div className="flex items-center justify-around py-2 max-w-md mx-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
              active === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            type="button"
            data-ocid={`nav.${item.id}.link`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${active === item.id ? "text-primary" : ""}`}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
            {active === item.id && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
