import { useEffect } from "react";
import { toast } from "sonner";
import type {
  AutoAcceptLogEntry,
  PendingPayment,
  WalletTransaction,
} from "../../types";

interface Props {
  transactions: WalletTransaction[];
  pendingPayments: PendingPayment[];
  onConfirmPayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
  autoAcceptLog: AutoAcceptLogEntry[];
  autoAcceptUnread: number;
  onClearAutoAcceptUnread: () => void;
}

function getMonthLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
}

export function CreatorWallet({
  transactions,
  pendingPayments,
  onConfirmPayment,
  onRejectPayment,
  autoAcceptLog,
  autoAcceptUnread,
  onClearAutoAcceptUnread,
}: Props) {
  // Clear unread badge when this component mounts (Creator opened wallet)
  useEffect(() => {
    if (autoAcceptUnread > 0) {
      onClearAutoAcceptUnread();
    }
  }, [autoAcceptUnread, onClearAutoAcceptUnread]);

  // Only count real confirmed payments (type === "payment")
  const confirmedPayments = transactions.filter((t) => t.type === "payment");
  const totalReceived = confirmedPayments.reduce((s, t) => s + t.amount, 0);

  // Breakdown by source
  const membershipTotal = confirmedPayments
    .filter((t) => t.note?.toLowerCase().includes("membership"))
    .reduce((s, t) => s + t.amount, 0);
  const eventTotal = confirmedPayments
    .filter((t) => t.note?.toLowerCase().includes("event"))
    .reduce((s, t) => s + t.amount, 0);
  const announcementTotal = confirmedPayments
    .filter(
      (t) =>
        t.note?.toLowerCase().includes("announcement") ||
        t.note?.toLowerCase().includes("shop"),
    )
    .reduce((s, t) => s + t.amount, 0);
  const otherTotal =
    totalReceived - membershipTotal - eventTotal - announcementTotal;

  // Monthly bar chart data — last 6 months
  const monthlyMap: Record<string, number> = {};
  for (const t of confirmedPayments) {
    const label = getMonthLabel(t.timestamp);
    monthlyMap[label] = (monthlyMap[label] || 0) + t.amount;
  }
  const now = new Date();
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(
      d.toLocaleString("default", { month: "short", year: "2-digit" }),
    );
  }
  const monthlyValues = monthLabels.map((m) => monthlyMap[m] || 0);
  const maxMonthly = Math.max(...monthlyValues, 1);

  // Bar chart segments for breakdown
  const segments = [
    { label: "Membership", amount: membershipTotal, color: "bg-blue-500" },
    { label: "Events", amount: eventTotal, color: "bg-amber-500" },
    {
      label: "Shop Announcements",
      amount: announcementTotal,
      color: "bg-purple-500",
    },
    ...(otherTotal > 0
      ? [{ label: "Other", amount: otherTotal, color: "bg-zinc-500" }]
      : []),
  ].filter((s) => s.amount > 0);

  return (
    <div className="fade-in space-y-4">
      {/* Total received header */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 gold-glow">
        <p className="text-sm text-muted-foreground mb-1">
          Total Revenue Received
        </p>
        <p className="font-heading text-5xl font-bold text-primary">
          ₹{totalReceived.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Confirmed payments only — real transactions via UPI
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-mono">
            ANALYTICS ONLY • READ-ONLY VIEW
          </span>
        </div>
      </div>

      {/* Pending Payments */}
      <div
        className="bg-card border border-border rounded-xl p-4"
        data-ocid="wallet.pending.panel"
      >
        <h2 className="font-heading font-semibold mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400 text-lg">
            pending
          </span>
          Pending Payments ({pendingPayments.length})
        </h2>
        <p className="text-xs text-amber-400/80 mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">
            schedule
          </span>
          Items not reviewed in 24h are auto-approved.
        </p>
        {pendingPayments.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="wallet.pending.empty_state"
          >
            No pending payments. Member payments submitted via UPI will appear
            here.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((p, i) => (
              <div
                key={p.id}
                className="bg-secondary rounded-lg p-3 border border-yellow-500/20"
                data-ocid={`wallet.pending.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-semibold">@{p.memberUsername}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.memberEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.paymentType === "event"
                        ? `Event: ${p.eventTitle || "Event"}`
                        : p.paymentType === "announcement"
                          ? `Shop Announcement: ${p.productName || "Product"}`
                          : p.paymentType === "room_rental"
                            ? `Room Rental: "${p.roomTitle || "Room"}" from @${p.memberUsername}`
                            : `${p.tier} Membership`}
                      {" · "}
                      {new Date(p.timestamp).toLocaleString()}
                    </p>
                    {/* UPI reference if stored */}
                    {(p as any).upiRef && (
                      <p className="text-xs text-amber-400 mt-0.5">
                        UPI Ref: {(p as any).upiRef}
                      </p>
                    )}
                    {/* Time remaining before auto-accept */}
                    <AutoAcceptCountdown timestamp={p.timestamp} />
                  </div>
                  <p className="font-bold text-yellow-400">
                    ₹{p.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                    onClick={() => {
                      onConfirmPayment(p.id);
                      toast.success(
                        `₹${p.amount.toLocaleString()} from @${p.memberUsername} confirmed!`,
                      );
                    }}
                    data-ocid={`wallet.pending.confirm_button.${i + 1}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="flex-1 border border-red-500/40 text-red-400 hover:bg-red-500/10 active:bg-red-500/20 text-xs py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                    onClick={() => {
                      onRejectPayment(p.id);
                      toast.info(`Payment from @${p.memberUsername} rejected.`);
                    }}
                    data-ocid={`wallet.pending.cancel_button.${i + 1}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      cancel
                    </span>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue breakdown */}
      {totalReceived > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              pie_chart
            </span>
            Revenue Breakdown
          </h2>
          <div className="space-y-3">
            {segments.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold">
                    ₹{s.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{
                      width: `${Math.round((s.amount / totalReceived) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly bar chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            bar_chart
          </span>
          Monthly Revenue (Last 6 Months)
        </h2>
        <div className="flex items-end gap-2 h-32">
          {monthLabels.map((label, i) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[9px] text-muted-foreground">
                {monthlyValues[i] > 0
                  ? `₹${(monthlyValues[i] / 1000).toFixed(1)}k`
                  : ""}
              </span>
              <div
                className="w-full bg-zinc-800 rounded-t overflow-hidden"
                style={{ height: "96px" }}
              >
                <div
                  className="w-full bg-primary rounded-t transition-all"
                  style={{
                    height: `${Math.round((monthlyValues[i] / maxMonthly) * 96)}px`,
                    marginTop: `${96 - Math.round((monthlyValues[i] / maxMonthly) * 96)}px`,
                  }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        {totalReceived === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            No confirmed payments yet. Payments confirmed above will appear
            here.
          </p>
        )}
      </div>

      {/* Transaction log */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            receipt_long
          </span>
          Confirmed Payment Log ({confirmedPayments.length})
        </h2>
        {confirmedPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No confirmed payments yet. Confirmed UPI payments will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {confirmedPayments.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-secondary rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-400 text-base">
                      arrow_downward
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {t.note || `From @${t.from}`}
                      </p>
                      {t.note?.startsWith("Auto-Approved") && (
                        <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                          AUTO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-green-400">
                  +₹{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-Accept Log */}
      <div
        className="bg-card border border-border rounded-xl p-4"
        data-ocid="wallet.auto_accept.panel"
      >
        <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400 text-lg">
            auto_awesome
          </span>
          Auto-Approved Items
          {autoAcceptLog.length > 0 && (
            <span className="ml-auto bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2 py-0.5 rounded-full font-semibold">
              {autoAcceptLog.length}
            </span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Items not manually reviewed within 24 hours are automatically
          approved. Content scan still runs — flagged items are noted below.
        </p>

        {autoAcceptLog.length === 0 ? (
          <div
            className="text-center py-6"
            data-ocid="wallet.auto_accept.empty_state"
          >
            <span className="material-symbols-outlined text-3xl text-muted-foreground mb-2 block">
              schedule
            </span>
            <p className="text-sm text-muted-foreground">
              No auto-approved items yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pending items older than 24h will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {autoAcceptLog.map((entry, i) => (
              <div
                key={entry.id}
                className={`rounded-lg p-3 border ${
                  entry.flagged
                    ? "bg-orange-500/5 border-orange-500/20"
                    : "bg-secondary border-border"
                }`}
                data-ocid={`wallet.auto_accept.item.${i + 1}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5 mb-1">
                      <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                        AUTO-APPROVED
                      </span>
                      {entry.flagged && (
                        <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full font-bold tracking-wide flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">
                            flag
                          </span>
                          FLAGGED
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground capitalize bg-zinc-800 px-1.5 py-0.5 rounded-full">
                        {entry.itemType.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {entry.itemTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted by @{entry.submittedBy}
                    </p>
                    {entry.amount && (
                      <p className="text-xs text-green-400 font-semibold mt-0.5">
                        ₹{entry.amount.toLocaleString()}
                      </p>
                    )}
                    {entry.flagged && entry.flagReason && (
                      <p className="text-xs text-orange-400 mt-1 bg-orange-500/10 rounded px-2 py-1">
                        <span className="font-semibold">Flag reason:</span>{" "}
                        {entry.flagReason}
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-600 mt-1">
                      Auto-approved:{" "}
                      {new Date(entry.autoApprovedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Shows a countdown / time-since label for the 24h auto-accept window */
function AutoAcceptCountdown({ timestamp }: { timestamp: string }) {
  const submitted = new Date(timestamp).getTime();
  const deadline = submitted + 24 * 60 * 60 * 1000;
  const now = Date.now();
  const remaining = deadline - now;

  if (remaining <= 0) {
    return (
      <p className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-0.5">
        <span className="material-symbols-outlined text-[12px]">schedule</span>
        Auto-approving now...
      </p>
    );
  }

  const hoursLeft = Math.floor(remaining / (60 * 60 * 1000));
  const minutesLeft = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  return (
    <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-0.5">
      <span className="material-symbols-outlined text-[12px]">schedule</span>
      Auto-approves in{" "}
      <span className="text-amber-400 font-semibold">
        {hoursLeft}h {minutesLeft}m
      </span>
    </p>
  );
}
