import { useState } from "react";
import { toast } from "sonner";
import type { Account } from "../../types";

interface PaymentRecord {
  date: string;
  amount: number;
  status: string;
}

interface Props {
  currentUser: Account;
  paymentHistory?: PaymentRecord[];
  onAddPendingPayment?: (p: {
    memberId: string;
    memberUsername: string;
    memberEmail: string;
    amount: number;
    tier: string;
    status: "pending";
    paymentType: "membership";
  }) => void;
  onUpgrade?: (tier: "Common" | "Premier") => void;
}

const COMMON_FEATURES = [
  "1 business listing on Explore page",
  "Customer reviews visible",
  "Edit business profile anytime",
  "Google Maps directions link",
  "Up to 20 photos per listing",
  "300 MB cloud storage",
  "Restaurant & Rental promotion",
  "Violation monitoring dashboard",
];

const PREMIER_FEATURES = [
  "Everything in Common plan",
  "Up to 3 business listings",
  "Hotel promotion (Premier only)",
  "Premier badge on all listings",
  "Priority placement in Explore",
  "2 promotional videos per business",
  "Up to 50 photos per listing",
  "Shop / Selling category access (50 photos)",
  "1 GB cloud storage",
  "Webpage editing (coming soon)",
];

export function MembershipTab({
  currentUser,
  paymentHistory = [],
  onAddPendingPayment,
  onUpgrade,
}: Props) {
  const [confirmPlan, setConfirmPlan] = useState<"Common" | "Premier" | null>(
    null,
  );
  const [paying, setPaying] = useState(false);

  // Trial timing — 2-hour free trial
  const trialStart = currentUser.trialStartDate
    ? new Date(currentUser.trialStartDate)
    : null;
  const trialEnd = trialStart
    ? new Date(trialStart.getTime() + 2 * 60 * 60 * 1000)
    : null;
  const now = new Date();
  const trialActive = trialEnd ? now < trialEnd : false;
  const trialExpired = trialStart !== null && !trialActive;
  const minutesLeft = trialEnd
    ? Math.max(0, Math.round((trialEnd.getTime() - now.getTime()) / 60000))
    : 0;

  const isActive = currentUser.membershipStatus === "active";
  const isTrial = currentUser.membershipStatus === "trial";
  const currentTier = currentUser.membershipTier;

  const isPaid = isActive && currentTier;

  function handlePayNow(tier: "Common" | "Premier") {
    setConfirmPlan(tier);
  }

  function handleConfirmPayment() {
    if (!confirmPlan) return;
    setPaying(true);
    const amount = confirmPlan === "Premier" ? 1500 : 1000;

    try {
      if (onAddPendingPayment) {
        onAddPendingPayment({
          memberId: currentUser.id,
          memberUsername: currentUser.username,
          memberEmail: currentUser.email,
          amount,
          tier: confirmPlan,
          status: "pending",
          paymentType: "membership",
        });
      }
      if (onUpgrade) {
        onUpgrade(confirmPlan);
      }
      toast.success(
        `Payment of ₹${amount.toLocaleString()} submitted! Awaiting Creator confirmation.`,
        { duration: 5000 },
      );
      setConfirmPlan(null);
    } catch (_e) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="fade-in space-y-4 pb-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading text-xl font-bold mb-1">Membership</h2>
        <p className="text-sm text-muted-foreground">
          Choose your plan and manage billing
        </p>
      </div>

      {/* Trial / Status Banner */}
      {isTrial && trialActive && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-yellow-400 text-2xl">
            hourglass_top
          </span>
          <div>
            <p className="text-sm text-yellow-400 font-semibold">
              Free Trial Active
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {minutesLeft} minutes remaining. During your trial you have access
              to all business types including Hotel. After your trial:{" "}
              <strong className="text-amber-400">
                Hotel promotion requires Premier Plan (₹1,500/mo).
              </strong>{" "}
              Restaurant &amp; Rental &amp; Shop are available on any paid plan.
            </p>
          </div>
        </div>
      )}

      {isTrial && trialExpired && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-400 text-2xl">
            lock
          </span>
          <div>
            <p className="text-sm text-red-400 font-semibold">
              ⚠️ Trial Expired
            </p>
            <p className="text-xs text-muted-foreground">
              Your 2-hour free trial has ended. Select a plan below to continue
              accessing business features.
            </p>
          </div>
        </div>
      )}

      {isPaid && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400 text-2xl">
            verified
          </span>
          <div>
            <p className="text-sm text-green-400 font-semibold">
              {currentTier} Plan — Active
            </p>
            <p className="text-xs text-muted-foreground">
              Your membership is active. Renew monthly to keep your listings
              live.
            </p>
          </div>
        </div>
      )}

      {/* Non-refundable warning */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p className="text-xs text-red-400 font-semibold">
          ⚠️ Non-Refundable Payment Policy
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          All membership payments are strictly non-refundable. Please review
          your plan carefully before paying.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Common Plan */}
        <div
          className={`rounded-xl border p-5 transition-all ${
            currentTier === "Common" && isPaid
              ? "bg-blue-500/10 border-blue-500/40"
              : "bg-card border-border"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🏷️</span>
                <h3 className="font-heading font-bold text-lg">Common Plan</h3>
                {currentTier === "Common" && isPaid && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="font-heading text-3xl font-extrabold text-white">
                ₹1,000
                <span className="text-sm text-muted-foreground font-normal">
                  {" "}
                  / month
                </span>
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 mb-5">
            {COMMON_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-green-400 text-base">
                  check_circle
                </span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          {currentTier === "Common" && isPaid ? (
            <div className="w-full text-center py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-semibold border border-blue-500/20">
              ✓ Active Plan — Renew Monthly
            </div>
          ) : currentTier === "Premier" && isPaid ? (
            <div className="w-full text-center py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-sm border border-zinc-700">
              On Premier Plan
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handlePayNow("Common")}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg"
              data-ocid="membership.primary_button"
            >
              Pay ₹1,000 — Choose Common
            </button>
          )}
        </div>

        {/* Premier Plan */}
        <div
          className={`rounded-xl border p-5 transition-all gold-glow ${
            currentTier === "Premier" && isPaid
              ? "bg-primary/10 border-primary/50"
              : "bg-card border-primary/30"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">❆</span>
                <h3 className="font-heading font-bold text-lg text-primary">
                  Premier Plan
                </h3>
                {currentTier === "Premier" && isPaid && (
                  <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Best Value
                </span>
              </div>
              <p className="font-heading text-3xl font-extrabold text-primary">
                ₹1,500
                <span className="text-sm text-muted-foreground font-normal">
                  {" "}
                  / month
                </span>
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 mb-5">
            {PREMIER_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-primary text-base">
                  star
                </span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          {currentTier === "Premier" && isPaid ? (
            <div className="w-full text-center py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
              ❆ Active Premier — Renew Monthly
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handlePayNow("Premier")}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold text-sm transition-colors shadow-lg"
              data-ocid="membership.primary_button"
            >
              {currentTier === "Common" && isPaid
                ? "Upgrade to Premier — ₹1,500"
                : "Pay ₹1,500 — Choose Premier"}
            </button>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3">Payment History</h3>
        {paymentHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No payments yet. Your history appears here after each payment is
            confirmed.
          </p>
        ) : (
          <div className="space-y-2">
            {paymentHistory.map((p, idx) => (
              <div
                key={`payment-${p.date}-${idx}`}
                className="flex items-center justify-between bg-secondary rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium">{p.date}</p>
                  <p className="text-xs text-muted-foreground">
                    Monthly subscription
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ₹{p.amount.toLocaleString()}
                  </p>
                  <span className="text-xs text-green-400">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => !paying && setConfirmPlan(null)}
          onKeyDown={(e) =>
            e.key === "Escape" && !paying && setConfirmPlan(null)
          }
          aria-label="Close modal"
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            data-ocid="membership.dialog"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-400 text-3xl">
                payments
              </span>
              <div>
                <h3 className="font-heading font-bold text-lg">
                  Confirm Payment
                </h3>
                <p className="text-xs text-zinc-400">
                  {confirmPlan} Plan — Monthly
                </p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Plan</span>
                <span className="font-semibold text-white">{confirmPlan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Amount</span>
                <span className="font-bold text-amber-400 text-lg">
                  ₹{confirmPlan === "Premier" ? "1,500" : "1,000"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Billing</span>
                <span className="text-zinc-300">Monthly</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Account</span>
                <span className="text-zinc-300">@{currentUser.username}</span>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5">
              <p className="text-xs text-red-400 font-semibold">
                ⚠️ Non-Refundable
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                This payment cannot be refunded. Confirm only if you are sure.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmPlan(null)}
                disabled={paying}
                className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                data-ocid="membership.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={paying}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                data-ocid="membership.confirm_button"
              >
                {paying ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">
                      progress_activity
                    </span>
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm &amp; Pay ₹
                    {confirmPlan === "Premier" ? "1,500" : "1,000"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
