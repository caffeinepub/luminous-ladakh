import type { Account, Post, Violation } from "../../types";

interface Props {
  accounts: Account[];
  posts: Post[];
  violations: Violation[];
  walletBalance: number;
}

export function CreatorDashboard({
  accounts,
  posts,
  violations,
  walletBalance,
}: Props) {
  const users = accounts.filter((a) => a.role === "user");
  const members = accounts.filter((a) => a.role === "member");
  const community = accounts.filter((a) => a.role === "community");
  const activeViolations = violations.filter((v) => !v.resolved);
  const pendingPosts = posts.filter((p) => p.status === "pending");

  const stats = [
    {
      icon: "group",
      label: "Total Users",
      value: users.length,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
    },
    {
      icon: "store",
      label: "Members",
      value: members.length,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      icon: "diversity_3",
      label: "Community",
      value: community.length,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/20",
    },
    {
      icon: "account_balance_wallet",
      label: "Wallet Balance",
      value: `₹${walletBalance.toLocaleString()}`,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
    {
      icon: "warning",
      label: "Active Violations",
      value: activeViolations.length,
      color: "text-red-400",
      bg: "bg-red-400/10 border-red-400/20",
    },
    {
      icon: "pending_actions",
      label: "Pending Posts",
      value: pendingPosts.length,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/20",
    },
  ];

  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Welcome back, <span className="amber-text">Hunter</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Ladakh Connect Creator Dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`bg-card border rounded-xl p-4 card-hover slide-up stagger-${i + 1} ${s.bg}`}
          >
            <span
              className={`material-symbols-outlined text-2xl ${s.color} block mb-2`}
            >
              {s.icon}
            </span>
            <p className={`font-heading text-2xl font-bold ${s.color}`}>
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            timeline
          </span>
          Platform Overview
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total accounts
            </span>
            <span className="font-semibold">{accounts.length - 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Active members (paying)
            </span>
            <span className="font-semibold">
              {members.filter((m) => m.membershipStatus === "active").length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Monthly revenue
            </span>
            <span className="font-semibold text-green-400">
              ₹
              {members
                .reduce(
                  (s, m) => s + (m.membershipTier === "Premier" ? 1500 : 1000),
                  0,
                )
                .toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Community discoveries posted
            </span>
            <span className="font-semibold">{posts.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Approved discoveries
            </span>
            <span className="font-semibold text-green-400">
              {posts.filter((p) => p.status === "approved").length}
            </span>
          </div>
        </div>
      </div>

      {/* App Health */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400 text-lg">
            health_and_safety
          </span>
          App Health
        </h2>
        {[
          "Platform Online",
          "localStorage Data Sync",
          "Moderation System Active",
          "Wallet System Active",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-amber" />
            <span className="text-sm text-muted-foreground">{item}</span>
            <span className="ml-auto text-xs text-green-400">OK</span>
          </div>
        ))}
      </div>
    </div>
  );
}
