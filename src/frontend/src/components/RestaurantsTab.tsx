import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import type { Account, Business, MenuItem } from "../types";

interface DishRating {
  id: string;
  businessId: string;
  menuItemId: string;
  reviewerUserId: string;
  reviewerUsername: string;
  rating: number;
  comment?: string;
  timestamp: string;
}

const LC_DISH_RATINGS_KEY = "lc_dish_ratings";

function loadDishRatings(): DishRating[] {
  try {
    return JSON.parse(localStorage.getItem(LC_DISH_RATINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDishRatings(ratings: DishRating[]) {
  try {
    localStorage.setItem(LC_DISH_RATINGS_KEY, JSON.stringify(ratings));
  } catch {}
}

function getAvgRating(
  ratings: DishRating[],
  businessId: string,
  menuItemId: string,
): number | null {
  const relevant = ratings.filter(
    (r) => r.businessId === businessId && r.menuItemId === menuItemId,
  );
  if (!relevant.length) return null;
  return relevant.reduce((s, r) => s + r.rating, 0) / relevant.length;
}

function getPriceRange(items: MenuItem[]): string {
  if (!items.length) return "";
  const prices = items.map((i) => i.price).filter((p) => p >= 0);
  if (!prices.length) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `₹${min}`;
  return `₹${min} – ₹${max}`;
}

function getAvgMenuPrice(items: MenuItem[]): number {
  if (!items.length) return 0;
  return items.reduce((s, i) => s + i.price, 0) / items.length;
}

function StarDisplay({
  rating,
  count,
}: { rating: number | null; count: number }) {
  if (rating === null)
    return <span className="text-xs text-zinc-600">No ratings yet</span>;
  return (
    <span className="text-xs text-amber-400 flex items-center gap-0.5">
      <span>★</span>
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-zinc-500">({count})</span>
    </span>
  );
}

interface RestaurantDetailModalProps {
  business: Business;
  owner: Account;
  currentUser: Account;
  dishRatings: DishRating[];
  onClose: () => void;
  onRatingUpdate: (updated: DishRating[]) => void;
}

function RestaurantDetailModal({
  business,
  currentUser,
  dishRatings,
  onClose,
  onRatingUpdate,
}: RestaurantDetailModalProps) {
  const { t } = useLanguage();
  const menuItems: MenuItem[] = Array.isArray(business.menuItems)
    ? business.menuItems
    : [];
  const isUser = currentUser.role === "user";

  const [ratingState, setRatingState] = useState<
    Record<string, { stars: number; comment: string; editing: boolean }>
  >({});
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photos = Array.isArray(business.photos) ? business.photos : [];

  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>(
    (acc, item) => {
      const cat = item.category || "Other";
      acc[cat] = acc[cat] ? [...acc[cat], item] : [item];
      return acc;
    },
    {},
  );

  const categoryOrder = ["Starters", "Main Course", "Desserts", "Beverages"];
  const sortedCategories = [
    ...categoryOrder.filter((c) => groupedItems[c]),
    ...Object.keys(groupedItems).filter((c) => !categoryOrder.includes(c)),
  ];

  function getUserRating(menuItemId: string): DishRating | undefined {
    return dishRatings.find(
      (r) => r.menuItemId === menuItemId && r.reviewerUserId === currentUser.id,
    );
  }

  function startRating(itemId: string, existingRating?: DishRating) {
    setRatingState((prev) => ({
      ...prev,
      [itemId]: {
        stars: existingRating?.rating ?? 5,
        comment: existingRating?.comment ?? "",
        editing: true,
      },
    }));
  }

  function cancelRating(itemId: string) {
    setRatingState((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  function submitRating(item: MenuItem) {
    const state = ratingState[item.id];
    if (!state) return;
    const existing = getUserRating(item.id);
    const newRating: DishRating = {
      id: existing?.id ?? `dr_${Date.now()}`,
      businessId: business.id,
      menuItemId: item.id,
      reviewerUserId: currentUser.id,
      reviewerUsername: currentUser.username,
      rating: state.stars,
      comment: state.comment.trim() || undefined,
      timestamp: new Date().toISOString(),
    };
    const updated = existing
      ? dishRatings.map((r) => (r.id === existing.id ? newRating : r))
      : [...dishRatings, newRating];
    saveDishRatings(updated);
    onRatingUpdate(updated);
    cancelRating(item.id);
    toast.success(t("ratingSubmitted", "Rating submitted!"));
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
        data-ocid="restaurants.modal"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-base">{business.name}</h2>
            {business.phone && (
              <p className="text-xs text-zinc-400">{business.phone}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"
            data-ocid="restaurants.close_button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="relative">
            <img
              src={photos[activePhotoIdx]}
              alt={business.name}
              className="w-full h-48 object-cover"
            />
            {photos.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {photos.map((_, idx) => (
                  <button
                    key={String(idx)}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === activePhotoIdx ? "bg-amber-400" : "bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Contact actions */}
          <div className="flex gap-2 flex-wrap">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-1.5 bg-green-600/20 border border-green-600/40 text-green-400 text-xs px-3 py-2 rounded-xl font-semibold hover:bg-green-600/30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                {t("call", "Call")}
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-600/40 text-blue-400 text-xs px-3 py-2 rounded-xl font-semibold hover:bg-blue-600/30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">email</span>
                {t("email", "Email")}
              </a>
            )}
            {business.mapsUrl && (
              <a
                href={business.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs px-3 py-2 rounded-xl font-semibold hover:bg-amber-500/30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  directions
                </span>
                {t("directions", "Directions")}
              </a>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-sm text-zinc-300 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Menu */}
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-zinc-600 block mb-2">
                restaurant_menu
              </span>
              <p className="text-xs text-zinc-500">
                {t("noMenuItems", "Menu not available yet.")}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {!isUser && (
                <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-zinc-500 text-sm">
                    info
                  </span>
                  <p className="text-xs text-zinc-400">
                    {t(
                      "signInAsUserToRate",
                      "Sign in as a User to rate dishes.",
                    )}
                  </p>
                </div>
              )}
              {sortedCategories.map((category) => (
                <div key={category}>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="flex-1 border-b border-zinc-800" />
                    {category}
                    <span className="flex-1 border-b border-zinc-800" />
                  </h4>
                  <div className="space-y-3">
                    {(groupedItems[category] ?? []).map((item) => {
                      const avgRating = getAvgRating(
                        dishRatings,
                        business.id,
                        item.id,
                      );
                      const ratingCount = dishRatings.filter(
                        (r) =>
                          r.businessId === business.id &&
                          r.menuItemId === item.id,
                      ).length;
                      const userRating = getUserRating(item.id);
                      const isRating = ratingState[item.id]?.editing;

                      return (
                        <div
                          key={item.id}
                          className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs ${
                                    item.isVeg
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {item.isVeg ? "🟢" : "🔴"}
                                </span>
                                <p className="text-sm font-semibold text-white">
                                  {item.name}
                                </p>
                              </div>
                              {item.description && (
                                <p className="text-xs text-zinc-400 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-bold text-amber-400">
                                  ₹{item.price}
                                </span>
                                <StarDisplay
                                  rating={avgRating}
                                  count={ratingCount}
                                />
                              </div>
                            </div>
                            {isUser && !isRating && (
                              <button
                                type="button"
                                onClick={() => startRating(item.id, userRating)}
                                className={`flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                                  userRating
                                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                    : "bg-zinc-700 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                                }`}
                                data-ocid="restaurants.secondary_button"
                              >
                                {userRating
                                  ? `★ ${userRating.rating} Edit`
                                  : "Rate"}
                              </button>
                            )}
                          </div>

                          {/* Inline rating form */}
                          {isUser && isRating && (
                            <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
                              <p className="text-xs text-zinc-400">
                                {t("yourRating", "Your Rating")}
                              </p>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      setRatingState((prev) => ({
                                        ...prev,
                                        [item.id]: {
                                          ...prev[item.id],
                                          stars: star,
                                        },
                                      }))
                                    }
                                    className={`text-xl transition-colors ${
                                      star <= (ratingState[item.id]?.stars ?? 0)
                                        ? "text-amber-400"
                                        : "text-zinc-600"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                placeholder={t(
                                  "commentOptional",
                                  "Comment (optional)",
                                )}
                                value={ratingState[item.id]?.comment ?? ""}
                                onChange={(e) =>
                                  setRatingState((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...prev[item.id],
                                      comment: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                                data-ocid="restaurants.input"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => cancelRating(item.id)}
                                  className="flex-1 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-xs text-white transition-colors"
                                  data-ocid="restaurants.cancel_button"
                                >
                                  {t("cancel", "Cancel")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => submitRating(item)}
                                  className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-black font-bold transition-colors"
                                  data-ocid="restaurants.submit_button"
                                >
                                  {t("submitRating", "Submit")}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  accounts: Account[];
  currentUser: Account;
}

export function RestaurantsTab({ accounts, currentUser }: Props) {
  const { t } = useLanguage();
  const [dishRatings, setDishRatings] = useState<DishRating[]>(loadDishRatings);
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg">("all");
  const [priceSort, setPriceSort] = useState<"default" | "low" | "high">(
    "default",
  );
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    business: Business;
    owner: Account;
  } | null>(null);

  const handleRatingUpdate = useCallback((updated: DishRating[]) => {
    setDishRatings(updated);
  }, []);

  // Collect all restaurant businesses from member accounts
  const allRestaurants: Array<{ business: Business; owner: Account }> = [];
  try {
    for (const account of accounts) {
      if (account.role !== "member" && account.role !== "creator") continue;
      const businesses = Array.isArray(account.businesses)
        ? account.businesses
        : [];
      for (const biz of businesses) {
        if (biz.businessType === "restaurant") {
          allRestaurants.push({ business: biz, owner: account });
        }
      }
    }
  } catch {}

  // Apply filters
  let filtered = allRestaurants.filter(({ business }) => {
    try {
      if (search.trim()) {
        if (!business.name.toLowerCase().includes(search.toLowerCase()))
          return false;
      }
      if (vegFilter === "veg") {
        const items = Array.isArray(business.menuItems)
          ? business.menuItems
          : [];
        const allVeg = items.length > 0 && items.every((i) => i.isVeg);
        if (!allVeg) return false;
      }
      return true;
    } catch {
      return true;
    }
  });

  // Sort
  if (priceSort !== "default") {
    filtered = [...filtered].sort((a, b) => {
      const aAvg = getAvgMenuPrice(
        Array.isArray(a.business.menuItems) ? a.business.menuItems : [],
      );
      const bAvg = getAvgMenuPrice(
        Array.isArray(b.business.menuItems) ? b.business.menuItems : [],
      );
      return priceSort === "low" ? aAvg - bAvg : bAvg - aAvg;
    });
  }

  return (
    <div className="fade-in space-y-4" data-ocid="restaurants.section">
      <div>
        <h2 className="text-xl font-bold text-white">
          {t("restaurantsTitle", "Restaurants")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("restaurantsSubtitle", "Discover local Ladakhi dining")}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder={t("searchRestaurants", "Search restaurants...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            data-ocid="restaurants.search_input"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Veg filter */}
          <div className="flex bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
            {(["all", "veg"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setVegFilter(opt)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  vegFilter === opt
                    ? "bg-green-600/20 text-green-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                data-ocid="restaurants.toggle"
              >
                {opt === "all"
                  ? t("all", "All")
                  : `🟢 ${t("vegOnly", "Veg Only")}`}
              </button>
            ))}
          </div>

          {/* Price sort */}
          <div className="flex bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
            {(
              [
                ["default", t("default", "Default")],
                ["low", t("priceLow", "₹ Low")],
                ["high", t("priceHigh", "₹ High")],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setPriceSort(val)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  priceSort === val
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                data-ocid="restaurants.toggle"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12" data-ocid="restaurants.empty_state">
          <span className="material-symbols-outlined text-4xl text-zinc-600 block mb-2">
            restaurant
          </span>
          <p className="text-zinc-500 text-sm">
            {allRestaurants.length === 0
              ? t(
                  "noRestaurantsYet",
                  "No restaurants listed yet. Members can add their restaurant from the Business tab.",
                )
              : t("noRestaurantsMatch", "No restaurants match your filters.")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ business, owner }, idx) => {
            const menuItems: MenuItem[] = Array.isArray(business.menuItems)
              ? business.menuItems
              : [];
            const allVeg =
              menuItems.length > 0 && menuItems.every((i) => i.isVeg);
            const hasNonVeg = menuItems.some((i) => !i.isVeg);
            const priceRange = getPriceRange(menuItems);
            const photos = Array.isArray(business.photos)
              ? business.photos
              : [];

            // Compute overall restaurant rating from all dish ratings
            const allDishRatingsForRestaurant = dishRatings.filter(
              (r) => r.businessId === business.id,
            );
            const avgRestaurantRating =
              allDishRatingsForRestaurant.length > 0
                ? allDishRatingsForRestaurant.reduce(
                    (s, r) => s + r.rating,
                    0,
                  ) / allDishRatingsForRestaurant.length
                : null;

            return (
              <div
                key={business.id}
                className="bg-card border border-border rounded-2xl overflow-hidden"
                data-ocid={`restaurants.item.${idx + 1}`}
              >
                {photos[0] && (
                  <img
                    src={photos[0]}
                    alt={business.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white">{business.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {allVeg && !hasNonVeg && (
                          <span className="text-xs text-green-400">
                            🟢 Pure Veg
                          </span>
                        )}
                        {hasNonVeg && (
                          <span className="text-xs text-red-400">
                            🔴 Non-Veg Available
                          </span>
                        )}
                        {priceRange && (
                          <span className="text-xs text-amber-400 font-semibold">
                            {priceRange}
                          </span>
                        )}
                      </div>
                    </div>
                    {avgRestaurantRating !== null && (
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-bold text-amber-400">
                          ★ {avgRestaurantRating.toFixed(1)}
                        </span>
                        <p className="text-xs text-zinc-500">
                          ({allDishRatingsForRestaurant.length})
                        </p>
                      </div>
                    )}
                  </div>

                  {business.description && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {business.description}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {business.phone && (
                      <a
                        href={`tel:${business.phone}`}
                        className="flex items-center gap-1 bg-green-600/20 border border-green-600/40 text-green-400 text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-green-600/30 transition-colors"
                        data-ocid="restaurants.secondary_button"
                      >
                        <span className="material-symbols-outlined text-sm">
                          call
                        </span>
                        {t("call", "Call")}
                      </a>
                    )}
                    {business.email && (
                      <a
                        href={`mailto:${business.email}`}
                        className="flex items-center gap-1 bg-blue-600/20 border border-blue-600/40 text-blue-400 text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-blue-600/30 transition-colors"
                        data-ocid="restaurants.secondary_button"
                      >
                        <span className="material-symbols-outlined text-sm">
                          email
                        </span>
                        {t("email", "Email")}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRestaurant({ business, owner });
                      }}
                      className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-amber-500/30 transition-colors"
                      data-ocid="restaurants.secondary_button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        restaurant_menu
                      </span>
                      {t("viewMenu", "Menu")}
                      {menuItems.length > 0 && (
                        <span className="bg-amber-500/30 text-amber-300 text-xs px-1.5 py-0.5 rounded-full">
                          {menuItems.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <RestaurantDetailModal
          business={selectedRestaurant.business}
          owner={selectedRestaurant.owner}
          currentUser={currentUser}
          dishRatings={dishRatings}
          onClose={() => {
            setSelectedRestaurant(null);
          }}
          onRatingUpdate={handleRatingUpdate}
        />
      )}
    </div>
  );
}
