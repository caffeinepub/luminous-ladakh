import { useState } from "react";
import type {
  Account,
  Business,
  BusinessHourEntry,
  DiscountEntry,
  RoomType,
} from "../types";
import { HotelDetailPanel } from "./HotelDetailPanel";
import { BusinessQASection } from "./shared/BusinessQASection";
import { InquiryModal } from "./shared/InquiryModal";

const ROOM_FILTERS = ["All", "Suite", "Deluxe", "Standard", "Family"];
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

function getRoomTypeSummary(roomTypes: RoomType[]): string {
  if (!roomTypes || roomTypes.length === 0) return "";
  const counts = roomTypes.reduce(
    (acc, rt) => {
      acc[rt.type] = (acc[rt.type] || 0) + rt.availableCount;
      return acc;
    },
    {} as Record<string, number>,
  );
  return Object.entries(counts)
    .map(([t, c]) => `${c} ${t}`)
    .join(" · ");
}

interface HotelCardProps {
  business: Business;
  owner: Account;
  currentUserId: string;
  currentUsername: string;
  currentUserRole: string;
  onViewDetails: () => void;
}

function HotelCard({
  business,
  owner,
  currentUserId,
  currentUsername,
  currentUserRole,
  onViewDetails,
}: HotelCardProps) {
  const [showQA, setShowQA] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const activeDiscounts = getActiveDiscounts(business.id);
  const openStatus = getOpenStatus(business.businessHours);
  const roomTypes = business.roomTypes ?? [];
  const coverPhoto = business.photos?.[0] ?? "";
  const totalRooms = roomTypes.reduce((s, r) => s + (r.availableCount ?? 0), 0);

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Photo */}
        {coverPhoto ? (
          <div className="h-44 overflow-hidden">
            <img
              src={coverPhoto}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-44 bg-zinc-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-zinc-600 text-4xl">
              hotel
            </span>
          </div>
        )}

        <div className="p-4">
          {/* Discount banners */}
          {activeDiscounts.map((d) => (
            <div
              key={d.id}
              className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-amber-400 text-base">
                local_offer
              </span>
              <span className="text-xs text-amber-300 font-medium">
                {d.message}
              </span>
            </div>
          ))}

          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  {business.name}
                </h3>
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold">
                  Premier Hotel
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                {business.description}
              </p>
            </div>
          </div>

          {/* Room info */}
          {roomTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {roomTypes.map((rt) => (
                <span
                  key={rt.id}
                  className="text-xs px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300"
                >
                  {rt.type} · ₹{rt.pricePerNight.toLocaleString()}/night
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
            <span className="material-symbols-outlined text-sm">bed</span>
            <span>
              {totalRooms > 0
                ? `${totalRooms} room${totalRooms !== 1 ? "s" : ""} available · ${getRoomTypeSummary(roomTypes)}`
                : "Check availability"}
            </span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3 mb-4">
            {owner.businesses?.[0]?.phone || (business as any).phone ? (
              <a
                href={`tel:${owner.businesses?.[0]?.phone || (business as any).phone}`}
                className="text-xs text-blue-400 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                {owner.businesses?.[0]?.phone || (business as any).phone}
              </a>
            ) : (
              <span className="text-xs text-zinc-600">@{owner.username}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onViewDetails}
              className="col-span-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
              data-ocid="hotels.view_details.button"
            >
              <span className="material-symbols-outlined text-sm">hotel</span>
              Details
            </button>
            <button
              type="button"
              onClick={() => setShowQA(!showQA)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
              data-ocid="hotels.qa.button"
            >
              <span className="material-symbols-outlined text-sm">forum</span>
              Q&amp;A
            </button>
            <button
              type="button"
              onClick={() => setShowInquiry(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
              data-ocid="hotels.enquire.button"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Enquire
            </button>
          </div>

          {/* Q&A Section */}
          {showQA && (
            <div className="mt-4">
              <BusinessQASection
                businessId={business.id}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                currentUserRole={currentUserRole}
                ownerMemberId={owner.id}
              />
            </div>
          )}
        </div>
      </div>

      {showInquiry && (
        <InquiryModal
          businessId={business.id}
          businessName={business.name}
          memberUsername={owner.username}
          businessType="hotel"
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

export function HotelsTab({ currentUserRole, currentUser }: Props) {
  const [filter, setFilter] = useState("All");
  const [detailAccount, setDetailAccount] = useState<Account | null>(null);

  const accounts: Account[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("lc_accounts") || "[]");
    } catch {
      return [];
    }
  })();

  const hotelAccounts = accounts.filter(
    (a) =>
      a.role === "member" &&
      a.status !== "banned" &&
      a.membershipTier === "Premier" &&
      (a.businesses ?? []).some((b) => b.businessType === "hotel"),
  );

  const filteredAccounts =
    filter === "All"
      ? hotelAccounts
      : hotelAccounts.filter((a) =>
          (a.businesses ?? []).some(
            (b) =>
              b.businessType === "hotel" &&
              (b.roomTypes ?? []).some((rt) => rt.type === filter),
          ),
        );

  if (detailAccount) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setDetailAccount(null)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 text-sm"
          data-ocid="hotels.back.button"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Back to Hotels
        </button>
        <HotelDetailPanel
          account={detailAccount}
          currentUserId={currentUser?.id ?? ""}
          currentUserRole={currentUserRole}
          currentUsername={currentUser?.username ?? ""}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Hotels</h2>
      <p className="text-xs text-zinc-500 mb-4">
        Premier member-managed hotels in Ladakh
      </p>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
        {ROOM_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
              filter === f
                ? "bg-amber-500/20 border-amber-500/60 text-amber-400 font-semibold"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
            data-ocid="hotels.filter.tab"
          >
            {f}
          </button>
        ))}
      </div>

      {filteredAccounts.length === 0 ? (
        <div
          className="text-center py-16 text-zinc-500"
          data-ocid="hotels.empty_state"
        >
          <span className="material-symbols-outlined text-5xl block mb-3">
            hotel
          </span>
          <p className="font-semibold">
            {filter !== "All"
              ? `No hotels with ${filter} rooms`
              : "No hotels listed yet"}
          </p>
          <p className="text-xs mt-1">
            Premier members can add hotel listings from My Business.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAccounts.map((account, idx) => {
            const hotel = (account.businesses ?? []).find(
              (b) => b.businessType === "hotel",
            );
            if (!hotel) return null;
            return (
              <div key={account.id} data-ocid={`hotels.item.${idx + 1}`}>
                <HotelCard
                  business={hotel}
                  owner={account}
                  currentUserId={currentUser?.id ?? ""}
                  currentUsername={currentUser?.username ?? ""}
                  currentUserRole={currentUserRole}
                  onViewDetails={() => setDetailAccount(account)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
