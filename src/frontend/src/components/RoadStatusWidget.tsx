import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import type { RoadStatus } from "../types";

// User-reported alerts
const ALERTS_KEY = "lc_road_alerts";

interface RoadAlert {
  id: string;
  message: string;
  location: string;
  reportedBy: string;
  timestamp: string;
}

function loadAlerts(): RoadAlert[] {
  try {
    const saved = localStorage.getItem(ALERTS_KEY);
    if (!saved) return [];
    const all: RoadAlert[] = JSON.parse(saved);
    // Auto-archive alerts older than 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return all.filter((a) => new Date(a.timestamp).getTime() > cutoff);
  } catch {
    return [];
  }
}

function saveAlerts(alerts: RoadAlert[]) {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  } catch {}
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  } catch {
    return "";
  }
}

interface Props {
  roads: RoadStatus[];
  canEdit: boolean;
  canReport?: boolean; // users and community members can report
  currentUsername?: string;
  isCreator?: boolean;
  onUpdateStatus: (
    id: string,
    status: RoadStatus["status"],
    note: string,
  ) => void;
}

export function RoadStatusWidget({
  roads,
  canEdit,
  canReport,
  currentUsername,
  isCreator,
  onUpdateStatus,
}: Props) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    status: RoadStatus["status"];
    note: string;
  }>({ status: "open", note: "" });
  const [alerts, setAlerts] = useState<RoadAlert[]>(loadAlerts);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({ message: "", location: "" });

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

  function submitAlert() {
    if (!reportForm.message.trim() || !reportForm.location.trim()) return;
    const newAlert: RoadAlert = {
      id: Date.now().toString(36),
      message: reportForm.message.trim(),
      location: reportForm.location.trim(),
      reportedBy: currentUsername || "Anonymous",
      timestamp: new Date().toISOString(),
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    saveAlerts(updated);
    setReportForm({ message: "", location: "" });
    setShowReportForm(false);
  }

  function removeAlert(id: string) {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  }

  return (
    <div className="mb-4 bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400 text-lg">
            route
          </span>
          <h3 className="text-sm font-semibold">
            {t("roadStatusTitle", "Road & Pass Status")}
          </h3>
        </div>
        {canReport && (
          <button
            type="button"
            onClick={() => setShowReportForm((p) => !p)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            data-ocid="road.report_button"
          >
            <span className="material-symbols-outlined text-sm">add_alert</span>
            Report
          </button>
        )}
      </div>

      {/* Road status list */}
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

      {/* User-reported alerts */}
      {alerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">campaign</span>
            Community Alerts
          </p>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-amber-300 truncate">
                      {alert.location}
                    </p>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      {alert.message}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      @{alert.reportedBy} &middot; {timeAgo(alert.timestamp)}
                    </p>
                  </div>
                  {isCreator && (
                    <button
                      type="button"
                      onClick={() => removeAlert(alert.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-xs">
                        close
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report form */}
      {showReportForm && (
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
          <p className="text-xs font-semibold text-amber-400">
            Report a Road/Weather Alert
          </p>
          <input
            type="text"
            placeholder="Location (e.g. Khardung La)"
            value={reportForm.location}
            onChange={(e) =>
              setReportForm((p) => ({ ...p, location: e.target.value }))
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            placeholder="What's happening? (e.g. Road blocked due to landslide)"
            value={reportForm.message}
            onChange={(e) =>
              setReportForm((p) => ({ ...p, message: e.target.value }))
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitAlert}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs py-2 rounded-lg font-semibold transition-colors"
              data-ocid="road.submit_alert"
            >
              Submit Alert
            </button>
            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
