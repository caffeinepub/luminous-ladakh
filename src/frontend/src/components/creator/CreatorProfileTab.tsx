import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../../context/LanguageContext";
import { applyTheme } from "../../hooks/useAuth";
import { LANGUAGES } from "../../i18n/translations";
import type { Account, Post, Review, Violation } from "../../types";
import { WorldLanguageDownloader } from "../WorldLanguageDownloader";
import { CameraPermissionModal } from "../shared/CameraPermissionModal";

interface SpecialEntry {
  id: string;
  usernameOrEmail: string;
  addedAt: string;
}

interface Props {
  currentUser: Account;
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  violations: Violation[];
  walletBalance: number;
  onLogout: () => void;
  onUpdateUser?: (updates: Partial<Account>) => void;
  onSetCommunityCode?: (code: string) => void;
  specialAccounts?: SpecialEntry[];
  onAddSpecialAccount?: (usernameOrEmail: string) => void;
  onRemoveSpecialAccount?: (entryId: string) => void;
}

const THEMES = [
  { id: "dark", labelKey: "darkTheme", label: "Dark", desc: "Deep black" },
  {
    id: "slate",
    labelKey: "slateTheme",
    label: "Slate",
    desc: "Cool blue-grey",
  },
  { id: "warm", labelKey: "warmTheme", label: "Warm", desc: "Amber tones" },
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

export function CreatorProfileTab({
  currentUser,
  accounts,
  posts,
  reviews,
  violations,
  walletBalance,
  onLogout,
  onUpdateUser,
  onSetCommunityCode,
  specialAccounts = [],
  onAddSpecialAccount,
  onRemoveSpecialAccount,
}: Props) {
  const { t, language, setLanguage, isPWA } = useLanguage();
  const users = accounts.filter((a) => a.role === "user");
  const members = accounts.filter((a) => a.role === "member");
  const community = accounts.filter((a) => a.role === "community");
  const activeViolations = violations.filter((v) => !v.resolved);
  const monthlyRevenue = members.reduce(
    (s, m) => s + (m.membershipTier === "Premier" ? 1500 : 1000),
    0,
  );

  const [newCode, setNewCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [newSpecialEntry, setNewSpecialEntry] = useState("");
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const currentCode = localStorage.getItem("lc_communityCode") || "blackjack";

  const photoRef = useRef<HTMLInputElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [photoPermissionGranted, setPhotoPermissionGranted] = useState(false);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateUser?.({ profilePhoto: reader.result as string });
      toast.success(t("updated", "Profile photo updated!"));
    };
    reader.readAsDataURL(file);
  }

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

  const handleThemeChange = (theme: string) => {
    if (onUpdateUser) onUpdateUser({ theme: theme as Account["theme"] });
    applyTheme(theme);
    toast.success(`${t("theme", "Theme")} \u2192 ${theme}`);
  };

  const handleFontColor = (colorId: string) => {
    if (onUpdateUser)
      onUpdateUser({ fontColor: colorId as Account["fontColor"] });
    applyFontColor(colorId);
    toast.success(t("updated", "Font color updated!"));
  };

  return (
    <div className="fade-in space-y-4">
      <CameraPermissionModal
        open={showCameraModal}
        onAllow={handlePermissionAllow}
        onDeny={() => setShowCameraModal(false)}
      />

      {/* Profile Card */}
      <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {currentUser.profilePhoto ? (
              <img
                src={currentUser.profilePhoto}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400 text-3xl">
                  admin_panel_settings
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleEditPhotoClick}
              className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center"
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
          <div>
            <h2 className="text-xl font-bold text-white">
              @{currentUser.username}
            </h2>
            <p className="text-xs text-zinc-400">{currentUser.email}</p>
            <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full mt-1 inline-block">
              {t("creator", "Creator")} ❆
            </span>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-400">
            badge
          </span>
          <div>
            <p className="text-xs text-zinc-400">
              {t("electronicId", "Electronic ID")}
            </p>
            <p className="font-bold text-amber-400">
              {currentUser.electronicId}
            </p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
        data-ocid="profile.language.panel"
      >
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
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
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-zinc-700 bg-zinc-800 hover:border-amber-400/40"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold truncate ${language === lang.code ? "text-amber-400" : "text-white"}`}
                >
                  {lang.nativeName}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {lang.name}
                </p>
              </div>
            </button>
          ))}
        </div>
        {isPWA && <WorldLanguageDownloader />}
      </div>

      {/* Community Code */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
            key
          </span>
          {t("communityCode", "Community Access Code")}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white font-mono">
            {showCode ? currentCode : "•".repeat(currentCode.length)}
          </div>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
          >
            <span className="material-symbols-outlined text-sm">
              {showCode ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder={`${t("changeCode", "New code")}...`}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (!newCode.trim()) {
                toast.error("Enter a new code");
                return;
              }
              onSetCommunityCode?.(newCode.trim());
              setNewCode("");
              toast.success(t("codeSaved", "Community code updated!"));
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm"
          >
            {t("save", "Save")}
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Community members must enter this code when signing up.
        </p>
      </div>

      {/* Special Accounts */}
      <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
            star
          </span>
          {t("specialAccounts", "Special Accounts")}
        </h3>
        <p className="text-xs text-zinc-500 mb-3">
          {t(
            "specialAccountHint",
            "Members added here get Lifetime Premier access at no cost. Users get unique creation access. Both receive a one-time welcome greeting.",
          )}
        </p>
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder={t("specialAccountUsername", "Username or email...")}
            value={newSpecialEntry}
            onChange={(e) => setNewSpecialEntry(e.target.value)}
            data-ocid="special_accounts.input"
          />
          <button
            type="button"
            onClick={() => {
              if (!newSpecialEntry.trim()) {
                toast.error("Enter a username or email");
                return;
              }
              onAddSpecialAccount?.(newSpecialEntry.trim());
              setNewSpecialEntry("");
              toast.success(
                t(
                  "addedToSpecial",
                  "Special account added \u2014 Lifetime Premier granted!",
                ),
              );
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm whitespace-nowrap"
            data-ocid="special_accounts.primary_button"
          >
            {t("add", "Add")}
          </button>
        </div>
        {specialAccounts.length === 0 ? (
          <p
            className="text-xs text-zinc-600 text-center py-2"
            data-ocid="special_accounts.empty_state"
          >
            {t("noSpecialAccounts", "No special accounts yet.")}
          </p>
        ) : (
          <div className="space-y-2">
            {specialAccounts.map((entry, idx) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2"
                data-ocid={`special_accounts.item.${idx + 1}`}
              >
                <div>
                  <p className="text-sm text-white font-medium">
                    {entry.usernameOrEmail}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {new Date(entry.addedAt).toLocaleDateString()} ·
                    {t("lifetimePremier", "Lifetime Premier")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveSpecialAccount?.(entry.id);
                    toast.success(
                      t(
                        "removedFromSpecial",
                        "Removed from Special Accounts \u2014 access revoked.",
                      ),
                    );
                  }}
                  className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400"
                  title={t("remove", "Remove")}
                  data-ocid={`special_accounts.delete_button.${idx + 1}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    person_remove
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theme Switcher */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
            palette
          </span>
          {t("theme", "App Theme")}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((thm) => (
            <button
              key={thm.id}
              type="button"
              onClick={() => handleThemeChange(thm.id)}
              className={`rounded-xl p-3 text-center border transition-all ${
                (currentUser.theme || "dark") === thm.id
                  ? "border-amber-500 bg-amber-500/15"
                  : "border-zinc-700 bg-zinc-800 hover:border-amber-500/40"
              }`}
            >
              <p className="text-xs font-semibold text-white">
                {t(thm.labelKey, thm.label)}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{thm.desc}</p>
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
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
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

      {/* Stats */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">
          {t("dashboardTitle", "Platform Summary")}
        </h2>
        <div className="space-y-2">
          {[
            [t("totalUsers", "Total Users"), users.length],
            [t("totalMembers", "Total Members"), members.length],
            ["Community Partners", community.length],
            [
              t("walletBalance", "Wallet Balance"),
              `\u20b9${walletBalance.toLocaleString()}`,
            ],
            ["Monthly Revenue", `\u20b9${monthlyRevenue.toLocaleString()}`],
            ["Active Violations", activeViolations.length],
            [
              "Community Discoveries",
              posts.filter((p) => p.status === "approved").length,
            ],
            [t("reviews", "Total Reviews"), reviews.length],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between py-1 border-b border-zinc-800 last:border-0"
            >
              <span className="text-sm text-zinc-400">{label}</span>
              <span className="font-semibold text-sm text-white">{value}</span>
            </div>
          ))}
        </div>
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
        className="w-full border-zinc-700 text-zinc-400 hover:text-white"
        onClick={onLogout}
        data-ocid="profile.sign_out_button"
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        {t("signOut", "Sign Out")}
      </Button>
    </div>
  );
}
