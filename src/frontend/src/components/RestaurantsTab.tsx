import { useState } from "react";
import type { Account, Business, MenuItem, MenuItemReview } from "../types";

const LS_MENU_REVIEWS = "lc_menuItemReviews";

function getMenuReviews(): MenuItemReview[] {
  try {
    return JSON.parse(localStorage.getItem(LS_MENU_REVIEWS) || "[]");
  } catch {
    return [];
  }
}

function saveMenuReviews(reviews: MenuItemReview[]): void {
  localStorage.setItem(LS_MENU_REVIEWS, JSON.stringify(reviews));
}

function StarRating({
  rating,
  interactive,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(s)}
          className={`text-base transition-colors ${
            s <= (hover || rating) ? "text-amber-400" : "text-zinc-600"
          } ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface RestaurantDetailProps {
  business: Business;
  owner: Account;
  currentUserRole: string;
  currentUserId: string;
  currentUsername: string;
  onClose: () => void;
}

const MENU_CATEGORIES = ["Starters", "Main Course", "Desserts", "Beverages"];

function RestaurantDetailPanel({
  business,
  owner: _owner,
  currentUserRole,
  currentUserId,
  currentUsername,
  onClose,
}: RestaurantDetailProps) {
  const menuItems: MenuItem[] = business.menuItems ?? [];
  const allReviews = getMenuReviews();

  function getItemAvgRating(itemId: string): number {
    const itemReviews = allReviews.filter(
      (r) => r.menuItemId === itemId && r.businessId === business.id,
    );
    if (!itemReviews.length) return 0;
    return itemReviews.reduce((s, r) => s + r.rating, 0) / itemReviews.length;
  }

  function getUserRating(itemId: string): number {
    const r = allReviews.find(
      (r) =>
        r.menuItemId === itemId &&
        r.businessId === business.id &&
        r.reviewerUserId === currentUserId,
    );
    return r?.rating ?? 0;
  }

  function handleRate(item: MenuItem, rating: number) {
    if (currentUserRole !== "user") return;
    const reviews = getMenuReviews();
    const existing = reviews.findIndex(
      (r) =>
        r.menuItemId === item.id &&
        r.businessId === business.id &&
        r.reviewerUserId === currentUserId,
    );
    const newReview: MenuItemReview = {
      id: `${currentUserId}_${item.id}_${Date.now()}`,
      menuItemId: item.id,
      businessId: business.id,
      reviewerUserId: currentUserId,
      reviewerUsername: currentUsername,
      rating,
      comment: "",
      timestamp: new Date().toISOString(),
    };
    if (existing >= 0) {
      reviews[existing] = newReview;
    } else {
      reviews.push(newReview);
    }
    saveMenuReviews(reviews);
    // Force re-render
    window.dispatchEvent(new Event("lc_data_changed"));
  }

  const categoriesWithItems = MENU_CATEGORIES.filter((cat) =>
    menuItems.some((item) => item.category === cat),
  );
  const uncategorized = menuItems.filter(
    (item) => !MENU_CATEGORIES.includes(item.category),
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">{business.name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {business.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
            data-ocid="restaurants.close_button"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Photos */}
          {(business.photos ?? []).length > 0 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {(business.photos ?? []).map((p, i) => (
                <img
                  key={String(i)}
                  src={p}
                  alt=""
                  className="w-32 h-24 object-cover rounded-xl flex-shrink-0"
                />
              ))}
            </div>
          )}

          {/* Contact */}
          <div className="px-5 pb-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">
                Contact
              </p>
              <div className="flex gap-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-600/30 transition-colors"
                    data-ocid="restaurants.button"
                  >
                    <span className="material-symbols-outlined text-base">
                      call
                    </span>
                    Call
                  </a>
                )}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-600/30 transition-colors"
                    data-ocid="restaurants.button"
                  >
                    <span className="material-symbols-outlined text-base">
                      mail
                    </span>
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Menu */}
          {menuItems.length > 0 && (
            <div className="px-5 pb-6">
              <h3 className="text-sm font-bold text-white mb-3">
                <span className="material-symbols-outlined text-amber-400 text-base mr-1 align-middle">
                  restaurant_menu
                </span>
                Menu
              </h3>
              {categoriesWithItems.map((cat) => (
                <div key={cat} className="mb-4">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    {cat}
                  </p>
                  {menuItems
                    .filter((item) => item.category === cat)
                    .map((item) => {
                      const avgRating = getItemAvgRating(item.id);
                      const myRating = getUserRating(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 py-3 border-b border-zinc-800 last:border-0"
                        >
                          {item.photo && (
                            <img
                              src={item.photo}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                  item.isVeg ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              <p className="text-sm font-semibold text-white truncate">
                                {item.name}
                              </p>
                            </div>
                            {item.description && (
                              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm font-bold text-amber-400">
                                ₹{item.price}
                              </span>
                              {avgRating > 0 && (
                                <div className="flex items-center gap-1">
                                  <StarRating rating={Math.round(avgRating)} />
                                  <span className="text-xs text-zinc-500">
                                    ({avgRating.toFixed(1)})
                                  </span>
                                </div>
                              )}
                            </div>
                            {currentUserRole === "user" && (
                              <div className="mt-2">
                                <p className="text-xs text-zinc-500 mb-1">
                                  Rate this dish:
                                </p>
                                <StarRating
                                  rating={myRating}
                                  interactive
                                  onRate={(r) => handleRate(item, r)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
              {uncategorized.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Other
                  </p>
                  {uncategorized.map((item) => {
                    const avgRating = getItemAvgRating(item.id);
                    const myRating = getUserRating(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 py-3 border-b border-zinc-800 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`}
                            />
                            <p className="text-sm font-semibold text-white truncate">
                              {item.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm font-bold text-amber-400">
                              ₹{item.price}
                            </span>
                            {avgRating > 0 && (
                              <StarRating rating={Math.round(avgRating)} />
                            )}
                          </div>
                          {currentUserRole === "user" && (
                            <div className="mt-2">
                              <p className="text-xs text-zinc-500 mb-1">
                                Rate:
                              </p>
                              <StarRating
                                rating={myRating}
                                interactive
                                onRate={(r) => handleRate(item, r)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {menuItems.length === 0 && (
            <div className="px-5 pb-6 text-center text-zinc-500 text-sm">
              No menu items added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  currentUserRole: string;
  currentUser?: { id: string; username: string };
}

export function RestaurantsTab({ currentUserRole, currentUser }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [sort, setSort] = useState<
    "none" | "price-asc" | "price-desc" | "rating"
  >("none");
  const [selected, setSelected] = useState<{
    business: Business;
    owner: Account;
  } | null>(null);

  // Read all restaurant businesses from accounts
  function getRestaurants(): { business: Business; owner: Account }[] {
    try {
      const accounts: Account[] = JSON.parse(
        localStorage.getItem("lc_accounts") || "[]",
      );
      const results: { business: Business; owner: Account }[] = [];
      for (const account of accounts) {
        if (account.role !== "member" && account.role !== "community") continue;
        for (const biz of account.businesses ?? []) {
          if (biz.businessType === "restaurant") {
            results.push({ business: biz, owner: account });
          }
        }
      }
      return results;
    } catch {
      return [];
    }
  }

  function getRestaurantAvgRating(biz: Business): number {
    try {
      const reviews: MenuItemReview[] = JSON.parse(
        localStorage.getItem(LS_MENU_REVIEWS) || "[]",
      );
      const bizReviews = reviews.filter((r) => r.businessId === biz.id);
      if (!bizReviews.length) return 0;
      return bizReviews.reduce((s, r) => s + r.rating, 0) / bizReviews.length;
    } catch {
      return 0;
    }
  }

  function isVegRestaurant(biz: Business): boolean {
    return (biz.menuItems ?? []).every((item) => item.isVeg);
  }

  function hasNonVeg(biz: Business): boolean {
    return (biz.menuItems ?? []).some((item) => !item.isVeg);
  }

  let restaurants = getRestaurants();

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    restaurants = restaurants.filter(
      (r) =>
        r.business.name.toLowerCase().includes(q) ||
        r.business.description?.toLowerCase().includes(q) ||
        (r.business.menuItems ?? []).some((item) =>
          item.name.toLowerCase().includes(q),
        ),
    );
  }

  // Veg filter
  if (filter === "veg") {
    restaurants = restaurants.filter((r) => isVegRestaurant(r.business));
  } else if (filter === "non-veg") {
    restaurants = restaurants.filter((r) => hasNonVeg(r.business));
  }

  // Sort
  if (sort === "price-asc") {
    restaurants = [...restaurants].sort((a, b) => {
      const aMin = Math.min(
        ...(a.business.menuItems ?? [{ price: 0 }]).map((i) => i.price),
      );
      const bMin = Math.min(
        ...(b.business.menuItems ?? [{ price: 0 }]).map((i) => i.price),
      );
      return aMin - bMin;
    });
  } else if (sort === "price-desc") {
    restaurants = [...restaurants].sort((a, b) => {
      const aMax = Math.max(
        ...(a.business.menuItems ?? [{ price: 0 }]).map((i) => i.price),
      );
      const bMax = Math.max(
        ...(b.business.menuItems ?? [{ price: 0 }]).map((i) => i.price),
      );
      return bMax - aMax;
    });
  } else if (sort === "rating") {
    restaurants = [...restaurants].sort(
      (a, b) =>
        getRestaurantAvgRating(b.business) - getRestaurantAvgRating(a.business),
    );
  }

  const pillBase =
    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
  const pillActive = `${pillBase} bg-amber-500/20 text-amber-400 border-amber-500/40`;
  const pillInactive = `${pillBase} bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500`;

  return (
    <div className="fade-in pb-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Restaurants</h2>
        <p className="text-xs text-zinc-500">Discover Ladakh's dining spots</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-base">
          search
        </span>
        <input
          type="text"
          placeholder="Search restaurants or dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl pl-9 pr-4 py-3 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          data-ocid="restaurants.search_input"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={filter === "all" ? pillActive : pillInactive}
          data-ocid="restaurants.tab"
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("veg")}
          className={filter === "veg" ? pillActive : pillInactive}
          data-ocid="restaurants.tab"
        >
          🟢 Veg Only
        </button>
        <button
          type="button"
          onClick={() => setFilter("non-veg")}
          className={filter === "non-veg" ? pillActive : pillInactive}
          data-ocid="restaurants.tab"
        >
          🔴 Non-Veg
        </button>
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setSort("none")}
          className={sort === "none" ? pillActive : pillInactive}
          data-ocid="restaurants.tab"
        >
          Default
        </button>
        <button
          type="button"
          onClick={() => setSort("price-asc")}
          className={sort === "price-asc" ? pillActive : pillInactive}
          data-ocid="restaurants.tab"
        >
          Price ↑
        </button>
        <button
          type="button"
          onClick={() => setSort("price-desc")}
          className={sort === "price-desc" ? pillActive : pillInactive}
          data-ocid="restaurants.tab"
        >
          Price ↓
        </button>
        <button
          type="button"
          onClick={() => setSort("rating")}
          className={sort === "rating" ? pillActive : pillInactive}
          data-ocid="restaurants.tab"
        >
          Top Rated
        </button>
      </div>

      {/* Listings */}
      {restaurants.length === 0 ? (
        <div
          className="text-center py-16 text-zinc-500"
          data-ocid="restaurants.empty_state"
        >
          <span className="material-symbols-outlined text-5xl block mb-3 text-zinc-700">
            restaurant
          </span>
          <p className="text-sm font-medium">
            {search || filter !== "all"
              ? "No restaurants match your search."
              : "No restaurants listed yet."}
          </p>
          {!search && filter === "all" && (
            <p className="text-xs mt-1">
              Members can add their restaurant from My Business.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map(({ business, owner }, idx) => {
            const avgRating = getRestaurantAvgRating(business);
            const vegOnly = isVegRestaurant(business);
            const nonVeg = hasNonVeg(business);
            const minPrice = business.menuItems?.length
              ? Math.min(...business.menuItems.map((i) => i.price))
              : null;

            return (
              <button
                key={business.id}
                type="button"
                className="w-full text-left rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => setSelected({ business, owner })}
                data-ocid={`restaurants.item.${idx + 1}`}
              >
                {(business.photos ?? [])[0] && (
                  <img
                    src={(business.photos ?? [])[0]}
                    alt={business.name}
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">
                        {business.name}
                      </h3>
                      {business.description && (
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                          {business.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {vegOnly && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/15 border border-green-500/30 text-green-400">
                          Veg
                        </span>
                      )}
                      {nonVeg && !vegOnly && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400">
                          Non-Veg
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(avgRating)} />
                        <span className="text-xs text-zinc-500">
                          ({avgRating.toFixed(1)})
                        </span>
                      </div>
                    )}
                    {minPrice !== null && (
                      <span className="text-xs text-zinc-400">
                        From ₹{minPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {business.phone && (
                      <a
                        href={`tel:${business.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600/15 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-600/25 transition-colors"
                        data-ocid="restaurants.button"
                      >
                        <span className="material-symbols-outlined text-sm">
                          call
                        </span>
                        Call
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected({ business, owner });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors"
                      data-ocid="restaurants.button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        menu_book
                      </span>
                      View Menu
                    </button>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <RestaurantDetailPanel
          business={selected.business}
          owner={selected.owner}
          currentUserRole={currentUserRole}
          currentUserId={currentUser?.id ?? ""}
          currentUsername={currentUser?.username ?? ""}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
