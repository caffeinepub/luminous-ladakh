# Ladakh Connect — v55: Organic Map System

## Current State
The app has Explore, Discover, Hotels, Restaurants, Rentals, Shop, Rooms, Parcel Connect, Events tabs. No map feature exists. Business listings have a single edit flow. The BottomNav has a special circular 'post' button for users. Members and Community Members have no map access.

## Requested Changes (Diff)

### Add
- New `LadakhMapTab` component: full offline-first interactive map of Ladakh using Leaflet.js + OpenStreetMap tiles cached via service worker / localStorage tile cache
- Map shows pins for: Explore locations, Member businesses, Events, Community posts with location tags
- Daily auto-refresh of new pins (small delta, only when online)
- Military/restricted zones displayed as "Unnamed" with no description or label detail
- Map tab added to all nav arrays (USER_NAV, MEMBER_NAV, COMMUNITY_NAV, CREATOR_NAV)
- Business location picker inside member business form: two options — "Paste Google Maps URL" (auto-extract lat/lng from URL) and "Use Current Location" (device geolocation API, shows pin on inbuilt map)
- Device location permission dialog before accessing GPS

### Modify
- **BottomNav**: For Users — replace the single circular 'post' button with a compact split dual-dash button (two flat bars side by side): left = Post, right = Map. Both shaped as flat horizontal dashes.
- **BottomNav**: For Members and Community Members — show only the Map dash button (single, slightly larger)
- **MemberBusinessTab**: Split the edit flow into two separate buttons:
  - **Edit** button: instant changes to photos, description, menu, prices, hours, amenities
  - **Update** button: location change (30-day review) and business status change (Open/Closed/Temporarily Closed/Coming Soon). Clear notice shown: "Location changes will be reviewed and applied within 30 days". Old pin/location stays visible on map until approved.
- **Business type** in types/index.ts: add optional `lat`, `lng`, `locationStatus` ("active" | "pending_review"), `businessStatus` ("open" | "closed" | "temporarily_closed" | "coming_soon") fields to Business interface
- **App.tsx**: Add `map` tab routing for all roles
- **main.tsx**: CRITICAL — ensure LanguageProvider is present (do not remove)

### Remove
- Nothing removed

## Implementation Plan
1. Install `leaflet` and `@types/leaflet` npm packages
2. Create `src/components/LadakhMapTab.tsx` with Leaflet map, OSM tiles, all pin categories, military unnamed zones, daily refresh logic
3. Update `Business` interface in `types/index.ts` to add lat/lng/locationStatus/businessStatus
4. Update `MemberBusinessTab` to split Edit/Update buttons with location picker (Google Maps URL parser + current location)
5. Update `BottomNav` for split dual-dash button (Users) and single map dash (Members/Community)
6. Add `map` tab to all nav arrays in `App.tsx` and wire the `LadakhMapTab` component for all roles
7. Validate + deploy
