import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { Account, Review } from "../../types";

interface Props {
  member: Account;
  reviews: Review[];
  currentUserId?: string;
  currentUserRole?: string;
  onClose: () => void;
  onAddReview: (review: Omit<Review, "id" | "timestamp">) => void;
}

export function MemberProfileModal({
  member,
  reviews,
  currentUserId,
  currentUserRole,
  onClose,
  onAddReview,
}: Props) {
  const memberReviews = reviews.filter((r) => r.targetMemberId === member.id);
  const avgRating = memberReviews.length
    ? (
        memberReviews.reduce((s, r) => s + r.rating, 0) / memberReviews.length
      ).toFixed(1)
    : null;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const alreadyReviewed = memberReviews.some(
    (r) => r.reviewerUserId === currentUserId,
  );

  const submitReview = () => {
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    onAddReview({
      targetMemberId: member.id,
      targetMemberName: member.businessName || member.username,
      reviewerUserId: currentUserId!,
      reviewerUsername: "",
      rating,
      comment: comment.trim(),
    });
    toast.success("Review submitted!");
    setComment("");
    setShowReviewForm(false);
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
        data-ocid="member.modal"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold">
                {member.businessName || member.username}
              </h2>
              <p className="text-sm text-primary">{member.businessCategory}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="material-symbols-outlined text-base">
                  location_on
                </span>
                {member.businessLocation}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              type="button"
              data-ocid="member.close_button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {avgRating && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-lg ${s <= Math.round(Number.parseFloat(avgRating)) ? "text-primary" : "text-muted-foreground"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold">{avgRating}</span>
              <span className="text-xs text-muted-foreground">
                ({memberReviews.length} reviews)
              </span>
            </div>
          )}

          {member.membershipTier && (
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                member.membershipTier === "Premier"
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {member.membershipTier === "Premier"
                ? "✦ Premier Member"
                : "· Common Member"}
            </span>
          )}

          {member.businessDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {member.businessDescription}
            </p>
          )}

          <div className="border-t border-border pt-4">
            <h3 className="font-heading font-semibold text-sm mb-3">
              Reviews ({memberReviews.length})
            </h3>
            {memberReviews.length === 0 ? (
              <p
                className="text-sm text-muted-foreground"
                data-ocid="member.empty_state"
              >
                No reviews yet. Be the first!
              </p>
            ) : (
              <div className="space-y-3">
                {memberReviews.map((r, idx) => (
                  <div
                    key={r.id}
                    className="bg-secondary rounded-lg p-3"
                    data-ocid={`member.review.item.${idx + 1}`}
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentUserRole === "user" && currentUserId && !alreadyReviewed && (
            <div className="border-t border-border pt-4">
              {!showReviewForm ? (
                <Button
                  className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                  onClick={() => setShowReviewForm(true)}
                  data-ocid="member.open_modal_button"
                >
                  Write a Review
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground mr-2">
                      Rating:
                    </span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? "text-primary" : "text-muted-foreground"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-input border-border text-sm"
                    rows={3}
                    data-ocid="member.textarea"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-primary text-primary-foreground"
                      onClick={submitReview}
                      data-ocid="member.submit_button"
                    >
                      Submit Review
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-border"
                      onClick={() => setShowReviewForm(false)}
                      data-ocid="member.cancel_button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
