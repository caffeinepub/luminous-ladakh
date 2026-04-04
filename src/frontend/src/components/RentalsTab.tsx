import { useState } from "react";
import type {
  Account,
  Business,
  BusinessHourEntry,
  DiscountEntry,
  RentalAddon,
} from "../types";
import { BusinessQASection } from "./shared/BusinessQASection";
import { InquiryModal } from "./shared/InquiryModal";

const VEHICLE_TYPES = ["Car", "Bike", "Bicycle", "Scooter", "E-Bike", "Other"];
const LS_DISCOUNTS = "lc_discounts";

function getActiveDiscounts(businessId: string): DiscountEntry[] {
  try {
    const list: DiscountEntry[] = JSON.parse(
      localStorage.getItem(LS_DISCOUNTS) || "[]",
    );
    const now = new Date();
    return list.filter(
      (d) => d.businessId === businessId && new Date(d.validUntil) > now,
    );
  } catch {
    return [];
  }
}

function getOpenStatus(hours?: BusinessHourEntry[]): "open" | "closed" | null {
  if (!hours || hours.length === 0) return null;
  const now = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayName = dayNames[now.getDay()];
  const entry = hours.find(
    (h) =>
      h.day.startsWith(todayName) || todayName.startsWith(h.day.slice(0, 3)),
  );
  if (!entry) return null;
  if (entry.closed) return "closed";
  const [openH, openM] = entry.open.split(":").map(Number);
  const [closeH, closeM] = entry.close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  if (nowMins >= openMins && nowMins < closeMins) return "open";
  return "closed";
}

interface RentalDetailProps {
  business: Business;
  owner: Account;
  currentUserId: string;
  currentUsername: string;
  currentUserRole: string;
  onClose: () => void;
}

