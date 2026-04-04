# Ladakh Connect

## Current State
Version 36 is a clean rebuild of Version 31. It has:
- Language system (LanguageProvider in context, LanguageSelectScreen on first launch)
- Auth system with roles: user, member, community, creator
- Explore, Events, Search, Profile tabs for all roles
- Hotels module (Premier members only)
- Creator dashboard, wallet (4-layer protection), moderation, vault, discover
- Member business tab (MyBusinessTab) with hotel management
- Bottom navigation: 5 primary tabs + secondary scrollable row
- CRITICAL BUG: main.tsx is missing LanguageProvider wrapper — fixed in this version

## Requested Changes (Diff)

### Add
- **RestaurantsTab** — public browsing tab for all roles; shows restaurant listings added by members; search, veg/non-veg filter, price sort, star ratings per dish; Users can rate dishes; contact (call/email) goes direct to business
- **RentalsTab** — public browsing tab for all roles; shows vehicle rental listings; filter by vehicle type (Car/Bike/Bicycle/Scooter/E-Bike/Other); sort by price; direct contact
- **ShopTab** — public browsing tab for all roles; shows product listings from member shops; search by name/category; "New Arrival" badge for announced products; direct contact
- **Restaurant listing form** in MyBusinessTab — Common + Premier members can add restaurant with: name, description, phone, email, menu items (category, photo, price, veg/non-veg), up to 20 photos (Common) / 50 photos (Premier)
- **Rental listing form** in MyBusinessTab — Common + Premier members can add rental agency with: name, description, phone, vehicles (type, model, daily price, monthly price, photo, available toggle)
- **Shop listing form** in MyBusinessTab — members can add shop/products with: shop name, description, phone, products (name, category, description, price, photos up to 20/50), shop announcement fee ₹200
- **Shop product announcement** — member pays ₹200 to mark a product as "New Arrival" for 7 days visibility; goes through pending payment flow
- **Restaurant/Rental/Shop types** in types/index.ts: RentalVehicle, ShopProduct interfaces
- **Navigation additions**: Restaurants, Rentals, Shop as secondary tabs for User, Member, Community, Creator nav
- **Translation keys** for restaurants, rentals, shop tabs

### Modify
- **main.tsx** — add LanguageProvider wrapper (critical crash fix)
- **types/index.ts** — add RentalVehicle, ShopProduct, ShopAnnouncement interfaces; extend Business type with vehicles and products arrays
- **MyBusinessTab** — extend to handle restaurant, rental, shop business types with appropriate forms
- **App.tsx** — add Restaurants, Rentals, Shop tab routing for all roles; add secondary tabs to USER_NAV, MEMBER_NAV, COMMUNITY_NAV, CREATOR_NAV
- **seed.ts** — bump version to v11 to reset/migrate properly

### Remove
- No removals; extending existing patterns cleanly

## Implementation Plan
1. Fix main.tsx (LanguageProvider + ErrorBoundary at root) — prevents all crashes
2. Extend types/index.ts with RentalVehicle, ShopProduct, ShopAnnouncement
3. Create RestaurantsTab.tsx — browse listings, filter veg/non-veg + price, dish ratings by Users
4. Create RentalsTab.tsx — browse listings, filter by vehicle type + price sort
5. Create ShopTab.tsx — browse products, search, new arrival badges
6. Update MyBusinessTab.tsx — add restaurant/rental/shop forms within existing business setup flow
7. Update App.tsx — add tab routing and secondary nav items for all roles
8. Update translations with new keys
9. Validate + deploy
