import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Account, Post, Review } from "../types";
import { MemberProfileModal } from "./shared/MemberProfileModal";

interface Props {
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  currentUserId?: string;
  currentUserRole?: string;
  isCreator?: boolean;
  onAddReview: (r: Omit<Review, "id" | "timestamp">) => void;
  onApprovePost?: (id: string) => void;
  onRejectPost?: (id: string) => void;
}

const DESTINATIONS = [
  {
    name: "Pangong Tso Lake",
    location: "Chang La, Ladakh",
    desc: "The iconic high-altitude lake spanning India and China, famous for its color-changing blue waters.",
    img: "https://picsum.photos/seed/pangong1/600/350",
    maps: "https://maps.google.com/?q=Pangong+Tso+Lake+Ladakh",
    category: "Lake",
    altitude: "4,350m",
  },
  {
    name: "Nubra Valley",
    location: "North Ladakh",
    desc: "A high-altitude cold desert with sand dunes, Bactrian camels, and the confluence of the Shyok and Nubra rivers.",
    img: "https://picsum.photos/seed/nubra2/600/350",
    maps: "https://maps.google.com/?q=Nubra+Valley+Ladakh",
    category: "Valley",
    altitude: "3,048m",
  },
  {
    name: "Magnetic Hill",
    location: "Leh-Kargil Highway",
    desc: "A gravity-defying stretch of road where vehicles appear to roll uphill — one of Ladakh's most mysterious spots.",
    img: "https://picsum.photos/seed/magnet3/600/350",
    maps: "https://maps.google.com/?q=Magnetic+Hill+Ladakh",
    category: "Wonder",
    altitude: "3,500m",
  },
  {
    name: "Khardung La Pass",
    location: "North Ladakh",
    desc: "One of the world's highest motorable passes, gateway to Nubra Valley with panoramic Himalayan views.",
    img: "https://picsum.photos/seed/khardung4/600/350",
    maps: "https://maps.google.com/?q=Khardung+La+Pass",
    category: "Pass",
    altitude: "5,359m",
  },
  {
    name: "Leh Palace",
    location: "Old Town, Leh",
    desc: "A 17th-century palace overlooking Leh city, built in the style of the Potala Palace in Lhasa.",
    img: "https://picsum.photos/seed/lehpalace5/600/350",
    maps: "https://maps.google.com/?q=Leh+Palace+Ladakh",
    category: "Heritage",
    altitude: "3,500m",
  },
  {
    name: "Zanskar Valley",
    location: "Kargil District",
    desc: "Remote valley with stunning gorges, ancient monasteries, and the famous Chadar frozen river trek.",
    img: "https://picsum.photos/seed/zanskar6/600/350",
    maps: "https://maps.google.com/?q=Zanskar+Valley+Ladakh",
    category: "Valley",
    altitude: "3,500m",
  },
];

const MONASTERIES = [
  {
    name: "Thiksey Monastery",
    location: "Thiksey, 17km from Leh",
    img: "https://picsum.photos/seed/thiksey1/400/250",
    maps: "https://maps.google.com/?q=Thiksey+Monastery+Ladakh",
    desc: "Resembles the Potala Palace of Lhasa. Houses a 15m tall Maitreya Buddha statue. Morning prayers at 6am.",
  },
  {
    name: "Diskit Monastery",
    location: "Nubra Valley",
    img: "https://picsum.photos/seed/diskit2/400/250",
    maps: "https://maps.google.com/?q=Diskit+Monastery+Nubra",
    desc: "Oldest and largest monastery in Nubra Valley. Overlooks the valley with a 32m Maitreya Buddha statue.",
  },
  {
    name: "Lamayuru Monastery",
    location: "Lamayuru Village",
    img: "https://picsum.photos/seed/lamayuru3/400/250",
    maps: "https://maps.google.com/?q=Lamayuru+Monastery+Ladakh",
    desc: "One of the oldest monasteries in Ladakh, set dramatically on a moonscape landscape.",
  },
  {
    name: "Spituk Monastery",
    location: "8km from Leh Airport",
    img: "https://picsum.photos/seed/spituk4/400/250",
    maps: "https://maps.google.com/?q=Spituk+Monastery+Ladakh",
    desc: "Houses a giant statue of Kali used in annual Gustor festival. Panoramic views of Indus River.",
  },
  {
    name: "Shey Monastery",
    location: "Shey, 15km from Leh",
    img: "https://picsum.photos/seed/shey5/400/250",
    maps: "https://maps.google.com/?q=Shey+Monastery+Ladakh",
    desc: "Former royal summer palace with a 7.5m copper-gilded Buddha statue.",
  },
  {
    name: "Alchi Monastery",
    location: "Alchi Village, Sham",
    img: "https://picsum.photos/seed/alchi6/400/250",
    maps: "https://maps.google.com/?q=Alchi+Monastery+Ladakh",
    desc: "Oldest monastery in Ladakh with exquisite 11th-century murals. UNESCO World Heritage candidate.",
  },
];

