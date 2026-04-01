import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { Post, Role, Violation } from "../../types";

const MILITARY_KEYWORDS = [
  "army",
  "military",
  "camp",
  "cantonment",
  "barracks",
  "soldier",
  "uniform",
  "weapon",
  "ammunition",
  "patrol",
  "restricted",
  "armed forces",
  "defence",
  "defense",
  "regiment",
  "brigade",
  "battalion",
  "artillery",
  "armoured",
  "infantry",
  "navy",
  "airforce",
  "paramilitary",
  "jawans",
];

function hasMilitaryContent(texts: string[]): boolean {
  const combined = texts.join(" ").toLowerCase();
  return MILITARY_KEYWORDS.some((kw) => combined.includes(kw));
}

interface Props {
  currentUserId: string;
  currentUsername: string;
  currentUserRole: Role;
  onClose: () => void;
  onSubmit: (post: Omit<Post, "id" | "timestamp">) => void;
  onIssueViolation: (v: Omit<Violation, "id" | "timestamp">) => void;
}

export function PostPlaceModal({
  currentUserId,
  currentUsername,
  currentUserRole,
  onClose,
  onSubmit,
  onIssueViolation,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    locationName: "",
    description: "",
    imageUrl: "",
    googleMapsLink: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (
      !form.title ||
      !form.category ||
      !form.locationName ||
      !form.description
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Military content check
    if (
      hasMilitaryContent([
        form.title,
        form.locationName,
        form.description,
        form.imageUrl,
      ])
    ) {
      setError(
        "⚠️ Military/restricted content detected. This upload has been blocked. Posting content related to army camps, military zones, or restricted areas is strictly prohibited. A Level 2 warning has been issued to your account.",
      );
      onIssueViolation({
        targetUserId: currentUserId,
        targetUsername: currentUsername,
        targetRole: currentUserRole,
        level: 2,
        reason:
          "Attempted to post military/restricted content. Auto-blocked by system.",
        issuedBy: "system",
        resolved: false,
      });
      toast.error("Military content blocked. Level 2 warning issued.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    onSubmit({
      title: form.title,
      category: form.category,
      locationName: form.locationName,
      description: form.description,
      imageUrl: form.imageUrl || undefined,
      googleMapsLink: form.googleMapsLink || undefined,
      submittedBy: currentUserId,
      submitterUsername: currentUsername,
      status: "pending",
    });
    setLoading(false);
    toast.success("Place submitted! Awaiting creator approval.");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
        onKeyDown={(e) => e.stopPropagation()}
        data-ocid="post.modal"
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-xl font-bold">
                Post Undiscovered Place
              </h2>
              <p className="text-xs text-muted-foreground">
                Share a hidden gem not on Google Maps yet
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground"
              type="button"
              data-ocid="post.close_button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Place Name *
              </Label>
              <Input
                placeholder="e.g. Secret Meditation Cave"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="post.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Category *
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger
                  className="bg-input border-border"
                  data-ocid="post.select"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Monastery">Monastery</SelectItem>
                  <SelectItem value="Park">Park / Nature</SelectItem>
                  <SelectItem value="Eco Spot">Eco Spot</SelectItem>
                  <SelectItem value="Heritage">Heritage Site</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Location Name *
              </Label>
              <Input
                placeholder="e.g. Hemis Valley, 2km past monastery"
                value={form.locationName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, locationName: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="post.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Description *
              </Label>
              <Textarea
                placeholder="Describe the place — how to get there, what makes it special..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                className="bg-input border-border"
                data-ocid="post.textarea"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Photo URL (optional)
              </Label>
              <Input
                placeholder="https://... (direct image link)"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, imageUrl: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="post.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Google Maps Link (optional)
              </Label>
              <Input
                placeholder="https://maps.google.com/?q=..."
                value={form.googleMapsLink}
                onChange={(e) =>
                  setForm((p) => ({ ...p, googleMapsLink: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="post.input"
              />
            </div>
            {error && (
              <p
                className="text-sm text-red-400 leading-relaxed"
                data-ocid="post.error_state"
              >
                {error}
              </p>
            )}
            <div className="bg-secondary rounded-lg p-3 text-xs text-muted-foreground">
              ⚠️ No military or restricted area content. Submitted places go
              through creator review.
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold"
              disabled={loading}
              data-ocid="post.submit_button"
            >
              {loading ? "Submitting..." : "Submit Place"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
