import { useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../../context/LanguageContext";
import { loadDiscoveries, saveDiscoveries } from "../../data/discoveryData";
import type { Account, DiscoveryPost } from "../../types";

const MILITARY_KEYWORDS = [
  "army",
  "military",
  "itbp",
  "bsf",
  "camp",
  "base",
  "barracks",
  "regiment",
  "battalion",
  "soldier",
  "brigade",
  "armed forces",
];

function hasMilitaryContent(text: string): boolean {
  const lower = text.toLowerCase();
  return MILITARY_KEYWORDS.some((kw) => lower.includes(kw));
}

function generateId() {
  return `disc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface Props {
  currentUser: Account;
  onPromoteToExplore?: (post: DiscoveryPost) => void;
  isCreator?: boolean;
}

export function DiscoverTab({
  currentUser,
  onPromoteToExplore,
  isCreator,
}: Props) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<DiscoveryPost[]>(() =>
    [...loadDiscoveries()].sort((a, b) => b.upvotes.length - a.upvotes.length),
  );
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"undiscovered" | "discovered">(
    "undiscovered",
  );
  const [form, setForm] = useState({
    title: "",
    area: "",
    description: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const now = Date.now();
  const undiscoveredPosts = posts.filter(
    (p) => now - new Date(p.timestamp).getTime() < SEVEN_DAYS_MS,
  );
  const discoveredPosts = posts.filter(
    (p) => now - new Date(p.timestamp).getTime() >= SEVEN_DAYS_MS,
  );
  const displayedPosts =
    activeTab === "undiscovered" ? undiscoveredPosts : discoveredPosts;

  function handleUpvote(postId: string) {
    const all = loadDiscoveries();
    const idx = all.findIndex((p) => p.id === postId);
    if (idx < 0) return;
    const upvotes = all[idx].upvotes;
    if (upvotes.includes(currentUser.id)) {
      all[idx].upvotes = upvotes.filter((uid) => uid !== currentUser.id);
    } else {
      all[idx].upvotes = [...upvotes, currentUser.id];
    }
    saveDiscoveries(all);
    setPosts([...all].sort((a, b) => b.upvotes.length - a.upvotes.length));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setForm((p) => ({ ...p, imageUrl: evt.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.area.trim() || !form.description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (hasMilitaryContent(`${form.title} ${form.description}`)) {
      toast.error(
        t(
          "militaryWarning",
          "⚠️ Military/Army content is strictly prohibited. Your post has been blocked.",
        ),
        { duration: 6000 },
      );
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const newPost: DiscoveryPost = {
      id: generateId(),
      title: form.title.trim(),
      area: form.area.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl || undefined,
      postedBy: currentUser.id,
      postedByUsername: currentUser.username,
      timestamp: new Date().toISOString(),
      upvotes: [],
      promoted: false,
      discoveredAt: new Date().toISOString(),
    };
    const all = [...loadDiscoveries(), newPost];
    saveDiscoveries(all);
    setPosts([...all].sort((a, b) => b.upvotes.length - a.upvotes.length));
    setForm({ title: "", area: "", description: "", imageUrl: "" });
    setShowForm(false);
    setSubmitting(false);
    toast.success(t("submitted", "Discovery submitted! Thanks for sharing."));
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function getDaysOld(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {t("discoverTitle", "Discover")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("noUndiscoveredPlaces", "Hidden gems in Ladakh")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
          data-ocid="discover.open_modal_button"
        >
          <span className="material-symbols-outlined text-sm">
            add_location
          </span>
          {t("submit", "Submit")}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("undiscovered")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${
            activeTab === "undiscovered"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
          }`}
          data-ocid="discover.undiscovered.tab"
        >
          <span className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">explore</span>
            {t("undiscovered", "Undiscovered")}
            {undiscoveredPosts.length > 0 && (
              <span className="text-[10px] bg-primary/30 px-1.5 py-0.5 rounded-full">
                {undiscoveredPosts.length}
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("discovered")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${
            activeTab === "discovered"
              ? "bg-amber-500/20 text-amber-400 border-amber-500/60"
              : "bg-secondary text-muted-foreground border-border hover:border-amber-400/40"
          }`}
          data-ocid="discover.discovered.tab"
        >
          <span className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">verified</span>
            {t("discovered", "Discovered")}
            {discoveredPosts.length > 0 && (
              <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded-full">
                {discoveredPosts.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {activeTab === "discovered" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          <p className="text-xs text-amber-300 flex items-start gap-1">
            <span className="material-symbols-outlined text-sm flex-shrink-0">
              info
            </span>
            Places shared more than 7 days ago — now known to the community.
          </p>
        </div>
      )}

      {displayedPosts.length === 0 ? (
        <div className="text-center py-16" data-ocid="discover.empty_state">
          <span className="material-symbols-outlined text-5xl text-zinc-600 block mb-3">
            {activeTab === "undiscovered" ? "travel_explore" : "verified"}
          </span>
          <p className="text-zinc-400 font-semibold mb-1">
            {activeTab === "undiscovered"
              ? t("noUndiscoveredPlaces", "No new discoveries yet")
              : t("noDiscovered", "No discovered places yet")}
          </p>
          <p className="text-xs text-zinc-500">
            {activeTab === "undiscovered"
              ? t(
                  "beFirstToPost",
                  "Be the first to share a hidden gem in Ladakh!",
                )
              : "Places older than 7 days will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPosts.map((post, i) => (
            <div
              key={post.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
              data-ocid={`discover.item.${i + 1}`}
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-base">{post.title}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {post.promoted && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        {t("promoted", "Promoted")}
                      </span>
                    )}
                    {activeTab === "discovered" && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                        {getDaysOld(post.timestamp)}d ago
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">
                    location_on
                  </span>
                  {post.area}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  {post.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpvote(post.id)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        post.upvotes.includes(currentUser.id)
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-zinc-800 text-muted-foreground border-zinc-700 hover:border-primary/40"
                      }`}
                      data-ocid={`discover.toggle.${i + 1}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        thumb_up
                      </span>
                      {post.upvotes.length}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      by @{post.postedByUsername} · {formatDate(post.timestamp)}
                    </span>
                  </div>
                  {isCreator && !post.promoted && (
                    <button
                      type="button"
                      onClick={() => {
                        const all = loadDiscoveries();
                        const idx = all.findIndex((p) => p.id === post.id);
                        if (idx >= 0) {
                          all[idx].promoted = true;
                          saveDiscoveries(all);
                        }
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id ? { ...p, promoted: true } : p,
                          ),
                        );
                        onPromoteToExplore?.(post);
                        toast.success(
                          `"${post.title}" ${t(
                            "promoteToExplore",
                            "promoted to Explore!",
                          )}`,
                        );
                      }}
                      className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/25 transition-colors"
                      data-ocid={`discover.primary_button.${i + 1}`}
                    >
                      {t("promoteToExplore", "Promote to Explore")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Discovery Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowForm(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowForm(false);
          }}
          role="presentation"
        >
          <div
            className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
            data-ocid="discover.dialog"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                {t("submitPlace", "Submit a Discovery")}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                data-ocid="discover.close_button"
              >
                <span className="material-symbols-outlined text-muted-foreground">
                  close
                </span>
              </button>
            </div>

            <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 mb-4">
              <p className="text-xs text-red-300 flex items-start gap-1">
                <span className="material-symbols-outlined text-sm flex-shrink-0">
                  shield
                </span>
                {t(
                  "militaryWarning",
                  "Military or army-related content is strictly prohibited and will be auto-blocked.",
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="disc-title"
                  className="text-xs text-muted-foreground"
                >
                  {t("placeName", "Place Name")} *
                </label>
                <input
                  type="text"
                  id="disc-title"
                  placeholder="e.g. Hidden Valley near Markha"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  data-ocid="discover.input"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="disc-area"
                  className="text-xs text-muted-foreground"
                >
                  {t("placeLocation", "Area / Region")} *
                </label>
                <input
                  type="text"
                  id="disc-area"
                  placeholder="e.g. Markha Valley, Leh district"
                  value={form.area}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, area: e.target.value }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  data-ocid="discover.input"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="disc-desc"
                  className="text-xs text-muted-foreground"
                >
                  {t("placeDescription", "Description")} *
                </label>
                <textarea
                  id="disc-desc"
                  placeholder="What makes this place special?"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary resize-none"
                  data-ocid="discover.textarea"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("placePhotos", "Photo")} ({t("optional", "optional")})
                </p>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />
                {form.imageUrl ? (
                  <div className="relative">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                      className="absolute top-2 right-2 bg-black/70 rounded-full w-6 h-6 flex items-center justify-center text-white"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="w-full border border-dashed border-zinc-700 rounded-lg py-4 text-xs text-muted-foreground flex items-center justify-center gap-2 hover:border-primary/40 transition-colors"
                    data-ocid="discover.upload_button"
                  >
                    <span className="material-symbols-outlined text-sm">
                      add_photo_alternate
                    </span>
                    {t("addPhoto", "Add Photo")}
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-ocid="discover.submit_button"
              >
                {submitting
                  ? t("loading", "Submitting...")
                  : t("submitPlace2", "Submit Discovery")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
