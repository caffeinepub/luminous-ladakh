# Ladakh Connect — Version 32 (Stability + Full Feature Build)

## Current State
- Version 31 is live with: Hotels (Premier), Restaurants, Events, SOS+Pharmacy, Language system, Creator wallet, Special Accounts, Error boundaries
- App crashes intermittently due to accumulated technical debt
- Missing: Vehicle Rentals tab, Shop/Selling category, event fee update, user activity tracking
- All buttons need to be verified functional for all roles

## Requested Changes (Diff)

### Add
- **Vehicle Rentals section** (Common + Premier): standalone tab visible to all roles for browsing; members can list any rental (car, bike, scooter, bicycle, e-bike, etc.) under their business
- **Shop/Selling Category** (new business type): members list products for sale (dealerships, shops, etc.); up to 20 photos (Common), up to 50 photos (Premier); unlimited products per shop; members can add/edit/delete products
- **Shop Product Announcements**: ₹200 fee per announcement; shows "New Arrival" badge; same payment flow as events
- **Event fee update**: posting fee ₹500 (was ₹650); first 7 days free; day 8+ = ₹10/day; after 2nd week = ₹70/2 days; non-payment = event removed
- **User Activity Tracking** (Creator dashboard only): last login, last logout, days inactive per account; auto-cleanup of test/demo accounts on version update; Special Accounts are PERMANENT and never auto-cleaned
- **VehicleRentalsTab** component: browsable by all roles, with filters (vehicle type, price), reviews, contact info
- **ShopTab** component: browsable by all roles, product cards with photos, price, contact
- `lc_userActivity` localStorage key to track per-user login/logout timestamps
- Account activity data in Creator dashboard new "Activity" section

### Modify
- **types/index.ts**: add `ShopProduct`, `ShopAnnouncement`, `VehicleRental` types; add `shop` to BusinessType; add `lastLoginAt`, `lastLogoutAt` fields to Account
- **useData.ts**: add `logUserActivity`, `getUserActivity`, `getActivityLog` methods; add `addShopAnnouncement`, `getShopAnnouncements` methods
- **seed.ts**: bump seed version to v13 to trigger auto-cleanup of test accounts while preserving real accounts and special accounts
- **App.tsx**: add VehicleRentals and Shop tabs to all role nav arrays; wire new tab renders; add LanguageProvider wrapper if missing; fix main.tsx to ensure LanguageProvider wraps everything
- **main.tsx**: ensure LanguageProvider is always present
- **MyBusinessTab.tsx**: add 'shop' to BusinessType options; add product management (add/edit/delete products with up to 50 photos for Premier, 20 for Common); add rental business type with extended vehicle fields
- **MembershipTab.tsx**: update photo limits (Common: 20, Premier: 50); mention 2 promo videos for Premier
- **EventsTab.tsx**: update posting fee to ₹500; add extension fee logic display (₹10/day after week 1, ₹70/2 days after week 2)
- **CreatorDashboard**: add User Activity section showing last login, last logout, days inactive per user
- **DashboardTab.tsx**: add activity tracking panel
- **types/index.ts**: add rental-specific fields to Business type

### Remove
- Dead/unused imports across all files
- `pollsData.ts` usage if unused anywhere
- Any cheat codes or hardcoded test bypasses
- External redirects except Google Maps URLs (which are user-provided data)

## Implementation Plan
1. Update `types/index.ts` — add ShopProduct, VehicleRental, ShopAnnouncement types; extend Account with activity fields
2. Update `useData.ts` — add activity tracking, shop announcements, cleanup logic
3. Update `seed.ts` — bump to v13 for auto-cleanup
4. Update `main.tsx` — ensure LanguageProvider is rock-solid
5. Create `VehicleRentalsTab.tsx` — standalone browse tab for all roles
6. Create `ShopTab.tsx` — standalone browse tab for all roles
7. Update `MyBusinessTab.tsx` — add shop + rental business types with proper photo limits
8. Update `MembershipTab.tsx` — update photo limit text
9. Update `EventsTab.tsx` — ₹500 fee, extension fee display
10. Update `DashboardTab.tsx` — add User Activity panel
11. Update `App.tsx` — wire all new tabs for all roles, ensure every button has a handler
12. Validate and fix all TypeScript errors
