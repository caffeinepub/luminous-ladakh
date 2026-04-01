import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { applyTheme } from "../../hooks/useAuth";
import type { Account, Post, Review, Violation } from "../../types";

interface Props {
  currentUser: Account;
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  violations: Violation[];
  walletBalance: number;
  onLogout: () => void;
  onUpdateUser?: (updates: Partial<Account>) => void;
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
  document.documentElement.style.setProperty("--foreground-custom", color.hex);
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
}: Props) {
  const users = accounts.filter((a) => a.role === "user");
  const members = accounts.filter((a) => a.role === "member");
  const community = accounts.filter((a) => a.role === "community");
  const activeViolations = violations.filter((v) => !v.resolved);
  const monthlyRevenue = members.reduce(
    (s, m) => s + (m.membershipTier === "Premier" ? 1500 : 1000),
    0,
  );

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
      <div className="bg-card border border-primary/30 rounded-xl p-5 gold-glow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">
              admin_panel_settings
            </span>
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold">
              @{currentUser.username}
            </h2>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
              Creator ✦
            </span>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">badge</span>
          <div>
            <p className="text-xs text-muted-foreground">Electronic ID</p>
            <p className="font-heading font-bold text-primary">
              {currentUser.electronicId}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
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
                  ? "border-primary bg-primary/15"
                  : "border-border bg-secondary hover:border-primary/40"
              }`}
              data-ocid={`profile.theme.${t.id}`}
            >
              <p className="text-xs font-semibold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Color */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
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
              data-ocid={`profile.fontcolor.${c.id}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Tap a color to change all text in the app.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-heading font-semibold mb-3">Platform Summary</h2>
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
              className="flex items-center justify-between py-1 border-b border-border last:border-0"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-border text-muted-foreground"
        onClick={onLogout}
        data-ocid="profile.button"
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        Sign Out
      </Button>
    </div>
  );
}
