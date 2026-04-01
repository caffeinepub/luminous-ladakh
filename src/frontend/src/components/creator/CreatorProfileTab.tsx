import { Button } from "@/components/ui/button";
import type { Account, Post, Review, Violation } from "../../types";

interface Props {
  currentUser: Account;
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  violations: Violation[];
  walletBalance: number;
  onLogout: () => void;
}

export function CreatorProfileTab({
  currentUser,
  accounts,
  posts,
  reviews,
  violations,
  walletBalance,
  onLogout,
}: Props) {
  const users = accounts.filter((a) => a.role === "user");
  const members = accounts.filter((a) => a.role === "member");
  const community = accounts.filter((a) => a.role === "community");
  const activeViolations = violations.filter((v) => !v.resolved);
  const monthlyRevenue = members.reduce(
    (s, m) => s + (m.membershipTier === "Premier" ? 1500 : 1000),
    0,
  );

  return (
    <div className="fade-in space-y-4">
      <div className="bg-card border border-primary/30 rounded-xl p-5 gold-glow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">
              admin_panel_settings
            </span>
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold">
              @{currentUser.username}
            </h2>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
              Creator ✦
            </span>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">badge</span>
          <div>
            <p className="text-xs text-muted-foreground">Electronic ID</p>
            <p className="font-heading font-bold text-primary">
              {currentUser.electronicId}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-3">Platform Summary</h2>
        <div className="space-y-2">
          {[
            ["Total Users", users.length],
            ["Total Members", members.length],
            ["Community Partners", community.length],
            ["Wallet Balance", `₹${walletBalance.toLocaleString()}`],
            ["Monthly Revenue", `₹${monthlyRevenue.toLocaleString()}`],
            ["Active Violations", activeViolations.length],
            [
              "Community Discoveries",
              posts.filter((p) => p.status === "approved").length,
            ],
            ["Total Reviews", reviews.length],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between py-1 border-b border-border last:border-0"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-border text-muted-foreground"
        onClick={onLogout}
        data-ocid="profile.button"
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        Sign Out
      </Button>
    </div>
  );
}