const ESSENTIAL = [
  {
    name: "SNM District Hospital",
    location: "Leh City Centre",
    img: "https://picsum.photos/seed/hosp1/400/250",
    maps: "https://maps.google.com/?q=SNM+Hospital+Leh",
    desc: "Main government hospital. 24/7 emergency. High-altitude sickness treatment available.",
    type: "emergency",
  },
  {
    name: "Kargil District Hospital",
    location: "Kargil Town",
    img: "https://picsum.photos/seed/hosp2/400/250",
    maps: "https://maps.google.com/?q=Kargil+District+Hospital",
    desc: "Primary healthcare for Kargil region. Emergency services available.",
    type: "emergency",
  },
  {
    name: "Army Medical Centre",
    location: "Leh Cantonment",
    img: "https://picsum.photos/seed/hosp3/400/250",
    maps: "https://maps.google.com/?q=Army+Medical+Leh",
    desc: "Equipped for altitude emergencies. Civilian access in life-threatening situations.",
    type: "emergency",
  },
  {
    name: "Jawahar Navodaya Vidyalaya",
    location: "Leh District",
    img: "https://picsum.photos/seed/school1/400/250",
    maps: "https://maps.google.com/?q=Jawahar+Navodaya+Vidyalaya+Leh",
    desc: "Central government residential school. One of the best schools in Ladakh UT.",
    type: "normal",
  },
  {
    name: "Lamdon Model Senior Sec School",
    location: "Leh City",
    img: "https://picsum.photos/seed/school2/400/250",
    maps: "https://maps.google.com/?q=Lamdon+School+Leh",
    desc: "Premier English-medium school in Leh. Established 1972. Strong academic track record.",
    type: "normal",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  emergency: "text-red-400 bg-red-400/10 border-red-400/30",
  normal: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  default: "text-primary bg-primary/10 border-primary/30",
};

export function ExploreTab({
  accounts,
  posts,
  reviews,
  currentUserId,
  currentUserRole,
  isCreator,
  onAddReview,
  onApprovePost,
  onRejectPost,
}: Props) {
  const [selectedMember, setSelectedMember] = useState<Account | null>(null);
  const [filter, setFilter] = useState("All");
  const [pendingFilter, setPendingFilter] = useState(false);

  const members = accounts.filter((a) => a.role === "member");
  const approvedPosts = posts.filter((p) => p.status === "approved");
  const pendingPosts = posts.filter((p) => p.status === "pending");

  const filters = [
    "All",
    "Lakes",
    "Valleys",
    "Heritage",
    "Passes",
    "Wonder",
    "Monasteries",
  ];
  const filteredDest =
    filter === "All"
      ? DESTINATIONS
      : DESTINATIONS.filter((d) => d.category === filter);
  const filteredMon =
    filter === "All" || filter === "Monasteries" ? MONASTERIES : [];

  const getMemberReviews = (memberId: string) =>
    reviews.filter((r) => r.targetMemberId === memberId);
  const getAvgRating = (memberId: string) => {
    const rs = getMemberReviews(memberId);
    return rs.length
      ? (rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(1)
      : null;
  };

  return (
    <div className="fade-in">
      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
            type="button"
            data-ocid="explore.tab"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main Destinations */}
      {(filter === "All" ||
        ["Lakes", "Valleys", "Heritage", "Passes", "Wonder"].includes(
          filter,
        )) && (
        <section className="mb-6">
          <h2 className="font-heading text-base font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              landscape
            </span>
            Iconic Destinations
          </h2>
          <div className="space-y-3">
            {filteredDest.map((d, i) => (
              <div
                key={d.name}
                className={`bg-card border border-border rounded-xl overflow-hidden card-hover slide-up stagger-${Math.min(i + 1, 5)}`}
              >
                <img
                  src={d.img}
                  alt={d.name}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-heading font-bold">{d.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      {d.altitude}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>
                    {d.location}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {d.desc}
                  </p>
                  <a
                    href={d.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs bg-primary/15 text-primary hover:bg-primary/25 px-3 py-1.5 rounded-lg border border-primary/20 transition-colors font-medium"
                    data-ocid="explore.link"
                  >
                    <span className="material-symbols-outlined text-sm">
                      navigation
                    </span>
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monasteries */}
      {(filter === "All" || filter === "Monasteries") && (
        <section className="mb-6">
          <h2 className="font-heading text-base font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              temple_buddhist
            </span>
            Sacred Monasteries
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 ml-auto">
              Free Access
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {filteredMon.map((m, i) => (
              <div
                key={m.name}
                className={`bg-card border border-border rounded-xl overflow-hidden card-hover slide-up stagger-${Math.min(i + 1, 5)}`}
              >
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-full h-24 object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <h4 className="font-heading font-bold text-xs leading-tight mb-1">
                    {m.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mb-2 leading-tight">
                    {m.desc.slice(0, 60)}...
                  </p>
                  <a
                    href={m.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-primary font-medium"
                    data-ocid="explore.link"
                  >
                    <span className="material-symbols-outlined text-xs">
                      navigation
                    </span>
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Essential Services */}
      {filter === "All" && (
        <section className="mb-6">
          <h2 className="font-heading text-base font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400 text-lg">
              local_hospital
            </span>
            Essential Services
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 ml-auto">
              Free & Always Available
            </span>
          </h2>
          <div className="space-y-2">
            {ESSENTIAL.map((e, i) => (
              <div
                key={e.name}
                className={`bg-card border rounded-xl p-3 flex gap-3 items-start card-hover stagger-${i + 1} ${e.type === "emergency" ? "border-red-500/30" : "border-blue-500/30"}`}
              >
                <img
                  src={e.img}
                  alt={e.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-heading font-bold text-xs">{e.name}</h4>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[e.type]}`}
                    >
                      {e.type === "emergency" ? "🚨 Emergency" : "🏫 School"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">
                    {e.location}
                  </p>
                  <a
                    href={e.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-primary font-medium flex items-center gap-0.5"
                    data-ocid="explore.link"
                  >
                    <span className="material-symbols-outlined text-xs">
                      navigation
                    </span>
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Member Businesses */}
      {filter === "All" && members.length > 0 && (
        <section className="mb-6">
          <h2 className="font-heading text-base font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              store
            </span>
            Local Businesses
          </h2>
          <div className="space-y-3">
            {members.map((m, i) => {
              const avg = getAvgRating(m.id);
              const revCount = getMemberReviews(m.id).length;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className={`w-full bg-card border border-border rounded-xl p-4 text-left card-hover slide-up stagger-${i + 1}`}
                  type="button"
                  data-ocid={`explore.business.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold">
                        {m.businessName}
                      </h3>
                      <p className="text-xs text-primary mb-1">
                        {m.businessCategory}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          location_on
                        </span>
                        {m.businessLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      {avg && (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-primary text-sm">★</span>
                          <span className="text-sm font-semibold">{avg}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {revCount} reviews
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          m.membershipTier === "Premier"
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {m.membershipTier}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Community Discoveries */}
      {filter === "All" && approvedPosts.length > 0 && (
        <section className="mb-6">
          <h2 className="font-heading text-base font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              explore
            </span>
            Community Discoveries
          </h2>
          <div className="space-y-3">
            {approvedPosts.map((p, i) => (
              <div
                key={p.id}
                className={`bg-card border border-border rounded-xl overflow-hidden card-hover stagger-${i + 1}`}
                data-ocid={`explore.post.item.${i + 1}`}
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-heading font-semibold">{p.title}</h3>
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>
                    {p.locationName}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Posted by @{p.submitterUsername}
                    </span>
                    {p.googleMapsLink && (
                      <a
                        href={p.googleMapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary flex items-center gap-1"
                        data-ocid="explore.link"
                      >
                        <span className="material-symbols-outlined text-sm">
                          navigation
                        </span>
                        Directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Creator: Pending Approvals */}
      {isCreator && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-base font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-lg">
                pending_actions
              </span>
              Pending Place Submissions
            </h2>
            <button
              onClick={() => setPendingFilter(!pendingFilter)}
              className="text-xs text-primary"
              type="button"
              data-ocid="explore.toggle"
            >
              {pendingFilter ? "Hide" : `Show (${pendingPosts.length})`}
            </button>
          </div>
          {pendingFilter &&
            pendingPosts.map((p, i) => (
              <div
                key={p.id}
                className="bg-card border border-yellow-500/30 rounded-xl p-4 mb-3"
                data-ocid={`explore.pending.item.${i + 1}`}
              >
                <h3 className="font-heading font-semibold mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {p.locationName} • {p.category}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {p.description}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  By @{p.submitterUsername}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                    onClick={() => onApprovePost?.(p.id)}
                    data-ocid="explore.confirm_button"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400"
                    onClick={() => onRejectPost?.(p.id)}
                    data-ocid="explore.delete_button"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          {pendingFilter && pendingPosts.length === 0 && (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="explore.empty_state"
            >
              No pending submissions.
            </p>
          )}
        </section>
      )}

      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          reviews={reviews}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setSelectedMember(null)}
          onAddReview={(r) => {
            onAddReview({
              ...r,
              reviewerUsername:
                accounts.find((a) => a.id === currentUserId)?.username || "",
            });
          }}
        />
      )}
    </div>
  );
}
