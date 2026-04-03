import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import type { Account, Business, PendingPayment, ShopProduct } from "../types";
import { ErrorBoundary } from "./ErrorBoundary";

const SHOP_CATEGORIES = [
  "All",
  "Clothing & Fashion",
  "Electronics",
  "Handicrafts",
  "Jewellery",
  "Food & Groceries",
  "Vehicles",
  "Tools & Equipment",
  "Other",
];

interface ProductCardProps {
  product: ShopProduct;
  business: Business;
  owner: Account;
  currentUser: Account;
  onAnnounce: (product: ShopProduct) => void;
  isOwner: boolean;
}

function ProductCard({
  product,
  business,
  owner,
  onAnnounce,
  isOwner,
}: ProductCardProps) {
  const [photoIdx, setPhotoIdx] = useState(0);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {(product.photos ?? []).length > 0 && (
        <div className="relative h-44 bg-zinc-900">
          <img
            src={product.photos[photoIdx]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.photos.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {product.photos.map((_, i) => (
                <button
                  key={String(i)}
                  type="button"
                  onClick={() => setPhotoIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === photoIdx ? "bg-amber-400" : "bg-white/40"
                  }`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}
          {product.announcementPaid && (
            <div className="absolute top-2 left-2">
              <span className="text-xs bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full">
                🆕 New Arrival
              </span>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-sm bg-red-600/80 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h4 className="font-bold text-white text-sm">{product.name}</h4>
            <p className="text-xs text-zinc-400">
              {business.name} · @{owner.username}
            </p>
          </div>
          <span className="text-amber-400 font-bold flex-shrink-0">
            ₹{product.price.toLocaleString()}
          </span>
        </div>

        <span className="inline-block text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full mb-2">
          {product.category}
        </span>

        {product.description && (
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            {product.description}
          </p>
        )}

        <div className="flex gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition-colors"
              data-ocid="shop.button"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              Contact Shop
            </a>
          )}
          {isOwner && product.inStock && !product.announcementPaid && (
            <button
              type="button"
              onClick={() => onAnnounce(product)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
              data-ocid="shop.button"
            >
              <span className="material-symbols-outlined text-sm">
                campaign
              </span>
              Announce (₹200)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  accounts: Account[];
  currentUser: Account;
  onAddPendingPayment?: (p: Omit<PendingPayment, "id" | "timestamp">) => void;
}

function ShopContent({ accounts, currentUser, onAddPendingPayment }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [announcingProduct, setAnnouncingProduct] =
    useState<ShopProduct | null>(null);
  const [confirmingAnnounce, setConfirmingAnnounce] = useState(false);

  // Collect all shop products from member accounts
  const allProducts: {
    product: ShopProduct;
    business: Business;
    owner: Account;
  }[] = [];

  for (const account of accounts) {
    if (account.role !== "member" || account.status === "banned") continue;
    for (const biz of account.businesses ?? []) {
      if (biz.businessType !== "shop") continue;
      for (const product of biz.shopProducts ?? []) {
        allProducts.push({ product, business: biz, owner: account });
      }
    }
  }

  // Filter
  const filtered = allProducts.filter(({ product, business }) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      business.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort: announced (new arrivals) first
  const sorted = [...filtered].sort((a, b) => {
    if (a.product.announcementPaid && !b.product.announcementPaid) return -1;
    if (!a.product.announcementPaid && b.product.announcementPaid) return 1;
    return 0;
  });

  function handleAnnounce(product: ShopProduct) {
    setAnnouncingProduct(product);
  }

  function handleConfirmAnnounce() {
    if (!announcingProduct || !onAddPendingPayment) return;
    setConfirmingAnnounce(true);

    try {
      onAddPendingPayment({
        memberId: currentUser.id,
        memberUsername: currentUser.username,
        memberEmail: currentUser.email,
        amount: 200,
        tier: "Shop Announcement",
        status: "pending",
        paymentType: "shop_announcement",
        eventTitle: announcingProduct.name,
      });
      toast.success(
        "Announcement submitted! ₹200 payment pending Creator confirmation.",
      );
      setAnnouncingProduct(null);
    } catch {
      toast.error("Failed to submit announcement. Please try again.");
    } finally {
      setConfirmingAnnounce(false);
    }
  }

  return (
    <div className="fade-in space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">
          {t("shop", "Shop & Products")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("shopSubtitle", "Discover products from local Ladakh businesses")}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500 text-base">
          search
        </span>
        <input
          type="text"
          placeholder="Search products or shops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          data-ocid="shop.search_input"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {SHOP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              categoryFilter === cat
                ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
            data-ocid="shop.tab"
          >
            {cat}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16" data-ocid="shop.empty_state">
          <span className="material-symbols-outlined text-5xl text-zinc-600 block mb-3">
            storefront
          </span>
          <p className="text-zinc-400 font-medium">
            {search || categoryFilter !== "All"
              ? t("noMatchingProducts", "No products match your search")
              : t("noShopProducts", "No products listed yet")}
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            {t(
              "noShopHint",
              "Members can list their products in My Business → Shop",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(({ product, business, owner }) => (
            <ProductCard
              key={product.id}
              product={product}
              business={business}
              owner={owner}
              currentUser={currentUser}
              isOwner={owner.id === currentUser.id}
              onAnnounce={handleAnnounce}
            />
          ))}
        </div>
      )}

      {/* Announce Confirmation Modal */}
      {announcingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => !confirmingAnnounce && setAnnouncingProduct(null)}
          onKeyDown={(e) =>
            e.key === "Escape" &&
            !confirmingAnnounce &&
            setAnnouncingProduct(null)
          }
          role="presentation"
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
            data-ocid="shop.dialog"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-400 text-3xl">
                campaign
              </span>
              <div>
                <h3 className="font-bold text-lg">Announce New Arrival</h3>
                <p className="text-xs text-zinc-400">₹200 announcement fee</p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Product</span>
                <span className="font-semibold text-white">
                  {announcingProduct.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Fee</span>
                <span className="font-bold text-amber-400">₹200</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Account</span>
                <span className="text-zinc-300">@{currentUser.username}</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-300">
                Your product will get a "🆕 New Arrival" badge and appear at the
                top of the Shop tab after Creator approval.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5">
              <p className="text-xs text-red-400 font-semibold">
                ⚠️ Non-Refundable
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAnnouncingProduct(null)}
                disabled={confirmingAnnounce}
                className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                data-ocid="shop.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAnnounce}
                disabled={confirmingAnnounce}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors disabled:opacity-60"
                data-ocid="shop.confirm_button"
              >
                {confirmingAnnounce ? "Submitting..." : "Confirm & Pay ₹200"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ShopTab({ accounts, currentUser, onAddPendingPayment }: Props) {
  return (
    <ErrorBoundary minimal>
      <ShopContent
        accounts={accounts}
        currentUser={currentUser}
        onAddPendingPayment={onAddPendingPayment}
      />
    </ErrorBoundary>
  );
}
