import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { applyTheme } from "../../hooks/useAuth";
import type { Account, Violation } from "../../types";
import { ViolationCard } from "../shared/ViolationCard";
import { ElectronicIDCard } from "./ElectronicIDCard";

interface Props {
  currentUser: Account;
  violations: Violation[];
  onUpdateBio: (bio: string) => void;
  onUpdateUser: (updates: Partial<Account>) => void;
  onLogout: () => void;
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

export function MemberProfileTab({
  currentUser,
  violations,
  onUpdateBio,
  onUpdateUser,
  onLogout,
}: Props) {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");
  const photoRef = useRef<HTMLInputElement>(null);

  const isPremier = currentUser.membershipTier === "Premier";

  // Storage calculation
  let usedBytes = 0;
  for (const biz of currentUser.businesses || []) {
    for (const p of biz.photos) usedBytes += Math.round((p.length * 3) / 4);
    if (biz.videoUrl) usedBytes += Math.round((biz.videoUrl.length * 3) / 4);
  }
  const usedMB = usedBytes / (1024 * 1024);
  const limitMB = isPremier ? 1024 : 300;
  const storagePct = Math.min(100, (usedMB / limitMB) * 100);

  const saveBio = () => {
    onUpdateBio(bio);
    setEditingBio(false);
    toast.success("Bio updated!");
  };

  const handleThemeChange = (theme: string) => {
    onUpdateUser({ theme: theme as Account["theme"] });
    applyTheme(theme);
    toast.success(`Theme changed to ${theme}`);
  };

  const handlePhotoTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      onUpdateUser({ themePhoto: dataUrl });
      toast.success("Custom photo theme applied!");
    };
    reader.readAsDataURL(file);
  };

  const handleFontColor = (colorId: string) => {
    onUpdateUser({ fontColor: colorId as Account["fontColor"] });
    applyFontColor(colorId);
    toast.success("Font color updated!");
  };

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateUser({ profilePhoto: reader.result as string });
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fade-in space-y-4">
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
              onClick={() => photoRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-primary rounded-full w-5 h-5 flex items-center justify-center"
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
              onChange={handleProfilePhoto}
            />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-xl font-bold">
              @{currentUser.username}
            </h2>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                Member
              </span>
              {currentUser.membershipTier && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isPremier
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {currentUser.membershipTier}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Storage bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Storage</span>
            <span>
              {usedMB.toFixed(1)} MB / {isPremier ? "1 GB" : "300 MB"}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                storagePct > 90
                  ? "bg-red-500"
                  : storagePct > 75
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${storagePct}%` }}
            />
          </div>
        </div>

        <ElectronicIDCard account={currentUser} />
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary">badge</span>
          <div>
            <p className="text-xs text-muted-foreground">Electronic ID</p>
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
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border"
                onClick={() => setEditingBio(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted-foreground flex-1">
              {currentUser.bio || "No bio yet."}
            </p>
            <button
              type="button"
              onClick={() => setEditingBio(true)}
              className="text-primary text-xs ml-2"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Theme */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            palette
          </span>
          App Theme
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
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
            >
              <p className="text-xs font-semibold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t.desc}
              </p>
            </button>
          ))}
        </div>
        {isPremier && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <span className="text-primary">★</span> Premier: Custom Photo
              Theme
            </p>
            {currentUser.themePhoto && (
              <img
                src={currentUser.themePhoto}
                alt="Theme"
                className="w-full h-20 object-cover rounded-lg mb-2 opacity-70"
              />
            )}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoTheme}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/15 text-primary border border-primary/30 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary/25 transition-colors">
                <span className="material-symbols-outlined text-sm">
                  upload
                </span>
                {currentUser.themePhoto ? "Change Photo" : "Set Theme Photo"}
              </span>
            </label>
          </div>
        )}
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
            />
          ))}
        </div>
      </div>

      <ViolationCard violations={violations} userId={currentUser.id} />
      <Button
        variant="outline"
        className="w-full border-border text-muted-foreground"
        onClick={onLogout}
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        Sign Out
      </Button>
    </div>
  );
}
