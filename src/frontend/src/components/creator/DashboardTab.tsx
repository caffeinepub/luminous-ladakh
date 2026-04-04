import { useState } from "react";
import { loadEvents, saveEvents } from "../../data/eventsData";
import type { Account, LCEvent, Post, Violation } from "../../types";
import type { PendingPhoto } from "../ExploreTab";

const PENDING_PHOTOS_KEY = "lc_pending_photos";
const LOCATION_PHOTOS_KEY = "lc_location_photos";

function loadPendingPhotos(): PendingPhoto[] {
  try {
    const saved = localStorage.getItem(PENDING_PHOTOS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function savePendingPhotos(photos: PendingPhoto[]) {
  try {
    localStorage.setItem(PENDING_PHOTOS_KEY, JSON.stringify(photos));
  } catch {}
}

function loadLocationPhotos(): Record<string, string[]> {
  try {
    const saved = localStorage.getItem(LOCATION_PHOTOS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocationPhotos(photos: Record<string, string[]>) {
  try {
    localStorage.setItem(LOCATION_PHOTOS_KEY, JSON.stringify(photos));
  } catch {}
}

interface Props {
  accounts: Account[];
  posts: Post[];
  violations: Violation[];
  walletBalance: number;
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } catch {
    return "Unknown";
  }
}

// ─── Analytics Panel (Creator-only) ───────────────────────────────────────────
function AnalyticsPanel({
  accounts,
  walletBalance,
}: { accounts: Account[]; walletBalance: number }) {
  const [expanded, setExpanded] = useState(false);

  // User analytics
  const nonCreator = accounts.filter((a) => a.role !== "creator");
  const totalJoined = nonCreator.length;
  const activeNow = nonCreator.filter(
    (a) => !a.status || a.status === "active",
  ).length;
  const suspended = nonCreator.filter(
    (a) => a.status === "suspended" || a.status === "banned",
  ).length;
  const inactiveThreshold = 7 * 24 * 60 * 60 * 1000;
  const inactiveCount = nonCreator.filter((a) => {
    if (!a.lastLoginAt) return false;
    return Date.now() - new Date(a.lastLoginAt).getTime() > inactiveThreshold;
  }).length;

  // Revenue analytics (from wallet transactions)
  let membershipRevenue = 0;
  let eventRevenue = 0;
  let announcementRevenue = 0;
  try {
    const txns = JSON.parse(
      localStorage.getItem("lc_walletTransactions") || "[]",
    );
    for (const t of txns) {
      if (t.type === "payment") {
        if (t.note?.toLowerCase().includes("membership"))
          membershipRevenue += t.amount;
        else if (t.note?.toLowerCase().includes("event"))
          eventRevenue += t.amount;
        else if (
          t.note?.toLowerCase().includes("announcement") ||
          t.note?.toLowerCase().includes("shop")
        )
          announcementRevenue += t.amount;
        else membershipRevenue += t.amount; // default bucket
      }
    }
  } catch {}

  const totalRevenue = membershipRevenue + eventRevenue + announcementRevenue;

  // Mini bar chart helper
  const Bar = ({
    label,
    value,
    max,
    color,
  }: { label: string; value: number; max: number; color: string }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold text-white">{value}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between"
        data-ocid="dashboard.analytics.toggle"
      >
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-lg">
            bar_chart
          </span>
          Analytics
          <span className="ml-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Creator Only
          </span>
        </h2>
        <span className="material-symbols-outlined text-zinc-500">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-5">
          {/* User Analytics */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              User Analytics
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                {
                  label: "Total Joined",
                  value: totalJoined,
                  icon: "group_add",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10 border-blue-500/20",
                },
                {
                  label: "Active Now",
                  value: activeNow,
                  icon: "check_circle",
                  color: "text-green-400",
                  bg: "bg-green-500/10 border-green-500/20",
                },
                {
                  label: "Suspended/Banned",
                  value: suspended,
                  icon: "block",
                  color: "text-red-400",
                  bg: "bg-red-500/10 border-red-500/20",
                },
                {
                  label: "Inactive (7d+)",
                  value: inactiveCount,
                  icon: "bedtime",
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10 border-yellow-500/20",
                },
              ].map((s) => (
                <div key={s.label} className={`border rounded-xl p-3 ${s.bg}`}>
                  <span
                    className={`material-symbols-outlined text-xl ${s.color} block mb-1`}
                  >
                    {s.icon}
                  </span>
                  <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3 space-y-2">
              <Bar
                label="Users"
                value={nonCreator.filter((a) => a.role === "user").length}
                max={totalJoined}
                color="bg-sky-500"
              />
              <Bar
                label="Members"
                value={nonCreator.filter((a) => a.role === "member").length}
                max={totalJoined}
                color="bg-blue-500"
              />
              <Bar
                label="Community"
                value={nonCreator.filter((a) => a.role === "community").length}
                max={totalJoined}
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Revenue Analytics */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Revenue Analytics
            </p>
            <div className="bg-zinc-800/50 rounded-xl p-3 mb-3">
              <p className="text-xs text-muted-foreground mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                &#8377;{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Membership Payments
                </span>
                <span className="font-semibold text-blue-400">
                  &#8377;{membershipRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Event Posting Fees
                </span>
                <span className="font-semibold text-purple-400">
                  &#8377;{eventRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Shop Announcements
                </span>
                <span className="font-semibold text-amber-400">
                  &#8377;{announcementRevenue.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-bold">
                <span>Wallet Balance</span>
                <span className="text-emerald-400">
                  &#8377;{walletBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventApprovalsPanel() {
  const [events, setEvents] = useState<LCEvent[]>(loadEvents);
  const pending = events.filter((e) => e.status === "pending");

  function approve(id: string) {
    const updated = events.map((e) =>
      e.id === id ? { ...e, status: "approved" as const } : e,
    );
    setEvents(updated);
    saveEvents(updated);
  }

  function reject(id: string) {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-purple-400 text-lg">
          event
        </span>
        Event Approvals
        {pending.length > 0 && (
          <span className="ml-auto bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pending.length}
          </span>
        )}
      </h2>
      {pending.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No pending events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((ev) => (
            <div
              key={ev.id}
              className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700"
            >
              <p className="font-semibold text-sm">{ev.title}</p>
              <p className="text-xs text-muted-foreground">
                {ev.date} &middot; {ev.location}
              </p>
              <p className="text-xs text-muted-foreground">
                by @{ev.postedByUsername} &middot; &#8377;500 payment pending
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => approve(ev.id)}
                  className="flex-1 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold"
                  data-ocid="dashboard.confirm_button"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reject(ev.id)}
                  className="flex-1 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold"
                  data-ocid="dashboard.cancel_button"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoApprovalsPanel() {
  const [pending, setPending] = useState<PendingPhoto[]>(loadPendingPhotos);

  function approvePhoto(photo: PendingPhoto) {
    const locationPhotos = loadLocationPhotos();
    const existing = locationPhotos[photo.locationId] || [];
    locationPhotos[photo.locationId] = [...existing, photo.dataUrl];
    saveLocationPhotos(locationPhotos);
    const next = pending.filter((p) => p.id !== photo.id);
    setPending(next);
    savePendingPhotos(next);
  }

  function rejectPhoto(photoId: string) {
    const next = pending.filter((p) => p.id !== photoId);
    setPending(next);
    savePendingPhotos(next);
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-400 text-lg">
          photo_camera
        </span>
        Photo Approvals
        {pending.length > 0 && (
          <span className="ml-auto bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {pending.length}
          </span>
        )}
      </h2>
      {pending.length === 0 ? (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-zinc-600 block mb-2">
            check_circle
          </span>
          <p className="text-sm text-muted-foreground">No pending photos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((photo) => (
            <div
              key={photo.id}
              className="bg-zinc-800/60 rounded-xl overflow-hidden border border-zinc-700"
            >
              <div className="h-40 relative">
                <img
                  src={photo.dataUrl}
                  alt={`Contribution for ${photo.locationName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <p className="text-white font-semibold text-sm">
                    {photo.locationName}
                  </p>
                  <p className="text-zinc-300 text-xs">
                    by @{photo.submittedBy} &middot;{" "}
                    {formatDate(photo.submittedAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 p-3">
                <button
                  type="button"
                  onClick={() => approvePhoto(photo)}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
                  data-ocid="dashboard.confirm_button"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => rejectPhoto(photo.id)}
                  className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                  data-ocid="dashboard.cancel_button"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserActivityPanel({ accounts }: { accounts: Account[] }) {
  const [expanded, setExpanded] = useState(false);

  const nonCreatorAccounts = accounts
    .filter((a) => a.role !== "creator")
    .sort((a, b) => {
      if (a.lastLoginAt && b.lastLoginAt) {
        return (
          new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
        );
      }
      if (a.lastLoginAt) return -1;
      if (b.lastLoginAt) return 1;
      return 0;
    });

  const roleColors: Record<string, string> = {
    member: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    community: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    user: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  const statusColors: Record<string, string> = {
    active: "text-green-400",
    suspended: "text-yellow-400",
    banned: "text-red-400",
  };

  function getDaysInactive(account: Account): number {
    if (!account.lastLoginAt) return 0;
    const diff = Date.now() - new Date(account.lastLoginAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between"
        data-ocid="dashboard.toggle"
      >
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400 text-lg">
            analytics
          </span>
          User Activity
          <span className="ml-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
            {nonCreatorAccounts.length}
          </span>
        </h2>
        <span className="material-symbols-outlined text-zinc-500">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-2">
          {nonCreatorAccounts.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-4"
              data-ocid="dashboard.empty_state"
            >
              No user accounts yet.
            </p>
          ) : (
            nonCreatorAccounts.map((account, i) => (
              <div
                key={account.id}
                className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3"
                data-ocid={`dashboard.item.${i + 1}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {account.profilePhoto ? (
                      <img
                        src={account.profilePhoto}
                        alt={account.username}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {account.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        @{account.username}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${roleColors[account.role] || roleColors.user}`}
                        >
                          {account.role}
                        </span>
                        <span
                          className={`text-xs ${statusColors[account.status || "active"] || statusColors.active}`}
                        >
                          {account.status || "active"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-zinc-400">
                      {account.lastLoginAt
                        ? timeAgo(account.lastLoginAt)
                        : "Never logged in"}
                    </p>
                    {account.lastLoginAt && (
                      <p className="text-xs text-zinc-600">
                        {getDaysInactive(account)}d inactive
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
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
      value: `\u20b9${walletBalance.toLocaleString()}`,
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

      {/* Analytics Panel - Creator only */}
      <AnalyticsPanel accounts={accounts} walletBalance={walletBalance} />

      {/* Photo Approvals */}
      <PhotoApprovalsPanel />

      {/* Event Approvals */}
      <EventApprovalsPanel />

      {/* User Activity */}
      <UserActivityPanel accounts={accounts} />

      {/* Platform Overview */}
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
              Monthly revenue (est.)
            </span>
            <span className="font-semibold text-green-400">
              &#8377;
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
          "Data Sync Active",
          "Moderation System Active",
          "Wallet System Active",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-muted-foreground">{item}</span>
            <span className="ml-auto text-xs text-green-400">OK</span>
          </div>
        ))}
      </div>
    </div>
  );
}
