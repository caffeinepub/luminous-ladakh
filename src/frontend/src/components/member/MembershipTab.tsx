import type { Account } from "../../types";

interface Props {
  currentUser: Account;
}

export function MembershipTab({ currentUser }: Props) {
  const trialStart = currentUser.trialStartDate
    ? new Date(currentUser.trialStartDate)
    : null;
  const trialEnd = trialStart
    ? new Date(trialStart.getTime() + 24 * 60 * 60 * 1000)
    : null;
  const now = new Date();
  const trialActive = trialEnd && now < trialEnd;
  const hoursLeft = trialEnd
    ? Math.max(0, Math.round((trialEnd.getTime() - now.getTime()) / 3600000))
    : 0;

  return (
    <div className="fade-in space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading text-xl font-bold mb-1">Membership</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your current plan and billing status
        </p>

        <div
          className={`rounded-xl p-4 border mb-4 ${
            currentUser.membershipTier === "Premier"
              ? "bg-primary/10 border-primary/30 gold-glow"
              : "bg-secondary border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {currentUser.membershipTier === "Premier"
                  ? "✦ Premier Plan"
                  : "Common Plan"}
              </p>
              <p className="font-heading text-3xl font-bold text-primary">
                ₹{currentUser.membershipTier === "Premier" ? "1,500" : "1,000"}
                <span className="text-sm text-muted-foreground font-normal">
                  /mo
                </span>
              </p>
            </div>
            <span
              className={`text-sm px-3 py-1.5 rounded-full font-medium border ${
                currentUser.membershipStatus === "active"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : currentUser.membershipStatus === "trial"
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              {currentUser.membershipStatus === "trial"
                ? "Free Trial"
                : currentUser.membershipStatus}
            </span>
          </div>
        </div>

        {trialActive && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-400 font-semibold">
              Trial Period Active
            </p>
            <p className="text-xs text-muted-foreground">
              {hoursLeft} hours remaining in your 1-day free trial
            </p>
          </div>
        )}

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-xs text-red-400 font-semibold">
            ⚠️ Non-Refundable Payment Policy
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All membership payments are strictly non-refundable. Please review
            your plan before upgrading.
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <h3 className="font-heading font-semibold text-sm">Plan Features</h3>
          {currentUser.membershipTier === "Common" ? (
            <div className="space-y-1">
              {[
                "Business listing on Explore page",
                "Customer reviews visible",
                "Edit business profile",
                "Google Maps directions link",
                "Violation monitoring dashboard",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="material-symbols-outlined text-green-400 text-base">
                    check_circle
                  </span>
                  {f}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {[
                "All Common features",
                "Premier badge on listing",
                "Priority placement in Explore",
                "Video upload support (coming soon)",
                "Webpage editing (coming soon)",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="material-symbols-outlined text-primary text-base">
                    star
                  </span>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        {currentUser.membershipTier === "Common" && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <p className="text-sm font-semibold text-primary">
              Upgrade to Premier
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ₹500/mo more for premium benefits. Contact the creator to upgrade.
            </p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3">Payment History</h3>
        <div className="space-y-2" data-ocid="membership.table">
          {[
            {
              date: "Aug 1, 2024",
              amount: currentUser.membershipTier === "Premier" ? 1500 : 1000,
              status: "Paid",
            },
            {
              date: "Jul 1, 2024",
              amount: currentUser.membershipTier === "Premier" ? 1500 : 1000,
              status: "Paid",
            },
            {
              date: "Jun 1, 2024",
              amount: currentUser.membershipTier === "Premier" ? 1500 : 1000,
              status: "Paid",
            },
          ].map((p, idx) => (
            <div
              key={p.date}
              className="flex items-center justify-between bg-secondary rounded-lg p-3"
              data-ocid={`membership.row.${idx + 1}`}
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
    </div>
  );
}
