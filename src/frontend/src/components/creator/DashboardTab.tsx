import { useState } from "react";
import {
  generatePollId,
  loadPolls,
  loadVotes,
  savePolls,
} from "../../data/pollsData";
import type { Poll } from "../../data/pollsData";

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
                by @{ev.postedByUsername} &middot; &#8377;650 payment pending
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => approve(ev.id)}
                  className="flex-1 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reject(ev.id)}
                  className="flex-1 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold"
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
                    by @{photo.submittedBy} &middot;{" "}
                    {formatDate(photo.submittedAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 p-3">
                <button
                  type="button"
                  onClick={() => approvePhoto(photo)}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => rejectPhoto(photo.id)}
                  className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
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

function PollsManagementPanel() {
  const [polls, setPolls] = useState(loadPolls);
  const [votes] = useState(loadVotes);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiry, setExpiry] = useState("");

  function addOption() {
    if (options.length >= 4) return;
    setOptions((prev) => [...prev, ""]);
  }

  function updateOption(i: number, val: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  }

  function createPoll() {
    const validOpts = options.filter((o) => o.trim());
    if (!question.trim() || validOpts.length < 2) {
      return;
    }
    const newPoll: Poll = {
      id: generatePollId(),
      question: question.trim(),
      options: validOpts,
      createdBy: "hunter",
      expiryDate: expiry || undefined,
      closed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...polls, newPoll];
    setPolls(updated);
    savePolls(updated);
    setQuestion("");
    setOptions(["", ""]);
    setExpiry("");
    setShowCreate(false);
  }

  function closePoll(id: string) {
    const updated = polls.map((p) =>
      p.id === id ? { ...p, closed: true } : p,
    );
    setPolls(updated);
    savePolls(updated);
  }

  function deletePoll(id: string) {
    const updated = polls.filter((p) => p.id !== id);
    setPolls(updated);
    savePolls(updated);
  }

  const active = polls.filter((p) => !p.closed);
  const closed = polls.filter((p) => p.closed);

  return (
    <div
      className="bg-card border border-border rounded-xl p-4"
      data-ocid="dashboard.polls.panel"
    >
      <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-purple-400 text-lg">
          poll
        </span>
        Community Polls
        {active.length > 0 && (
          <span className="ml-auto bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {active.length} active
          </span>
        )}
      </h2>

      {showCreate ? (
        <div className="bg-zinc-800/60 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-zinc-300 mb-3">New Poll</p>
          <input
            type="text"
            placeholder="Poll question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 mb-3"
            data-ocid="dashboard.poll.input"
          />
          {options.map((opt, i) => (
            <input
              key={String(i)}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 mb-2"
            />
          ))}
          {options.length < 4 && (
            <button
              type="button"
              onClick={addOption}
              className="text-xs text-purple-400 hover:text-purple-300 mb-3 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add
              option
            </button>
          )}
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm mb-3"
          />
          <p className="text-xs text-zinc-500 mb-3">Expiry date (optional)</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-semibold"
              data-ocid="dashboard.poll.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createPoll}
              className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold"
              data-ocid="dashboard.poll.submit_button"
            >
              Create Poll
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          data-ocid="dashboard.poll.open_modal_button"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-sm font-semibold transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Poll
        </button>
      )}

      {active.length === 0 && !showCreate && (
        <p
          className="text-sm text-muted-foreground text-center py-3"
          data-ocid="dashboard.polls.empty_state"
        >
          No active polls
        </p>
      )}
      <div className="space-y-3">
        {active.map((poll, i) => {
          const pollVoters = votes[poll.id] || {};
          const totalVotes = Object.keys(pollVoters).length;
          return (
            <div
              key={poll.id}
              data-ocid={`dashboard.poll.item.${i + 1}`}
              className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700"
            >
              <p className="font-semibold text-sm text-white mb-1">
                {poll.question}
              </p>
              <p className="text-xs text-zinc-500 mb-2">
                {totalVotes} votes · {poll.options.length} options
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => closePoll(poll.id)}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-semibold"
                  data-ocid={`dashboard.poll.close_button.${i + 1}`}
                >
                  Close Poll
                </button>
                <button
                  type="button"
                  onClick={() => deletePoll(poll.id)}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-semibold"
                  data-ocid={`dashboard.poll.delete_button.${i + 1}`}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {closed.length > 0 && (
          <details className="group">
            <summary className="text-xs text-zinc-500 cursor-pointer py-1 select-none">
              Closed polls ({closed.length})
            </summary>
            <div className="space-y-2 mt-2">
              {closed.map((poll, i) => (
                <div
                  key={poll.id}
                  data-ocid={`dashboard.poll.closed.${i + 1}`}
                  className="bg-zinc-800/30 rounded-xl p-3 border border-zinc-800 opacity-60"
                >
                  <p className="text-sm text-zinc-400">{poll.question}</p>
                  <button
                    type="button"
                    onClick={() => deletePoll(poll.id)}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
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

      {/* Photo Approvals */}
      <PhotoApprovalsPanel />

      {/* Event Approvals */}
      <EventApprovalsPanel />
      <PollsManagementPanel />

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
