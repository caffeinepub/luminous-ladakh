import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// Fix Leaflet default icon paths in Vite/React builds
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// ─── Icon factory ──────────────────────────────────────────────────────────
function createColoredIcon(color: string, opacity = 1, size = 14) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      opacity: ${opacity};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

const blueIcon = createColoredIcon("#3b82f6");
const blueFadedIcon = createColoredIcon("#3b82f6", 0.55, 12);
const greyIcon = createColoredIcon("#6b7280", 0.6);

// ─── Static data ───────────────────────────────────────────────────────────
interface LadakhLocation {
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
}

const LADAKH_LOCATIONS: LadakhLocation[] = [
  {
    name: "Pangong Lake",
    category: "Lake",
    lat: 33.7836,
    lng: 78.6429,
    description: "Stunning high-altitude saltwater lake stretching into Tibet.",
  },
  {
    name: "Nubra Valley",
    category: "Valley",
    lat: 34.667,
    lng: 77.558,
    description:
      "Scenic valley between Ladakh and Karakoram ranges with sand dunes.",
  },
  {
    name: "Leh Palace",
    category: "Heritage",
    lat: 34.1642,
    lng: 77.5848,
    description: "Historic 17th-century royal palace overlooking Leh city.",
  },
  {
    name: "Hemis Monastery",
    category: "Monastery",
    lat: 33.92,
    lng: 77.6991,
    description: "Largest monastery in Ladakh, home to the Hemis Festival.",
  },
  {
    name: "Lamayuru Monastery",
    category: "Monastery",
    lat: 34.2722,
    lng: 76.7728,
    description:
      "One of the oldest monasteries in Ladakh set on a dramatic moonscape.",
  },
  {
    name: "Magnetic Hill",
    category: "Attraction",
    lat: 34.2117,
    lng: 77.3661,
    description: "Mysterious hill where vehicles appear to move uphill on own.",
  },
  {
    name: "Khardung La Pass",
    category: "Pass",
    lat: 34.2751,
    lng: 77.6029,
    description: "One of the highest motorable passes in the world at 5,359m.",
  },
  {
    name: "Chang La Pass",
    category: "Pass",
    lat: 34.0561,
    lng: 77.87,
    description: "High mountain pass at 5,360m on the way to Pangong Lake.",
  },
  {
    name: "Zoji La Pass",
    category: "Pass",
    lat: 34.2072,
    lng: 75.4761,
    description: "Strategic mountain pass connecting Kashmir to Ladakh.",
  },
  {
    name: "Tso Moriri Lake",
    category: "Lake",
    lat: 32.876,
    lng: 78.321,
    description:
      "Remote Ramsar-listed high-altitude lake teeming with wildlife.",
  },
  {
    name: "Diskit Monastery",
    category: "Monastery",
    lat: 34.6122,
    lng: 77.571,
    description:
      "Oldest and largest monastery in Nubra Valley with giant Maitreya Buddha.",
  },
  {
    name: "Shanti Stupa",
    category: "Heritage",
    lat: 34.1588,
    lng: 77.5713,
    description: "White-domed Buddhist stupa offering panoramic views of Leh.",
  },
  {
    name: "Leh Bazaar",
    category: "Market",
    lat: 34.1671,
    lng: 77.5838,
    description:
      "Vibrant main market of Leh with local handicrafts and Tibetan goods.",
  },
  {
    name: "Alchi Monastery",
    category: "Monastery",
    lat: 34.2271,
    lng: 76.9211,
    description:
      "Ancient monastery on the Indus banks with exquisite 11th-century murals.",
  },
  {
    name: "Dah Hanu Village",
    category: "Village",
    lat: 34.56,
    lng: 76.34,
    description:
      "Remote Aryan village preserving ancient culture along the Indus river.",
  },
];

const RESTRICTED_ZONES = [
  { lat: 34.375, lng: 77.1 },
  { lat: 34.5, lng: 77.85 },
  { lat: 33.5, lng: 78.9 },
];

