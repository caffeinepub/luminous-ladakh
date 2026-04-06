import { useState } from "react";
import { toast } from "sonner";
import type { Account } from "../../types";

export function getAvailableTitles(
  account: Account,
  _allAccounts: Account[],
): string[] {
  const base: string[] = [];
  if (account.role === "user") {
    base.push(
      "Explorer",
      "Traveller",
      "Adventure Seeker",
      "Local Resident",
      "Photo Contributor",
    );
  } else if (account.role === "member") {
    base.push(
      "Local Guide",
      "Business Owner",
      "Community Seller",
      "Verified Trader",
      "Ladakh Host",
    );
    if (account.membershipTier === "Premier") {
      base.push(
        "Elite Partner",
        "Premier Business",
        "Trusted Expert",
        "Ladakh Legend",
        "Heritage Host",
        "Gold Verified",
        "Premier Ambassador",
      );
    }
    // Trusted Seller: member for 6+ months
    const createdAt = new Date(account.createdAt).getTime();
    const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - createdAt >= sixMonths) base.push("Trusted Seller");
    // Verified Partner: Premier for 12+ months
    if (account.membershipTier === "Premier") {
      const twelveMonths = 12 * 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - createdAt >= twelveMonths) base.push("Verified Partner");
    }
  } else if (account.role === "community") {
    base.push(
      "Community Guardian",
      "Ladakh Moderator",
      "Content Reviewer",
      "Safety Monitor",
    );
  } else if (account.role === "creator") {
    base.push("App Creator", "Ladakh Connect Founder");
  }
  return base;
}

function getRankTitles(account: Account, allAccounts: Account[]): string[] {
  if (account.role !== "member") return [];

  // Load reviews from localStorage
  let reviews: Array<{ targetMemberId: string }> = [];
  try {
    reviews = JSON.parse(localStorage.getItem("lc_reviews") || "[]");
  } catch {
    reviews = [];
  }

  // Count reviews per member
  const members = allAccounts.filter((a) => a.role === "member");
  const counts = members.map((m) => ({
    id: m.id,
    count: reviews.filter((r) => r.targetMemberId === m.id).length,
  }));
  counts.sort((a, b) => b.count - a.count);

  const myRank = counts.findIndex((c) => c.id === account.id);
  if (myRank === 0 && counts[0].count > 0) return ["#1 Ranked"];
  if (myRank === 1 && counts[1]?.count > 0) return ["#2 Ranked"];
  if (myRank === 2 && counts[2]?.count > 0) return ["#3 Ranked"];
  return [];
}

interface Props {
  currentUser: Account;
  allAccounts: Account[];
  onUpdateUser: (updates: Partial<Account>) => void;
}

export function ProfileTitlePicker({
  currentUser,
  allAccounts,
  onUpdateUser,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const baseTitles = getAvailableTitles(currentUser, allAccounts);
  const rankTitles = getRankTitles(currentUser, allAccounts);
  const currentTitle = currentUser.title || "";

  function selectTitle(title: string) {
    const next = currentTitle === title ? undefined : title;
    onUpdateUser({ title: next });
    toast.success(next ? `Title set to "${next}"` : "Title removed");
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
        data-ocid="profile.title.toggle"
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <span className="material-symbols-outlined text-amber-400 text-lg">
            auto_awesome
          </span>
          My Title
          {currentTitle && (
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
              ✶ {currentTitle}
            </span>
          )}
        </span>
        <span className="material-symbols-outlined text-muted-foreground text-sm">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {!currentTitle && (
            <p className="text-xs text-muted-foreground">
              Pick a title to display above your username on posts and your
              profile.
            </p>
          )}

          {rankTitles.length > 0 && (
            <div>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-2">
                Earned — Top Ranked
              </p>
              <div className="grid grid-cols-2 gap-2">
                {rankTitles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => selectTitle(title)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      currentTitle === title
                        ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                        : "bg-secondary border-border hover:border-amber-500/40 hover:text-amber-400"
                    }`}
                    data-ocid="profile.title.select"
                  >
                    <span className="text-amber-400 mr-1">★</span>
                    {title}
                    {currentTitle === title && (
                      <span className="ml-1 text-amber-400">✔</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {baseTitles.length > 0 && (
            <div>
              {rankTitles.length > 0 && (
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">
                  Available Titles
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {baseTitles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => selectTitle(title)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      currentTitle === title
                        ? "bg-primary/20 border-primary/60 text-primary"
                        : "bg-secondary border-border hover:border-primary/40"
                    }`}
                    data-ocid="profile.title.select"
                  >
                    ✶ {title}
                    {currentTitle === title && (
                      <span className="ml-1 text-primary">✔</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentTitle && (
            <button
              type="button"
              onClick={() => selectTitle(currentTitle)}
              className="w-full text-xs text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded-xl py-2 transition-colors"
              data-ocid="profile.title.remove_button"
            >
              Remove Title
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Small badge to display title above username */
export function TitleBadge({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <span className="block text-[10px] font-bold text-amber-400 tracking-wide mb-0.5">
      ✶ {title}
    </span>
  );
}
