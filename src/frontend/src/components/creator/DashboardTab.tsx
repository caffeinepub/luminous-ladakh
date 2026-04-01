import { useState } from "react";
import type { Account, Post, Violation } from "../../types";
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

function PhotoApprovalsPanel() {
  const [pending, setPending] = useState<PendingPhoto[]>(loadPendingPhotos);

  function approvePhoto(photo: PendingPhoto) {
    // Add to location photos
    const locationPhotos = loadLocationPhotos();
    const existing = locationPhotos[photo.locationId] || [];
    locationPhotos[photo.locationId] = [...existing, photo.dataUrl];
    saveLocationPhotos(locationPhotos);

    // Remove from pending
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
                    by @{photo.submittedBy} · {formatDate(photo.submittedAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 p-3">
                <button
                  type="button"
                  onClick={() => approvePhoto(photo)}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  ✅ Approve
                </button>
                <button
                  type="button"
                  onClick={() => rejectPhoto(photo.id)}
                  className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
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

      {/* Photo Approvals */}
      <PhotoApprovalsPanel />

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
