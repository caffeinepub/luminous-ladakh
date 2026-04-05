import { useState } from "react";
import type { Account, Violation } from "../../types";

interface LinkedAccountGroup {
  email: string;
  accountIds: string[];
}

function getLinkedGroups(): LinkedAccountGroup[] {
  try {
    return JSON.parse(localStorage.getItem("lc_linked_accounts") || "[]");
  } catch {
    return [];
  }
}

function getViolations(): Violation[] {
  try {
    return JSON.parse(localStorage.getItem("lc_violations") || "[]");
  } catch {
    return [];
  }
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

function getDaysInactive(account: Account): number {
  if (!account.lastLoginAt) return 0;
  const diff = Date.now() - new Date(account.lastLoginAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const ROLE_COLORS: Record<string, string> = {
  user: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  member: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  community: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  creator: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-400",
  suspended: "text-yellow-400",
  banned: "text-red-400",
};

interface Props {
  accounts: Account[];
  showFullList?: boolean; // creator sees full, community sees summary only
}

export function AccountLogs({ accounts, showFullList = true }: Props) {
  const [activeLog, setActiveLog] = useState<"user" | "member" | "hybrid">(
    "user",
  );
  const [expanded, setExpanded] = useState(false);

  const violations = getViolations();
  const groups = getLinkedGroups();

  // User Log
  const users = accounts.filter((a) => a.role === "user");
  const activeUsers = users.filter(
    (a) =>
      (!a.status || a.status === "active") &&
      a.lastLoginAt &&
      getDaysInactive(a) < 7,
  );
  const inactiveUsers = users.filter(
    (a) => !a.lastLoginAt || getDaysInactive(a) >= 7,
  );

  // Member Log
  const members = accounts.filter((a) => a.role === "member");
  const activeMembers = members.filter(
    (a) =>
      (!a.status || a.status === "active") &&
      a.lastLoginAt &&
      getDaysInactive(a) < 7,
  );
  const recentlyUpdatedMembers = members.filter((m) => {
    const businesses = m.businesses || [];
    return businesses.some((b) => {
      if (!b.lastAvailabilityUpdate) return false;
      const diff = Date.now() - new Date(b.lastAvailabilityUpdate).getTime();
      return diff < 30 * 24 * 60 * 60 * 1000;
    });
  });

  // Hybrid Log — groups with 2+ non-creator accounts.
  // Creator accounts are NEVER shown in the Hybrid Log feed.
  const hybridGroups = groups
    .map((g) => ({
      ...g,
      // Strip creator account IDs out before evaluating the group
      accountIds: g.accountIds.filter((id) => {
        const acc = accounts.find((a) => a.id === id);
        return acc && acc.role !== "creator";
      }),
    }))
    .filter((g) => g.accountIds.length >= 2);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between"
        data-ocid="logs.toggle"
      >
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400 text-lg">
            assignment
          </span>
          Account Logs
          <span className="ml-1 bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
            {showFullList ? "Creator + Community" : "Community View"}
          </span>
        </h2>
        <span className="material-symbols-outlined text-zinc-500">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Summary counts (visible to community too) */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Users",
                value: users.length,
                color: "text-sky-400",
                bg: "bg-sky-500/10 border-sky-500/20",
              },
              {
                label: "Members",
                value: members.length,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                label: "Linked",
                value: hybridGroups.length,
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`border rounded-xl p-2 text-center ${s.bg}`}
              >
                <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Log type tabs */}
          <div className="flex rounded-xl overflow-hidden border border-zinc-800">
            {(["user", "member", "hybrid"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveLog(tab)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors capitalize ${
                  activeLog === tab
                    ? "bg-amber-500 text-black"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
                data-ocid="logs.tab"
              >
                {tab === "hybrid" ? "Hybrid" : `${tab} Log`}
              </button>
            ))}
          </div>

          {/* USER LOG */}
          {activeLog === "user" && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                  <p className="text-green-400 font-bold text-lg">
                    {activeUsers.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                  <p className="text-yellow-400 font-bold text-lg">
                    {inactiveUsers.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
              {showFullList && (
                <div className="space-y-2">
                  {users.length === 0 ? (
                    <p
                      className="text-sm text-muted-foreground text-center py-4"
                      data-ocid="logs.empty_state"
                    >
                      No users yet.
                    </p>
                  ) : (
                    users.map((u, i) => (
                      <div
                        key={u.id}
                        className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3"
                        data-ocid={`logs.item.${i + 1}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.username[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                @{u.username}
                              </p>
                              <span
                                className={`text-xs ${STATUS_COLORS[u.status || "active"] || STATUS_COLORS.active}`}
                              >
                                {u.status || "active"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-zinc-400">
                              {u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}
                            </p>
                            {u.lastLoginAt && (
                              <p className="text-xs text-zinc-600">
                                {getDaysInactive(u)}d inactive
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
          )}

          {/* MEMBER LOG */}
          {activeLog === "member" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                  <p className="text-green-400 font-bold text-lg">
                    {activeMembers.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                  <p className="text-blue-400 font-bold text-lg">
                    {recentlyUpdatedMembers.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated (30d)</p>
                </div>
              </div>
              {showFullList && (
                <div className="space-y-2">
                  {members.length === 0 ? (
                    <p
                      className="text-sm text-muted-foreground text-center py-4"
                      data-ocid="logs.empty_state"
                    >
                      No members yet.
                    </p>
                  ) : (
                    members.map((m, i) => (
                      <div
                        key={m.id}
                        className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3"
                        data-ocid={`logs.item.${i + 1}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {m.username[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                @{m.username}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-blue-400">
                                  {m.membershipTier || "Common"}
                                </span>
                                <span
                                  className={`text-xs ${STATUS_COLORS[m.status || "active"] || STATUS_COLORS.active}`}
                                >
                                  {m.status || "active"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-zinc-400">
                              {m.lastLoginAt ? timeAgo(m.lastLoginAt) : "Never"}
                            </p>
                            <p className="text-xs text-zinc-600">
                              {(m.businesses || []).length} business
                              {(m.businesses || []).length !== 1 ? "es" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* HYBRID LOG */}
          {activeLog === "hybrid" && (
            <div className="space-y-3">
              {hybridGroups.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground text-center py-4"
                  data-ocid="logs.empty_state"
                >
                  No hybrid (multi-account) groups found.
                </p>
              ) : (
                hybridGroups.map((group, gi) => {
                  // Only show non-creator accounts inside each group row
                  const groupAccounts = accounts.filter(
                    (a) =>
                      group.accountIds.includes(a.id) && a.role !== "creator",
                  );
                  const groupViolations = violations.filter(
                    (v) =>
                      group.accountIds.includes(v.targetUserId) && !v.resolved,
                  );
                  const hasSerious = groupViolations.some(
                    (v) => v.level === 6 || v.level === 7,
                  );
                  const hasAutoLevel2 = groupViolations.some(
                    (v) =>
                      v.level === 2 &&
                      v.issuedBy === "system" &&
                      v.reason?.includes("Linked account"),
                  );

                  return (
                    <div
                      key={group.email}
                      className="bg-zinc-800/60 border border-zinc-700 rounded-xl overflow-hidden"
                      data-ocid={`logs.item.${gi + 1}`}
                    >
                      <div className="px-3 py-2 bg-zinc-700/40 border-b border-zinc-700">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono text-zinc-300">
                            {group.email}
                          </p>
                          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                            {group.accountIds.length} accounts
                          </span>
                        </div>
                        {hasSerious && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              warning
                            </span>
                            Serious violation (L6/L7)
                          </p>
                        )}
                        {hasAutoLevel2 && (
                          <p className="text-xs text-yellow-400 mt-0.5">
                            ⚡ Level 2 auto-applied to linked account
                          </p>
                        )}
                      </div>
                      <div className="divide-y divide-zinc-700/50">
                        {groupAccounts.map((acc) => {
                          const sessionRaw = localStorage.getItem("lc_session");
                          let isLoggedIn = false;
                          try {
                            const { userId } = JSON.parse(sessionRaw || "{}");
                            isLoggedIn = userId === acc.id;
                          } catch {}
                          const statusLabel =
                            acc.status === "banned"
                              ? "Banned"
                              : acc.status === "suspended"
                                ? "Suspended"
                                : isLoggedIn
                                  ? "Active"
                                  : acc.lastLogoutAt
                                    ? "Logged Out"
                                    : acc.lastLoginAt
                                      ? "Inactive"
                                      : "Never Logged In";
                          const statusColor =
                            acc.status === "banned"
                              ? "text-red-400"
                              : acc.status === "suspended"
                                ? "text-yellow-400"
                                : isLoggedIn
                                  ? "text-green-400"
                                  : "text-zinc-500";

                          return (
                            <div
                              key={acc.id}
                              className="px-3 py-2 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {acc.username[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-white truncate">
                                    @{acc.username}
                                  </p>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${ROLE_COLORS[acc.role] || ROLE_COLORS.user}`}
                                  >
                                    {acc.role}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-medium flex-shrink-0 ${statusColor}`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
