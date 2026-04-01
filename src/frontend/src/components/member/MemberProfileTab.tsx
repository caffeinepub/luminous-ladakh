import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { applyTheme } from "../../hooks/useAuth";
import type { Account, Violation } from "../../types";
import { ViolationCard } from "../shared/ViolationCard";

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

export function MemberProfileTab({
  currentUser,
  violations,
  onUpdateBio,
  onUpdateUser,
  onLogout,
}: Props) {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");

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
      document.documentElement.style.setProperty(
        "--theme-bg-photo",
        `url("${dataUrl}")`,
      );
      toast.success("Custom photo theme applied!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fade-in space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
            <span className="font-heading font-bold text-2xl text-primary">
              {currentUser.username[0].toUpperCase()}
            </span>
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
                    currentUser.membershipTier === "Premier"
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
              className="bg-input border-border text-sm"
              data-ocid="profile.textarea"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground"
                onClick={saveBio}
                data-ocid="profile.save_button"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border"
                onClick={() => setEditingBio(false)}
                data-ocid="profile.cancel_button"
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
              data-ocid="profile.edit_button"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Theme Switcher */}
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
              data-ocid={`profile.theme.${t.id}`}
            >
              <p className="text-xs font-semibold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Photo theme — Premier only */}
        {currentUser.membershipTier === "Premier" && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <span className="text-primary">★</span> Premier: Custom Photo
              Theme
            </p>
            {currentUser.themePhoto && (
              <img
                src={currentUser.themePhoto}
                alt="Theme preview"
                className="w-full h-20 object-cover rounded-lg mb-2 opacity-70"
              />
            )}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoTheme}
                className="hidden"
                data-ocid="profile.photo_input"
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

      <ViolationCard violations={violations} userId={currentUser.id} />
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
