import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../../context/LanguageContext";
import { applyTheme } from "../../hooks/useAuth";
import { LANGUAGES } from "../../i18n/translations";
import type { Account, Post, Violation } from "../../types";
import { WorldLanguageDownloader } from "../WorldLanguageDownloader";
import { CameraPermissionModal } from "../shared/CameraPermissionModal";
import { ViolationCard } from "../shared/ViolationCard";

interface Props {
  currentUser: Account;
  posts: Post[];
  violations: Violation[];
  onUpdateBio: (bio: string) => void;
  onUpdateUser: (updates: Partial<Account>) => void;
  onLogout: () => void;
}

const THEMES = [
  {
    id: "dark",
    labelKey: "darkTheme",
    descKey: "darkThemeDesc",
    label: "Dark",
    desc: "Deep black",
  },
  {
    id: "slate",
    labelKey: "slateTheme",
    descKey: "slateThemeDesc",
    label: "Slate",
    desc: "Cool blue-grey",
  },
  {
    id: "warm",
    labelKey: "warmTheme",
    descKey: "warmThemeDesc",
    label: "Warm",
    desc: "Amber tones",
  },
] as const;

const FONT_COLORS = [
  { id: "default", labelKey: "colorWhite", label: "White", hex: "#f0e8d8" },
  { id: "gold", labelKey: "colorGold", label: "Gold", hex: "#e8c55a" },
  { id: "sky", labelKey: "colorSky", label: "Sky", hex: "#7dd3fc" },
  { id: "mint", labelKey: "colorMint", label: "Mint", hex: "#6ee7b7" },
  { id: "rose", labelKey: "colorRose", label: "Rose", hex: "#fda4af" },
  {
    id: "lavender",
    labelKey: "colorLavender",
    label: "Lavender",
    hex: "#c4b5fd",
  },
] as const;

function applyFontColor(colorId: string) {
  const color = FONT_COLORS.find((c) => c.id === colorId);
  if (!color) return;
  document.body.style.color = color.hex;
}

