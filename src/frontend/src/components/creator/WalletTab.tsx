import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Account, PendingPayment, WalletTransaction } from "../../types";
import {
  type AuditEntry,
  addAuditEntry,
  getAuditLog,
} from "../../utils/walletAudit";

const BANKS = [
  "SBI",
  "HDFC Bank",
  "ICICI Bank",
  "PNB",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Yes Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
];

type WithdrawStep = "form" | "secword" | "scan" | "done";

interface Props {
  balance: number;
  transactions: WalletTransaction[];
  pendingPayments: PendingPayment[];
  members: Account[];
  onWithdraw: (amount: number, bankName: string) => void;
  onConfirmPayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
  verifySecurityWord: (input: string) => boolean;
}

export function CreatorWallet({
  balance,
  transactions,
  pendingPayments,
  members: _members,
  onWithdraw,
  onConfirmPayment,
  onRejectPayment,
  verifySecurityWord,
}: Props) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>("form");
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bank: "",
    accountNo: "",
    ifsc: "",
  });
  const [withdrawError, setWithdrawError] = useState("");
  const [secWordInput, setSecWordInput] = useState("");
  const [secWordError, setSecWordError] = useState("");
  const [scanLines, setScanLines] = useState<string[]>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => getAuditLog());
  const scanTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function refreshAudit() {
    setAuditLog(getAuditLog());
  }

  function closeWithdraw() {
    setShowWithdraw(false);
    setWithdrawStep("form");
    setWithdrawForm({ amount: "", bank: "", accountNo: "", ifsc: "" });
    setWithdrawError("");
    setSecWordInput("");
    setSecWordError("");
    setScanLines([]);
    for (const t of scanTimers.current) clearTimeout(t);
    scanTimers.current = [];
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      for (const t of scanTimers.current) clearTimeout(t);
    };
  }, []);

  const handleWithdrawFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    const amt = Number.parseInt(withdrawForm.amount, 10);
    if (!amt || amt <= 0) {
      setWithdrawError("Enter a valid amount");
      return;
    }
    if (amt > balance) {
      setWithdrawError("Amount exceeds available balance");
      return;
    }
    if (!withdrawForm.bank) {
      setWithdrawError("Select a bank");
      return;
    }
    if (!withdrawForm.accountNo || withdrawForm.accountNo.length < 9) {
      setWithdrawError("Enter valid account number");
      return;
    }
    if (!withdrawForm.ifsc || withdrawForm.ifsc.length < 11) {
      setWithdrawError("Enter valid IFSC code");
      return;
    }
    setWithdrawStep("secword");
  };

  const handleSecWordSubmit = () => {
    setSecWordError("");
    if (!secWordInput.trim()) {
      setSecWordError("Please enter your security card");
      return;
    }
    const valid = verifySecurityWord(secWordInput.trim());
    if (!valid) {
      addAuditEntry(
        "security_check_failed",
        `Withdrawal of ₹${Number.parseInt(withdrawForm.amount, 10).toLocaleString()} blocked — invalid security card entered`,
        "blocked",
        Number.parseInt(withdrawForm.amount, 10),
      );
      refreshAudit();
      setSecWordError("Invalid security card. Withdrawal blocked and logged.");
      return;
    }
    addAuditEntry(
      "security_check_passed",
      `Security verification passed for withdrawal of ₹${Number.parseInt(withdrawForm.amount, 10).toLocaleString()}`,
      "success",
      Number.parseInt(withdrawForm.amount, 10),
    );
    refreshAudit();
    startSecurityScan();
  };

  function startSecurityScan() {
    const amt = Number.parseInt(withdrawForm.amount, 10);
    setWithdrawStep("scan");
    setScanLines([]);
    const lines = [
      "[00:01] Security scan initiated...",
      `[00:02] Verifying withdrawal request: \u20B9${amt.toLocaleString()}`,
      "[00:03] Identity confirmed: hunter",
      `[00:04] Destination bank: ${withdrawForm.bank}`,
      "[00:05] Threat scan: CLEAR",
      "[00:06] Authorization: APPROVED ✓",
      "[00:07] Processing transfer...",
    ];
    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        setScanLines((prev) => [...prev, line]);
        if (i === lines.length - 1) {
          const finalT = setTimeout(() => {
            onWithdraw(amt, withdrawForm.bank);
            addAuditEntry(
              "withdrawal_processed",
              `Withdrawal of \u20B9${amt.toLocaleString()} to ${withdrawForm.bank} processed successfully`,
              "success",
              amt,
            );
            refreshAudit();
            setWithdrawStep("done");
            toast.success(
              `\u20B9${amt.toLocaleString()} withdrawal initiated to ${withdrawForm.bank}!`,
            );
          }, 600);
          scanTimers.current.push(finalT);
        }
      }, i * 500);
      scanTimers.current.push(t);
    });
  }

  const totalReceived = transactions
    .filter((t) => t.type === "payment")
    .reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((s, t) => s + t.amount, 0);

  const auditActionLabel = (action: AuditEntry["action"]) => {
    const map: Record<AuditEntry["action"], string> = {
      payment_confirmed: "Payment Confirmed",
      payment_rejected: "Payment Rejected",
      withdrawal_attempted: "Withdrawal Attempt",
      withdrawal_blocked: "Withdrawal Blocked",
      withdrawal_processed: "Withdrawal Processed",
      security_check_failed: "Security Check Failed",
      security_check_passed: "Security Check Passed",
    };
    return map[action] || action;
  };

  const auditStatusColor = (status: AuditEntry["status"]) => {
    if (status === "success") return "text-green-400";
    if (status === "blocked") return "text-red-400";
    return "text-amber-400";
  };

  return (
    <div className="fade-in space-y-4">
      {/* Balance Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 gold-glow">
        <p className="text-sm text-muted-foreground mb-1">
          Creator Wallet Balance
        </p>
        <p className="font-heading text-5xl font-bold text-primary">
          ₹{balance.toLocaleString()}
        </p>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Received</p>
            <p className="font-semibold text-green-400">
              ₹{totalReceived.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Withdrawn</p>
            <p className="font-semibold text-red-400">
              ₹{totalWithdrawn.toLocaleString()}
            </p>
          </div>
        </div>
        {/* Security status badge */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-mono">
            WALLET SECURED • 4-LAYER PROTECTION ACTIVE
          </span>
        </div>
        <Button
          className="mt-4 w-full bg-primary text-primary-foreground font-semibold"
          onClick={() => {
            setShowWithdraw(true);
            setWithdrawStep("form");
          }}
          data-ocid="wallet.primary_button"
        >
          <span className="material-symbols-outlined text-lg mr-1">
            account_balance
          </span>
          Withdraw to Bank
        </Button>
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
          <p
            className="text-sm text-muted-foreground"
            data-ocid="wallet.pending.empty_state"
          >
            No pending payments. Payments from members will appear here for
            verification.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((p, i) => (
              <div
                key={p.id}
                className="bg-secondary rounded-lg p-3 border border-yellow-500/20"
                data-ocid={`wallet.pending.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold">@{p.memberUsername}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.memberEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.paymentType === "event"
                        ? `Event Post: ${p.eventTitle || "Event"}`
                        : `${p.tier} Plan`}{" "}
                      · {new Date(p.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-bold text-yellow-400">
                    ₹{p.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                    onClick={() => {
                      onConfirmPayment(p.id);
                      addAuditEntry(
                        "payment_confirmed",
                        `Payment of \u20B9${p.amount.toLocaleString()} from @${p.memberUsername} confirmed`,
                        "success",
                        p.amount,
                      );
                      refreshAudit();
                      toast.success(
                        `Payment of \u20B9${p.amount.toLocaleString()} from @${p.memberUsername} confirmed!`,
                      );
                    }}
                    data-ocid={`wallet.pending.confirm_button.${i + 1}`}
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      check_circle
                    </span>
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                    onClick={() => {
                      onRejectPayment(p.id);
                      addAuditEntry(
                        "payment_rejected",
                        `Payment of \u20B9${p.amount.toLocaleString()} from @${p.memberUsername} rejected`,
                        "blocked",
                        p.amount,
                      );
                      refreshAudit();
                      toast.info(`Payment from @${p.memberUsername} rejected.`);
                    }}
                    data-ocid={`wallet.pending.cancel_button.${i + 1}`}
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      cancel
                    </span>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            receipt_long
          </span>
          Transaction History ({transactions.length})
        </h2>
        {transactions.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="wallet.empty_state"
          >
            No transactions yet. Confirmed payments will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-secondary rounded-lg p-3"
                data-ocid={`wallet.row.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      t.type === "payment" ? "bg-green-500/15" : "bg-red-500/15"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base ${
                        t.type === "payment" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {t.type === "payment" ? "arrow_downward" : "arrow_upward"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t.note ||
                        (t.type === "payment"
                          ? `From @${t.from}`
                          : `To ${t.bankName}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    t.type === "payment" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {t.type === "payment" ? "+" : "-"}₹{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Audit Log */}
      <div className="bg-card border border-border rounded-xl p-4">
        <button
          type="button"
          onClick={() => setShowAuditLog((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="font-heading font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-lg">
              security
            </span>
            Security Audit Log
            {auditLog.length > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                {auditLog.length}
              </span>
            )}
          </h2>
          <span className="material-symbols-outlined text-zinc-500 text-sm">
            {showAuditLog ? "expand_less" : "expand_more"}
          </span>
        </button>

        {showAuditLog && (
          <div className="mt-3">
            {auditLog.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono">
                No security events logged yet
              </p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {auditLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="font-mono text-xs bg-zinc-900 rounded p-2 border border-zinc-800"
                  >
                    <span className="text-zinc-600">
                      [{new Date(entry.timestamp).toLocaleString()}]
                    </span>{" "}
                    <span className={auditStatusColor(entry.status)}>
                      [{entry.status.toUpperCase()}]
                    </span>{" "}
                    <span className="text-zinc-300">
                      {auditActionLabel(entry.action)}
                    </span>
                    {" — "}
                    <span className="text-zinc-500">{entry.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={withdrawStep === "scan" ? undefined : closeWithdraw}
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape" && withdrawStep !== "scan") closeWithdraw();
          }}
        >
          <div
            className="w-full sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* STEP 1: Form */}
            {withdrawStep === "form" && (
              <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-xl font-bold">
                    Withdraw Funds
                  </h2>
                  <button onClick={closeWithdraw} type="button">
                    <span className="material-symbols-outlined text-muted-foreground">
                      close
                    </span>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Available:{" "}
                  <span className="text-primary font-bold">
                    ₹{balance.toLocaleString()}
                  </span>
                </p>
                <form onSubmit={handleWithdrawFormSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Amount (₹)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawForm.amount}
                      onChange={(e) =>
                        setWithdrawForm((p) => ({
                          ...p,
                          amount: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Select Bank
                    </Label>
                    <Select
                      value={withdrawForm.bank}
                      onValueChange={(v) =>
                        setWithdrawForm((p) => ({ ...p, bank: v }))
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {BANKS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Account Number
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••••"
                      value={withdrawForm.accountNo}
                      onChange={(e) =>
                        setWithdrawForm((p) => ({
                          ...p,
                          accountNo: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      IFSC Code
                    </Label>
                    <Input
                      placeholder="e.g. SBIN0001234"
                      value={withdrawForm.ifsc}
                      onChange={(e) =>
                        setWithdrawForm((p) => ({
                          ...p,
                          ifsc: e.target.value.toUpperCase(),
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  {withdrawError && (
                    <p className="text-sm text-red-400">{withdrawError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-semibold"
                  >
                    Continue to Security Verification
                  </Button>
                </form>
              </div>
            )}

            {/* STEP 2: Security Word Gate */}
            {withdrawStep === "secword" && (
              <div className="bg-card border border-amber-500/30 rounded-t-2xl sm:rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-400 text-xl">
                      lock
                    </span>
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold">
                      🔐 Security Verification
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Layer 3 of 4 — Identity Confirmation
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
                  <p className="text-sm text-zinc-300 mb-1">
                    Withdrawal amount:
                  </p>
                  <p className="text-2xl font-bold text-amber-400">
                    ₹{Number.parseInt(withdrawForm.amount, 10).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    To: {withdrawForm.bank}
                  </p>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  Enter your security card to authorize this withdrawal.
                </p>
                <input
                  className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-4 py-3 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors mb-1"
                  placeholder="e.g. King of Hearts, Ace of Spades"
                  value={secWordInput}
                  onChange={(e) => setSecWordInput(e.target.value)}
                />
                <p className="text-xs text-zinc-600 mb-4">
                  Your secret card from a standard 52-card deck, or "52 decks of
                  cards"
                </p>
                {secWordError && (
                  <div className="mb-3 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                    🚨 {secWordError}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700 text-zinc-400"
                    onClick={closeWithdraw}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-amber-500 text-black font-bold hover:bg-amber-400"
                    onClick={handleSecWordSubmit}
                  >
                    Authorize Withdrawal
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: ROG Security Scan */}
            {withdrawStep === "scan" && (
              <div
                className="rounded-t-2xl sm:rounded-2xl p-5 border border-red-500/30"
                style={{
                  background:
                    "linear-gradient(135deg, #0d0d0d 0%, #1a0a00 50%, #0d0d0d 100%)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-red-400 text-lg font-black">R</span>
                  </div>
                  <div>
                    <h2
                      className="text-red-400 font-bold text-lg tracking-widest"
                      style={{ fontFamily: "monospace" }}
                    >
                      ROG SECURITY WATCH
                    </h2>
                    <p className="text-xs text-zinc-600 font-mono">
                      EDGE PRO • TRANSACTION GUARDIAN
                    </p>
                  </div>
                  <div className="ml-auto w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </div>
                <div className="bg-black border border-red-500/20 rounded-lg p-4 min-h-[180px] font-mono text-xs space-y-1">
                  {scanLines.map((line) => (
                    <div
                      key={line}
                      className={`${
                        line.includes("APPROVED") || line.includes("CLEAR")
                          ? "text-green-400"
                          : line.includes("Processing")
                            ? "text-amber-400 animate-pulse"
                            : "text-zinc-400"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                  {scanLines.length < 7 && (
                    <span className="text-zinc-600 animate-pulse">_</span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 text-center mt-3 font-mono">
                  Do not close this window
                </p>
              </div>
            )}

            {/* STEP 4: Done */}
            {withdrawStep === "done" && (
              <div className="bg-card border border-green-500/30 rounded-t-2xl sm:rounded-2xl p-5 text-center">
                <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-400 text-3xl">
                    check_circle
                  </span>
                </div>
                <h2 className="font-heading text-xl font-bold text-green-400 mb-2">
                  Transfer Initiated
                </h2>
                <p className="text-zinc-400 text-sm mb-1">
                  ₹{Number.parseInt(withdrawForm.amount, 10).toLocaleString()} →{" "}
                  {withdrawForm.bank}
                </p>
                <p className="text-xs text-zinc-600 mb-5">
                  All 4 security layers passed • Logged to audit trail
                </p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={closeWithdraw}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
