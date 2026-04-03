import { useState } from "react";
import { toast } from "sonner";
import { generateId } from "../data/seed";
import type { Account, MenuItemReview } from "../types";

const MENU_ITEM_REVIEWS_KEY = "lc_menuItemReviews";

function loadMenuItemReviews(): MenuItemReview[] {
  try {
    const saved = localStorage.getItem(MENU_ITEM_REVIEWS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMenuItemReviews(reviews: MenuItemReview[]) {
  try {
    localStorage.setItem(MENU_ITEM_REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event("lc_data_changed"));
  } catch {
    // silently fail
  }
}

function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-base transition-transform hover:scale-110 ${
            s <= rating ? "text-amber-400" : "text-zinc-700"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface Props {
  account: Account;
  currentUserId: string;
  currentUserRole: string;
  currentUsername: string;
}

export function HotelDetailPanel({
  account,
  currentUserId,
  currentUserRole,
  currentUsername,
}: Props) {
  const [activeTab, setActiveTab] = useState<"rooms" | "menu" | "rentals">(
    "rooms",
  );
  const [activePhoto, setActivePhoto] = useState(0);
  const [menuItemReviews, setMenuItemReviews] =
    useState<MenuItemReview[]>(loadMenuItemReviews);
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const businesses = account.businesses ?? [];
  const hotel =
    businesses.find((b) => b.businessType === "hotel") ?? businesses[0];

  if (!hotel) return null;

  const photos = hotel.photos ?? [];
  const roomTypes = hotel.roomTypes ?? [];
  const menuItems = hotel.menuItems ?? [];
  const rentalAddons = hotel.rentalAddons ?? [];
  const AMENITY_ICONS: Record<string, string> = {
    WiFi: "wifi",
    AC: "ac_unit",
    "Hot Water": "water_drop",
    Parking: "local_parking",
    "Room Service": "room_service",
    "Breakfast Included": "breakfast_dining",
  };

  const totalRooms = roomTypes.reduce((s, r) => s + (r.availableCount ?? 0), 0);
  const availabilityBadge =
    totalRooms === 0
      ? { label: "Full", cls: "bg-red-600/20 text-red-400 border-red-500/30" }
      : totalRooms <= 3
        ? {
            label: "Limited",
            cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          }
        : {
            label: "Available",
            cls: "bg-green-600/20 text-green-400 border-green-500/30",
          };

  function submitMenuReview(itemId: string) {
    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    const review: MenuItemReview = {
      id: generateId(),
      menuItemId: itemId,
      businessId: hotel.id,
      reviewerUserId: currentUserId,
      reviewerUsername: currentUsername,
      rating: reviewRating,
      comment: reviewComment.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...menuItemReviews, review];
    setMenuItemReviews(updated);
    saveMenuItemReviews(updated);
    setReviewingItemId(null);
    setReviewComment("");
    setReviewRating(5);
    toast.success("Review submitted!");
  }

  const hasTabs =
    roomTypes.length > 0 || menuItems.length > 0 || rentalAddons.length > 0;
  const visibleTabs: Array<"rooms" | "menu" | "rentals"> = [
    ...(roomTypes.length > 0 ? (["rooms"] as const) : []),
    ...(menuItems.length > 0 ? (["menu"] as const) : []),
    ...(rentalAddons.length > 0 ? (["rentals"] as const) : []),
  ];

  return (
    <div className="pb-8">
      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="relative h-52 overflow-hidden">
          <img
            src={photos[activePhoto]}
            alt={`${hotel.name} view ${activePhoto + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={String(i)}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activePhoto
                      ? "bg-white scale-125"
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="bg-black/60 text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-500/30">
              🏨 Hotel
            </span>
          </div>
          <div
            className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-semibold ${
              availabilityBadge.cls
            }`}
          >
            {availabilityBadge.label}
          </div>
        </div>
      )}

      <div className="px-5 pt-4">
        {/* Header */}
        <div className="mb-3">
          <h2 className="text-xl font-bold text-white">{hotel.name}</h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            by @{account.username} ·{" "}
            <span className="text-amber-400">
              {account.membershipTier === "Premier"
                ? "⭐ Premier Member"
                : "Member"}
            </span>
          </p>
          {hotel.description && (
            <p className="text-zinc-300 text-sm mt-2 leading-relaxed">
              {hotel.description}
            </p>
          )}
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2 mb-4">
          {hotel.mapsUrl && (
            <a
              href={hotel.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                directions
              </span>
              Directions
            </a>
          )}
          {hotel.phone && (
            <a
              href={`tel:${hotel.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              Call
            </a>
          )}
          {hotel.email && (
            <a
              href={`mailto:${hotel.email}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">mail</span>
              Email
            </a>
          )}
        </div>

        {/* Tabs */}
        {hasTabs && visibleTabs.length > 0 && (
          <div className="flex gap-1 mb-4 bg-zinc-800/50 rounded-xl p-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-amber-500 text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab === "rooms" && "🛏️ Rooms"}
                {tab === "menu" && "🍽️ Menu"}
                {tab === "rentals" && "🚗 Rentals"}
              </button>
            ))}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === "rooms" && roomTypes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-zinc-300">Room Types</h3>
              {hotel.lastAvailabilityUpdate && (
                <span className="text-xs text-zinc-500">
                  Updated{" "}
                  {new Date(hotel.lastAvailabilityUpdate).toLocaleDateString()}
                </span>
              )}
            </div>
            {roomTypes.map((room) => (
              <div
                key={room.id}
                className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {room.type} Room
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Up to {room.maxGuests}{" "}
                      {room.maxGuests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-bold text-sm">
                      ₹{room.pricePerNight.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">per night</p>
                  </div>
                </div>
                {(room.amenities ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(room.amenities ?? []).map((amenity) => (
                      <span
                        key={amenity}
                        className="flex items-center gap-1 bg-zinc-700/60 text-zinc-300 text-xs px-2 py-0.5 rounded-full"
                      >
                        {AMENITY_ICONS[amenity] && (
                          <span className="material-symbols-outlined text-xs">
                            {AMENITY_ICONS[amenity]}
                          </span>
                        )}
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                      room.availableCount === 0
                        ? "bg-red-600/20 text-red-400 border-red-500/30"
                        : room.availableCount <= 2
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-green-600/20 text-green-400 border-green-500/30"
                    }`}
                  >
                    {room.availableCount === 0
                      ? "Not Available"
                      : `${room.availableCount} Available`}
                  </div>
                  {hotel.phone && (
                    <a
                      href={`tel:${hotel.phone}`}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        call
                      </span>
                      Book via Call
                    </a>
                  )}
                </div>
                {(room.photos ?? []).length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {(room.photos ?? []).map((p, i) => (
                      <img
                        key={String(i)}
                        src={p}
                        alt={`${room.type} view`}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "rooms" && roomTypes.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <span className="material-symbols-outlined text-3xl block mb-2">
              hotel
            </span>
            <p className="text-sm">No room information listed yet.</p>
            {hotel.phone && (
              <a
                href={`tel:${hotel.phone}`}
                className="mt-3 inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                Call hotel directly for availability
              </a>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && menuItems.length > 0 && (
          <div className="space-y-3">
            {["Starters", "Main Course", "Desserts", "Beverages"].map((cat) => {
              const items = menuItems.filter((m) => m.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">
                    {cat}
                  </h4>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const itemReviews = menuItemReviews.filter(
                        (r) => r.menuItemId === item.id,
                      );
                      const avgRating = itemReviews.length
                        ? itemReviews.reduce((s, r) => s + r.rating, 0) /
                          itemReviews.length
                        : 0;
                      return (
                        <div
                          key={item.id}
                          className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3"
                        >
                          <div className="flex items-start gap-3">
                            {item.photo && (
                              <img
                                src={item.photo}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-semibold text-white text-sm">
                                      {item.name}
                                    </h5>
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                        item.isVeg
                                          ? "text-green-400 bg-green-600/10 border border-green-500/30"
                                          : "text-red-400 bg-red-600/10 border border-red-500/30"
                                      }`}
                                    >
                                      {item.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                  {avgRating > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-xs text-amber-400 font-bold">
                                        ★ {avgRating.toFixed(1)}
                                      </span>
                                      <span className="text-xs text-zinc-600">
                                        ({itemReviews.length})
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-amber-400 font-bold text-sm shrink-0">
                                  ₹{item.price}
                                </span>
                              </div>

                              {currentUserRole === "user" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReviewingItemId(
                                      reviewingItemId === item.id
                                        ? null
                                        : item.id,
                                    )
                                  }
                                  className="mt-2 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
                                >
                                  {reviewingItemId === item.id
                                    ? "Cancel"
                                    : "Leave a review"}
                                </button>
                              )}

                              {reviewingItemId === item.id && (
                                <div className="mt-2 bg-zinc-900 rounded-lg p-3 space-y-2">
                                  <StarRating
                                    rating={reviewRating}
                                    onChange={setReviewRating}
                                  />
                                  <textarea
                                    className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                                    rows={2}
                                    placeholder="How was this dish?"
                                    value={reviewComment}
                                    onChange={(e) =>
                                      setReviewComment(e.target.value)
                                    }
                                  />
                                  <button
                                    type="button"
                                    onClick={() => submitMenuReview(item.id)}
                                    className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                                  >
                                    Submit Review
                                  </button>
                                </div>
                              )}

                              {itemReviews.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {itemReviews.slice(0, 2).map((r) => (
                                    <div
                                      key={r.id}
                                      className="text-xs text-zinc-500 bg-zinc-900/60 rounded-lg px-2 py-1"
                                    >
                                      <span className="text-zinc-400 font-semibold">
                                        @{r.reviewerUsername}
                                      </span>{" "}
                                      <span className="text-amber-400">
                                        ★{r.rating}
                                      </span>{" "}
                                      — {r.comment}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rental Addons Tab */}
        {activeTab === "rentals" && rentalAddons.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-300 mb-2">
              Available Vehicles
            </h3>
            {rentalAddons.map((addon) => (
              <div
                key={addon.id}
                className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  {addon.photo && (
                    <img
                      src={addon.photo}
                      alt={addon.model}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {addon.vehicleType}
                        </h4>
                        <p className="text-xs text-zinc-500">{addon.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-bold text-sm">
                          ₹{addon.pricePerDay}/day
                        </p>
                        {addon.pricePerMonth && (
                          <p className="text-xs text-zinc-500">
                            ₹{addon.pricePerMonth}/mo
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                          addon.available
                            ? "bg-green-600/20 text-green-400 border-green-500/30"
                            : "bg-zinc-700/40 text-zinc-500 border-zinc-600/30"
                        }`}
                      >
                        {addon.available ? "Available" : "Not Available"}
                      </span>
                      {hotel.phone && addon.available && (
                        <a
                          href={`tel:${hotel.phone}`}
                          className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            call
                          </span>
                          Enquire
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact info footer */}
        {(hotel.phone || hotel.email) && (
          <div className="mt-6 bg-zinc-800/40 border border-zinc-700 rounded-xl p-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">
              Contact Information
            </h3>
            {hotel.phone && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-sm">
                    call
                  </span>
                  <span className="text-sm text-white">{hotel.phone}</span>
                </div>
                <a
                  href={`tel:${hotel.phone}`}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Call Now
                </a>
              </div>
            )}
            {hotel.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-sm">
                    mail
                  </span>
                  <span className="text-sm text-white truncate max-w-[180px]">
                    {hotel.email}
                  </span>
                </div>
                <a
                  href={`mailto:${hotel.email}`}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Email
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
