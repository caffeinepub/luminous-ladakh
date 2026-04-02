import { useState } from "react";
import { toast } from "sonner";

interface TripLocation {
  id: string;
  name: string;
  category: string;
  photo?: string;
}

interface TripDay {
  day: number;
  locations: TripLocation[];
}

interface Trip {
  id: string;
  name: string;
  days: TripDay[];
  createdAt: string;
}

const LOCATIONS_QUICK = [
  {
    id: "m1",
    name: "Thiksey Monastery",
    category: "Monasteries",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Thikse_Monastery_.jpg/640px-Thikse_Monastery_.jpg",
  },
  {
    id: "m2",
    name: "Diskit Monastery",
    category: "Monasteries",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Diskit_Gompa_2.jpg/640px-Diskit_Gompa_2.jpg",
  },
  {
    id: "m3",
    name: "Lamayuru Monastery",
    category: "Monasteries",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lamayuru_Monastery%2C_Ladakh%2C_India.jpg/640px-Lamayuru_Monastery%2C_Ladakh%2C_India.jpg",
  },
  {
    id: "m4",
    name: "Spituk Monastery",
    category: "Monasteries",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Spituk.jpg/640px-Spituk.jpg",
  },
  {
    id: "m5",
    name: "Shey Monastery & Palace",
    category: "Monasteries",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Shey_Palace%2C_Ladakh_01.jpg/640px-Shey_Palace%2C_Ladakh_01.jpg",
  },
  {
    id: "m6",
    name: "Alchi Monastery",
    category: "Monasteries",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Alchi.jpg/640px-Alchi.jpg",
  },
  {
    id: "t1",
    name: "Namgyal Tsemo Temple",
    category: "Temples",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Namgyal_Tsemo_Monastery%2C_Leh_01.jpg/640px-Namgyal_Tsemo_Monastery%2C_Leh_01.jpg",
  },
  { id: "t2", name: "Stok Guru Lhakhang", category: "Temples" },
  {
    id: "t3",
    name: "Leh Jama Masjid",
    category: "Temples",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Leh_mosque_and_palace.jpg/640px-Leh_mosque_and_palace.jpg",
  },
  {
    id: "p1",
    name: "Pangong Lake",
    category: "Parks",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Pangong_tso.jpg/640px-Pangong_tso.jpg",
  },
  {
    id: "p2",
    name: "Nubra Valley",
    category: "Parks",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Nubra_Valley_2.jpg/640px-Nubra_Valley_2.jpg",
  },
  { id: "p3", name: "Hemis National Park", category: "Parks" },
  { id: "h1", name: "SNM Hospital Leh", category: "Hospitals" },
  { id: "s1", name: "Jawahar Navodaya Vidyalaya", category: "Schools" },
  { id: "s2", name: "Druk White Lotus School", category: "Schools" },
  { id: "e1", name: "Leh Police Station", category: "Emergency" },
  { id: "b1", name: "SBI Leh", category: "Banks/ATMs" },
];

function loadTrips(userId: string): Trip[] {
  try {
    return JSON.parse(localStorage.getItem(`lc_trips_${userId}`) || "[]");
  } catch {
    return [];
  }
}

