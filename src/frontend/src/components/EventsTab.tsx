import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
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

function getDaysUntil(dateStr: string): number {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    return Math.ceil(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  } catch {
    return 0;
  }
}

const UPI_ID = "ladakhconnect@upi";

type ModalStep = "form" | "payment";

export function EventsTab({ currentUser, onAddPendingPayment }: Props) {
  const { t } = useLanguage();
  const [events, setEvents] = useState<LCEvent[]>(loadEvents);
  const [showForm, setShowForm] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("form");
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const [txRef, setTxRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Staged event for after payment step
  const [stagedEvent, setStagedEvent] = useState<LCEvent | null>(null);

  const isCreator = currentUser.role === "creator";
  const approvedEvents = events.filter((e) => e.status === "approved");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = approvedEvents.filter(
    (e) => new Date(e.date) >= today,
  );

  const pendingEvents = isCreator
    ? events.filter((e) => e.status === "pending")
    : [];

  const groups = groupByMonth(
    [...upcomingEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ),
  );

  const todayStr = new Date().toISOString().split("T")[0];

  function handleApprove(id: string) {
    const updated = events.map((e) =>
      e.id === id ? { ...e, status: "approved" as const } : e,
    );
    setEvents(updated);
    saveEvents(updated);
    toast.success(t("approved", "Event approved and published!"));
  }

  function handleReject(id: string) {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
    toast.info(t("rejected", "Event rejected and removed."));
  }

  function handleCloseModal() {
    setShowForm(false);
    setModalStep("form");
    setTxRef("");
    setStagedEvent(null);
  }

  async function handleFormSubmit(e: React.FormEvent) {
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
    if (form.date < todayStr) {
      toast.error("Event date cannot be in the past.");
      return;
    }
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
    setStagedEvent(newEvent);
    setModalStep("payment");
  }

  async function handlePaymentSubmit() {
    if (!txRef.trim() || !stagedEvent) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = [...events, stagedEvent];
    setEvents(updated);
    saveEvents(updated);
    onAddPendingPayment({
      memberId: currentUser.id,
      memberUsername: currentUser.username,
      memberEmail: currentUser.email,
      amount: 500,
      tier: "Event Post",
      status: "pending",
      paymentType: "event",
      eventTitle: stagedEvent.title,
    });
    setForm({ title: "", date: "", location: "", description: "" });
    setTxRef("");
    setStagedEvent(null);
    setSubmitting(false);
    handleCloseModal();
    toast.success(
      t("submitted", "Event submitted! Payment pending Creator confirmation."),
    );
  }

  function copyUpiId() {
    navigator.clipboard
      .writeText(UPI_ID)
      .then(() => toast.success("Copied!"))
      .catch(() => toast.error("Could not copy"));
  }

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {t("eventsTitle", "Events & Festivals")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("upcomingEventsSubtitle", "Upcoming Ladakh cultural events")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setModalStep("form");
          }}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
          data-ocid="events.open_modal_button"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t("postEvent", "Post Event")}
        </button>
      </div>

      {isCreator && pendingEvents.length > 0 && (
        <div className="bg-card border border-amber-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-amber-400 text-sm mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">pending</span>
            {t("pendingEventApproval", "Pending Events")} (
            {pendingEvents.length})
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
                  by @{ev.postedByUsername} · ₹500{" "}
                  {t("pending", "payment pending")}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(ev.id)}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-1.5 rounded-lg font-semibold"
                    data-ocid={`events.confirm_button.${i + 1}`}
                  >
                    {t("approveEvent", "Approve")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(ev.id)}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white text-xs py-1.5 rounded-lg font-semibold"
                    data-ocid={`events.cancel_button.${i + 1}`}
                  >
                    {t("rejectEvent", "Reject")}
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
            {t(
              "noUpcomingEvents",
              "No upcoming events. Be the first to post one!",
            )}
          </p>
        </div>
      ) : (
        Object.entries(groups).map(([month, monthEvents]) => (
          <div key={month}>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {month}
            </h3>
            <div className="space-y-3">
              {monthEvents.map((ev, i) => {
                const daysUntil = getDaysUntil(ev.date);
                const isToday = daysUntil === 0;
                const isSoon = daysUntil <= 7;
                return (
                  <div
                    key={ev.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                    data-ocid={`events.item.${i + 1}`}
                  >
                    <div className="bg-gradient-to-r from-primary/20 to-amber-600/10 px-4 py-3 border-b border-border">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm">{ev.title}</h4>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isToday && (
                            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/40 px-2 py-0.5 rounded-full font-semibold">
                              Today!
                            </span>
                          )}
                          {!isToday && isSoon && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                              {daysUntil}d away
                            </span>
                          )}
                          <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                            {t("free", "Free")}
                          </span>
                        </div>
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
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Post Event Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={handleCloseModal}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCloseModal();
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
            {modalStep === "form" ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">
                    {t("postEvent", "Post an Event")}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    data-ocid="events.close_button"
                  >
                    <span className="material-symbols-outlined text-muted-foreground">
                      close
                    </span>
                  </button>
                </div>

                {/* Fee info */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-300 font-semibold mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      info
                    </span>
                    {t("eventFee", "Event Posting Fee: ₹500")}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Pay once via UPI to post your event. Creator reviews and
                    approves within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="evt-title"
                      className="text-xs text-muted-foreground"
                    >
                      {t("eventName", "Event Title")}
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
                      {t("eventDate", "Date")}
                    </label>
                    <input
                      id="evt-date"
                      type="date"
                      min={todayStr}
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
                      {t("eventLocation", "Location")}
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
                      {t("eventDesc", "Description")}
                    </label>
                    <textarea
                      id="evt-desc"
                      rows={3}
                      placeholder="Describe the event..."
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary resize-none"
                      data-ocid="events.textarea"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors"
                      data-ocid="events.cancel_button"
                    >
                      {t("cancel", "Cancel")}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors flex items-center justify-center gap-2"
                      data-ocid="events.submit_button"
                    >
                      <span className="material-symbols-outlined text-base">
                        payment
                      </span>
                      {t("pay", "Pay")} ₹500 &amp; Post
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* Step 2: Payment */}
                <div className="flex items-center gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => setModalStep("form")}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    data-ocid="events.back_button"
                  >
                    <span className="material-symbols-outlined text-base">
                      arrow_back
                    </span>
                  </button>
                  <div>
                    <h2 className="font-bold text-lg">Complete Payment</h2>
                    <p className="text-xs text-muted-foreground">Step 2 of 2</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="ml-auto"
                    data-ocid="events.close_button"
                  >
                    <span className="material-symbols-outlined text-muted-foreground">
                      close
                    </span>
                  </button>
                </div>

                {/* Placeholder QR Code */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-44 h-44 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-black text-[80px] block">
                        qr_code_2
                      </span>
                      <p className="text-black text-[8px] font-bold tracking-widest">
                        LADAKH CONNECT
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 text-center max-w-xs">
                    Placeholder QR · Your real QR will appear here after setup
                  </p>
                </div>

                {/* UPI ID */}
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-4">
                  <p className="text-xs text-zinc-400 mb-2">UPI ID</p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 font-mono text-white font-semibold text-sm">
                      {UPI_ID}
                    </p>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="flex items-center gap-1 text-xs bg-primary/15 text-primary px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/25 transition-colors"
                      data-ocid="events.copy_button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        content_copy
                      </span>
                      Copy
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <ol className="space-y-2 mb-5">
                  {[
                    "Open any UPI app (Google Pay, PhonePe, Paytm)",
                    "Scan the QR code or enter the UPI ID above",
                    "Pay ₹500",
                    "Enter the transaction reference number below",
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-2 text-xs">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>

                {/* Transaction Reference */}
                <div className="space-y-1 mb-5">
                  <label
                    htmlFor="tx-ref"
                    className="text-xs text-muted-foreground"
                  >
                    Transaction Reference / UTR Number *
                  </label>
                  <input
                    id="tx-ref"
                    type="text"
                    placeholder="e.g. 407123456789"
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                    data-ocid="events.tx_ref.input"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalStep("form")}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors"
                    data-ocid="events.back_button"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    disabled={!txRef.trim() || submitting}
                    className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    data-ocid="events.submit_payment_button"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">
                          progress_activity
                        </span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">
                          check_circle
                        </span>
                        Submit Payment
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
