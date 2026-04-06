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
  canCarry: string;
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
const CARRY_OPTIONS = [
  "Small items (under 2kg)",
  "Documents only",
  "Medium box (under 10kg)",
  "Any parcel size",
];

function getTrips(): ParcelTrip[] {
  try {
    return JSON.parse(localStorage.getItem("lc_parcel_trips") || "[]");
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

export function ParcelConnectTab({ currentUser }: { currentUser: Account }) {
  const [trips, setTrips] = useState<ParcelTrip[]>(() =>
    getTrips().filter((t) => t.status === "active"),
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    from: "",
    to: "",
    travelDate: "",
    canCarry: "",
    phone: "",
  });
  const [filter, setFilter] = useState("");

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.from ||
      !form.to ||
      !form.travelDate ||
      !form.canCarry ||
      !form.phone
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    const trip: ParcelTrip = {
      id: Math.random().toString(36).slice(2),
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      ...form,
      postedAt: new Date().toISOString(),
      status: "active",
    };
    const all = getTrips();
    all.unshift(trip);
    saveTrips(all);
    setTrips(all.filter((t) => t.status === "active"));
    setShowForm(false);
    setForm({ from: "", to: "", travelDate: "", canCarry: "", phone: "" });
    toast.success("Trip posted! Travellers can now contact you.");
  }

  const filtered = filter
    ? trips.filter(
        (t) =>
          t.from.toLowerCase().includes(filter.toLowerCase()) ||
          t.to.toLowerCase().includes(filter.toLowerCase()),
      )
    : trips;

  const ROLE_COLORS: Record<string, string> = {
    user: "text-sky-400",
    member: "text-blue-400",
    community: "text-purple-400",
    creator: "text-amber-400",
  };

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
        <div className="flex items-center gap-3 mb-2">
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
        <p className="text-xs text-zinc-400 mb-4">
          Someone travelling your way? Ask them to carry your parcel —
          completely free, no payment, just community spirit.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-all active:scale-95 btn-glow"
          style={{
            background:
              "linear-gradient(135deg, oklch(72% 0.17 55), oklch(62% 0.19 42))",
          }}
          data-ocid="parcel.open_modal_button"
        >
          + Post My Trip
        </button>
      </div>

      {/* Search filter */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
          search
        </span>
        <input
          type="text"
          placeholder="Search by destination..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
          data-ocid="parcel.search_input"
        />
      </div>

      {/* Trips list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-300">
            {filtered.length} traveller{filtered.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12" data-ocid="parcel.empty_state">
            <span className="material-symbols-outlined text-5xl text-zinc-700">
              route
            </span>
            <p className="text-zinc-500 mt-2 text-sm">No trips posted yet.</p>
            <p className="text-zinc-600 text-xs mt-1">
              Be the first to post your travel route!
            </p>
          </div>
        ) : (
          filtered.map((trip, idx) => (
            <div
              key={trip.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 glass-card"
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
                <span className="text-xs text-zinc-600">
                  {timeAgo(trip.postedAt)}
                </span>
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
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    inventory_2
                  </span>
                  {trip.canCarry}
                </span>
              </div>
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
            </div>
          ))
        )}
      </div>

      {/* Post form modal */}
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
                  <h3 className="font-bold text-white">Post Your Trip</h3>
                  <p className="text-xs text-zinc-400">
                    Let others know you&apos;re travelling
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
              <form onSubmit={handlePost} className="space-y-3">
                <div>
                  <label
                    htmlFor="parcel-from"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    Travelling From *
                  </label>
                  <select
                    id="parcel-from"
                    value={form.from}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, from: e.target.value }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.select"
                  >
                    <option value="">Select location</option>
                    {LADAKH_PLACES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="parcel-to"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    Destination (To) *
                  </label>
                  <select
                    id="parcel-to"
                    value={form.to}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, to: e.target.value }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.select"
                  >
                    <option value="">Select destination</option>
                    {LADAKH_PLACES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div>
                  <label
                    htmlFor="parcel-carry"
                    className="text-xs text-zinc-400 mb-1 block"
                  >
                    What can you carry? *
                  </label>
                  <select
                    id="parcel-carry"
                    value={form.canCarry}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, canCarry: e.target.value }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    data-ocid="parcel.select"
                  >
                    <option value="">Select parcel size</option>
                    {CARRY_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
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
                    This will be shown to senders so they can contact you.
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
                  Post Trip
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
