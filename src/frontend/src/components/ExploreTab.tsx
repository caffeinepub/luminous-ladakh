import { useState } from "react";
import { toast } from "sonner";
import type { Account, LocationReview, Post, Review } from "../types";

interface Location {
  id: string;
  name: string;
  category: string;
  overview: string;
  image: string;
  mapsUrl: string;
}

const LOCATIONS: Location[] = [
  {
    id: "m1",
    name: "Thiksey Monastery",
    category: "Monasteries",
    overview:
      "Iconic 12-story monastery near Leh resembling the Potala Palace in Lhasa. Features a massive Maitreya Buddha statue and stunning valley views.",
    image: "/assets/generated/thiksey-monastery.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Thiksey+Monastery+Ladakh",
  },
  {
    id: "m2",
    name: "Diskit Monastery",
    category: "Monasteries",
    overview:
      "Oldest and largest monastery in Nubra Valley, home to a giant 32-meter Maitreya Buddha statue overlooking the Shyok River.",
    image: "/assets/generated/hemis-monastery.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Diskit+Monastery+Nubra",
  },
  {
    id: "m3",
    name: "Lamayuru Monastery",
    category: "Monasteries",
    overview:
      "One of Ladakh's oldest monasteries, perched dramatically on an eroded moonland plateau. Known for the Yuru Kabgyat festival.",
    image: "/assets/generated/thiksey-monastery.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Lamayuru+Monastery+Ladakh",
  },
  {
    id: "m4",
    name: "Spituk Monastery",
    category: "Monasteries",
    overview:
      "A vibrant Gelugpa monastery on a hilltop near Leh airport, offering panoramic views. The annual Gustor festival is a major highlight.",
    image: "/assets/generated/spituk-monastery.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Spituk+Monastery+Ladakh",
  },
  {
    id: "m5",
    name: "Shey Monastery",
    category: "Monasteries",
    overview:
      "Former summer capital of Ladakh kings, housing the largest indoor copper Buddha statue. The Shey Palace ruins are adjacent.",
    image: "/assets/generated/thiksey-monastery.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Shey+Monastery+Ladakh",
  },
  {
    id: "m6",
    name: "Alchi Monastery",
    category: "Monasteries",
    overview:
      "A unique 11th-century monastery with rare Kashmiri-style murals and intricate wood carvings.",
    image: "/assets/generated/hemis-monastery.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Alchi+Monastery+Ladakh",
  },
  {
    id: "t1",
    name: "Namgyal Tsemo Temple",
    category: "Temples",
    overview:
      "A hilltop temple above Leh Palace with a striking red tower and golden Buddha statue, offering 360° views of Leh town.",
    image: "/assets/generated/shanti-stupa.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Namgyal+Tsemo+Leh",
  },
  {
    id: "t2",
    name: "Stok Guru Lhakhang",
    category: "Temples",
    overview:
      "Ancient temple at the foot of Stok Palace, known for vivid Tantric murals and peaceful meditation chambers.",
    image: "/assets/generated/leh-palace.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Stok+Palace+Ladakh",
  },
  {
    id: "t3",
    name: "Leh Jama Masjid",
    category: "Temples",
    overview:
      "One of Ladakh's largest mosques, built in the 17th century. A symbol of religious harmony in Leh's main bazaar.",
    image: "/assets/generated/shanti-stupa.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Leh+Jama+Masjid",
  },
  {
    id: "p1",
    name: "Pangong Lake",
    category: "Parks",
    overview:
      "The famous high-altitude lake straddling India and China. Crystal-clear blue waters change color through the day.",
    image: "/assets/generated/pangong-lake.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Pangong+Lake+Ladakh",
  },
  {
    id: "p2",
    name: "Nubra Valley",
    category: "Parks",
    overview:
      "A high-altitude cold desert with double-humped Bactrian camels, sand dunes, and lush orchards.",
    image: "/assets/generated/nubra-valley.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Nubra+Valley+Ladakh",
  },
  {
    id: "p3",
    name: "Hemis National Park",
    category: "Parks",
    overview:
      "India's largest national park by area, home to the elusive snow leopard and over 200 bird species.",
    image: "/assets/generated/nubra-valley.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Hemis+National+Park+Ladakh",
  },
  {
    id: "h1",
    name: "SNM Hospital Leh",
    category: "Hospitals",
    overview:
      "The main government hospital in Leh, offering general medicine, surgery, maternity, and emergency services. Open 24/7.",
    image: "/assets/generated/leh-hospital.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=SNM+Hospital+Leh",
  },
  {
    id: "h2",
    name: "SDRRF Hospital",
    category: "Hospitals",
    overview:
      "Emergency trauma care and high-altitude medicine for civilians in Leh district.",
    image: "/assets/generated/leh-hospital.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=SDRRF+Hospital+Leh",
  },
  {
    id: "h3",
    name: "Kargil District Hospital",
    category: "Hospitals",
    overview:
      "Primary government hospital for Kargil district providing general medical and surgical services.",
    image: "/assets/generated/leh-hospital.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Kargil+District+Hospital",
  },
  {
    id: "s1",
    name: "Jawahar Navodaya Vidyalaya",
    category: "Schools",
    overview:
      "Residential central government school offering quality education from Class 6–12.",
    image: "/assets/generated/shanti-stupa.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Jawahar+Navodaya+Vidyalaya+Leh",
  },
  {
    id: "s2",
    name: "Druk White Lotus School",
    category: "Schools",
    overview:
      "Award-winning eco-friendly school combining modern education with traditional Ladakhi culture.",
    image: "/assets/generated/shanti-stupa.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Druk+White+Lotus+School+Ladakh",
  },
  {
    id: "e1",
    name: "Leh Police Station",
    category: "Emergency",
    overview:
      "Main police station for Leh town. Contact for emergencies, FIR registration, and public safety. Helpline: 100.",
    image: "/assets/generated/leh-police.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Leh+Police+Station",
  },
  {
    id: "e2",
    name: "Kargil Police Station",
    category: "Emergency",
    overview:
      "District police headquarters for Kargil. Contact for law enforcement and emergency assistance. Open 24/7.",
    image: "/assets/generated/leh-police.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=Kargil+Police+Station",
  },
  {
    id: "b1",
    name: "State Bank of India - Leh",
    category: "Banks/ATMs",
    overview:
      "Main SBI branch in Leh. Full banking services including foreign exchange, ATM, and business accounts.",
    image: "/assets/generated/leh-palace.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=SBI+Bank+Leh",
  },
  {
    id: "b2",
    name: "J&K Bank - Leh",
    category: "Banks/ATMs",
    overview:
      "Jammu & Kashmir Bank flagship Leh branch. ATM, loans, current/savings accounts.",
    image: "/assets/generated/leh-palace.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=JK+Bank+Leh",
  },
  {
    id: "b3",
    name: "Punjab National Bank - Kargil",
    category: "Banks/ATMs",
    overview:
      "PNB branch serving Kargil district with full retail banking and ATM facility.",
    image: "/assets/generated/leh-palace.dim_800x500.jpg",
    mapsUrl: "https://maps.google.com/?q=PNB+Bank+Kargil",
  },
];

