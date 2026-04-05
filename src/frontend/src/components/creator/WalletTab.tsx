import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PendingPayment, WalletTransaction } from "../../types";

interface Props {
  transactions: WalletTransaction[];
  pendingPayments: PendingPayment[];
  onConfirmPayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
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
}: Props) {
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
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400 text-lg">
            pending
          </span>
          Pending Payments ({pendingPayments.length})
        </h2>
        {pendingPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending payments. Member payments submitted via UPI will appear
            here.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((p, i) => (
              <div
                key={p.id}
                className="bg-secondary rounded-lg p-3 border border-yellow-500/20"
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
                    <p className="text-sm font-medium">
                      {t.note || `From @${t.from}`}
                    </p>
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
    </div>
  );
}
