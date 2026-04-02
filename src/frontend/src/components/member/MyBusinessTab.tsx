import { useRef, useState } from "react";
import { toast } from "sonner";
import { generateId } from "../../data/seed";
import type { Account, Business, Violation } from "../../types";

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

export function MemberBusinessTab({
  currentUser,
  reviews,
  onUpdate,
  onIssueViolation,
}: Props) {
  const isPremier = currentUser.membershipTier === "Premier";
  const maxBusinesses = isPremier ? 3 : 1;
  const storageLimitMB = isPremier ? 1024 : 300;

  const businesses: Business[] = currentUser.businesses || [];
  // Calculate used storage
  let usedBytes = 0;
  for (const biz of businesses) {
    for (const p of biz.photos) usedBytes += base64Size(p);
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

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setFormName("");
    setFormCategory(CATEGORIES[0]);
    setFormDesc("");
    setFormMaps("");
    setFormPhotos([]);
    setFormVideo("");
  }

  function openEdit(biz: Business) {
    setIsNew(false);
    setEditing(biz);
    setFormName(biz.name);
    setFormCategory(biz.category || CATEGORIES[0]);
    setFormDesc(biz.description);
    setFormMaps(biz.mapsUrl);
    setFormPhotos(biz.photos);
    setFormVideo(biz.videoUrl || "");
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

    const biz: Business = {
      id: editing?.id || generateId(),
      name: formName.trim(),
      category: formCategory,
      description: formDesc.trim(),
      mapsUrl: formMaps.trim(),
      photos: formPhotos,
      videoUrl: isPremier && formVideo ? formVideo : undefined,
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
              {biz.photos[0] && (
                <img
                  src={biz.photos[0]}
                  alt={biz.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">{biz.name}</h3>
                    <span className="text-xs text-amber-400">
                      {biz.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(biz)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-zinc-300">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBusiness(biz.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-red-400">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mt-2">{biz.description}</p>
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
                {biz.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {biz.photos.map((p, i) => (
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

      {/* Form */}
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
          <div className="space-y-4">
            <div>
              <label
                htmlFor="biz-field-1"
                className="block text-xs text-zinc-400 mb-1"
              >
                Business Name *
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Snow Leopard Cafe"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="biz-field-2"
                className="block text-xs text-zinc-400 mb-1"
              >
                Category
              </label>
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
            <div>
              <label
                htmlFor="biz-field-3"
                className="block text-xs text-zinc-400 mb-1"
              >
                Description
              </label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Tell customers about your business..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="biz-field-4"
                className="block text-xs text-zinc-400 mb-1"
              >
                Google Maps URL *
              </label>
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
            <div>
              <label
                htmlFor="biz-field-5"
                className="block text-xs text-zinc-400 mb-1"
              >
                Photos (max 5)
              </label>
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
              >
                <span className="material-symbols-outlined text-sm mr-1">
                  add_photo_alternate
                </span>
                Add Photos
              </button>
            </div>
            {isPremier && (
              <div>
                <label
                  htmlFor="biz-field-6"
                  className="block text-xs text-zinc-400 mb-1"
                >
                  Video (Premier only)
                </label>
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
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveBusiness}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
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
