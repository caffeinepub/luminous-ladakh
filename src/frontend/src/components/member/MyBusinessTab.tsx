import { useRef, useState } from "react";
import { toast } from "sonner";
import { generateId } from "../../data/seed";
import type {
  Account,
  Business,
  BusinessType,
  MenuItem,
  RentalAddon,
  RoomType,
  Violation,
} from "../../types";

const MILITARY_KEYWORDS = [
  "army",
  "military",
  "cantonment",
  "regiment",
  "battalion",
  "corps",
  "brigade",
  "sector",
  "lac",
  "line of actual control",
  "armed forces",
  "jawans",
  "troops",
  "barracks",
];

function checkMilitary(text: string): boolean {
  const lower = text.toLowerCase();
  return MILITARY_KEYWORDS.some((kw) => lower.includes(kw));
}

function base64Size(b64: string): number {
  return Math.round((b64.length * 3) / 4);
}

const inputCls =
  "w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-4 py-3 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm";

const CATEGORIES = [
  "Hotels",
  "Food & Dining",
  "Shopping",
  "Services",
  "Tourism",
  "Health",
  "Education",
  "Transport",
  "Other",
];

const ROOM_AMENITIES = [
  "WiFi",
  "AC",
  "Hot Water",
  "Parking",
  "Room Service",
  "Breakfast Included",
];

const ROOM_TYPES = ["Suite", "Deluxe", "Standard", "Family"] as const;
const MENU_CATEGORIES = ["Starters", "Main Course", "Desserts", "Beverages"];
const VEHICLE_TYPES = ["Bike", "Car", "Bicycle", "Scooter"];

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  hotel: "🏨 Hotel",
  restaurant: "🍽️ Restaurant",
  rental: "🚗 Rental Agency",
  other: "🏦 Other Business",
};

interface Props {
  currentUser: Account;
  reviews: {
    targetMemberId: string;
    rating: number;
    comment: string;
    reviewerUsername: string;
  }[];
  onUpdate: (updates: Partial<Account>) => void;
  onIssueViolation?: (v: Omit<Violation, "id" | "timestamp">) => void;
}

function StorageBar({ usedMB, limitMB }: { usedMB: number; limitMB: number }) {
  const pct = Math.min(100, (usedMB / limitMB) * 100);
  const color =
    pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>Storage Used</span>
        <span>
          {usedMB.toFixed(1)} MB /{" "}
          {limitMB >= 1000 ? `${limitMB / 1024} GB` : `${limitMB} MB`}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct > 90 && (
        <p className="text-xs text-red-400 mt-1">
          Storage almost full! Delete some files.
        </p>
      )}
    </div>
  );
}

