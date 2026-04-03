import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import type { RoadStatus } from "../types";

interface Props {
  roads: RoadStatus[];
  canEdit: boolean;
  onUpdateStatus: (
    id: string,
    status: RoadStatus["status"],
    note: string,
  ) => void;
}

export function RoadStatusWidget({ roads, canEdit, onUpdateStatus }: Props) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    status: RoadStatus["status"];
    note: string;
  }>({ status: "open", note: "" });

  const STATUS_CONFIG = {
    open: {
      label: t("roadOpen", "Open"),
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      dot: "bg-green-400",
    },
    closed: {
      label: t("roadClosed", "Closed"),
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      dot: "bg-red-400",
    },
    caution: {
      label: t("roadRestricted", "Caution"),
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      dot: "bg-yellow-400",
    },
  };

  function startEdit(road: RoadStatus) {
    setEditingId(road.id);
    setEditForm({ status: road.status, note: road.note || "" });
  }

  function saveEdit(id: string) {
    onUpdateStatus(id, editForm.status, editForm.note);
    setEditingId(null);
  }

  return (
    <div className="mb-4 bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-blue-400 text-lg">
          route
        </span>
        <h3 className="text-sm font-semibold">
          {t("roadStatusTitle", "Road & Pass Status")}
        </h3>
      </div>
      <div className="space-y-2">
        {roads.map((road) => {
          const cfg = STATUS_CONFIG[road.status];
          return (
            <div key={road.id}>
              {editingId === road.id ? (
                <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold">{road.name}</p>
                  <div className="flex gap-2">
                    {(["open", "caution", "closed"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setEditForm((p) => ({ ...p, status: s }))
                        }
                        className={`flex-1 text-xs py-1.5 rounded-lg border font-semibold capitalize transition-all ${
                          editForm.status === s
                            ? STATUS_CONFIG[s].color
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a note (optional)"
                    value={editForm.note}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, note: e.target.value }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(road.id)}
                      className="flex-1 bg-primary text-primary-foreground text-xs py-1.5 rounded-lg font-semibold"
                    >
                      {t("save", "Save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-zinc-700 text-white text-xs py-1.5 rounded-lg"
                    >
                      {t("cancel", "Cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {road.name}
                      </p>
                      {road.note && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {road.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => startEdit(road)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">
                          edit
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