export function UserProfileTab({
  currentUser,
  posts,
  violations,
  onUpdateBio,
  onUpdateUser,
  onLogout,
}: Props) {
  const { t, language, setLanguage, isPWA } = useLanguage();
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");
  const photoRef = useRef<HTMLInputElement>(null);
  const myPosts = posts.filter((p) => p.submittedBy === currentUser.id);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [photoPermissionGranted, setPhotoPermissionGranted] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);

  const saveBio = () => {
    onUpdateBio(bio);
    setEditingBio(false);
    toast.success(t("updated", "Bio updated!"));
  };

  const handleThemeChange = (theme: string) => {
    onUpdateUser({ theme: theme as Account["theme"] });
    applyTheme(theme);
    toast.success(`${t("theme", "Theme")} \u2192 ${theme}`);
  };

  const handleFontColor = (colorId: string) => {
    onUpdateUser({ fontColor: colorId as Account["fontColor"] });
    applyFontColor(colorId);
    toast.success(t("updated", "Font color updated!"));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateUser({ profilePhoto: reader.result as string });
      toast.success(t("updated", "Profile photo updated!"));
    };
    reader.readAsDataURL(file);
  };

  const handleEditPhotoClick = () => {
    if (photoPermissionGranted) {
      photoRef.current?.click();
    } else {
      setShowCameraModal(true);
    }
  };

  const handlePermissionAllow = () => {
    setPhotoPermissionGranted(true);
    setShowCameraModal(false);
    photoRef.current?.click();
  };

  return (
    <div className="fade-in space-y-4">
      <CameraPermissionModal
        open={showCameraModal}
        onAllow={handlePermissionAllow}
        onDeny={() => setShowCameraModal(false)}
      />

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {currentUser.profilePhoto ? (
              <img
                src={currentUser.profilePhoto}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/40"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                <span className="font-bold text-2xl text-primary">
                  {currentUser.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleEditPhotoClick}
              className="absolute -bottom-1 -right-1 bg-primary rounded-full w-5 h-5 flex items-center justify-center"
              data-ocid="profile.upload_button"
            >
              <span className="material-symbols-outlined text-black text-xs">
                edit
              </span>
            </button>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-xl font-bold">
              @{currentUser.username}
            </h2>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
              {t(currentUser.role as string, currentUser.role)}
            </span>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary">badge</span>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("electronicId", "Electronic ID")}
            </p>
            <p className="font-heading font-bold text-primary">
              {currentUser.electronicId}
            </p>
          </div>
        </div>
        {editingBio ? (
          <div className="space-y-2">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="bg-zinc-900 border-zinc-700 text-white text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground"
                onClick={saveBio}
                data-ocid="profile.save_button"
              >
                {t("save", "Save")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border"
                onClick={() => setEditingBio(false)}
                data-ocid="profile.cancel_button"
              >
                {t("cancel", "Cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted-foreground flex-1">
              {currentUser.bio || t("yourBio", "No bio yet.")}
            </p>
            <button
              onClick={() => setEditingBio(true)}
              className="text-primary text-xs ml-2 shrink-0"
              type="button"
              data-ocid="profile.edit_button"
            >
              {t("editBio", "Edit bio")}
            </button>
          </div>
        )}
      </div>

      {/* Language */}
      <div
        className="bg-card border border-border rounded-xl p-4"
        data-ocid="profile.language.panel"
      >
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            language
          </span>
          {t("language", "Language")}
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              data-ocid="profile.language.toggle"
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                language === lang.code
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-border bg-secondary hover:border-amber-400/40"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">
                  {lang.nativeName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {lang.name}
                </p>
              </div>
            </button>
          ))}
        </div>
        {isPWA && <WorldLanguageDownloader />}
      </div>

      {/* Theme */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            palette
          </span>
          {t("theme", "App Theme")}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleThemeChange(theme.id)}
              className={`rounded-xl p-3 text-center border transition-all ${
                (currentUser.theme || "dark") === theme.id
                  ? "border-primary bg-primary/15"
                  : "border-border bg-secondary hover:border-primary/40"
              }`}
            >
              <p className="text-xs font-semibold">
                {t(theme.labelKey, theme.label)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {theme.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Light/Dark Mode Toggle */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            light_mode
          </span>
          Display Mode
        </h3>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((mode) => {
            const stored = (() => {
              try {
                return (
                  (localStorage.getItem("lc_theme_mode") as "dark" | "light") ||
                  "dark"
                );
              } catch {
                return "dark";
              }
            })();
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem("lc_theme_mode", mode);
                    window.dispatchEvent(new Event("lc_data_changed"));
                  } catch {}
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  stored === mode
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                }`}
                data-ocid={`profile.${mode}_mode.toggle`}
              >
                <span className="material-symbols-outlined text-base">
                  {mode === "dark" ? "dark_mode" : "light_mode"}
                </span>
                {mode === "dark" ? "Dark" : "Light"}
              </button>
            );
          })}
        </div>
      </div>
      {/* Font Color */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            format_color_text
          </span>
          {t("fontColor", "Font Color")}
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {FONT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleFontColor(c.id)}
              title={t(c.labelKey, c.label)}
              className={`h-9 rounded-lg border-2 transition-all ${
                (currentUser.fontColor || "default") === c.id
                  ? "border-white scale-110"
                  : "border-transparent hover:border-white/40"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <ViolationCard violations={violations} userId={currentUser.id} />

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            explore
          </span>
          {t("discover", "My Submitted Places")} ({myPosts.length})
        </h3>
        {myPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noUndiscoveredPlaces", "You haven't posted any places yet.")}
          </p>
        ) : (
          <div className="space-y-2">
            {myPosts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-secondary rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.locationName}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === "approved"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {t(p.status as string, p.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Rules */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
        <button
          type="button"
          onClick={() => setRulesExpanded(!rulesExpanded)}
          className="w-full flex items-center justify-between"
          data-ocid="profile.rules.toggle"
        >
          <span className="flex items-center gap-2 font-semibold text-white text-sm">
            <span className="material-symbols-outlined text-amber-400 text-lg">
              policy
            </span>
            📋 Platform Rules
          </span>
          <span className="material-symbols-outlined text-zinc-400 text-sm">
            {rulesExpanded ? "expand_less" : "expand_more"}
          </span>
        </button>
        {rulesExpanded && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold text-sm shrink-0">
                1.
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Respect &amp; Authenticity
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  All content must be genuine and respectful. Fake reviews,
                  misleading business info, or impersonating users is strictly
                  prohibited and may result in suspension or permanent ban
                  (Violation Level 5+).
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold text-sm shrink-0">
                2.
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Privacy &amp; Safety
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Do not share other users&apos; personal contact details or
                  private information publicly. Content that endangers safety,
                  spreads misinformation, or violates privacy will be removed
                  and penalized.
                </p>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 mt-2">
              <p className="text-xs text-zinc-500">
                These rules are enforced by the Creator. Violations are tracked
                and escalate from Level 1 (warning) to Level 7 (permanent ban).
              </p>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full border-border text-muted-foreground"
        onClick={onLogout}
        data-ocid="profile.sign_out_button"
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        {t("signOut", "Sign Out")}
      </Button>
    </div>
  );
}
