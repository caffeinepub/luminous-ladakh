import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Account, Post, Review, RoomRental } from "../../types";

const PRELOADED_NAMES = [
  "Thiksey Monastery",
  "Diskit Monastery",
  "Lamayuru Monastery",
  "Spituk Monastery",
  "Shey Monastery",
  "Alchi Monastery",
  "Namgyal Tsemo Temple",
  "Stok Guru Lhakhang",
  "Leh Jama Masjid",
  "Pangong Lake",
  "Nubra Valley",
  "Hemis National Park",
  "SNM Hospital Leh",
  "SDRRF Hospital",
  "Kargil District Hospital",
  "Jawahar Navodaya Vidyalaya",
  "Druk White Lotus School",
  "Leh Police Station",
  "Kargil Police Station",
  "State Bank of India - Leh",
  "J&K Bank - Leh",
  "Punjab National Bank - Kargil",
];

const inputCls =
  "w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-4 py-3 pl-10 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors";

interface Props {
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  currentUserId: string;
  currentUserRole: string;
  onAddReview: (r: Omit<Review, "id" | "timestamp">) => void;
}

export function SearchTab({
  accounts,
  posts,
  reviews: _reviews,
  currentUserId: _currentUserId,
  currentUserRole: _currentUserRole,
  onAddReview: _onAddReview,
}: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();
  const members = accounts.filter(
    (a) => a.role === "member" && a.status !== "banned",
  );
  const approvedPosts = posts.filter((p) => p.status === "approved");

  const roomRentals: RoomRental[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("lc_room_rentals") || "[]");
    } catch {
      return [];
    }
  })();
  const activeRooms = roomRentals.filter(
    (r) => r.status === "active" && new Date(r.expiresAt) > new Date(),
  );

  const matchedLocations = q
    ? PRELOADED_NAMES.filter((n) => n.toLowerCase().includes(q))
    : [];

  const matchedBusinesses = q
    ? members.filter((m) => {
        const businesses = m.businesses || [];
        if (businesses.length > 0) {
          return businesses.some(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              b.category.toLowerCase().includes(q) ||
              b.description.toLowerCase().includes(q),
          );
        }
        return (
          (m.businessName || "").toLowerCase().includes(q) ||
          (m.businessCategory || "").toLowerCase().includes(q)
        );
      })
    : [];

  const matchedPosts = q
    ? approvedPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.locationName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    : [];

  const matchedRooms = q
    ? activeRooms.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.postedByUsername.toLowerCase().includes(q),
      )
    : [];

  const matchedMembers = q
    ? members.filter(
        (m) =>
          m.username.toLowerCase().includes(q) ||
          (m.bio || "").toLowerCase().includes(q),
      )
    : [];

  const hasResults =
    matchedLocations.length +
      matchedBusinesses.length +
      matchedPosts.length +
      matchedRooms.length +
      matchedMembers.length >
    0;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        {t("searchTitle", "Search")}
      </h2>
      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
          search
        </span>
        <input
          className={inputCls}
          placeholder={t(
            "searchPlaceholder",
            "Search locations, businesses, places...",
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {!query && (
        <div className="text-center py-12 text-zinc-500">
          <span className="material-symbols-outlined text-5xl block mb-3">
            travel_explore
          </span>
          <p className="font-semibold">{t("searchTitle", "Search Ladakh")}</p>
          <p className="text-xs mt-1">
            {t(
              "searchPlaceholder",
              "Locations, businesses, and community discoveries",
            )}
          </p>
        </div>
      )}

      {query && !hasResults && (
        <div className="text-center py-12 text-zinc-500">
          <span className="material-symbols-outlined text-5xl block mb-3">
            search_off
          </span>
          <p className="font-semibold">
            {t("noResults", "No results for")} "{query}"
          </p>
        </div>
      )}

      {matchedLocations.length > 0 && (
        <section className="mb-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">
            {t("explore", "Locations")} ({matchedLocations.length})
          </h3>
          <div className="space-y-2">
            {matchedLocations.map((name) => (
              <div
                key={name}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-amber-400 text-xl">
                  landscape
                </span>
                <p className="font-semibold text-sm text-white">{name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {matchedBusinesses.length > 0 && (
        <section className="mb-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">
            {t("myBusinesses", "Businesses")} ({matchedBusinesses.length})
          </h3>
          <div className="space-y-2">
            {matchedBusinesses.map((m) => {
              const biz = m.businesses?.[0];
              const name = biz?.name || m.businessName || "";
              const cat = biz?.category || m.businessCategory || "";
              const photo = biz?.photos?.[0] || "";
              return (
                <div
                  key={m.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-blue-400 text-xl">
                      store
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">{name}</p>
                    <p className="text-xs text-zinc-500">
                      {cat} · @{m.username}
                    </p>
                  </div>
                  {biz?.mapsUrl && (
                    <a
                      href={biz.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-400 flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">
                        directions
                      </span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {matchedPosts.length > 0 && (
        <section className="mb-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">
            {t("discover", "Discoveries")} ({matchedPosts.length})
          </h3>
          <div className="space-y-2">
            {matchedPosts.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-green-400 text-xl">
                  explore
                </span>
                <div>
                  <p className="font-semibold text-sm text-white">{p.title}</p>
                  <p className="text-xs text-zinc-500">
                    {p.locationName} · {p.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {matchedRooms.length > 0 && (
        <section className="mb-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">
            Room Rentals ({matchedRooms.length})
          </h3>
          <div className="space-y-2">
            {matchedRooms.map((r) => (
              <div
                key={r.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-sky-400 text-xl">
                  meeting_room
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">{r.title}</p>
                  <p className="text-xs text-zinc-500">
                    {r.location} · ₹{r.pricePerNight.toLocaleString()}/night · @
                    {r.postedByUsername}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {matchedMembers.length > 0 && (
        <section className="mb-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">
            Members ({matchedMembers.length})
          </h3>
          <div className="space-y-2">
            {matchedMembers.map((m) => (
              <div
                key={m.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3"
              >
                {m.profilePhoto ? (
                  <img
                    src={m.profilePhoto}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-sm text-blue-400">
                      {m.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">
                    @{m.username}
                  </p>
                  {m.bio && (
                    <p className="text-xs text-zinc-500 truncate">{m.bio}</p>
                  )}
                  <p className="text-[10px] text-zinc-600 capitalize">
                    {m.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