// ----- Room Type Form -----
function RoomTypeForm({
  onSave,
  onCancel,
  initial,
}: {
  onSave: (r: RoomType) => void;
  onCancel: () => void;
  initial?: RoomType;
}) {
  const [rType, setRType] = useState<RoomType["type"]>(
    initial?.type ?? "Standard",
  );
  const [price, setPrice] = useState(String(initial?.pricePerNight ?? ""));
  const [maxGuests, setMaxGuests] = useState(String(initial?.maxGuests ?? "2"));
  const [amenities, setAmenities] = useState<string[]>(
    initial?.amenities ?? [],
  );
  const [available, setAvailable] = useState(
    String(initial?.availableCount ?? "1"),
  );

  function toggleAmenity(a: string) {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  function handleSave() {
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    onSave({
      id: initial?.id ?? generateId(),
      type: rType,
      pricePerNight: priceNum,
      maxGuests: Number(maxGuests) || 2,
      amenities,
      availableCount: Number(available) || 0,
      photos: initial?.photos ?? [],
    });
  }

  return (
    <div className="bg-zinc-800/60 border border-amber-500/20 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Room Type</p>
          <select
            className={inputCls}
            value={rType}
            onChange={(e) => setRType(e.target.value as RoomType["type"])}
          >
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Price/Night (₹)</p>
          <input
            className={inputCls}
            type="number"
            min="0"
            placeholder="2500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Max Guests</p>
          <input
            className={inputCls}
            type="number"
            min="1"
            max="10"
            placeholder="2"
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
          />
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Available Today</p>
          <input
            className={inputCls}
            type="number"
            min="0"
            placeholder="3"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
          />
        </div>
      </div>
      <div>
        <p className="block text-xs text-zinc-400 mb-2">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {ROOM_AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                amenities.includes(a)
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
        >
          Save Room
        </button>
      </div>
    </div>
  );
}

// ----- Menu Item Form -----
function MenuItemForm({
  onSave,
  onCancel,
  initial,
}: {
  onSave: (m: MenuItem) => void;
  onCancel: () => void;
  initial?: MenuItem;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(
    initial?.category ?? MENU_CATEGORIES[0],
  );
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isVeg, setIsVeg] = useState(initial?.isVeg ?? true);

  function handleSave() {
    if (!name.trim()) {
      toast.error("Item name required");
      return;
    }
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Enter a valid price");
      return;
    }
    onSave({
      id: initial?.id ?? generateId(),
      name: name.trim(),
      category,
      price: priceNum,
      description: description.trim() || undefined,
      photo: initial?.photo,
      isVeg,
    });
  }

  return (
    <div className="bg-zinc-800/60 border border-amber-500/20 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <p className="block text-xs text-zinc-400 mb-1">Item Name *</p>
          <input
            className={inputCls}
            placeholder="e.g. Butter Chicken"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Category</p>
          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {MENU_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Price (₹)</p>
          <input
            className={inputCls}
            type="number"
            min="0"
            placeholder="250"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
      <div>
        <p className="block text-xs text-zinc-400 mb-1">Description</p>
        <input
          className={inputCls}
          placeholder="Optional description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400">Type:</span>
        <button
          type="button"
          onClick={() => setIsVeg(true)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            isVeg
              ? "bg-green-600/20 border-green-500/60 text-green-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-400"
          }`}
        >
          🟢 Vegetarian
        </button>
        <button
          type="button"
          onClick={() => setIsVeg(false)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !isVeg
              ? "bg-red-600/20 border-red-500/60 text-red-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-400"
          }`}
        >
          🔴 Non-Veg
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
        >
          Save Item
        </button>
      </div>
    </div>
  );
}

// ----- Rental Addon Form -----
function RentalAddonForm({
  onSave,
  onCancel,
  initial,
}: {
  onSave: (r: RentalAddon) => void;
  onCancel: () => void;
  initial?: RentalAddon;
}) {
  const [vehicleType, setVehicleType] = useState(
    initial?.vehicleType ?? VEHICLE_TYPES[0],
  );
  const [model, setModel] = useState(initial?.model ?? "");
  const [pricePerDay, setPricePerDay] = useState(
    String(initial?.pricePerDay ?? ""),
  );
  const [pricePerMonth, setPricePerMonth] = useState(
    String(initial?.pricePerMonth ?? ""),
  );
  const [available, setAvailable] = useState(initial?.available ?? true);

  function handleSave() {
    if (!model.trim()) {
      toast.error("Vehicle model required");
      return;
    }
    const dayPrice = Number(pricePerDay);
    if (!pricePerDay || Number.isNaN(dayPrice) || dayPrice <= 0) {
      toast.error("Enter a valid price per day");
      return;
    }
    onSave({
      id: initial?.id ?? generateId(),
      vehicleType,
      model: model.trim(),
      pricePerDay: dayPrice,
      pricePerMonth: pricePerMonth ? Number(pricePerMonth) : undefined,
      photo: initial?.photo,
      available,
    });
  }

  return (
    <div className="bg-zinc-800/60 border border-amber-500/20 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Vehicle Type</p>
          <select
            className={inputCls}
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Model *</p>
          <input
            className={inputCls}
            placeholder="e.g. Royal Enfield 350"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Price/Day (₹)</p>
          <input
            className={inputCls}
            type="number"
            min="0"
            placeholder="800"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
          />
        </div>
        <div>
          <p className="block text-xs text-zinc-400 mb-1">Price/Month (₹)</p>
          <input
            className={inputCls}
            type="number"
            min="0"
            placeholder="Optional"
            value={pricePerMonth}
            onChange={(e) => setPricePerMonth(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400">Status:</span>
        <button
          type="button"
          onClick={() => setAvailable(true)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            available
              ? "bg-green-600/20 border-green-500/60 text-green-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-400"
          }`}
        >
          Available
        </button>
        <button
          type="button"
          onClick={() => setAvailable(false)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !available
              ? "bg-red-600/20 border-red-500/60 text-red-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-400"
          }`}
        >
          Unavailable
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
        >
          Save Vehicle
        </button>
      </div>
    </div>
  );
}

export function MemberBusinessTab({
  currentUser,
  reviews,
  onUpdate,
  onIssueViolation,
}: Props) {
  const isPremier = currentUser.membershipTier === "Premier";
  const maxBusinesses = isPremier ? 3 : 1;
  const storageLimitMB = isPremier ? 1024 : 300;

  const businesses: Business[] = Array.isArray(currentUser.businesses)
    ? currentUser.businesses
    : [];

  let usedBytes = 0;
  for (const biz of businesses) {
    for (const p of biz.photos ?? []) usedBytes += base64Size(p);
    if (biz.videoUrl) usedBytes += base64Size(biz.videoUrl);
  }
  const usedMB = usedBytes / (1024 * 1024);

  const [editing, setEditing] = useState<Business | null>(null);
  const [isNew, setIsNew] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formDesc, setFormDesc] = useState("");
  const [formMaps, setFormMaps] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formVideo, setFormVideo] = useState("");
  const [formBizType, setFormBizType] = useState<BusinessType>("other");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRoomTypes, setFormRoomTypes] = useState<RoomType[]>([]);
  const [formMenuItems, setFormMenuItems] = useState<MenuItem[]>([]);
  const [formRentalAddons, setFormRentalAddons] = useState<RentalAddon[]>([]);

  // Sub-form visibility
  const [addingRoom, setAddingRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [addingMenuItem, setAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [addingRental, setAddingRental] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalAddon | null>(null);

  function getBizTypeLabel(biz: Business): string {
    if (biz.businessType) return BUSINESS_TYPE_LABELS[biz.businessType];
    return "🏦 Other Business";
  }

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setFormName("");
    setFormCategory(CATEGORIES[0]);
    setFormDesc("");
    setFormMaps("");
    setFormPhotos([]);
    setFormVideo("");
    setFormBizType("other");
    setFormPhone("");
    setFormEmail("");
    setFormRoomTypes([]);
    setFormMenuItems([]);
    setFormRentalAddons([]);
    setAddingRoom(false);
    setEditingRoom(null);
    setAddingMenuItem(false);
    setEditingMenuItem(null);
    setAddingRental(false);
    setEditingRental(null);
  }

  function openEdit(biz: Business) {
    setIsNew(false);
    setEditing(biz);
    setFormName(biz.name);
    setFormCategory(biz.category || CATEGORIES[0]);
    setFormDesc(biz.description);
    setFormMaps(biz.mapsUrl);
    setFormPhotos(biz.photos ?? []);
    setFormVideo(biz.videoUrl || "");
    setFormBizType(biz.businessType ?? "other");
    setFormPhone(biz.phone ?? "");
    setFormEmail(biz.email ?? "");
    setFormRoomTypes(biz.roomTypes ?? []);
    setFormMenuItems(biz.menuItems ?? []);
    setFormRentalAddons(biz.rentalAddons ?? []);
    setAddingRoom(false);
    setEditingRoom(null);
    setAddingMenuItem(false);
    setEditingMenuItem(null);
    setAddingRental(false);
    setEditingRental(null);
  }

  function validateMapsUrl(url: string): boolean {
    if (!url) return false;
    return (
      url.startsWith("https://maps.google.com") ||
      url.startsWith("https://www.google.com/maps") ||
      url.startsWith("https://goo.gl/maps") ||
      url.startsWith("https://maps.app.goo.gl")
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const toAdd: string[] = [];
    for (const file of files) {
      if (checkMilitary(file.name)) {
        toast.error(
          "Upload blocked: possible military content detected. Level 2 warning issued.",
        );
        onIssueViolation?.({
          targetUserId: currentUser.id,
          targetUsername: currentUser.username,
          targetRole: currentUser.role,
          level: 2,
          reason: "Military/army content detected in upload filename",
          issuedBy: "system",
          resolved: false,
        });
        continue;
      }
      const b64 = await fileToBase64(file);
      toAdd.push(b64);
    }
    setFormPhotos((prev) => [...prev, ...toAdd].slice(0, 5));
    if (e.target) e.target.value = "";
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (checkMilitary(file.name)) {
      toast.error("Upload blocked: possible military content detected.");
      return;
    }
    const b64 = await fileToBase64(file);
    setFormVideo(b64);
    if (e.target) e.target.value = "";
  }

  function saveBusiness() {
    if (!formName.trim()) {
      toast.error("Business name required");
      return;
    }
    if (!validateMapsUrl(formMaps)) {
      toast.error(
        "Please enter a valid Google Maps URL (maps.google.com, goo.gl/maps, or maps.app.goo.gl)",
      );
      return;
    }
    if (checkMilitary(formName) || checkMilitary(formDesc)) {
      toast.error("Content blocked: military-related content detected.");
      return;
    }
    // Hotel: Premier only
    if (formBizType === "hotel" && !isPremier) {
      toast.error(
        "Hotels can only be promoted by Premier members. Upgrade to Premier first.",
      );
      return;
    }
    // Hotel: require phone
    if (formBizType === "hotel" && !formPhone.trim()) {
      toast.error("Hotel listings require a contact phone number.");
      return;
    }
    // Restaurant: require phone
    if (formBizType === "restaurant" && !formPhone.trim()) {
      toast.error("Restaurant listings require a contact phone number.");
      return;
    }
    // Rental: require phone
    if (formBizType === "rental" && !formPhone.trim()) {
      toast.error("Rental listings require a contact phone number.");
      return;
    }

    const biz: Business = {
      id: editing?.id || generateId(),
      name: formName.trim(),
      category: formBizType === "hotel" ? "Hotels" : formCategory,
      description: formDesc.trim(),
      mapsUrl: formMaps.trim(),
      photos: formPhotos,
      videoUrl: isPremier && formVideo ? formVideo : undefined,
      businessType: formBizType,
      phone: formPhone.trim() || undefined,
      email: formEmail.trim() || undefined,
      roomTypes:
        formBizType === "hotel" && isPremier ? formRoomTypes : undefined,
      menuItems:
        formBizType === "hotel" || formBizType === "restaurant"
          ? formMenuItems
          : undefined,
      rentalAddons:
        formBizType === "rental" || formBizType === "hotel"
          ? formRentalAddons
          : undefined,
      lastAvailabilityUpdate:
        formBizType === "hotel" ? new Date().toISOString() : undefined,
    };

    let updated: Business[];
    if (isNew) {
      updated = [...businesses, biz];
    } else {
      updated = businesses.map((b) => (b.id === biz.id ? biz : b));
    }
    onUpdate({ businesses: updated });
    setEditing(null);
    setIsNew(false);
    toast.success(isNew ? "Business added!" : "Business updated!");
  }

  function deleteBusiness(id: string) {
    const updated = businesses.filter((b) => b.id !== id);
    onUpdate({ businesses: updated });
    toast.success("Business removed");
  }

  const showForm = isNew || editing !== null;

  const isHotelForm = formBizType === "hotel" && isPremier;
  const isRestaurantForm = formBizType === "restaurant";
  const isRentalForm = formBizType === "rental";
  const needsContact = isHotelForm || isRestaurantForm || isRentalForm;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">My Business</h2>
          <p className="text-xs text-zinc-500">
            {isPremier
              ? "Premier: up to 3 businesses + video"
              : "Common: 1 business, multiple photos"}
          </p>
        </div>
        {!showForm && businesses.length < maxBusinesses && (
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Business
          </button>
        )}
        {!showForm && businesses.length >= maxBusinesses && (
          <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-2 rounded-xl">
            Limit reached
            {!isPremier && " — Upgrade for more"}
          </span>
        )}
      </div>

      <StorageBar usedMB={usedMB} limitMB={storageLimitMB} />
      {!isPremier && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-amber-300">
            <strong>Upgrade to Premier</strong> for ₹1,500/mo to list up to 3
            businesses, add video, and customize your page.
          </p>
        </div>
      )}

      {/* Business list */}
      {!showForm &&
        businesses.map((biz) => {
          const bizReviews = reviews.filter(
            (r) => r.targetMemberId === currentUser.id,
          );
          const avg = bizReviews.length
            ? bizReviews.reduce((s, r) => s + r.rating, 0) / bizReviews.length
            : 0;
          return (
            <div
              key={biz.id}
              className="mb-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden"
            >
              {(biz.photos ?? [])[0] && (
                <img
                  src={(biz.photos ?? [])[0]}
                  alt={biz.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">{biz.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-amber-400">
                        {biz.category}
                      </span>
                      {biz.businessType && (
                        <span className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full text-zinc-300">
                          {getBizTypeLabel(biz)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(biz)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      data-ocid="business.edit_button"
                    >
                      <span className="material-symbols-outlined text-sm text-zinc-300">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBusiness(biz.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                      data-ocid="business.delete_button"
                    >
                      <span className="material-symbols-outlined text-sm text-red-400">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mt-2">{biz.description}</p>
                {biz.phone && (
                  <a
                    href={`tel:${biz.phone}`}
                    className="mt-2 text-xs text-green-400 flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">
                      call
                    </span>
                    {biz.phone}
                  </a>
                )}
                {biz.mapsUrl && (
                  <a
                    href={biz.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-xs text-amber-400 flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">
                      map
                    </span>{" "}
                    View on Maps
                  </a>
                )}
                {avg > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-amber-400 text-sm">
                      ★ {avg.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({bizReviews.length} reviews)
                    </span>
                  </div>
                )}
                {/* Hotel quick stats */}
                {biz.businessType === "hotel" &&
                  (biz.roomTypes ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(biz.roomTypes ?? []).map((room) => (
                        <span
                          key={room.id}
                          className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full text-zinc-300"
                        >
                          {room.type}: ₹{room.pricePerNight.toLocaleString()}
                          /night
                        </span>
                      ))}
                    </div>
                  )}
                {(biz.photos ?? []).length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {(biz.photos ?? []).map((p, i) => (
                      <img
                        key={String(i)}
                        src={p}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

      {!showForm && businesses.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <span className="material-symbols-outlined text-4xl block mb-2">
            store
          </span>
          <p className="text-sm">No business listed yet. Add your first one!</p>
        </div>
      )}

      {/* ---- Form ---- */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">
              {isNew ? "New Business" : "Edit Business"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsNew(false);
              }}
              className="text-zinc-500 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-5">
            {/* Business Type Selector */}
            <div>
              <p className="block text-xs text-zinc-400 mb-2">
                Business Type *
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["hotel", "🏨", "Hotel"],
                    ["restaurant", "🍽️", "Restaurant"],
                    ["rental", "🚗", "Rental Agency"],
                    ["other", "🏦", "Other"],
                  ] as const
                ).map(([type, emoji, label]) => {
                  const isDisabledHotel = type === "hotel" && !isPremier;
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={isDisabledHotel}
                      onClick={() => setFormBizType(type)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        formBizType === type
                          ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                          : isDisabledHotel
                            ? "bg-zinc-800/40 border-zinc-700/40 text-zinc-600 cursor-not-allowed"
                            : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      <span>{emoji}</span>
                      {label}
                      {type === "hotel" && !isPremier && (
                        <span className="ml-auto text-xs text-zinc-600">
                          ⭐ Premier
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {formBizType === "hotel" && !isPremier && (
                <p className="text-xs text-amber-400 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  Hotels can only be promoted by Premier members. Upgrade to
                  Premier (₹1,500/mo) to list a hotel.
                </p>
              )}
            </div>

            {/* Basic fields */}
            <div>
              <p className="block text-xs text-zinc-400 mb-1">
                Business Name *
              </p>
              <input
                className={inputCls}
                placeholder="e.g. Snow Leopard Hotel"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                data-ocid="business.input"
              />
            </div>

            {/* Category: only show for non-hotel */}
            {formBizType !== "hotel" && (
              <div>
                <p className="block text-xs text-zinc-400 mb-1">Category</p>
                <select
                  className={inputCls}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <p className="block text-xs text-zinc-400 mb-1">Description</p>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Tell customers about your business..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div>
              <p className="block text-xs text-zinc-400 mb-1">
                Google Maps URL *
              </p>
              <input
                className={inputCls}
                placeholder="https://maps.google.com/?q=..."
                value={formMaps}
                onChange={(e) => setFormMaps(e.target.value)}
              />
              <p className="text-xs text-zinc-600 mt-1">
                Must start with maps.google.com, goo.gl/maps, or maps.app.goo.gl
              </p>
            </div>

            {/* Contact Info */}
            {needsContact && (
              <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Contact Information
                </h4>
                <div>
                  <p className="block text-xs text-zinc-400 mb-1">
                    Phone Number *
                  </p>
                  <input
                    className={inputCls}
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                  <p className="text-xs text-zinc-600 mt-1">
                    Users will call this number to book / enquire
                  </p>
                </div>
                {(formBizType === "hotel" || formBizType === "restaurant") && (
                  <div>
                    <p className="block text-xs text-zinc-400 mb-1">
                      Email Address
                    </p>
                    <input
                      className={inputCls}
                      type="email"
                      placeholder="hotel@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Photos */}
            <div>
              <p className="block text-xs text-zinc-400 mb-1">Photos (max 5)</p>
              <div className="flex gap-2 flex-wrap mb-2">
                {formPhotos.map((p, i) => (
                  <div key={String(i)} className="relative">
                    <img
                      src={p}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormPhotos((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs"
                    >
                      ×
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
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                disabled={formPhotos.length >= 5}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors disabled:opacity-50"
                data-ocid="business.upload_button"
              >
                <span className="material-symbols-outlined text-sm mr-1">
                  add_photo_alternate
                </span>
                Add Photos
              </button>
            </div>

            {isPremier && (
              <div>
                <p className="block text-xs text-zinc-400 mb-1">
                  Video (Premier only)
                </p>
                {formVideo && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-400">
                      ✓ Video uploaded
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormVideo("")}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm mr-1">
                    videocam
                  </span>
                  {formVideo ? "Replace Video" : "Add Video"}
                </button>
              </div>
            )}

            {/* ---- Hotel Room Types (Premier only) ---- */}
            {isHotelForm && (
              <div className="border-t border-zinc-700 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      🛏️ Room Types
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Update availability daily
                    </p>
                  </div>
                  {!addingRoom && !editingRoom && (
                    <button
                      type="button"
                      onClick={() => setAddingRoom(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>
                      Add Room
                    </button>
                  )}
                </div>

                {formRoomTypes.map((room) => (
                  <div key={room.id}>
                    {editingRoom?.id === room.id ? (
                      <RoomTypeForm
                        initial={editingRoom}
                        onSave={(r) => {
                          setFormRoomTypes((prev) =>
                            prev.map((x) => (x.id === r.id ? r : x)),
                          );
                          setEditingRoom(null);
                        }}
                        onCancel={() => setEditingRoom(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {room.type} Room
                          </p>
                          <p className="text-xs text-zinc-500">
                            ₹{room.pricePerNight.toLocaleString()}/night ·{" "}
                            {room.availableCount} available
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingRoom(room)}
                            className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormRoomTypes((prev) =>
                                prev.filter((x) => x.id !== room.id),
                              )
                            }
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingRoom && (
                  <RoomTypeForm
                    onSave={(r) => {
                      setFormRoomTypes((prev) => [...prev, r]);
                      setAddingRoom(false);
                    }}
                    onCancel={() => setAddingRoom(false)}
                  />
                )}
              </div>
            )}

            {/* ---- Menu Items (Hotel & Restaurant) ---- */}
            {(isHotelForm || isRestaurantForm) && (
              <div className="border-t border-zinc-700 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isHotelForm ? "🍽️ In-House Menu" : "🍽️ Menu"}
                    </h4>
                    <p className="text-xs text-zinc-500">Optional</p>
                  </div>
                  {!addingMenuItem && !editingMenuItem && (
                    <button
                      type="button"
                      onClick={() => setAddingMenuItem(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>
                      Add Item
                    </button>
                  )}
                </div>

                {formMenuItems.map((item) => (
                  <div key={item.id}>
                    {editingMenuItem?.id === item.id ? (
                      <MenuItemForm
                        initial={editingMenuItem}
                        onSave={(m) => {
                          setFormMenuItems((prev) =>
                            prev.map((x) => (x.id === m.id ? m : x)),
                          );
                          setEditingMenuItem(null);
                        }}
                        onCancel={() => setEditingMenuItem(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {item.name}
                            </p>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full ${
                                item.isVeg
                                  ? "text-green-400 bg-green-600/10"
                                  : "text-red-400 bg-red-600/10"
                              }`}
                            >
                              {item.isVeg ? "🟢" : "🔴"}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {item.category} · ₹{item.price}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingMenuItem(item)}
                            className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormMenuItems((prev) =>
                                prev.filter((x) => x.id !== item.id),
                              )
                            }
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingMenuItem && (
                  <MenuItemForm
                    onSave={(m) => {
                      setFormMenuItems((prev) => [...prev, m]);
                      setAddingMenuItem(false);
                    }}
                    onCancel={() => setAddingMenuItem(false)}
                  />
                )}
              </div>
            )}

            {/* ---- Vehicle Rentals (Rental Agency & Hotel add-ons) ---- */}
            {(isRentalForm || isHotelForm) && (
              <div className="border-t border-zinc-700 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isRentalForm
                        ? "🚗 Vehicles"
                        : "🚗 Rental Add-ons (Optional)"}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      {isRentalForm
                        ? "List your vehicles"
                        : "Offer car/bike rentals to your guests"}
                    </p>
                  </div>
                  {!addingRental && !editingRental && (
                    <button
                      type="button"
                      onClick={() => setAddingRental(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>
                      Add Vehicle
                    </button>
                  )}
                </div>

                {formRentalAddons.map((addon) => (
                  <div key={addon.id}>
                    {editingRental?.id === addon.id ? (
                      <RentalAddonForm
                        initial={editingRental}
                        onSave={(r) => {
                          setFormRentalAddons((prev) =>
                            prev.map((x) => (x.id === r.id ? r : x)),
                          );
                          setEditingRental(null);
                        }}
                        onCancel={() => setEditingRental(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {addon.vehicleType} — {addon.model}
                          </p>
                          <p className="text-xs text-zinc-500">
                            ₹{addon.pricePerDay}/day
                            {addon.pricePerMonth &&
                              ` · ₹${addon.pricePerMonth}/mo`}
                            {" · "}
                            <span
                              className={
                                addon.available
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {addon.available ? "Available" : "Unavailable"}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingRental(addon)}
                            className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormRentalAddons((prev) =>
                                prev.filter((x) => x.id !== addon.id),
                              )
                            }
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingRental && (
                  <RentalAddonForm
                    onSave={(r) => {
                      setFormRentalAddons((prev) => [...prev, r]);
                      setAddingRental(false);
                    }}
                    onCancel={() => setAddingRental(false)}
                  />
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
                data-ocid="business.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveBusiness}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                data-ocid="business.submit_button"
              >
                Save Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
