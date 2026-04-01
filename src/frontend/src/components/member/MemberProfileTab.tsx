import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { Account, Violation } from "../../types";
import { ViolationCard } from "../shared/ViolationCard";

interface Props {
  currentUser: Account;
  violations: Violation[];
  onUpdateBio: (bio: string) => void;
  onLogout: () => void;
}

export function MemberProfileTab({
  currentUser,
  violations,
  onUpdateBio,
  onLogout,
}: Props) {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");

  const saveBio = () => {
    onUpdateBio(bio);
    setEditingBio(false);
    toast.success("Bio updated!");
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
