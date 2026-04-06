import { useState } from "react";
import { toast } from "sonner";
import type { Account } from "../types";

interface ParcelTrip {
  id: string;
  userId: string;
  username: string;
  role: string;
  from: string;
  to: string;
  travelDate: string;
  capacity: number;
  slotsLeft: number;
  isFull: boolean;
  phone: string;
  postedAt: string;
  status: "active" | "completed";
}

const LADAKH_PLACES = [
  "Leh",
  "Pangong Tso",
  "Nubra Valley",
  "Khardung La",
  "Zoji La",
  "Kargil",
  "Diskit",
  "Turtuk",
  "Hanle",
  "Padum",
  "Lamayuru",
  "Alchi",
  "Hemis",
  "Thiksey",
  "Dah",
];

function normalizeTrip(t: Record<string, unknown>): ParcelTrip {
  return {
    id: (t.id as string) || "",
    userId: (t.userId as string) || "",
    username: (t.username as string) || "",
    role: (t.role as string) || "user",
    from: (t.from as string) || "",
    to: (t.to as string) || "",
    travelDate: (t.travelDate as string) || "",
    capacity: typeof t.capacity === "number" ? t.capacity : 1,
    slotsLeft: typeof t.slotsLeft === "number" ? t.slotsLeft : 1,
    isFull: typeof t.isFull === "boolean" ? t.isFull : false,
    phone: (t.phone as string) || "",
    postedAt: (t.postedAt as string) || new Date().toISOString(),
    status: (t.status as "active" | "completed") || "active",
  };
}

function getTrips(): ParcelTrip[] {
  try {
    const raw = JSON.parse(
      localStorage.getItem("lc_parcel_trips") || "[]",
    ) as Record<string, unknown>[];
    return raw.map(normalizeTrip);
  } catch {
    return [];
  }
}