const LEH_CENTER: [number, number] = [34.1526, 77.5771];
const MAP_REFRESH_KEY = "lc_map_last_refresh";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// ─── Types ─────────────────────────────────────────────────────────────────
interface BusinessPin {
  name: string;
  type: string;
  username: string;
  lat: number;
  lng: number;
}

interface TodaysPostPin {
  title: string;
  content: string;
  username: string;
  createdAt: number;
  lat: number;
  lng: number;
}

type PinKind = "location" | "business" | "todays_post" | "restricted";

interface ActivePin {
  kind: PinKind;
  lat: number;
  lng: number;
  // location
  locName?: string;
  locCategory?: string;
  locDescription?: string;
  // business
  bizName?: string;
  bizType?: string;
  bizUsername?: string;
  // today's post
  postTitle?: string;
  postContent?: string;
  postUsername?: string;
  postCreatedAt?: number;
}

interface Props {
  currentUser: { id: string; username: string; role: string };
  onTabChange?: (tab: string) => void;
}

// ─── Helper components ─────────────────────────────────────────────────────

/** Closes the active popup when user clicks on the map background */
function MapClickClear({
  onClear,
}: {
  onClear: () => void;
}) {
  useMapEvents({
    click() {
      onClear();
    },
  });
  return null;
}

