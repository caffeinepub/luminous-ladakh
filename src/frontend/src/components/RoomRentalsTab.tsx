import { useRef, useState } from "react";
import { toast } from "sonner";
import { generateId } from "../data/seed";
import type { PendingPayment, RoomRental } from "../types";

const LS_ROOM_RENTALS = "lc_room_rentals";
const LS_PENDING_PAYMENTS = "lc_pendingPayments";

function getRoomRentals(): RoomRental[] {
  try {
    return JSON.parse(localStorage.getItem(LS_ROOM_RENTALS) || "[]");
  } catch {
    return [];
  }
}

const PRICE_FILTERS = [
  { label: "All Prices", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under ₹500", min: 0, max: 499 },
  { label: "₹500–₹1500", min: 500, max: 1500 },
  { label: "₹1500+", min: 1501, max: Number.POSITIVE_INFINITY },
];

function daysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

interface Props {
  currentUserRole: string;
  currentUser?: { id: string; username: string };
}

export function RoomRentalsTab({
  currentUserRole: _currentUserRole,
  currentUser: _currentUser,
}: Props) {
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const [selectedRoom, setSelectedRoom] = useState<RoomRental | null>(null);

  const allRentals = getRoomRentals();
  const now = new Date();

  const activeRentals = allRentals.filter(
    (r) => r.status === "active" && new Date(r.expiresAt) > now,
  );

  const priceRange = PRICE_FILTERS.find((f) => f.label === priceFilter)!;
  const filtered = activeRentals.filter(
    (r) =>
      r.pricePerNight >= priceRange.min && r.pricePerNight <= priceRange.max,
  );

  if (selectedRoom) {
    const days = daysRemaining(selectedRoom.expiresAt);
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedRoom(null)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 text-sm"
          data-ocid="rooms.back.button"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Back to Rooms
        </button>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {selectedRoom.photos.length > 0 ? (
            <div className="h-56 overflow-hidden">
              <img
                src={selectedRoom.photos[0]}
                alt={selectedRoom.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-56 bg-zinc-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-zinc-600 text-5xl">
                meeting_room
              </span>
            </div>
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedRoom.title}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {selectedRoom.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-400">
                  ₹{selectedRoom.pricePerNight.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">/night</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 mb-4">
              {selectedRoom.description}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500">Max Guests</p>
                <p className="font-semibold text-white">
                  {selectedRoom.maxGuests} person
                  {selectedRoom.maxGuests !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500">Days Left</p>
                <p
                  className={`font-semibold ${days <= 2 ? "text-red-400" : days <= 5 ? "text-amber-400" : "text-green-400"}`}
                >
                  {days} day{days !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {selectedRoom.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
                {selectedRoom.photos.map((photo, idx) => (
                  <img
                    key={photo.slice(0, 30)}
                    src={photo}
                    alt={`Room view ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  />
                ))}
              </div>
            )}
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-500 mb-1">Posted by</p>
              <p className="text-sm font-semibold text-white">
                @{selectedRoom.postedByUsername} · {selectedRoom.postedByRole}
              </p>
              <a
                href={`tel:${selectedRoom.contactNumber}`}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors"
                data-ocid="rooms.contact.button"
              >
                <span className="material-symbols-outlined">call</span>
                Call {selectedRoom.contactNumber}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Room Rentals</h2>
      <p className="text-xs text-zinc-500 mb-4">
        Homeowners renting rooms in Ladakh
      </p>

      {/* Price filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
        {PRICE_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setPriceFilter(f.label)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
              priceFilter === f.label
                ? "bg-amber-500/20 border-amber-500/60 text-amber-400 font-semibold"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
            data-ocid="rooms.filter.tab"
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-zinc-500"
          data-ocid="rooms.empty_state"
        >
          <span className="material-symbols-outlined text-5xl block mb-3">
            meeting_room
          </span>
          <p className="font-semibold">No rooms available right now</p>
          <p className="text-xs mt-1">
            Check back soon, or post your own room from your Profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((room, idx) => {
            const days = daysRemaining(room.expiresAt);
            return (
              <div
                key={room.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                data-ocid={`rooms.item.${idx + 1}`}
              >
                <div className="flex gap-0">
                  {room.photos.length > 0 ? (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={room.photos[0]}
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-zinc-600 text-3xl">
                        meeting_room
                      </span>
                    </div>
                  )}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {room.title}
                      </h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          days <= 2
                            ? "bg-red-500/20 text-red-400"
                            : days <= 5
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {days}d left
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {room.location}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-bold text-amber-400">
                        ₹{room.pricePerNight.toLocaleString()}/night
                      </span>
                      <span className="text-xs text-zinc-500">
                        {room.maxGuests} guest{room.maxGuests !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      @{room.postedByUsername}
                    </p>
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className="w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-semibold text-xs py-2 rounded-xl transition-colors"
                    data-ocid={`rooms.view_details.button.${idx + 1}`}
                  >
                    View Details & Contact
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === MY ROOM LISTINGS (used in profile tabs) ===

interface MyRoomListingsProps {
  currentUserId: string;
  currentUsername: string;
  currentUserRole: string;
  currentUserEmail: string;
}

function addPendingPayment(payment: Omit<PendingPayment, "id">): string {
  const id = generateId();
  const list: PendingPayment[] = JSON.parse(
    localStorage.getItem(LS_PENDING_PAYMENTS) || "[]",
  );
  list.push({ id, ...payment });
  localStorage.setItem(LS_PENDING_PAYMENTS, JSON.stringify(list));
  window.dispatchEvent(new Event("lc_data_changed"));
  return id;
}

function addRoomRental(rental: RoomRental) {
  const list = getRoomRentals();
  list.unshift(rental);
  localStorage.setItem(LS_ROOM_RENTALS, JSON.stringify(list));
  window.dispatchEvent(new Event("lc_data_changed"));
}

export function MyRoomListings({
  currentUserId,
  currentUsername,
  currentUserRole,
  currentUserEmail,
}: MyRoomListingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [upiStep, setUpiStep] = useState<{
    paymentId: string;
    rentalId: string;
  } | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricePerNight: "",
    maxGuests: "",
    contactNumber: "",
    location: "",
    photos: [] as string[],
  });

  const allRentals = getRoomRentals();
  const myRentals = allRentals.filter((r) => r.postedById === currentUserId);

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, reader.result as string].slice(0, 10),
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmitListing() {
    if (!formData.title.trim()) {
      toast.error("Enter a title");
      return;
    }
    if (!formData.pricePerNight || Number(formData.pricePerNight) <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!formData.maxGuests || Number(formData.maxGuests) <= 0) {
      toast.error("Enter max guests");
      return;
    }
    if (!formData.contactNumber.trim()) {
      toast.error("Enter a contact number");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Enter a location");
      return;
    }

    const rentalId = generateId();
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const paymentId = addPendingPayment({
      memberId: currentUserId,
      memberUsername: currentUsername,
      memberEmail: currentUserEmail,
      amount: 1000,
      tier: "Room Rental",
      timestamp: now.toISOString(),
      status: "pending",
      paymentType: "room_rental",
      roomTitle: formData.title.trim(),
    });

    const rental: RoomRental = {
      id: rentalId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      photos: formData.photos,
      pricePerNight: Number(formData.pricePerNight),
      maxGuests: Number(formData.maxGuests),
      contactNumber: formData.contactNumber.trim(),
      location: formData.location.trim(),
      postedById: currentUserId,
      postedByUsername: currentUsername,
      postedByRole: currentUserRole,
      postedAt: now.toISOString(),
      expiresAt: twoWeeksLater.toISOString(),
      paymentId,
      status: "pending_payment",
    };

    addRoomRental(rental);
    setUpiStep({ paymentId, rentalId });
    setShowForm(false);
    setFormData({
      title: "",
      description: "",
      pricePerNight: "",
      maxGuests: "",
      contactNumber: "",
      location: "",
      photos: [],
    });
  }

  function handleUpiRefSubmit() {
    if (!upiRef.trim()) {
      toast.error("Enter the UPI transaction reference");
      return;
    }
    if (!upiStep) return;

    // Update pending payment with UPI ref
    const payments: PendingPayment[] = JSON.parse(
      localStorage.getItem(LS_PENDING_PAYMENTS) || "[]",
    );
    const idx = payments.findIndex((p) => p.id === upiStep.paymentId);
    if (idx >= 0) {
      (payments[idx] as any).upiRef = upiRef.trim();
      localStorage.setItem(LS_PENDING_PAYMENTS, JSON.stringify(payments));
      window.dispatchEvent(new Event("lc_data_changed"));
    }

    toast.success(
      "Payment reference submitted! The Creator will confirm shortly.",
    );
    setUpiStep(null);
    setUpiRef("");
  }

  function handleExtend(rentalId: string) {
    const rentals = getRoomRentals();
    const idx = rentals.findIndex((r) => r.id === rentalId);
    if (idx < 0) return;
    const r = rentals[idx];
    const base = new Date(r.extendedUntil || r.expiresAt);
    const extended = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);
    rentals[idx] = { ...r, extendedUntil: extended.toISOString() };
    localStorage.setItem(LS_ROOM_RENTALS, JSON.stringify(rentals));
    window.dispatchEvent(new Event("lc_data_changed"));

    addPendingPayment({
      memberId: currentUserId,
      memberUsername: currentUsername,
      memberEmail: currentUserEmail,
      amount: 100,
      tier: "Room Rental Extension",
      timestamp: new Date().toISOString(),
      status: "pending",
      paymentType: "room_rental",
      roomTitle: `${r.title} (Extension)`,
    });

    toast.success("Extension request submitted! Pay ₹100 via UPI to activate.");
  }

  // UPI payment step
  if (upiStep) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400">
            payment
          </span>
          Complete Payment
        </h3>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
          <p className="text-amber-400 font-bold text-2xl mb-1">₹1,000</p>
          <p className="text-xs text-zinc-400">
            One-time listing fee · 2 weeks visibility
          </p>
        </div>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3">
            <span className="text-xs text-zinc-400">Pay to UPI ID</span>
            <span className="font-mono text-sm text-amber-400">
              ladakhconnect@upi
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            1. Open Google Pay / PhonePe / Paytm
            <br />
            2. Send ₹1,000 to{" "}
            <strong className="text-amber-400">ladakhconnect@upi</strong>
            <br />
            3. Copy the transaction reference number
            <br />
            4. Paste it below and submit
          </p>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={upiRef}
            onChange={(e) => setUpiRef(e.target.value)}
            placeholder="Transaction Reference / UTR Number"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            data-ocid="rooms.upi_ref.input"
          />
          <button
            type="button"
            onClick={handleUpiRefSubmit}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl text-sm transition-colors"
            data-ocid="rooms.upi_submit.button"
          >
            Submit Reference
          </button>
          <button
            type="button"
            onClick={() => {
              setUpiStep(null);
              setUpiRef("");
            }}
            className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            data-ocid="rooms.upi_cancel.button"
          >
            I'll pay later
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
            meeting_room
          </span>
          My Room Listings ({myRentals.length})
        </h3>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg transition-colors"
            data-ocid="rooms.add_listing.button"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Room
          </button>
        )}
      </div>

      {/* Add Room Form */}
      {showForm && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3">
          <h4 className="text-sm font-semibold text-white">New Room Listing</h4>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Room title (e.g. Cozy Room in Leh)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            data-ocid="rooms.title.input"
          />
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Description (facilities, nearby attractions...)"
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            data-ocid="rooms.description.textarea"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={formData.pricePerNight}
              onChange={(e) =>
                setFormData((p) => ({ ...p, pricePerNight: e.target.value }))
              }
              placeholder="Price/night (₹)"
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              data-ocid="rooms.price.input"
            />
            <input
              type="number"
              value={formData.maxGuests}
              onChange={(e) =>
                setFormData((p) => ({ ...p, maxGuests: e.target.value }))
              }
              placeholder="Max guests"
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              data-ocid="rooms.max_guests.input"
            />
          </div>
          <input
            type="tel"
            value={formData.contactNumber}
            onChange={(e) =>
              setFormData((p) => ({ ...p, contactNumber: e.target.value }))
            }
            placeholder="Contact number"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            data-ocid="rooms.contact.input"
          />
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="Location (e.g. Leh Town, near Old Market)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            data-ocid="rooms.location.input"
          />

          {/* Photos */}
          <div>
            <p className="text-xs text-zinc-400 mb-2">Photos (up to 10)</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.photos.map((photo, i) => (
                <div
                  key={`photo-${photo.slice(0, 20)}-${i}`}
                  className="relative w-14 h-14"
                >
                  <img
                    src={photo}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        photos: p.photos.filter((_, j) => j !== i),
                      }))
                    }
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-white text-[10px]">
                      close
                    </span>
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-400 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
              data-ocid="rooms.photo.upload_button"
            >
              <span className="material-symbols-outlined text-sm">
                add_photo_alternate
              </span>
              Add Photos
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-xs text-amber-300 font-semibold">
              ₹1,000 posting fee applies
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Listing stays active for 2 weeks. Extend for ₹100/week.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmitListing}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
              data-ocid="rooms.submit_listing.button"
            >
              Post Room & Pay ₹1,000
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({
                  title: "",
                  description: "",
                  pricePerNight: "",
                  maxGuests: "",
                  contactNumber: "",
                  location: "",
                  photos: [],
                });
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm transition-colors"
              data-ocid="rooms.cancel_listing.button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* My listings */}
      {myRentals.length === 0 && !showForm ? (
        <p
          className="text-sm text-zinc-500 text-center py-4"
          data-ocid="rooms.my_listings.empty_state"
        >
          No room listings yet. Add one to rent out your space!
        </p>
      ) : (
        <div className="space-y-3">
          {myRentals.map((rental, idx) => {
            const expiry = new Date(rental.extendedUntil || rental.expiresAt);
            const days = Math.max(
              0,
              Math.ceil(
                (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              ),
            );
            const isExpiring = days <= 3 && rental.status === "active";
            return (
              <div
                key={rental.id}
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-3"
                data-ocid={`rooms.my_listing.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {rental.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {rental.location} · ₹
                      {rental.pricePerNight.toLocaleString()}/night
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      rental.status === "pending_payment"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : rental.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {rental.status === "pending_payment"
                      ? "Pending Payment"
                      : rental.status === "active"
                        ? "Active"
                        : "Expired"}
                  </span>
                </div>
                {rental.status === "active" && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Expires: {expiry.toLocaleDateString()} ({days} day
                    {days !== 1 ? "s" : ""} left)
                  </p>
                )}
                {isExpiring && (
                  <button
                    type="button"
                    onClick={() => handleExtend(rental.id)}
                    className="mt-2 w-full text-xs bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 py-2 rounded-lg transition-colors"
                    data-ocid={`rooms.extend.button.${idx + 1}`}
                  >
                    Extend 1 Week (₹100)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