function RentalDetailPanel({
  business,
  owner,
  currentUserId,
  currentUsername,
  currentUserRole,
  onClose,
}: RentalDetailProps) {
  const [showInquiry, setShowInquiry] = useState(false);

  const vehicles: RentalAddon[] = [
    ...(business.rentalAddons ?? []),
    ...(business.vehicles ?? []).map((v) => ({
      id: v.id,
      vehicleType: v.type,
      model: v.model,
      pricePerDay: v.pricePerDay,
      pricePerMonth: v.pricePerMonth,
      photo: v.photo,
      available: v.available,
    })),
  ];

  const activeDiscounts = getActiveDiscounts(business.id);
  const openStatus = getOpenStatus(business.businessHours);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">
                  {business.name}
                </h2>
                {openStatus === "open" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-semibold">
                    Open Now
                  </span>
                )}
                {openStatus === "closed" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-semibold">
                    Closed
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {business.description}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 flex-shrink-0"
              data-ocid="rentals.close_button"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            {/* Discount Banner */}
            {activeDiscounts.length > 0 && (
              <div
                className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2"
                data-ocid="rentals.panel"
              >
                <span className="material-symbols-outlined text-amber-400 text-base flex-shrink-0 mt-0.5">
                  local_offer
                </span>
                <div>
                  {activeDiscounts.map((d) => (
                    <p
                      key={d.id}
                      className="text-sm text-amber-300 font-medium"
                    >
                      {d.message}
                    </p>
                  ))}
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Valid until{" "}
                    {new Date(
                      activeDiscounts[0].validUntil,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Photos */}
            {(business.photos ?? []).length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">
                Contact
              </p>
              <div className="flex gap-2 flex-wrap">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-600/30 transition-colors"
                    data-ocid="rentals.button"
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
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-600/30 transition-colors"
                    data-ocid="rentals.button"
                  >
                    <span className="material-symbols-outlined text-base">
                      mail
                    </span>
                    Email
                  </a>
                )}
                {currentUserRole !== "member" &&
                  currentUserRole !== "creator" && (
                    <button
                      type="button"
                      onClick={() => setShowInquiry(true)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-600/30 transition-colors"
                      data-ocid="rentals.button"
                    >
                      <span className="material-symbols-outlined text-base">
                        chat
                      </span>
                      Enquire
                    </button>
                  )}
              </div>
            </div>

            {/* Business Hours */}
            {business.businessHours && business.businessHours.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">
                  Hours
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {business.businessHours.map((h) => (
                    <div
                      key={h.day}
                      className="flex justify-between text-xs py-0.5"
                    >
                      <span className="text-zinc-400">{h.day}</span>
                      <span
                        className={h.closed ? "text-red-400" : "text-zinc-300"}
                      >
                        {h.closed ? "Closed" : `${h.open}–${h.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle List */}
            {vehicles.length > 0 ? (
              <div>
                <p className="text-sm font-bold text-white mb-3">
                  Available Vehicles
                </p>
                <div className="space-y-3">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3"
                    >
                      {v.photo && (
                        <img
                          src={v.photo}
                          alt={v.model}
                          className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                            {v.vehicleType}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              v.available
                                ? "bg-green-600/15 border border-green-500/30 text-green-400"
                                : "bg-red-600/15 border border-red-500/30 text-red-400"
                            }`}
                          >
                            {v.available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {v.model}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-amber-400 font-bold">
                            ₹{v.pricePerDay}/day
                          </span>
                          {v.pricePerMonth && (
                            <span className="text-xs text-zinc-400">
                              ₹{v.pricePerMonth}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">
                No vehicles listed yet.
              </p>
            )}

            {/* Q&A Section */}
            <BusinessQASection
              businessId={business.id}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
              currentUserRole={currentUserRole}
              ownerMemberId={owner.id}
            />
          </div>
        </div>
      </div>

      {showInquiry && (
        <InquiryModal
          businessId={business.id}
          businessName={business.name}
          memberUsername={owner.username}
          businessType={business.businessType}
          fromUserId={currentUserId}
          fromUsername={currentUsername}
          onClose={() => setShowInquiry(false)}
        />
      )}
    </>
  );
}

interface Props {
  currentUserRole: string;
  currentUser?: { id: string; username: string };
}

export function RentalsTab({ currentUserRole, currentUser }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"none" | "price-asc" | "price-desc">("none");
  const [selected, setSelected] = useState<{
    business: Business;
    owner: Account;
  } | null>(null);
  const [showInquiryCard, setShowInquiryCard] = useState<{
    business: Business;
    owner: Account;
  } | null>(null);

  function getRentals(): { business: Business; owner: Account }[] {
    try {
      const accounts: Account[] = JSON.parse(
        localStorage.getItem("lc_accounts") || "[]",
      );
      const results: { business: Business; owner: Account }[] = [];
      for (const account of accounts) {
        if (account.role !== "member" && account.role !== "community") continue;
        for (const biz of account.businesses ?? []) {
          if (biz.businessType === "rental") {
            results.push({ business: biz, owner: account });
          }
        }
      }
      return results;
    } catch {
      return [];
    }
  }

  function getVehicleTypes(biz: Business): string[] {
    const types = new Set<string>();
    for (const v of biz.rentalAddons ?? []) types.add(v.vehicleType);
    for (const v of biz.vehicles ?? []) types.add(v.type);
    return Array.from(types);
  }

  function getMinDayPrice(biz: Business): number | null {
    const prices = [
      ...(biz.rentalAddons ?? []).map((v) => v.pricePerDay),
      ...(biz.vehicles ?? []).map((v) => v.pricePerDay),
    ];
    return prices.length ? Math.min(...prices) : null;
  }

  let rentals = getRentals();

  if (search.trim()) {
    const q = search.toLowerCase();
    rentals = rentals.filter(
      (r) =>
        r.business.name.toLowerCase().includes(q) ||
        r.business.description?.toLowerCase().includes(q),
    );
  }

  if (filter !== "All") {
    rentals = rentals.filter((r) => {
      const types = getVehicleTypes(r.business);
      return types.some((t) => t.toLowerCase() === filter.toLowerCase());
    });
  }

  if (sort === "price-asc") {
    rentals = [...rentals].sort((a, b) => {
      const aMin = getMinDayPrice(a.business) ?? Number.POSITIVE_INFINITY;
      const bMin = getMinDayPrice(b.business) ?? Number.POSITIVE_INFINITY;
      return aMin - bMin;
    });
  } else if (sort === "price-desc") {
    rentals = [...rentals].sort((a, b) => {
      const aMin = getMinDayPrice(a.business) ?? 0;
      const bMin = getMinDayPrice(b.business) ?? 0;
      return bMin - aMin;
    });
  }

  const pillBase =
    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
  const pillActive = `${pillBase} bg-amber-500/20 text-amber-400 border-amber-500/40`;
  const pillInactive = `${pillBase} bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500`;

  return (
    <div className="fade-in pb-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Rentals</h2>
        <p className="text-xs text-zinc-500">
          Vehicle rental agencies in Ladakh
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-base">
          search
        </span>
        <input
          type="text"
          placeholder="Search rental agencies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl pl-9 pr-4 py-3 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          data-ocid="rentals.search_input"
        />
      </div>

      {/* Vehicle type filters */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {["All", ...VEHICLE_TYPES].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={filter === type ? pillActive : pillInactive}
            data-ocid="rentals.tab"
          >
            {type}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setSort("none")}
          className={sort === "none" ? pillActive : pillInactive}
          data-ocid="rentals.tab"
        >
          Default
        </button>
        <button
          type="button"
          onClick={() => setSort("price-asc")}
          className={sort === "price-asc" ? pillActive : pillInactive}
          data-ocid="rentals.tab"
        >
          Price ↑
        </button>
        <button
          type="button"
          onClick={() => setSort("price-desc")}
          className={sort === "price-desc" ? pillActive : pillInactive}
          data-ocid="rentals.tab"
        >
          Price ↓
        </button>
      </div>

      {rentals.length === 0 ? (
        <div
          className="text-center py-16 text-zinc-500"
          data-ocid="rentals.empty_state"
        >
          <span className="material-symbols-outlined text-5xl block mb-3 text-zinc-700">
            directions_car
          </span>
          <p className="text-sm font-medium">
            {search || filter !== "All"
              ? "No rentals match your search."
              : "No rental agencies listed yet."}
          </p>
          {!search && filter === "All" && (
            <p className="text-xs mt-1">
              Members can add their rental agency from My Business.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map(({ business, owner }, idx) => {
            const vehicleTypes = getVehicleTypes(business);
            const minPrice = getMinDayPrice(business);
            const openStatus = getOpenStatus(business.businessHours);
            const activeDiscounts = getActiveDiscounts(business.id);

            return (
              <div
                key={business.id}
                className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden"
                data-ocid={`rentals.item.${idx + 1}`}
              >
                {/* Discount banner */}
                {activeDiscounts.length > 0 && (
                  <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-sm">
                      local_offer
                    </span>
                    <p className="text-xs text-amber-300 font-medium truncate">
                      {activeDiscounts[0].message}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="w-full text-left hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelected({ business, owner })}
                >
                  {(business.photos ?? [])[0] && (
                    <div className="relative">
                      <img
                        src={(business.photos ?? [])[0]}
                        alt={business.name}
                        className="w-full h-36 object-cover"
                      />
                      {openStatus && (
                        <span
                          className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                            openStatus === "open"
                              ? "bg-green-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          {openStatus === "open" ? "Open" : "Closed"}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white truncate">
                        {business.name}
                      </h3>
                      {openStatus && (business.photos ?? []).length === 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                            openStatus === "open"
                              ? "bg-green-500/20 border border-green-500/40 text-green-400"
                              : "bg-red-500/20 border border-red-500/40 text-red-400"
                          }`}
                        >
                          {openStatus === "open" ? "Open" : "Closed"}
                        </span>
                      )}
                    </div>
                    {business.description && (
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    {vehicleTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {vehicleTypes.map((type) => (
                          <span
                            key={type}
                            className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                    {minPrice !== null && (
                      <p className="text-xs text-amber-400 font-bold mt-2">
                        From ₹{minPrice}/day
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600/15 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-600/25 transition-colors"
                          data-ocid="rentals.button"
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
                        data-ocid="rentals.button"
                      >
                        <span className="material-symbols-outlined text-sm">
                          info
                        </span>
                        Details
                      </button>
                      {currentUserRole !== "member" &&
                        currentUserRole !== "creator" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInquiryCard({ business, owner });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition-colors"
                            data-ocid="rentals.button"
                          >
                            <span className="material-symbols-outlined text-sm">
                              chat
                            </span>
                            Enquire
                          </button>
                        )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <RentalDetailPanel
          business={selected.business}
          owner={selected.owner}
          currentUserId={currentUser?.id ?? ""}
          currentUsername={currentUser?.username ?? ""}
          currentUserRole={currentUserRole}
          onClose={() => setSelected(null)}
        />
      )}

      {showInquiryCard && (
        <InquiryModal
          businessId={showInquiryCard.business.id}
          businessName={showInquiryCard.business.name}
          memberUsername={showInquiryCard.owner.username}
          businessType={showInquiryCard.business.businessType}
          fromUserId={currentUser?.id ?? ""}
          fromUsername={currentUser?.username ?? ""}
          onClose={() => setShowInquiryCard(null)}
        />
      )}
    </div>
  );
}
