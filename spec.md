# Ladakh Connect — Version 36 (Rebuild of Version 31)

## Current State
Versions 32–35 added Restaurants, Vehicle Rentals, Shop, User Activity tracking, and several new tabs/components. These versions have all been broken due to a recurring crash: `LanguageProvider` was never added to `main.tsx`, causing the language selection to be a no-op and cascading into broken navigation where every page rendered as the dashboard. The user wants all post-v31 changes deleted and Version 31 rebuilt cleanly as Version 36.

## Requested Changes (Diff)

### Add
- `LanguageProvider` wrapper in `main.tsx` (the permanent fix — the single root cause of all crashes since v32)
- `ErrorBoundary` wrapper at top level in `main.tsx`

### Modify
- `main.tsx`: wrap app with `LanguageProvider` and `ErrorBoundary`
- `App.tsx`: remove all post-v31 tabs (Restaurants, Rentals, Shop) from nav arrays and tab rendering for all roles
- Navigation arrays: USER_NAV, MEMBER_NAV, COMMUNITY_NAV, CREATOR_NAV — remove restaurants, rentals, shop entries
- `seed.ts`: revert to v31 seed version (v10), remove shopAnnouncements init
- `useData.ts`: remove `addShopAnnouncement`, `getShopAnnouncements`, `logUserLogin`, `logUserLogout`, `getUserActivity` — these are post-v31
- `types/index.ts`: remove `ShopAnnouncement`, `VehicleRental`, `ShopProduct`, `MenuItem`, `MenuItemReview`, `RentalAddon`, `BusinessType` from types — keep only what was in v31
- `data/eventsData.ts`: ensure events only show upcoming (keep this v32 improvement as it was a simple date filter)

### Remove
- `src/frontend/src/components/RestaurantsTab.tsx` — post-v31
- `src/frontend/src/components/VehicleRentalsTab.tsx` — post-v31
- `src/frontend/src/components/ShopTab.tsx` — post-v31
- All imports of the above in `App.tsx`

## Implementation Plan
1. Fix `main.tsx`: add `LanguageProvider` and `ErrorBoundary` wrapping the entire app. This is the #1 fix.
2. Remove RestaurantsTab, VehicleRentalsTab, ShopTab files.
3. Clean `App.tsx`: remove all imports and tab renderers for restaurants/rentals/shop. Remove those items from all 4 nav arrays.
4. Clean `types/index.ts`: remove post-v31 types (ShopAnnouncement, VehicleRental, ShopProduct, MenuItem, MenuItemReview, RentalAddon, BusinessType). Keep Business, RoomType, RentalAddon (hotel rental addons), PharmacyEntry.
5. Clean `useData.ts`: remove post-v31 functions (shop announcements, user activity logging).
6. Clean `seed.ts`: revert seed version, remove shopAnnouncements.
7. Validate build — zero errors, zero crashes.