function getTimeSinceRefresh(ts: number | null): string {
  if (!ts) return "Never refreshed";
  const diffMs = Date.now() - ts;
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return "Updated just now";
  if (diffHours < 24) return `Updated ${Math.floor(diffHours)}h ago`;
  const days = Math.floor(diffHours / 24);
  return `Updated ${days} day${days > 1 ? "s" : ""} ago`;
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

// ─── Main Map component ────────────────────────────────────────────────────
export function LadakhMapTab({
  currentUser: _currentUser,
  onTabChange,
}: Props) {
  const [lastRefresh, setLastRefresh] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(MAP_REFRESH_KEY);
      return stored ? Number.parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activePin, setActivePin] = useState<ActivePin | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-refresh once per day when online
  useEffect(() => {
    if (!isOnline) return;
    const now = Date.now();
    const diff = lastRefresh ? now - lastRefresh : Number.POSITIVE_INFINITY;
    if (diff > ONE_DAY_MS) {
      const ts = now;
      localStorage.setItem(MAP_REFRESH_KEY, String(ts));
      setLastRefresh(ts);
    }
  }, [isOnline, lastRefresh]);

  function handleManualRefresh() {
    if (!isOnline) return;
    const ts = Date.now();
    localStorage.setItem(MAP_REFRESH_KEY, String(ts));
    setLastRefresh(ts);
  }

  // Read business pins from localStorage
  const businessPins: BusinessPin[] = useMemo(() => {
    try {
      const raw = localStorage.getItem("lc_accounts");
      if (!raw) return [];
      const accounts: any[] = JSON.parse(raw);
      const pins: BusinessPin[] = [];
      for (const acc of accounts) {
        if (acc.role !== "member") continue;
        const bizList: any[] = Array.isArray(acc.businesses)
          ? acc.businesses
          : [];
        for (const biz of bizList) {
          if (
            typeof biz.lat === "number" &&
            typeof biz.lng === "number" &&
            biz.locationStatus !== "pending_review"
          ) {
            pins.push({
              name: biz.name || "Business",
              type: biz.businessType || biz.category || "Business",
              username: acc.username || "?",
              lat: biz.lat,
              lng: biz.lng,
            });
          }
        }
      }
      return pins;
    } catch {
      return [];
    }
  }, []);

  // Read Today's Post pins from localStorage — only posts within 24h
  const todaysPostPins: TodaysPostPin[] = useMemo(() => {
    try {
      const raw = localStorage.getItem("lc_posts");
      if (!raw) return [];
      const posts: any[] = JSON.parse(raw);
      const cutoff = Date.now() - ONE_DAY_MS;
      return posts
        .filter(
          (p) =>
            typeof p.lat === "number" &&
            typeof p.lng === "number" &&
            p.status === "approved" &&
            typeof p.createdAt === "number" &&
            p.createdAt > cutoff,
        )
        .map((p) => ({
          title: p.title || p.locationName || "Today's Post",
          content: p.content || p.description || "",
          username: p.username || "user",
          createdAt: p.createdAt,
          lat: p.lat,
          lng: p.lng,
        }));
    } catch {
      return [];
    }
  }, []);

  const refreshLabel = getTimeSinceRefresh(lastRefresh);

  // Derive the business tab name from type
  function bizTabFromType(type: string): string {
    const t = type.toLowerCase();
    if (t.includes("hotel")) return "hotels";
    if (t.includes("restaurant") || t.includes("food")) return "restaurants";
    if (t.includes("rental") || t.includes("vehicle")) return "rentals";
    if (t.includes("shop") || t.includes("store")) return "shop";
    return "explore";
  }

  return (
    <div className="fade-in relative" data-ocid="map.section">
      {/* Header bar */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Ladakh Map</h2>
          <p className="text-xs text-zinc-500">
            Offline-first · Powered by OpenStreetMap
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={!isOnline}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          data-ocid="map.button"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Offline notice */}
      {!isOnline && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700">
          <span className="material-symbols-outlined text-amber-400 text-base">
            wifi_off
          </span>
          <p className="text-xs text-zinc-400">
            Offline mode — map data is cached on your device.
          </p>
        </div>
      )}

      {/* Map container */}
      <div
        className="rounded-2xl overflow-hidden border border-zinc-700 relative"
        style={{
          height: "calc(100vh - 320px)",
          minHeight: "400px",
          boxShadow:
            "0 0 30px oklch(0% 0 0 / 0.5), 0 0 0 1px oklch(28% 0.02 30)",
        }}
        data-ocid="map.canvas_target"
      >
        <MapContainer
          center={LEH_CENTER}
          zoom={10}
          style={{ height: "100%", width: "100%", background: "#1a1a2e" }}
          zoomControl
          attributionControl
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={18}
            keepBuffer={4}
          />

          {/* Clear active pin when clicking map background */}
          <MapClickClear onClear={() => setActivePin(null)} />

          {/* ── Explore location pins (blue) ─────────────────────── */}
          {LADAKH_LOCATIONS.map((loc) => (
            <Marker
              key={`loc-${loc.name}`}
              position={[loc.lat, loc.lng]}
              icon={blueIcon}
              eventHandlers={{
                click(e) {
                  L.DomEvent.stopPropagation(e);
                  setActivePin({
                    kind: "location",
                    lat: loc.lat,
                    lng: loc.lng,
                    locName: loc.name,
                    locCategory: loc.category,
                    locDescription: loc.description,
                  });
                },
              }}
            />
          ))}

          {/* ── Military / restricted zones (grey, unnamed) ────────── */}
          {RESTRICTED_ZONES.map((zone) => (
            <Marker
              key={`restricted-${zone.lat}-${zone.lng}`}
              position={[zone.lat, zone.lng]}
              icon={greyIcon}
              eventHandlers={{
                click(e) {
                  L.DomEvent.stopPropagation(e);
                  setActivePin({
                    kind: "restricted",
                    lat: zone.lat,
                    lng: zone.lng,
                  });
                },
              }}
            />
          ))}

          {/* ── Business pins (blue — same as locations) ─────────── */}
          {businessPins.map((biz, i) => (
            <Marker
              key={`biz-${biz.lat}-${biz.lng}-${i}`}
              position={[biz.lat, biz.lng]}
              icon={blueIcon}
              eventHandlers={{
                click(e) {
                  L.DomEvent.stopPropagation(e);
                  setActivePin({
                    kind: "business",
                    lat: biz.lat,
                    lng: biz.lng,
                    bizName: biz.name,
                    bizType: biz.type,
                    bizUsername: biz.username,
                  });
                },
              }}
            />
          ))}

          {/* ── Today's Post pins (blue faded — 24h only) ───────── */}
          {todaysPostPins.map((post, i) => (
            <Marker
              key={`post-${post.lat}-${post.lng}-${i}`}
              position={[post.lat, post.lng]}
              icon={blueFadedIcon}
              eventHandlers={{
                click(e) {
                  L.DomEvent.stopPropagation(e);
                  setActivePin({
                    kind: "todays_post",
                    lat: post.lat,
                    lng: post.lng,
                    postTitle: post.title,
                    postContent: post.content,
                    postUsername: post.username,
                    postCreatedAt: post.createdAt,
                  });
                },
              }}
            />
          ))}
        </MapContainer>

        {/* ── Custom glassmorphism popup ─────────────────────────── */}
        {activePin && (
          <div
            ref={popupRef}
            className="absolute bottom-4 left-4 right-4 z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ pointerEvents: "all" }}
          >
            <div
              style={{
                background: "rgba(15, 15, 20, 0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "16px",
                padding: "14px 14px 12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setActivePin(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                aria-label="Close"
                data-ocid="map.popup_close"
              >
                <span className="material-symbols-outlined text-sm text-zinc-400">
                  close
                </span>
              </button>

              {/* ── Location popup ──────────────────────────── */}
              {activePin.kind === "location" && (
                <>
                  <div className="pr-8 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
                        {activePin.locCategory}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {activePin.locName}
                    </h3>
                    {activePin.locDescription && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {activePin.locDescription}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activePin.lat},${activePin.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                      data-ocid="map.get_directions"
                    >
                      <span className="material-symbols-outlined text-sm">
                        directions
                      </span>
                      Get Directions
                    </a>
                    {onTabChange && (
                      <button
                        type="button"
                        onClick={() => {
                          onTabChange("explore");
                          setActivePin(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
                        data-ocid="map.explore_location"
                      >
                        <span className="material-symbols-outlined text-sm">
                          explore
                        </span>
                        Explore
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── Business popup ──────────────────────────── */}
              {activePin.kind === "business" && (
                <>
                  <div className="pr-8 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold capitalize">
                        {activePin.bizType}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {activePin.bizName}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      @{activePin.bizUsername}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activePin.lat},${activePin.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                      data-ocid="map.biz_directions"
                    >
                      <span className="material-symbols-outlined text-sm">
                        directions
                      </span>
                      Get Directions
                    </a>
                    {onTabChange && (
                      <button
                        type="button"
                        onClick={() => {
                          onTabChange(bizTabFromType(activePin.bizType ?? ""));
                          setActivePin(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
                        data-ocid="map.view_business"
                      >
                        <span className="material-symbols-outlined text-sm">
                          storefront
                        </span>
                        View Business
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── Today's Post popup ──────────────────────── */}
              {activePin.kind === "todays_post" && (
                <>
                  <div className="pr-8 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 opacity-60 flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                        Today's Post
                      </span>
                      {activePin.postCreatedAt && (
                        <span className="text-[10px] text-zinc-500 ml-auto">
                          {timeAgo(activePin.postCreatedAt)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {activePin.postTitle}
                    </h3>
                    {activePin.postContent && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {activePin.postContent}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1">
                      Posted by @{activePin.postUsername}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activePin.lat},${activePin.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                      data-ocid="map.post_directions"
                    >
                      <span className="material-symbols-outlined text-sm">
                        directions
                      </span>
                      Get Directions
                    </a>
                  </div>
                </>
              )}

              {/* ── Restricted / unnamed popup ───────────────── */}
              {activePin.kind === "restricted" && (
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 flex-shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                      Restricted Area
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-400">Unnamed</h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    No details available for this area.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend + refresh status */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Location / Business</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 opacity-50 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Today's Post (24h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-500 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Restricted Area</span>
          </div>
        </div>
        <span className="text-xs text-zinc-600">{refreshLabel}</span>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-blue-400">
            {LADAKH_LOCATIONS.length}
          </p>
          <p className="text-[10px] text-zinc-500">Locations</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-blue-400">
            {businessPins.length}
          </p>
          <p className="text-[10px] text-zinc-500">Businesses</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-blue-400">
            {todaysPostPins.length}
          </p>
          <p className="text-[10px] text-zinc-500">Today's Posts</p>
        </div>
      </div>
    </div>
  );
}
