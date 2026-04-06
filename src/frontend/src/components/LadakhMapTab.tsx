import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Fix Leaflet default icon paths in Vite/React builds
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Custom colored icon factory
function createColoredIcon(color: string, opacity = 1) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      opacity: ${opacity};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const blueIcon = createColoredIcon("#3b82f6");
const amberIcon = createColoredIcon("#f59e0b");
const greenIcon = createColoredIcon("#22c55e");
const greyIcon = createColoredIcon("#6b7280", 0.6);

// Hardcoded Ladakh locations
const LADAKH_LOCATIONS = [
  { name: "Pangong Lake", category: "Lake", lat: 33.7836, lng: 78.6429 },
  { name: "Nubra Valley", category: "Valley", lat: 34.667, lng: 77.558 },
  { name: "Leh Palace", category: "Heritage", lat: 34.1642, lng: 77.5848 },
  { name: "Hemis Monastery", category: "Monastery", lat: 33.92, lng: 77.6991 },
  {
    name: "Lamayuru Monastery",
    category: "Monastery",
    lat: 34.2722,
    lng: 76.7728,
  },
  { name: "Magnetic Hill", category: "Attraction", lat: 34.2117, lng: 77.3661 },
  { name: "Khardung La Pass", category: "Pass", lat: 34.2751, lng: 77.6029 },
  { name: "Chang La Pass", category: "Pass", lat: 34.0561, lng: 77.87 },
  { name: "Zoji La Pass", category: "Pass", lat: 34.2072, lng: 75.4761 },
  { name: "Tso Moriri Lake", category: "Lake", lat: 32.876, lng: 78.321 },
  {
    name: "Diskit Monastery",
    category: "Monastery",
    lat: 34.6122,
    lng: 77.571,
  },
  { name: "Shanti Stupa", category: "Heritage", lat: 34.1588, lng: 77.5713 },
  { name: "Leh Bazaar", category: "Market", lat: 34.1671, lng: 77.5838 },
  {
    name: "Alchi Monastery",
    category: "Monastery",
    lat: 34.2271,
    lng: 76.9211,
  },
  { name: "Dah Hanu Village", category: "Village", lat: 34.56, lng: 76.34 },
];

// Military/restricted zones — show only as "Unnamed" with no details
const RESTRICTED_ZONES = [
  { lat: 34.375, lng: 77.1 },
  { lat: 34.5, lng: 77.85 },
  { lat: 33.5, lng: 78.9 },
];

const LEH_CENTER: [number, number] = [34.1526, 77.5771];
const MAP_REFRESH_KEY = "lc_map_last_refresh";

interface Props {
  currentUser: { id: string; username: string; role: string };
}

interface BusinessPin {
  name: string;
  type: string;
  username: string;
  lat: number;
  lng: number;
}

interface CommunityPin {
  title: string;
  lat: number;
  lng: number;
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

export function LadakhMapTab({ currentUser: _currentUser }: Props) {
  const [lastRefresh, setLastRefresh] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(MAP_REFRESH_KEY);
      return stored ? Number.parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (diff > oneDayMs) {
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

  // Read community post pins from localStorage
  const communityPins: CommunityPin[] = useMemo(() => {
    try {
      const raw = localStorage.getItem("lc_posts");
      if (!raw) return [];
      const posts: any[] = JSON.parse(raw);
      return posts
        .filter(
          (p) =>
            typeof p.lat === "number" &&
            typeof p.lng === "number" &&
            p.status === "approved",
        )
        .map((p) => ({
          title: p.title || p.locationName || "Community Post",
          lat: p.lat,
          lng: p.lng,
        }));
    } catch {
      return [];
    }
  }, []);

  const refreshLabel = getTimeSinceRefresh(lastRefresh);

  return (
    <div className="fade-in" data-ocid="map.section">
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
        className="rounded-2xl overflow-hidden border border-zinc-700"
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

          {/* Explore location pins (blue) */}
          {LADAKH_LOCATIONS.map((loc) => (
            <Marker
              key={`loc-${loc.name}`}
              position={[loc.lat, loc.lng]}
              icon={blueIcon}
            >
              <Popup>
                <div className="text-sm font-bold">{loc.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {loc.category}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Military/restricted zones (grey, unnamed) */}
          {RESTRICTED_ZONES.map((zone) => (
            <Marker
              key={`restricted-${zone.lat}-${zone.lng}`}
              position={[zone.lat, zone.lng]}
              icon={greyIcon}
            >
              <Popup>
                <div className="text-sm font-bold text-gray-500">Unnamed</div>
              </Popup>
            </Marker>
          ))}

          {/* Business pins (amber) */}
          {businessPins.map((biz, i) => (
            <Marker
              key={`biz-${biz.lat}-${biz.lng}-${i}`}
              position={[biz.lat, biz.lng]}
              icon={amberIcon}
            >
              <Popup>
                <div className="text-sm font-bold">{biz.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5 capitalize">
                  {biz.type}
                </div>
                <div className="text-xs text-amber-600 mt-0.5">
                  @{biz.username}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Community post pins (green) */}
          {communityPins.map((post, i) => (
            <Marker
              key={`post-${post.lat}-${post.lng}-${i}`}
              position={[post.lat, post.lng]}
              icon={greenIcon}
            >
              <Popup>
                <div className="text-sm font-bold">{post.title}</div>
                <div className="text-xs text-green-600 mt-0.5">
                  Community Post
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend + refresh status */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Locations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Businesses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Community</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-500 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Unnamed</span>
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
          <p className="text-base font-bold text-amber-400">
            {businessPins.length}
          </p>
          <p className="text-[10px] text-zinc-500">Businesses</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-green-400">
            {communityPins.length}
          </p>
          <p className="text-[10px] text-zinc-500">Posts</p>
        </div>
      </div>
    </div>
  );
}
