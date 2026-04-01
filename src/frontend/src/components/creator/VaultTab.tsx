import { Button } from "@/components/ui/button";
import { useState } from "react";

const VAULT_ITEMS = [
  {
    id: "v1",
    title: "Pangong Lake Digital Guide 2026",
    category: "Travel Guide",
    desc: "Complete guide with maps, permits, altitude info, best viewpoints, and photography spots.",
    icon: "map",
    link: "https://luminous.ladakh/guides/pangong-2026",
  },
  {
    id: "v2",
    title: "Monastery Festival Calendar",
    category: "Events",
    desc: "Complete festival calendar for all major Ladakhi monasteries including Gustor, Hemis, and Losar.",
    icon: "event",
    link: "https://luminous.ladakh/events/festivals",
  },
  {
    id: "v3",
    title: "Member Onboarding Handbook",
    category: "Operations",
    desc: "Step-by-step guide for new members setting up their business profiles and understanding policies.",
    icon: "menu_book",
    link: "#",
  },
  {
    id: "v4",
    title: "Violation Policy Document",
    category: "Legal",
    desc: "Complete violation levels 1-7 with penalties, appeal process, and resolution procedures.",
    icon: "gavel",
    link: "#",
  },
  {
    id: "v5",
    title: "Ladakh Tourism Statistics 2025",
    category: "Data",
    desc: "Annual tourism data for Ladakh including footfall, popular routes, and spending patterns.",
    icon: "bar_chart",
    link: "#",
  },
  {
    id: "v6",
    title: "Emergency Contact Directory",
    category: "Emergency",
    desc: "All hospital numbers, police stations, army helplines, and emergency contacts in Ladakh.",
    icon: "emergency",
    link: "#",
  },
  {
    id: "v7",
    title: "Business Promotion Guidelines",
    category: "Operations",
    desc: "Rules for members on how to promote businesses appropriately within Ladakh Connect.",
    icon: "campaign",
    link: "#",
  },
  {
    id: "v8",
    title: "Creator Withdrawal Log",
    category: "Finance",
    desc: "Historical record of all wallet withdrawals and payment settlements.",
    icon: "receipt_long",
    link: "#",
  },
];

const CATEGORIES = [
  "All",
  "Travel Guide",
  "Events",
  "Operations",
  "Legal",
  "Data",
  "Emergency",
  "Finance",
];

export function VaultTab() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof VAULT_ITEMS)[0] | null>(
    null,
  );

  const filtered =
    filter === "All"
      ? VAULT_ITEMS
      : VAULT_ITEMS.filter((v) => v.category === filter);

  return (
    <div className="fade-in">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === c
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
            type="button"
            data-ocid="vault.tab"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className={`w-full bg-card border border-border rounded-xl p-4 text-left card-hover slide-up stagger-${Math.min(i + 1, 5)}`}
            type="button"
            data-ocid={`vault.item.${i + 1}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  {item.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-heading font-semibold text-sm leading-tight">
                    {item.title}
                  </h3>
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-2 shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelected(null);
          }}
        >
          <div
            className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
            onKeyDown={(e) => e.stopPropagation()}
            data-ocid="vault.modal"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {selected.icon}
                </span>
              </div>
              <div>
                <h2 className="font-heading font-bold">{selected.title}</h2>
                <span className="text-xs text-muted-foreground">
                  {selected.category}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {selected.desc}
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={() => {
                  if (selected.link !== "#")
                    window.open(selected.link, "_blank");
                }}
                data-ocid="vault.primary_button"
              >
                Open Resource
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setSelected(null)}
                data-ocid="vault.close_button"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
