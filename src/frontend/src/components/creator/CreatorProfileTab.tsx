import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../../context/LanguageContext";
import { applyTheme } from "../../hooks/useAuth";
import { LANGUAGES } from "../../i18n/translations";
import type { Account, Post, Review, Violation } from "../../types";
import { WorldLanguageDownloader } from "../WorldLanguageDownloader";

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
}

const THEMES = [
  { id: "dark", label: "Dark", desc: "Deep black" },
  { id: "slate", label: "Slate", desc: "Cool blue-grey" },
  { id: "warm", label: "Warm", desc: "Amber tones" },
] as const;

const FONT_COLORS = [
  { id: "default", label: "White", hex: "#f0e8d8" },
  { id: "gold", label: "Gold", hex: "#e8c55a" },
  { id: "sky", label: "Sky", hex: "#7dd3fc" },
  { id: "mint", label: "Mint", hex: "#6ee7b7" },
  { id: "rose", label: "Rose", hex: "#fda4af" },
  { id: "lavender", label: "Lavender", hex: "#c4b5fd" },
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
}: Props) {
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
  const currentCode = localStorage.getItem("lc_communityCode") || "blackjack";
  const { language, setLanguage, isPWA } = useLanguage();

  const photoRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateUser?.({ profilePhoto: reader.result as string });
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  }

  const handleThemeChange = (theme: string) => {
    if (onUpdateUser) onUpdateUser({ theme: theme as Account["theme"] });
    applyTheme(theme);
    toast.success(`Theme changed to ${theme}`);
  };

  const handleFontColor = (colorId: string) => {
    if (onUpdateUser)
      onUpdateUser({ fontColor: colorId as Account["fontColor"] });
    applyFontColor(colorId);
    toast.success("Font color updated!");
  };

  return (
    <div className="fade-in space-y-4">
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
              onClick={() => photoRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center"
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
              Creator ❆
            </span>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-400">
            badge
          </span>
          <div>
            <p className="text-xs text-zinc-400">Electronic ID</p>
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
          Language
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
          Community Access Code
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
            placeholder="New code..."
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
              toast.success("Community code updated!");
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm"
          >
            Save
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Community members must enter this code when signing up.
        </p>
      </div>

      {/* Theme Switcher */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
            palette
          </span>
          App Theme
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleThemeChange(t.id)}
              className={`rounded-xl p-3 text-center border transition-all ${
                (currentUser.theme || "dark") === t.id
                  ? "border-amber-500 bg-amber-500/15"
                  : "border-zinc-700 bg-zinc-800 hover:border-amber-500/40"
              }`}
            >
              <p className="text-xs font-semibold text-white">{t.label}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Color */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">
            format_color_text
          </span>
          Font Color
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {FONT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleFontColor(c.id)}
              title={c.label}
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
        <h2 className="font-semibold text-white mb-3">Platform Summary</h2>
        <div className="space-y-2">
          {[
            ["Total Users", users.length],
            ["Total Members", members.length],
            ["Community Partners", community.length],
            ["Wallet Balance", `₹${walletBalance.toLocaleString()}`],
            ["Monthly Revenue", `₹${monthlyRevenue.toLocaleString()}`],
            ["Active Violations", activeViolations.length],
            [
              "Community Discoveries",
              posts.filter((p) => p.status === "approved").length,
            ],
            ["Total Reviews", reviews.length],
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

      <Button
        variant="outline"
        className="w-full border-zinc-700 text-zinc-400 hover:text-white"
        onClick={onLogout}
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        Sign Out
      </Button>
    </div>
  );
}
