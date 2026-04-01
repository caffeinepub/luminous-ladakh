import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { applyTheme } from "../../hooks/useAuth";
import type { Account, Post, Violation } from "../../types";
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

export function UserProfileTab({
  currentUser,
  posts,
  violations,
  onUpdateBio,
  onUpdateUser,
  onLogout,
}: Props) {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");
  const photoRef = useRef<HTMLInputElement>(null);
  const myPosts = posts.filter((p) => p.submittedBy === currentUser.id);

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

  const handleFontColor = (colorId: string) => {
    onUpdateUser({ fontColor: colorId as Account["fontColor"] });
    applyFontColor(colorId);
    toast.success("Font color updated!");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-xl font-bold">
              @{currentUser.username}
            </h2>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
              {currentUser.role}
            </span>
          </div>
        </div>
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
              onClick={() => setEditingBio(true)}
              className="text-primary text-xs ml-2 shrink-0"
              type="button"
            >
              Edit bio
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
          My Submitted Places ({myPosts.length})
        </h3>
        {myPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t posted any places yet.
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
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
