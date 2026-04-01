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
import { useState } from "react";
import { toast } from "sonner";
import type { Account, WalletTransaction } from "../../types";

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

interface Props {
  balance: number;
  transactions: WalletTransaction[];
  members: Account[];
  onWithdraw: (amount: number, bankName: string) => void;
  onSimulatePayment: () => void;
}

export function CreatorWallet({
  balance,
  transactions,
  members: _members,
  onWithdraw,
  onSimulatePayment,
}: Props) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bank: "",
    accountNo: "",
    ifsc: "",
  });
  const [withdrawError, setWithdrawError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
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
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    onWithdraw(amt, withdrawForm.bank);
    setLoading(false);
    setShowWithdraw(false);
    setWithdrawForm({ amount: "", bank: "", accountNo: "", ifsc: "" });
    toast.success(
      `₹${amt.toLocaleString()} withdrawal initiated to ${withdrawForm.bank}!`,
    );
  };

  const totalReceived = transactions
    .filter((t) => t.type === "payment")
    .reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((s, t) => s + t.amount, 0);

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
        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-primary text-primary-foreground font-semibold"
            onClick={() => setShowWithdraw(true)}
            data-ocid="wallet.primary_button"
          >
            <span className="material-symbols-outlined text-lg mr-1">
              account_balance
            </span>
            Withdraw
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-primary/30 text-primary"
            onClick={onSimulatePayment}
            data-ocid="wallet.secondary_button"
          >
            <span className="material-symbols-outlined text-lg mr-1">
              add_circle
            </span>
            Simulate Payment
          </Button>
        </div>
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
            No transactions yet.
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

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowWithdraw(false)}
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowWithdraw(false);
          }}
        >
          <div
            className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
            onKeyDown={(e) => e.stopPropagation()}
            data-ocid="wallet.modal"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold">Withdraw Funds</h2>
              <button
                onClick={() => setShowWithdraw(false)}
                type="button"
                data-ocid="wallet.close_button"
              >
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
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Amount (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawForm.amount}
                  onChange={(e) =>
                    setWithdrawForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  className="bg-input border-border"
                  data-ocid="wallet.input"
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
                  <SelectTrigger
                    className="bg-input border-border"
                    data-ocid="wallet.select"
                  >
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
                  data-ocid="wallet.input"
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
                  data-ocid="wallet.input"
                />
              </div>
              {withdrawError && (
                <p
                  className="text-sm text-red-400"
                  data-ocid="wallet.error_state"
                >
                  {withdrawError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-semibold"
                disabled={loading}
                data-ocid="wallet.confirm_button"
              >
                {loading ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
