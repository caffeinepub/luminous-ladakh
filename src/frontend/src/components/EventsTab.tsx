import { useState } from "react";
import { toast } from "sonner";
import { loadEvents, saveEvents } from "../data/eventsData";
import type { Account, LCEvent, PendingPayment } from "../types";

interface Props {
  currentUser: Account;
  onAddPendingPayment: (
    payment: Omit<PendingPayment, "id" | "timestamp">,
  ) => void;
}

function groupByMonth(events: LCEvent[]): Record<string, LCEvent[]> {
  const groups: Record<string, LCEvent[]> = {};
  for (const ev of events) {
    try {
      const key = new Date(ev.date).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      groups[key] = groups[key] ? [...groups[key], ev] : [ev];
    } catch {}
  }
  return groups;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function EventsTab({ currentUser, onAddPendingPayment }: Props) {
  const [events, setEvents] = useState<LCEvent[]>(loadEvents);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isCreator = currentUser.role === "creator";
  const approvedEvents = events.filter((e) => e.status === "approved");
  const pendingEvents = isCreator
    ? events.filter((e) => e.status === "pending")
    : [];
  const groups = groupByMonth(
    [...approvedEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ),
  );

  function handleApprove(id: string) {
    const updated = events.map((e) =>
      e.id === id ? { ...e, status: "approved" as const } : e,
    );
    setEvents(updated);
    saveEvents(updated);
    toast.success("Event approved and published!");
  }

  function handleReject(id: string) {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
    toast.info("Event rejected and removed.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.date ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const paymentId = `evpay_${Date.now()}`;
    const newEvent: LCEvent = {
      id: `ev_${Date.now()}`,
      title: form.title.trim(),
      date: form.date,
      location: form.location.trim(),
      description: form.description.trim(),
      postedBy: currentUser.id,
      postedByUsername: currentUser.username,
      postedByRole: currentUser.role,
      paymentId,
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    const updated = [...events, newEvent];
    setEvents(updated);
    saveEvents(updated);
    onAddPendingPayment({
      memberId: currentUser.id,
      memberUsername: currentUser.username,
      memberEmail: currentUser.email,
      amount: 650,
      tier: "Event Post",
      status: "pending",
      paymentType: "event",
      eventTitle: form.title.trim(),
    });
    setForm({ title: "", date: "", location: "", description: "" });
    setShowForm(false);
    setSubmitting(false);
    toast.success(
      "Event submitted! ₹650 payment pending Creator confirmation.",
    );
  }

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Events &amp; Festivals
          </h2>
          <p className="text-xs text-muted-foreground">
            Ladakh cultural events calendar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
          data-ocid="events.open_modal_button"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Post Event
        </button>
      </div>

      {isCreator && pendingEvents.length > 0 && (
        <div className="bg-card border border-amber-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-amber-400 text-sm mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">pending</span>
            Pending Events ({pendingEvents.length})
          </h3>
          <div className="space-y-3">
            {pendingEvents.map((ev, i) => (
              <div
                key={ev.id}
                className="bg-zinc-800 rounded-lg p-3"
                data-ocid={`events.pending.item.${i + 1}`}
              >
                <p className="text-sm font-semibold">{ev.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ev.date)} · {ev.location}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  by @{ev.postedByUsername} · ₹650 payment pending
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(ev.id)}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-1.5 rounded-lg font-semibold"
                    data-ocid={`events.confirm_button.${i + 1}`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(ev.id)}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white text-xs py-1.5 rounded-lg font-semibold"
                    data-ocid={`events.cancel_button.${i + 1}`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(groups).length === 0 ? (
        <div className="text-center py-12" data-ocid="events.empty_state">
          <span className="material-symbols-outlined text-4xl text-zinc-600 block mb-2">
            event
          </span>
          <p className="text-zinc-500 text-sm">
            No events yet. Be the first to post one!
          </p>
        </div>
      ) : (
        Object.entries(groups).map(([month, monthEvents]) => (
          <div key={month}>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {month}
            </h3>
            <div className="space-y-3">
              {monthEvents.map((ev, i) => (
                <div
                  key={ev.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                  data-ocid={`events.item.${i + 1}`}
                >
                  <div className="bg-gradient-to-r from-primary/20 to-amber-600/10 px-4 py-3 border-b border-border">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm">{ev.title}</h4>
                      <span className="flex-shrink-0 text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                        Free
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        calendar_today
                      </span>
                      {formatDate(ev.date)}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-xs">
                        location_on
                      </span>
                      {ev.location}
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {ev.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted by @{ev.postedByUsername}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Post Event Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowForm(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowForm(false);
          }}
          role="presentation"
        >
          <div
            className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
            data-ocid="events.dialog"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Post an Event</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                data-ocid="events.close_button"
              >
                <span className="material-symbols-outlined text-muted-foreground">
                  close
                </span>
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Posting an event costs <strong>₹650</strong>. Payment is held
                pending Creator confirmation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="evt-title"
                  className="text-xs text-muted-foreground"
                >
                  Event Title
                </label>
                <input
                  id="evt-title"
                  type="text"
                  placeholder="e.g. Village Harvest Festival"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  data-ocid="events.input"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="evt-date"
                  className="text-xs text-muted-foreground"
                >
                  Date
                </label>
                <input
                  id="evt-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  data-ocid="events.input"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="evt-loc"
                  className="text-xs text-muted-foreground"
                >
                  Location
                </label>
                <input
                  id="evt-loc"
                  type="text"
                  placeholder="e.g. Leh Palace Grounds"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  data-ocid="events.input"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="evt-desc"
                  className="text-xs text-muted-foreground"
                >
                  Description
                </label>
                <textarea
                  id="evt-desc"
                  placeholder="Describe the event..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary resize-none"
                  data-ocid="events.textarea"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-ocid="events.submit_button"
              >
                {submitting ? "Submitting..." : "Submit Event (₹650)"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
