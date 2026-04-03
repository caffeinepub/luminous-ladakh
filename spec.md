# Ladakh Connect

## Current State
- Hotels module is live (Premier-only), with room types, availability, food menu, rental add-ons, and direct contact.
- Events tab exists with full calendar grouped by month, showing ALL approved events including past ones.
- Restaurant and Rental Agency business types exist as form options in MyBusinessTab but have no dedicated public-facing discovery/browse section yet.
- Members can pick business type (Hotel/Restaurant/Rental/Other) when adding a listing.

## Requested Changes (Diff)

### Add
- **Restaurants public discovery tab/section**: A browsable list of all restaurant listings submitted by Common and Premier members. Shows restaurant card with name, category (veg/non-veg indicator), price range, photos, rating, and a Call button. Tapping a card opens a full detail panel with the complete menu (grouped by category: Starters, Main Course, Desserts, Beverages), each dish showing name, price, veg/non-veg badge, description, and star rating. Users can rate individual dishes. Filters: price range (low/high), veg-only toggle.
- **Restaurant dish ratings**: Users can tap a star rating on any menu item. Rating is saved to localStorage. Average rating shown on dish card.

### Modify
- **Events tab**: Filter approved events to only show **upcoming** events (date >= today). Past events are hidden from the public calendar view. Group by month as before, but only future months. Show a friendly empty state if there are no upcoming events. Creator's pending approval panel is unchanged.
- **Events form date input**: Set minimum date to today so users cannot post events in the past.
- **Explore tab**: Add a "Restaurants" filter pill / category so users can discover restaurant listings from the Explore screen (optional integration — show restaurant cards inline).

### Remove
- Nothing removed.

## Implementation Plan
1. Update `EventsTab.tsx`: filter `approvedEvents` to only those with `date >= today` before grouping. Add `min={today}` to the date input in the post form.
2. Create `src/frontend/src/data/restaurantsData.ts`: localStorage-backed store for dish ratings (keyed by businessId + itemId).
3. Update `EventsTab.tsx` with upcoming-only filtering.
4. Update `ExploreTab.tsx` or create a `RestaurantsTab.tsx` component: public-facing restaurant discovery, with filters and detail panel showing full menu with dish ratings.
5. Wire `RestaurantsTab` into `App.tsx` navigation for User, Member, Community Member, and Creator roles (similar to how Hotels are shown in Explore).
6. Validate and deploy.
