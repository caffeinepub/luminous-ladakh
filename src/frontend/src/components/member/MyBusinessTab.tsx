import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { Account, Review } from "../../types";

interface Props {
  currentUser: Account;
  reviews: Review[];
  onUpdate: (updates: Partial<Account>) => void;
}

export function MemberBusinessTab({ currentUser, reviews, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: currentUser.businessName || "",
    businessCategory: currentUser.businessCategory || "",
    businessLocation: currentUser.businessLocation || "",
    businessDescription: currentUser.businessDescription || "",
  });
  const myReviews = reviews.filter((r) => r.targetMemberId === currentUser.id);
  const avgRating = myReviews.length
    ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(
        1,
      )
    : null;

  const saveChanges = () => {
    if (
      !form.businessName ||
      !form.businessCategory ||
      !form.businessLocation
    ) {
      toast.error("Please fill required fields");
      return;
    }
    onUpdate(form);
    setEditing(false);
    toast.success("Business profile updated!");
  };

  return (
    <div className="fade-in space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold">
              {currentUser.businessName || "Set Up Your Business"}
            </h2>
            <p className="text-sm text-primary">
              {currentUser.businessCategory}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              {currentUser.businessLocation}
            </p>
          </div>
          {avgRating && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-primary">★</span>
                <span className="font-bold">{avgRating}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {myReviews.length} reviews
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span
            className={`text-xs px-3 py-1 rounded-full border font-medium ${
              currentUser.membershipTier === "Premier"
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {currentUser.membershipTier} Member
          </span>
          <span
            className={`text-xs px-3 py-1 rounded-full border ${
              currentUser.membershipStatus === "active"
                ? "bg-green-500/10 text-green-400 border-green-500/30"
                : currentUser.membershipStatus === "trial"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {currentUser.membershipStatus}
          </span>
        </div>

        {!editing ? (
          <>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {currentUser.businessDescription || "No description yet."}
            </p>
            <Button
              size="sm"
              className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
              onClick={() => setEditing(true)}
              data-ocid="business.edit_button"
            >
              Edit Business Info
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Business Name *
              </Label>
              <Input
                value={form.businessName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, businessName: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="business.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Category *
              </Label>
              <Input
                value={form.businessCategory}
                onChange={(e) =>
                  setForm((p) => ({ ...p, businessCategory: e.target.value }))
                }
                className="bg-input border-border"
                placeholder="e.g. Handicrafts, Tourism"
                data-ocid="business.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Location *
              </Label>
              <Input
                value={form.businessLocation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, businessLocation: e.target.value }))
                }
                className="bg-input border-border"
                placeholder="e.g. Leh Main Bazaar"
                data-ocid="business.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.businessDescription}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    businessDescription: e.target.value,
                  }))
                }
                rows={4}
                className="bg-input border-border text-sm"
                data-ocid="business.textarea"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={saveChanges}
                data-ocid="business.save_button"
              >
                Save
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setEditing(false)}
                data-ocid="business.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* My Reviews */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            reviews
          </span>
          Customer Reviews ({myReviews.length})
        </h3>
        {myReviews.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="business.empty_state"
          >
            No reviews yet. They&apos;ll appear here once users review your
            business.
          </p>
        ) : (
          <div className="space-y-3">
            {myReviews.map((r, i) => (
              <div
                key={r.id}
                className="bg-secondary rounded-lg p-3"
                data-ocid={`business.review.item.${i + 1}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    @{r.reviewerUsername}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`text-sm ${s <= r.rating ? "text-primary" : "text-muted-foreground"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{r.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(r.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
