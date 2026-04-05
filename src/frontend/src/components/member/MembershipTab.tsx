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
    upiRef?: string;
  }) => void;
  onUpgrade?: (tier: "Common" | "Premier") => void;
}

const COMMON_FEATURES = [
  "1 business listing on Explore page",
  "Restaurant & Rental promotion",
  "Up to 20 photos per listing",
  "300 MB cloud storage",
  "Customer reviews visible",
  "Edit business profile anytime",
  "Google Maps directions link",
  "Violation monitoring dashboard",
];

const PREMIER_FEATURES = [
  "Everything in Common plan",
  "Hotel promotion (Premier only)",
  "Up to 3 business listings",
  "Up to 50 photos per listing",
  "2 promotional videos per business",
  "Shop / Selling category (50 photos)",
  "1 GB cloud storage",
  "Premier badge on all listings",
  "Priority placement in Explore",
];

// Placeholder UPI details — replace with real UPI ID/QR when available
const PLACEHOLDER_UPI_ID = "ladakhconnect@upi";
const PLACEHOLDER_UPI_NAME = "Ladakh Connect";

export function MembershipTab({
  currentUser,
  paymentHistory = [],
  onAddPendingPayment,
  onUpgrade,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"Common" | "Premier" | null>(
    null,
  );
  const [step, setStep] = useState<"select" | "upi" | "ref" | "done">("select");
  const [upiRef, setUpiRef] = useState("");
  const [upiRefError, setUpiRefError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
  const isPaid = isActive && !!currentTier;

  function startPayment(tier: "Common" | "Premier") {
    setSelectedPlan(tier);
    setStep("upi");
    setUpiRef("");
    setUpiRefError("");
  }

  function cancelPayment() {
    setSelectedPlan(null);
    setStep("select");
    setUpiRef("");
    setUpiRefError("");
    setSubmitting(false);
  }

  function handleSubmitRef() {
    if (!upiRef.trim() || upiRef.trim().length < 6) {
      setUpiRefError(
        "Enter a valid UPI transaction reference number (min 6 characters)",
      );
      return;
    }
    setUpiRefError("");
    setSubmitting(true);
    const amount = selectedPlan === "Premier" ? 1500 : 1000;
    try {
      if (onAddPendingPayment) {
        onAddPendingPayment({
          memberId: currentUser.id,
          memberUsername: currentUser.username,
          memberEmail: currentUser.email,
          amount,
          tier: selectedPlan!,
          status: "pending",
          paymentType: "membership",
          upiRef: upiRef.trim(),
        });
      }
      if (onUpgrade) {
        onUpgrade(selectedPlan!);
      }
      setStep("done");
      toast.success("Payment submitted! Awaiting Creator confirmation.", {
        duration: 5000,
      });
    } catch (_e) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const amount = selectedPlan === "Premier" ? 1500 : 1000;

  // --- UPI payment flow modal ---
  if (step !== "select") {
    return (
      <div className="fade-in space-y-4 pb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={cancelPayment}
              className="p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-muted-foreground">
                arrow_back
              </span>
            </button>
            <div>
              <h2 className="font-heading text-xl font-bold">Pay via UPI</h2>
              <p className="text-xs text-muted-foreground">
                {selectedPlan} Plan — ₹{amount.toLocaleString()}/mo
              </p>
            </div>
          </div>

          {step === "done" ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-400 text-3xl">
                  check_circle
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold text-green-400 mb-2">
                Payment Submitted!
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                Your payment reference has been sent to the Creator for
                verification.
              </p>
              <p className="text-xs text-zinc-500 mb-6">
                Your plan will be activated once the Creator confirms receipt.
              </p>
              <button
                type="button"
                onClick={cancelPayment}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                Back to Membership
              </button>
            </div>
          ) : step === "upi" ? (
            <div className="space-y-4">
              {/* Non-refundable warning */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-xs text-red-400 font-semibold">
                  ⚠️ Non-Refundable Payment
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  All membership payments are strictly non-refundable. Confirm
                  only if you are sure.
                </p>
              </div>

              {/* Payment summary */}
              <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Plan</span>
                  <span className="font-semibold">{selectedPlan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Amount</span>
                  <span className="font-bold text-amber-400 text-lg">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Billing</span>
                  <span className="text-zinc-300">Monthly</span>
                </div>
              </div>

              {/* UPI instructions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-300">
                  How to pay:
                </p>
                <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside">
                  <li>Open Google Pay, PhonePe, Paytm, or any UPI app</li>
                  <li>
                    Send{" "}
                    <span className="font-bold text-amber-400">
                      ₹{amount.toLocaleString()}
                    </span>{" "}
                    to the UPI ID below
                  </li>
                  <li>
                    Copy the transaction reference / UTR number from your app
                  </li>
                  <li>Paste it here to submit for Creator confirmation</li>
                </ol>

                {/* UPI ID box */}
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-zinc-500 mb-0.5">UPI ID</p>
                    <p className="text-sm font-mono font-bold text-amber-400">
                      {PLACEHOLDER_UPI_ID}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {PLACEHOLDER_UPI_NAME}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(PLACEHOLDER_UPI_ID)
                        .then(() => {
                          toast.success("UPI ID copied!");
                        })
                        .catch(() => {
                          toast.info(`UPI ID: ${PLACEHOLDER_UPI_ID}`);
                        });
                    }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("ref")}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold text-sm transition-colors"
              >
                I have paid — Enter Reference Number
              </button>
              <button
                type="button"
                onClick={cancelPayment}
                className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            /* step === "ref" */
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl p-4 space-y-1">
                <p className="text-xs text-zinc-400">You are submitting for</p>
                <p className="font-bold text-amber-400 text-lg">
                  ₹{amount.toLocaleString()} — {selectedPlan} Plan
                </p>
              </div>

              <div>
                <label
                  htmlFor="upi-ref"
                  className="text-sm text-zinc-400 block mb-1.5"
                >
                  UPI Transaction Reference / UTR Number
                </label>
                <input
                  id="upi-ref"
                  type="text"
                  value={upiRef}
                  onChange={(e) => {
                    setUpiRef(e.target.value);
                    setUpiRefError("");
                  }}
                  placeholder="e.g. 412345678901"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                {upiRefError && (
                  <p className="text-xs text-red-400 mt-1">{upiRefError}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">
                  Find this in your UPI app under "Transaction Details" or
                  "Payment History"
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmitRef}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
                      send
                    </span>
                    Submit for Confirmation
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep("upi")}
                className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Main membership view ---
  return (
    <div className="fade-in space-y-4 pb-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading text-xl font-bold mb-1">Membership</h2>
        <p className="text-sm text-muted-foreground">
          Choose your plan and pay securely via UPI
        </p>
      </div>

      {/* Trial banner */}
      {isTrial && trialActive && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-yellow-400 text-2xl">
            hourglass_top
          </span>
          <div>
            <p className="text-sm text-yellow-400 font-semibold">
              Free Trial Active — {minutesLeft} min remaining
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              During trial, all business types including Hotel are accessible.
              After trial: Hotel requires Premier. Restaurant, Rental &amp; Shop
              available on any paid plan.
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
              Select a plan below to continue accessing business features.
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
              Renew monthly to keep your listings live.
            </p>
          </div>
        </div>
      )}

      {/* Non-refundable warning */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p className="text-xs text-red-400 font-semibold">
          ⚠️ Non-Refundable Payment Policy
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          All membership payments are strictly non-refundable. Review your plan
          carefully before paying.
        </p>
      </div>

      {/* Plan cards */}
      <div className="space-y-4">
        {/* Common Plan */}
        <div
          className={`rounded-xl border p-5 ${
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
              onClick={() => startPayment("Common")}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg"
              data-ocid="membership.common_pay_button"
            >
              Pay ₹1,000 — Choose Common
            </button>
          )}
        </div>

        {/* Premier Plan */}
        <div
          className={`rounded-xl border p-5 gold-glow ${
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
              onClick={() => startPayment("Premier")}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold text-sm transition-colors shadow-lg"
              data-ocid="membership.premier_pay_button"
            >
              {currentTier === "Common" && isPaid
                ? "Upgrade to Premier — ₹1,500"
                : "Pay ₹1,500 — Choose Premier"}
            </button>
          )}
        </div>
      </div>

      {/* Payment history */}
      {paymentHistory.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-heading font-semibold mb-3">Payment History</h3>
          <div className="space-y-2">
            {paymentHistory.map((p, idx) => (
              <div
                key={`ph-${p.date}-${idx}`}
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
        </div>
      )}
    </div>
  );
}