function saveTrips(userId: string, trips: Trip[]) {
  try {
    localStorage.setItem(`lc_trips_${userId}`, JSON.stringify(trips));
  } catch {}
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface Props {
  currentUserId: string;
}

export function TripPlannerTab({ currentUserId }: Props) {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips(currentUserId));
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [showLocPicker, setShowLocPicker] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState("");

  function createTrip() {
    if (!newTripName.trim()) return;
    const trip: Trip = {
      id: generateId(),
      name: newTripName.trim(),
      days: [{ day: 1, locations: [] }],
      createdAt: new Date().toISOString(),
    };
    const updated = [...trips, trip];
    setTrips(updated);
    saveTrips(currentUserId, updated);
    setActiveTrip(trip);
    setCreating(false);
    setNewTripName("");
    toast.success("Trip created!");
  }

  function deleteTrip(id: string) {
    if (!window.confirm("Delete this trip?")) return;
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    saveTrips(currentUserId, updated);
    if (activeTrip?.id === id) setActiveTrip(null);
    toast.success("Trip deleted.");
  }

  function addDay(trip: Trip) {
    const updated = {
      ...trip,
      days: [...trip.days, { day: trip.days.length + 1, locations: [] }],
    };
    persistTrip(updated);
  }

  function removeDay(trip: Trip, dayNum: number) {
    if (trip.days.length <= 1) return;
    const updated = {
      ...trip,
      days: trip.days
        .filter((d) => d.day !== dayNum)
        .map((d, i) => ({ ...d, day: i + 1 })),
    };
    persistTrip(updated);
  }

  function addLocationToDay(trip: Trip, dayNum: number, loc: TripLocation) {
    const updated = {
      ...trip,
      days: trip.days.map((d) =>
        d.day === dayNum ? { ...d, locations: [...d.locations, loc] } : d,
      ),
    };
    persistTrip(updated);
    setShowLocPicker(null);
    setSearchQ("");
    toast.success(`Added to Day ${dayNum}`);
  }

  function removeLocationFromDay(trip: Trip, dayNum: number, locIdx: number) {
    const updated = {
      ...trip,
      days: trip.days.map((d) =>
        d.day === dayNum
          ? { ...d, locations: d.locations.filter((_, i) => i !== locIdx) }
          : d,
      ),
    };
    persistTrip(updated);
  }

  function persistTrip(trip: Trip) {
    const updated = trips.map((t) => (t.id === trip.id ? trip : t));
    setTrips(updated);
    saveTrips(currentUserId, updated);
    setActiveTrip(trip);
  }

  function shareTrip(trip: Trip) {
    const lines = [`🏔️ My Ladakh Trip: ${trip.name}\n`];
    for (const day of trip.days) {
      lines.push(`Day ${day.day}:`);
      if (day.locations.length === 0) {
        lines.push("  (no locations yet)");
      } else {
        for (const loc of day.locations) {
          lines.push(`  • ${loc.name} (${loc.category})`);
        }
      }
    }
    lines.push("\n📍 Planned with Ladakh Connect");
    const text = lines.join("\n");
    if (navigator.share) {
      navigator.share({ title: `Ladakh Trip: ${trip.name}`, text });
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success("Trip copied to clipboard!"));
    }
  }

  const filteredLocs = LOCATIONS_QUICK.filter((l) =>
    l.name.toLowerCase().includes(searchQ.toLowerCase()),
  );

  if (activeTrip) {
    const trip = trips.find((t) => t.id === activeTrip.id) || activeTrip;
    return (
      <div className="fade-in">
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setActiveTrip(null)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            data-ocid="trip.back.button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M11 14L7 9l4-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{trip.name}</h2>
            <p className="text-xs text-zinc-500">
              {trip.days.length} day{trip.days.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => shareTrip(trip)}
            data-ocid="trip.share.button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            Share
          </button>
        </div>

        <div className="space-y-4">
          {trip.days.map((day) => (
            <div
              key={day.day}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-amber-400">Day {day.day}</h3>
                {trip.days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(trip, day.day)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                  >
                    Remove day
                  </button>
                )}
              </div>

              {day.locations.length === 0 ? (
                <p className="text-zinc-600 text-sm italic mb-3">
                  No locations added yet
                </p>
              ) : (
                <div className="space-y-2 mb-3">
                  {day.locations.map((loc, idx) => (
                    <div
                      key={`${day.day}-${String(idx)}`}
                      className="flex items-center gap-3 bg-zinc-800 rounded-xl px-3 py-2.5"
                      data-ocid={`trip.location.item.${idx + 1}`}
                    >
                      {loc.photo ? (
                        <img
                          src={loc.photo}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-zinc-400 text-sm">
                            place
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {loc.name}
                        </p>
                        <p className="text-xs text-zinc-500">{loc.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeLocationFromDay(trip, day.day, idx)
                        }
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                        aria-label="Remove"
                      >
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showLocPicker === day.day ? (
                <div className="bg-zinc-800 rounded-xl p-3">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 mb-2"
                    data-ocid="trip.search.input"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredLocs.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => addLocationToDay(trip, day.day, loc)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-700 text-sm text-zinc-200 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-zinc-400 text-sm">
                          add_location
                        </span>
                        <span>{loc.name}</span>
                        <span className="text-xs text-zinc-500 ml-auto">
                          {loc.category}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLocPicker(null);
                      setSearchQ("");
                    }}
                    className="mt-2 w-full text-xs text-zinc-500 hover:text-zinc-300 py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLocPicker(day.day)}
                  data-ocid="trip.add.button"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500/50 text-zinc-500 hover:text-amber-400 text-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add location
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addDay(trip)}
          data-ocid="trip.add_day.button"
          className="mt-4 w-full py-3 rounded-xl border border-zinc-700 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Day
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white mb-1">Trip Planner</h2>
        <p className="text-zinc-500 text-sm">
          Build your perfect Ladakh itinerary
        </p>
      </div>

      {creating ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-zinc-300 mb-3">
            Name your trip
          </p>
          <input
            type="text"
            placeholder="e.g. Ladakh Summer Adventure 2026"
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTrip()}
            className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 mb-3"
            data-ocid="trip.name.input"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setNewTripName("");
              }}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm hover:bg-zinc-700 transition-colors"
              data-ocid="trip.cancel.button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createTrip}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
              data-ocid="trip.create.button"
            >
              Create Trip
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          data-ocid="trip.new.button"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-semibold hover:bg-amber-500/20 transition-colors mb-4"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Plan a New Trip
        </button>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-12" data-ocid="trip.empty_state">
          <span className="material-symbols-outlined text-5xl text-zinc-700 block mb-3">
            luggage
          </span>
          <p className="text-zinc-500">No trips planned yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Create your first Ladakh itinerary above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip, i) => (
            <div
              key={trip.id}
              data-ocid={`trip.item.${i + 1}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-white">{trip.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {trip.days.length} day{trip.days.length !== 1 ? "s" : ""} ·{" "}
                    {trip.days.reduce((s, d) => s + d.locations.length, 0)}{" "}
                    locations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTrip(trip.id)}
                  className="text-zinc-700 hover:text-red-400 transition-colors p-1"
                  aria-label="Delete trip"
                  data-ocid={`trip.delete_button.${i + 1}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    delete
                  </span>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTrip(trip)}
                  data-ocid={`trip.edit_button.${i + 1}`}
                  className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  View & Edit
                </button>
                <button
                  type="button"
                  onClick={() => shareTrip(trip)}
                  className="flex-1 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold transition-colors"
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