const LOCATION_CATEGORIES = [
  "All",
  "Monasteries",
  "Temples",
  "Parks",
  "Schools",
  "Hospitals",
  "Emergency",
  "Banks/ATMs",
];
const BUSINESS_CATEGORIES = ["Hotels", "Food", "Shopping", "Services"];
const ALL_CATEGORIES = [...LOCATION_CATEGORIES, ...BUSINESS_CATEGORIES];

interface Props {
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  currentUserId: string;
  currentUserRole: string;
  locationReviews?: LocationReview[];
  onAddReview: (r: Omit<Review, "id" | "timestamp">) => void;
  onAddLocationReview?: (r: Omit<LocationReview, "id" | "timestamp">) => void;
  isCreator?: boolean;
  onApprovePost?: (id: string) => void;
  onRejectPost?: (id: string) => void;
}

function StarRating({
  rating,
  onChange,
}: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-lg transition-transform hover:scale-110 ${
            s <= rating ? "text-amber-400" : "text-zinc-700"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function Overlay({
  onClose,
  children,
}: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      aria-label="Close"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-lg mx-auto bg-zinc-900 rounded-t-3xl border-t border-zinc-700 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mt-4 mb-2" />
        {children}
      </div>
    </div>
  );
}

function LocationCard({
  location,
  locationReviews,
  currentUserId,
  currentUsername,
  onAddLocationReview,
}: {
  location: Location;
  locationReviews: LocationReview[];
  currentUserId: string;
  currentUsername: string;
  onAddLocationReview?: (r: Omit<LocationReview, "id" | "timestamp">) => void;
}) {
  const [sheet, setSheet] = useState<"" | "details" | "reviews">("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const myReviews = locationReviews.filter((r) => r.locationId === location.id);
  const avgRating = myReviews.length
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0;

  function submitReview() {
    if (!newComment.trim()) return;
    onAddLocationReview?.({
      locationId: location.id,
      reviewerUserId: currentUserId,
      reviewerUsername: currentUsername,
      rating: newRating,
      comment: newComment.trim(),
    });
    setNewComment("");
    setNewRating(5);
    toast.success("Review submitted!");
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:scale-[1.01]">
        <div className="relative h-44 overflow-hidden">
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/generated/thiksey-monastery.dim_800x500.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3">
            <span className="text-xs bg-amber-500/90 text-black px-2 py-0.5 rounded-full font-semibold">
              {location.category}
            </span>
          </div>
          {avgRating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-lg text-xs text-amber-400 font-bold">
              ★ {avgRating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-base mb-1">
            {location.name}
          </h3>
          <p className="text-zinc-400 text-xs line-clamp-2 mb-3">
            {location.overview}
          </p>
          <div className="flex gap-2">
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                directions
              </span>
              Directions
            </a>
            <button
              type="button"
              onClick={() => setSheet("details")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Details
            </button>
            <button
              type="button"
              onClick={() => setSheet("reviews")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">star</span>
              Reviews
            </button>
          </div>
        </div>
      </div>

      {sheet === "details" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            <img
              src={location.image}
              alt={location.name}
              className="w-full h-40 object-cover rounded-xl mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/generated/thiksey-monastery.dim_800x500.jpg";
              }}
            />
            <h2 className="text-xl font-bold text-white mb-1">
              {location.name}
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              {location.category}
            </span>
            <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
              {location.overview}
            </p>
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                directions
              </span>
              Get Directions
            </a>
          </div>
        </Overlay>
      )}

      {sheet === "reviews" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-1">
              {location.name} Reviews
            </h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-amber-400">
                  {avgRating.toFixed(1)}
                </span>
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-zinc-500 text-xs">
                  ({myReviews.length} reviews)
                </span>
              </div>
            )}
            {onAddLocationReview && (
              <div className="bg-zinc-800 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-zinc-300 mb-2">
                  Leave a Review
                </p>
                <StarRating rating={newRating} onChange={setNewRating} />
                <textarea
                  className="mt-2 w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  placeholder="Share your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="button"
                  onClick={submitReview}
                  className="mt-2 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
                >
                  Submit Review
                </button>
              </div>
            )}
            {myReviews.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-4">
                No reviews yet. Be the first!
              </p>
            )}
            {myReviews.map((r) => (
              <div key={r.id} className="border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">
                    @{r.reviewerUsername}
                  </span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-sm text-zinc-300">{r.comment}</p>
              </div>
            ))}
          </div>
        </Overlay>
      )}
    </>
  );
}