function saveTrips(trips: ParcelTrip[]) {
  localStorage.setItem("lc_parcel_trips", JSON.stringify(trips));
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ROLE_COLORS: Record<string, string> = {
  user: "text-sky-400",
  member: "text-blue-400",
  community: "text-purple-400",
  creator: "text-amber-400",
};

type ActiveTab = "going" | "send";

export function ParcelConnectTab({ currentUser }: { currentUser: Account }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("going");
  const [trips, setTrips] = useState<ParcelTrip[]>(() => getTrips());
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<ParcelTrip | null>(null);
  const [form, setForm] = useState({
    fromSelect: "",
    fromCustom: "",
    toSelect: "",
    toCustom: "",
    travelDate: "",
    capacity: 1,
    phone: "",
  });
  const [searchDest, setSearchDest] = useState("");

  const isFromOther = form.fromSelect === "__other__";
  const isToOther = form.toSelect === "__other__";
  const resolvedFrom = isFromOther ? form.fromCustom.trim() : form.fromSelect;
  const resolvedTo = isToOther ? form.toCustom.trim() : form.toSelect;

  const activeTrips = trips.filter((t) => t.status === "active");
  const myTrips = activeTrips.filter((t) => t.userId === currentUser.id);

  function refreshTrips() {
    setTrips(getTrips());
  }

  function openPostForm() {
    setEditingTrip(null);
    setForm({
      fromSelect: "",
      fromCustom: "",
      toSelect: "",
      toCustom: "",
      travelDate: "",
      capacity: 1,
      phone: "",
    });
    setShowForm(true);
  }

  function openEditForm(trip: ParcelTrip) {
    setEditingTrip(trip);
    const isKnownFrom = LADAKH_PLACES.includes(trip.from);
    const isKnownTo = LADAKH_PLACES.includes(trip.to);
    setForm({
      fromSelect: isKnownFrom ? trip.from : "__other__",
      fromCustom: isKnownFrom ? "" : trip.from,
      toSelect: isKnownTo ? trip.to : "__other__",
      toCustom: isKnownTo ? "" : trip.to,
      travelDate: trip.travelDate,
      capacity: trip.capacity,
      phone: trip.phone,
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !resolvedFrom ||
      !resolvedTo ||
      !form.travelDate ||
      !form.phone ||
      form.capacity < 1
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    const all = getTrips();
    if (editingTrip) {
      const idx = all.findIndex((t) => t.id === editingTrip.id);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          from: resolvedFrom,
          to: resolvedTo,
          travelDate: form.travelDate,
          capacity: form.capacity,
          slotsLeft: Math.min(all[idx].slotsLeft, form.capacity),
          phone: form.phone,
        };
      }
      toast.success("Trip updated!");
    } else {
      const trip: ParcelTrip = {
        id: Math.random().toString(36).slice(2),
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        from: resolvedFrom,
        to: resolvedTo,
        travelDate: form.travelDate,
        capacity: form.capacity,
        slotsLeft: form.capacity,
        isFull: false,
        phone: form.phone,
        postedAt: new Date().toISOString(),
        status: "active",
      };
      all.unshift(trip);
      toast.success("Trip posted! Others can now contact you.");
    }
    saveTrips(all);
    refreshTrips();
    setShowForm(false);
    setEditingTrip(null);
  }

  function handleReduceSlot(tripId: string) {
    const all = getTrips();
    const idx = all.findIndex((t) => t.id === tripId);
    if (idx === -1) return;
    if (all[idx].slotsLeft <= 0) return;
    all[idx].slotsLeft = all[idx].slotsLeft - 1;
    if (all[idx].slotsLeft === 0) all[idx].isFull = true;
    saveTrips(all);
    refreshTrips();
    toast.success(
      `Slot reduced. ${all[idx].slotsLeft} slot${all[idx].slotsLeft !== 1 ? "s" : ""} remaining.`,
    );
  }

  function handleMarkFull(tripId: string) {
    const all = getTrips();
    const idx = all.findIndex((t) => t.id === tripId);
    if (idx === -1) return;
    all[idx].isFull = true;
    all[idx].slotsLeft = 0;
    saveTrips(all);
    refreshTrips();
    toast.success("Trip marked as full.");
  }

  function handleDelete(tripId: string) {
    const all = getTrips().filter((t) => t.id !== tripId);
    saveTrips(all);
    refreshTrips();
    toast.success("Trip removed.");
  }

  const filteredTrips = searchDest
    ? activeTrips.filter(
        (t) =>
          t.to.toLowerCase().includes(searchDest.toLowerCase()) ||
          t.from.toLowerCase().includes(searchDest.toLowerCase()),
      )
    : activeTrips;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(18% 0.04 55), oklch(12% 0.02 30))",
        }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(72% 0.17 55), transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-amber-400">
            local_shipping
          </span>
          <div>
            <h1 className="text-xl font-bold text-white">Parcel Connect</h1>
            <p className="text-xs text-zinc-400">
              Send parcels free with fellow travellers
            </p>
          </div>
        </div>
      </div>

      {/* Two-tab selector */}
      <div className="flex rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
        <button
          type="button"
          onClick={() => setActiveTab("going")}
          className={`flex-1 py-3 text-sm font-semibold transition-all relative ${
            activeTab === "going"
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          data-ocid="parcel.going_tab"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">
              directions_car
            </span>
            I&apos;m Going
          </span>
          {activeTab === "going" && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(72% 0.17 55), oklch(62% 0.19 42))",
              }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("send")}
          className={`flex-1 py-3 text-sm font-semibold transition-all relative ${
            activeTab === "send"
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          data-ocid="parcel.send_tab"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">
              package_2
            </span>
            Send a Parcel
          </span>
          {activeTab === "send" && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(72% 0.17 55), oklch(62% 0.19 42))",
              }}
            />
          )}
        </button>
      </div>

      {/* ── TAB 1: I'M GOING ── */}
      {activeTab === "going" && (
        <div className="space-y-4">
          {/* Post button */}
          <button
            type="button"
            onClick={openPostForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-all active:scale-95 btn-glow"
            style={{
              background:
                "linear-gradient(135deg, oklch(72% 0.17 55), oklch(62% 0.19 42))",
            }}
            data-ocid="parcel.open_modal_button"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Post My Trip
          </button>

          {/* My active trips with controls */}
          {myTrips.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                Your Active Trips
              </p>
              {myTrips.map((trip, idx) => (
                <div
                  key={trip.id}
                  className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-4 space-y-3 glass-card"
                  data-ocid={`parcel.item.${idx + 1}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-medium">
                        {trip.from}
                      </span>
                      <span className="material-symbols-outlined text-amber-400 text-base">
                        arrow_forward
                      </span>
                      <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-medium">
                        {trip.to}
                      </span>
                    </div>
                    {trip.isFull && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 text-xs font-semibold">
                        FULL
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      {new Date(trip.travelDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        trip.isFull ? "text-zinc-500" : "text-green-400"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        inventory_2
                      </span>
                      Slots: {trip.slotsLeft} / {trip.capacity}
                    </span>
                  </div>

                  {/* Slot controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleReduceSlot(trip.id)}
                      disabled={trip.slotsLeft === 0}
                      className="py-2 rounded-lg text-xs font-semibold border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      data-ocid={`parcel.toggle.${idx + 1}`}
                    >
                      −1 Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkFull(trip.id)}
                      disabled={trip.isFull}
                      className="py-2 rounded-lg text-xs font-semibold border border-zinc-700 text-zinc-300 hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      data-ocid={`parcel.delete_button.${idx + 1}`}
                    >
                      Mark as Full
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(trip)}
                      className="py-2 rounded-lg text-xs font-semibold border border-amber-500/30 text-amber-400 hover:border-amber-500/60 transition-colors"
                      data-ocid={`parcel.edit_button.${idx + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(trip.id)}
                      className="py-2 rounded-lg text-xs font-semibold border border-red-500/30 text-red-400 hover:border-red-500/60 transition-colors"
                      data-ocid={`parcel.delete_button.${idx + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All active trips */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                All Trips ({activeTrips.length})
              </p>
            </div>

            {activeTrips.length === 0 ? (
              <div className="text-center py-12" data-ocid="parcel.empty_state">
                <span className="material-symbols-outlined text-5xl text-zinc-700">
                  route
                </span>
                <p className="text-zinc-500 mt-2 text-sm">
                  No trips posted yet.
                </p>
                <p className="text-zinc-600 text-xs mt-1">
                  Be the first to post your travel route!
                </p>
              </div>
            ) : (
              activeTrips.map((trip, idx) => (
                <div
                  key={trip.id}
                  className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 glass-card transition-opacity ${
                    trip.isFull ? "opacity-60" : ""
                  }`}
                  data-ocid={`parcel.item.${idx + 1}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-amber-400">
                        {trip.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          @{trip.username}
                        </p>
                        <p
                          className={`text-xs capitalize ${
                            ROLE_COLORS[trip.role] || "text-zinc-400"
                          }`}
                        >
                          {trip.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trip.isFull && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 text-xs font-semibold">
                          FULL
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">
                        {timeAgo(trip.postedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-medium">
                      {trip.from}
                    </span>
                    <span className="material-symbols-outlined text-amber-400 text-base">
                      arrow_forward
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-medium">
                      {trip.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      {new Date(trip.travelDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        trip.isFull ? "text-zinc-500" : "text-green-400"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        inventory_2
                      </span>
                      {trip.isFull
                        ? "Full"
                        : `${trip.slotsLeft} slot${trip.slotsLeft !== 1 ? "s" : ""} available`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SEND A PARCEL ── */}
      {activeTab === "send" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by destination..."
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              data-ocid="parcel.search_input"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">
              {filteredTrips.length} traveller
              {filteredTrips.length !== 1 ? "s" : ""}{" "}
              {searchDest ? "found" : "available"}
            </p>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="text-center py-12" data-ocid="parcel.empty_state">
              <span className="material-symbols-outlined text-5xl text-zinc-700">
                search_off
              </span>
              <p className="text-zinc-500 mt-2 text-sm">
                {searchDest
                  ? `No travellers going to "${searchDest}" yet.`
                  : "No active trips posted yet."}
              </p>
              <p className="text-zinc-600 text-xs mt-1">
                Switch to &quot;I&apos;m Going&quot; to post your travel route!
              </p>
            </div>
          ) : (
            filteredTrips.map((trip, idx) => (
              <div
                key={trip.id}
                className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 glass-card transition-opacity ${
                  trip.isFull ? "opacity-60" : ""
                }`}
                data-ocid={`parcel.item.${idx + 1}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-amber-400">
                      {trip.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        @{trip.username}
                      </p>
                      <p
                        className={`text-xs capitalize ${
                          ROLE_COLORS[trip.role] || "text-zinc-400"
                        }`}
                      >
                        {trip.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trip.isFull ? (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 text-xs font-semibold">
                        FULL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
                        {trip.slotsLeft} slot
                        {trip.slotsLeft !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="text-xs text-zinc-600">
                      {timeAgo(trip.postedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-medium">
                    {trip.from}
                  </span>
                  <span className="material-symbols-outlined text-amber-400 text-base">
                    arrow_forward
                  </span>
                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-medium">
                    {trip.to}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      calendar_today
                    </span>
                    {new Date(trip.travelDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {trip.isFull ? (
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm text-zinc-500 bg-zinc-800 border border-zinc-700 cursor-not-allowed opacity-50"
                    data-ocid={`parcel.button.${idx + 1}`}
                  >
                    <span className="material-symbols-outlined text-base">
                      call
                    </span>
                    Call {trip.username} (Full)
                  </button>
                ) : (
                  <a
                    href={`tel:${trip.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm text-black transition-all active:scale-95 btn-glow"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(72% 0.17 55), oklch(62% 0.19 42))",
                    }}
                    data-ocid={`parcel.button.${idx + 1}`}
                  >
                    <span className="material-symbols-outlined text-base">
                      call
                    </span>
                    Call {trip.username}
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── POST / EDIT FORM MODAL ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowForm(false)}
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowForm(false);
          }}
        >
          <div
            className="bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
            onKeyDown={(e) => e.stopPropagation()}
            data-ocid="parcel.modal"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">
                    {editingTrip ? "Edit Trip" : "Post Your Trip"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {editingTrip
                      ? "Update your travel details"
                      : "Let others know you're travelling"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-zinc-500 hover:text-white"
                  data-ocid="parcel.close_button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Travelling From */}
                <div>
                  <label
                    htmlFor="parcel-from"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    Travelling From *
                  </label>
                  <select
                    id="parcel-from"
                    value={form.fromSelect}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        fromSelect: e.target.value,
                        fromCustom: "",
                      }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.from_select"
                  >
                    <option value="">Select location</option>
                    {LADAKH_PLACES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="__other__">Other (type your own)</option>
                  </select>
                  {isFromOther && (
                    <input
                      type="text"
                      value={form.fromCustom}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fromCustom: e.target.value }))
                      }
                      required
                      placeholder="e.g. Sham Valley, Zanskar..."
                      className="mt-2 w-full bg-zinc-900 border border-amber-500/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                      data-ocid="parcel.from_custom_input"
                    />
                  )}
                </div>

                {/* Destination To */}
                <div>
                  <label
                    htmlFor="parcel-to"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    Destination (To) *
                  </label>
                  <select
                    id="parcel-to"
                    value={form.toSelect}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        toSelect: e.target.value,
                        toCustom: "",
                      }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.to_select"
                  >
                    <option value="">Select destination</option>
                    {LADAKH_PLACES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="__other__">Other (type your own)</option>
                  </select>
                  {isToOther && (
                    <input
                      type="text"
                      value={form.toCustom}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, toCustom: e.target.value }))
                      }
                      required
                      placeholder="e.g. Sham Valley, Zanskar..."
                      className="mt-2 w-full bg-zinc-900 border border-amber-500/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                      data-ocid="parcel.to_custom_input"
                    />
                  )}
                </div>

                {/* Travel Date */}
                <div>
                  <label
                    htmlFor="parcel-date"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    Travel Date *
                  </label>
                  <input
                    id="parcel-date"
                    type="date"
                    value={form.travelDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, travelDate: e.target.value }))
                    }
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.input"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label
                    htmlFor="parcel-capacity"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    How many packages can you carry? (1–10) *
                  </label>
                  <input
                    id="parcel-capacity"
                    type="number"
                    min={1}
                    max={10}
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        capacity: Math.min(
                          10,
                          Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                        ),
                      }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.input"
                  />
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Set how many separate packages you can take along.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="parcel-phone"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    Your Phone Number *
                  </label>
                  <input
                    id="parcel-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.input"
                  />
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Senders will call you directly on this number.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm text-black btn-glow"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(72% 0.17 55), oklch(62% 0.19 42))",
                  }}
                  data-ocid="parcel.submit_button"
                >
                  {editingTrip ? "Update Trip" : "Post Trip"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
