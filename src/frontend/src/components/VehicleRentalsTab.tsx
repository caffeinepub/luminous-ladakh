import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import type { Account, Business, RentalAddon } from "../types";
import { ErrorBoundary } from "./ErrorBoundary";

const VEHICLE_FILTER_OPTIONS = [
  "All",
  "Car",
  "Bike",
  "Bicycle",
  "Scooter",
  "E-Bike",
];

function RentalVehicleCard({
  vehicle,
  businessName,
  ownerPhone,
}: {
  vehicle: RentalAddon;
  businessName: string;
  ownerPhone?: string;
}) {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                vehicle.available
                  ? "bg-green-600/15 text-green-400 border-green-500/30"
                  : "bg-red-600/15 text-red-400 border-red-500/30"
              }`}
            >
              {vehicle.available ? "✓ Available" : "✗ Unavailable"}
            </span>
            <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-600">
              {vehicle.vehicleType}
            </span>
          </div>
          <h4 className="font-semibold text-white text-sm">{vehicle.model}</h4>
          <p className="text-xs text-zinc-400">{businessName}</p>
        </div>
        <div className="text-right">
          <p className="text-amber-400 font-bold text-sm">
            ₹{vehicle.pricePerDay.toLocaleString()}
            <span className="text-zinc-500 font-normal">/day</span>
          </p>
          {vehicle.pricePerMonth && (
            <p className="text-zinc-400 text-xs">
              ₹{vehicle.pricePerMonth.toLocaleString()}/mo
            </p>
          )}
        </div>
      </div>
      {ownerPhone && (
        <a
          href={`tel:${ownerPhone}`}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-600/30 transition-colors"
          data-ocid="rentals.button"
        >
          <span className="material-symbols-outlined text-sm">call</span>
          Call to Book
        </a>
      )}
    </div>
  );
}

function RentalBusinessCard({
  business,
  owner,
}: { business: Business; owner: Account }) {
  const [expanded, setExpanded] = useState(false);
  const vehicles = business.rentalAddons ?? [];

  if (vehicles.length === 0) return null;

  const availableCount = vehicles.filter((v) => v.available).length;
  const priceRange =
    vehicles.length > 0
      ? `₹${Math.min(...vehicles.map((v) => v.pricePerDay)).toLocaleString()} – ₹${Math.max(...vehicles.map((v) => v.pricePerDay)).toLocaleString()}/day`
      : "";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {(business.photos ?? [])[0] && (
        <img
          src={(business.photos ?? [])[0]}
          alt={business.name}
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-white">{business.name}</h3>
            <p className="text-xs text-zinc-400">
              by @{owner.username} · {availableCount}/{vehicles.length}{" "}
              available
            </p>
          </div>
          {priceRange && (
            <span className="text-xs text-amber-400 font-semibold flex-shrink-0">
              {priceRange}
            </span>
          )}
        </div>

        {business.description && (
          <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {Array.from(new Set<string>(vehicles.map((v) => v.vehicleType))).map(
            (type) => (
              <span
                key={type}
                className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full"
              >
                {type}
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-zinc-300 mb-3"
          data-ocid="rentals.toggle"
        >
          <span>
            {expanded
              ? "Hide Vehicles"
              : `View ${vehicles.length} Vehicle${vehicles.length !== 1 ? "s" : ""}`}
          </span>
          <span className="material-symbols-outlined text-sm">
            {expanded ? "expand_less" : "expand_more"}
          </span>
        </button>

        {expanded && (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <RentalVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                businessName={business.name}
                ownerPhone={business.phone}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition-colors"
              data-ocid="rentals.button"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              Call
            </a>
          )}
          {business.mapsUrl && (
            <a
              href={business.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
              data-ocid="rentals.link"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Directions
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface ContentProps {
  accounts: Account[];
}

interface Props {
  accounts: Account[];
  currentUser: Account;
}

function VehicleRentalsContent({ accounts }: ContentProps) {
  const { t } = useLanguage();
  const [vehicleFilter, setVehicleFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"low" | "high">("low");

  // Collect all rental businesses from member accounts
  const rentalBusinesses: { business: Business; owner: Account }[] = [];
  for (const account of accounts) {
    if (account.role !== "member" || account.status === "banned") continue;
    for (const biz of account.businesses ?? []) {
      if (
        biz.businessType === "rental" &&
        (biz.rentalAddons ?? []).length > 0
      ) {
        rentalBusinesses.push({ business: biz, owner: account });
      }
    }
  }

  // Filter by vehicle type
  const filtered = rentalBusinesses.filter(({ business }) => {
    if (vehicleFilter === "All") return true;
    return (business.rentalAddons ?? []).some(
      (v) => v.vehicleType.toLowerCase() === vehicleFilter.toLowerCase(),
    );
  });

  // Sort by min price
  const sorted = [...filtered].sort((a, b) => {
    const minA = Math.min(
      ...(a.business.rentalAddons ?? []).map((v) => v.pricePerDay),
    );
    const minB = Math.min(
      ...(b.business.rentalAddons ?? []).map((v) => v.pricePerDay),
    );
    return sortOrder === "low" ? minA - minB : minB - minA;
  });

  return (
    <div className="fade-in space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">
          {t("rentals", "Vehicle Rentals")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t(
            "rentalsSubtitle",
            "Cars, bikes, bicycles, scooters & more in Ladakh",
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {VEHICLE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setVehicleFilter(opt)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                vehicleFilter === opt
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
              data-ocid="rentals.tab"
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSortOrder("low")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              sortOrder === "low"
                ? "bg-zinc-700 border-zinc-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
            data-ocid="rentals.toggle"
          >
            Price: Low to High
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("high")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              sortOrder === "high"
                ? "bg-zinc-700 border-zinc-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
            data-ocid="rentals.toggle"
          >
            Price: High to Low
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16" data-ocid="rentals.empty_state">
          <span className="material-symbols-outlined text-5xl text-zinc-600 block mb-3">
            directions_car
          </span>
          <p className="text-zinc-400 font-medium">
            {vehicleFilter === "All"
              ? t("noRentals", "No vehicle rentals listed yet")
              : `No ${vehicleFilter} rentals available`}
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            {t(
              "noRentalsHint",
              "Members can list their rental vehicles in My Business",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(({ business, owner }) => (
            <RentalBusinessCard
              key={business.id}
              business={business}
              owner={owner}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function VehicleRentalsTab({
  accounts,
  currentUser: _currentUser,
}: Props) {
  return (
    <ErrorBoundary minimal>
      <VehicleRentalsContent accounts={accounts} />
    </ErrorBoundary>
  );
}
