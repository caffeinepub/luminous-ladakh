import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Account, Post, Review } from "../../types";
import { MemberProfileModal } from "../shared/MemberProfileModal";

const DESTINATIONS = [
  { name: "Pangong Tso Lake", location: "Chang La, Ladakh", category: "Lake" },
  { name: "Nubra Valley", location: "North Ladakh", category: "Valley" },
  { name: "Magnetic Hill", location: "Leh-Kargil Highway", category: "Wonder" },
  { name: "Khardung La Pass", location: "North Ladakh", category: "Pass" },
  { name: "Leh Palace", location: "Old Town, Leh", category: "Heritage" },
  { name: "Zanskar Valley", location: "Kargil District", category: "Valley" },
  {
    name: "Thiksey Monastery",
    location: "Thiksey, 17km from Leh",
    category: "Monastery",
  },
  { name: "Diskit Monastery", location: "Nubra Valley", category: "Monastery" },
  { name: "Alchi Monastery", location: "Alchi Village", category: "Monastery" },
];

interface Props {
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  currentUserId: string;
  currentUserRole: string;
  onAddReview: (r: Omit<Review, "id" | "timestamp">) => void;
}

export function SearchTab({
  accounts,
  posts,
  reviews,
  currentUserId,
  currentUserRole,
  onAddReview,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Account | null>(null);

  const q = query.toLowerCase().trim();
  const members = accounts.filter((a) => a.role === "member");
  const approvedPosts = posts.filter((p) => p.status === "approved");

  const matchedDest = q
    ? DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q),
      )
    : [];
  const matchedMembers = q
    ? members.filter(
        (m) =>
          (m.businessName || "").toLowerCase().includes(q) ||
          (m.businessCategory || "").toLowerCase().includes(q) ||
          (m.businessLocation || "").toLowerCase().includes(q),
      )
    : [];
  const matchedPosts = q
    ? approvedPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.locationName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    : [];

  const hasResults =
    matchedDest.length + matchedMembers.length + matchedPosts.length > 0;

  return (
    <div className="fade-in">
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
          search
        </span>
        <Input
          placeholder="Search destinations, businesses, discoveries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-card border-border"
          data-ocid="search.search_input"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {!query && (
        <div className="text-center py-12" data-ocid="search.empty_state">
          <span className="material-symbols-outlined text-5xl text-muted-foreground block mb-3">
            travel_explore
          </span>
          <p className="font-heading font-semibold text-muted-foreground">
            Search Ladakh
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Destinations, businesses, and community discoveries
          </p>
        </div>
      )}

      {query && !hasResults && (
        <div className="text-center py-12" data-ocid="search.empty_state">
          <span className="material-symbols-outlined text-5xl text-muted-foreground block mb-3">
            search_off
          </span>
          <p className="font-heading font-semibold text-muted-foreground">
            No results for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {matchedDest.length > 0 && (
        <section className="mb-5">
          <h3 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Destinations ({matchedDest.length})
          </h3>
          <div className="space-y-2">
            {matchedDest.map((d, i) => (
              <div
                key={d.name}
                className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                data-ocid={`search.destination.item.${i + 1}`}
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  landscape
                </span>
                <div>
                  <p className="font-semibold text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.location} • {d.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {matchedMembers.length > 0 && (
        <section className="mb-5">
          <h3 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Businesses ({matchedMembers.length})
          </h3>
          <div className="space-y-2">
            {matchedMembers.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMember(m)}
                className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 text-left"
                data-ocid={`search.business.item.${i + 1}`}
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  store
                </span>
                <div>
                  <p className="font-semibold text-sm">{m.businessName}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.businessCategory} • {m.businessLocation}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {matchedPosts.length > 0 && (
        <section className="mb-5">
          <h3 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Discoveries ({matchedPosts.length})
          </h3>
          <div className="space-y-2">
            {matchedPosts.map((p, i) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                data-ocid={`search.post.item.${i + 1}`}
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  explore
                </span>
                <div>
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.locationName} • {p.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          reviews={reviews}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setSelectedMember(null)}
          onAddReview={(r) =>
            onAddReview({
              ...r,
              reviewerUsername:
                accounts.find((a) => a.id === currentUserId)?.username || "",
            })
          }
        />
      )}
    </div>
  );
}
