import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { Account, Post, Violation } from "../../types";
import { ViolationCard } from "../shared/ViolationCard";

interface Props {
  currentUser: Account;
  posts: Post[];
  violations: Violation[];
  onUpdateBio: (bio: string) => void;
  onLogout: () => void;
}

export function UserProfileTab({
  currentUser,
  posts,
  violations,
  onUpdateBio,
  onLogout,
}: Props) {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");
  const myPosts = posts.filter((p) => p.submittedBy === currentUser.id);

  const saveBio = () => {
    onUpdateBio(bio);
    setEditingBio(false);
    toast.success("Bio updated!");
  };

  return (
    <div className="fade-in space-y-4">
      {/* Profile Header */}
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
              onClick={() => setEditingBio(true)}
              className="text-primary text-xs ml-2 shrink-0"
              type="button"
              data-ocid="profile.edit_button"
            >
              Edit bio
            </button>
          </div>
        )}
      </div>

      <ViolationCard violations={violations} userId={currentUser.id} />

      {/* My Posts */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            explore
          </span>
          My Submitted Places ({myPosts.length})
        </h3>
        {myPosts.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="profile.empty_state"
          >
            You haven&apos;t posted any places yet.
          </p>
        ) : (
          <div className="space-y-2">
            {myPosts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-secondary rounded-lg p-3"
                data-ocid={`profile.post.item.${i + 1}`}
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
        data-ocid="profile.button"
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        Sign Out
      </Button>
    </div>
  );
}