function BusinessCard({
  account,
  reviews,
  currentUserId,
  currentUserRole,
  onAddReview,
}: {
  account: Account;
  reviews: Review[];
  currentUserId: string;
  currentUserRole: string;
  onAddReview: (r: Omit<Review, "id" | "timestamp">) => void;
}) {
  const [sheet, setSheet] = useState<"" | "details" | "reviews">("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const businesses = account.businesses || [];
  const firstBiz = businesses[0];
  if (!firstBiz && !account.businessName) return null;

  const bizName = firstBiz?.name || account.businessName || "";
  const bizDesc = firstBiz?.description || account.businessDescription || "";
  const bizCat = firstBiz?.category || account.businessCategory || "";
  const bizMaps = firstBiz?.mapsUrl || "";
  const bizPhoto = firstBiz?.photos?.[0] || "";

  const myReviews = reviews.filter((r) => r.targetMemberId === account.id);
  const avgRating = myReviews.length
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0;

  function submitReview() {
    if (!newComment.trim()) return;
    onAddReview({
      targetMemberId: account.id,
      targetMemberName: bizName,
      reviewerUserId: currentUserId,
      reviewerUsername: "you",
      rating: newRating,
      comment: newComment.trim(),
    });
    setNewComment("");
    setNewRating(5);
    toast.success("Review submitted!");
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/30 transition-all duration-300 hover:scale-[1.01]">
        <div className="relative h-44 overflow-hidden bg-zinc-800">
          {bizPhoto ? (
            <img
              src={bizPhoto}
              alt={bizName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-zinc-600">
                store
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3">
            <span className="text-xs bg-blue-500/90 text-white px-2 py-0.5 rounded-full font-semibold">
              {bizCat || "Business"}
            </span>
          </div>
          {avgRating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-lg text-xs text-amber-400 font-bold">
              ★ {avgRating.toFixed(1)}
            </div>
          )}
          <div className="absolute top-2 left-2 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-xs text-amber-300">
            {account.membershipTier === "Premier" ? "⭐ Premier" : "Member"}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-base mb-0.5">{bizName}</h3>
          <p className="text-zinc-500 text-xs mb-1">by @{account.username}</p>
          <p className="text-zinc-400 text-xs line-clamp-2 mb-3">{bizDesc}</p>
          <div className="flex gap-2">
            {bizMaps ? (
              <a
                href={bizMaps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  directions
                </span>
                Directions
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex-1 py-2 rounded-lg bg-zinc-800/50 text-xs text-zinc-600"
              >
                No Map
              </button>
            )}
            <button
              type="button"
              onClick={() => setSheet("details")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Details
            </button>
            <button
              type="button"
              onClick={() => setSheet("reviews")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">star</span>
              Reviews
            </button>
          </div>
        </div>
      </div>

      {sheet === "details" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            {bizPhoto && (
              <img
                src={bizPhoto}
                alt={bizName}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
            )}
            <h2 className="text-xl font-bold text-white">{bizName}</h2>
            <p className="text-zinc-500 text-sm">
              by @{account.username} · {bizCat}
            </p>
            <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
              {bizDesc}
            </p>
            {firstBiz?.photos && firstBiz.photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {firstBiz.photos.slice(1).map((p, i) => (
                  <img
                    key={`photo-${account.id}-${String(i)}`}
                    src={p}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            )}
            {bizMaps && (
              <a
                href={bizMaps}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  directions
                </span>
                Get Directions
              </a>
            )}
          </div>
        </Overlay>
      )}

      {sheet === "reviews" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-2">
              {bizName} Reviews
            </h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-amber-400">
                  {avgRating.toFixed(1)}
                </span>
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-zinc-500 text-xs">
                  ({myReviews.length})
                </span>
              </div>
            )}
            {currentUserRole === "user" && (
              <div className="bg-zinc-800 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-zinc-300 mb-2">
                  Write a Review
                </p>
                <StarRating rating={newRating} onChange={setNewRating} />
                <textarea
                  className="mt-2 w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  placeholder="Share your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="button"
                  onClick={submitReview}
                  className="mt-2 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
                >
                  Submit
                </button>
              </div>
            )}
            {myReviews.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-4">
                No reviews yet.
              </p>
            )}
            {myReviews.map((r) => (
              <div key={r.id} className="border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">
                    @{r.reviewerUsername}
                  </span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-sm text-zinc-300">{r.comment}</p>
              </div>
            ))}
          </div>
        </Overlay>
      )}
    </>
  );
}

export function ExploreTab({
  accounts,
  posts,
  reviews,
  currentUserId,
  currentUserRole,
  locationReviews = [],
  onAddReview,
  onAddLocationReview,
  isCreator,
  onApprovePost,
  onRejectPost,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const currentAccount = accounts.find((a) => a.id === currentUserId);
  const currentUsername = currentAccount?.username || "user";

  const memberBusinesses = accounts.filter(
    (a) =>
      a.role === "member" &&
      a.status !== "banned" &&
      a.status !== "suspended" &&
      ((a.businesses && a.businesses.length > 0) || a.businessName),
  );

  const isBusinessCategory = BUSINESS_CATEGORIES.includes(activeCategory);

  const filteredLocations = !isBusinessCategory
    ? LOCATIONS.filter(
        (l) => activeCategory === "All" || l.category === activeCategory,
      )
    : [];

  const filteredBusinesses =
    activeCategory === "All"
      ? memberBusinesses
      : isBusinessCategory
        ? memberBusinesses.filter((a) => {
            const biz = (a.businesses || [])[0];
            const cat = biz?.category || a.businessCategory || "";
            return cat.toLowerCase() === activeCategory.toLowerCase();
          })
        : [];

  const pendingPosts = posts.filter((p) => p.status === "pending");

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Explore Ladakh</h2>
        <p className="text-zinc-500 text-sm">
          Discover monasteries, places, and local businesses
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-amber-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isCreator && pendingPosts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">pending</span>
            Pending Posts ({pendingPosts.length})
          </h3>
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4 mb-3"
            >
              <p className="font-semibold text-white text-sm">{post.title}</p>
              <p className="text-xs text-zinc-400 mb-3">{post.description}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onApprovePost?.(post.id)}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onRejectPost?.(post.id)}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLocations.length > 0 && (
        <div className="mb-6">
          {filteredBusinesses.length > 0 && (
            <h3 className="text-sm font-bold text-zinc-400 mb-3">
              📍 Locations
            </h3>
          )}
          <div className="grid grid-cols-1 gap-4">
            {filteredLocations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                locationReviews={locationReviews}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                onAddLocationReview={onAddLocationReview}
              />
            ))}
          </div>
        </div>
      )}

      {filteredBusinesses.length > 0 && (
        <div className="mb-6">
          {activeCategory === "All" && (
            <h3 className="text-sm font-bold text-zinc-400 mb-3">
              🏪 Local Businesses
            </h3>
          )}
          <div className="grid grid-cols-1 gap-4">
            {filteredBusinesses.map((acc) => (
              <BusinessCard
                key={acc.id}
                account={acc}
                reviews={reviews}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onAddReview={onAddReview}
              />
            ))}
          </div>
        </div>
      )}

      {filteredLocations.length === 0 && filteredBusinesses.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <span className="material-symbols-outlined text-4xl block mb-2">
            search_off
          </span>
          <p className="text-sm">No results for "{activeCategory}"</p>
          {isBusinessCategory && (
            <p className="text-xs mt-1">
              Members can list businesses in this category
            </p>
          )}
        </div>
      )}

      {posts.filter((p) => p.status === "approved").length > 0 &&
        activeCategory === "All" && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-zinc-400 mb-3">
              🌿 Community Discovered
            </h3>
            {posts
              .filter((p) => p.status === "approved")
              .map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 mb-3"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-bold text-white text-sm">{post.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-zinc-600">
                      @{post.submitterUsername}
                    </span>
                    {post.googleMapsLink && (
                      <a
                        href={post.googleMapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-400 hover:underline"
                      >
                        View on Maps
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
    </div>
  );
}
