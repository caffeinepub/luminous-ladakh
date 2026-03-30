# Luminous Ladakh — Version 3

## Current State
A creator dashboard with 4 pages (Dashboard, Explore, Vault, Profile). All navigation works and backend is wired. Key issues:
- Explore "View Guide" buttons only show toast notifications — no real content
- Vault item clicks only show toast — no detail content
- Profile settings buttons only show toast — nothing happens
- Mobile bottom nav: Dashboard button is always styled as the active "primary" pill regardless of which page is active
- Code is monolithic 1267-line single file with all 4 views inlined

## Requested Changes (Diff)

### Add
- Destination detail Dialog for Explore: clicking any destination card or "View Guide" opens a modal with rich travel info (altitude, best season, travel tips, key highlights, typical duration)
- Vault item detail Dialog: clicking a vault item opens a contextual dialog with category-specific content/description
- Profile settings Sheet: clicking any settings item opens a right-side Sheet with relevant controls (e.g., Appearance toggles dark mode label; Region shows location info; Privacy shows identity info; Notifications shows toggle list)

### Modify
- Mobile bottom nav: Dashboard button should only be styled as the "active" primary pill when activeNav === "dashboard"; all other tabs use the same inactive/active style pattern
- Explore "View Guide" button: open destination detail dialog
- Vault item click: open vault item dialog instead of toast
- Profile settings click: open settings sheet instead of toast
- Stats cards: add subtle hover state improvement and make numbers larger/bolder relative to labels
- Clean up the hero greeting area — tighter vertical spacing
- Consistent border-radius across all cards (use rounded-2xl consistently)

### Remove
- Toast-only interactions on Explore, Vault, Profile that provide no real value
- Redundant `key` prop on `<motion.div>` that duplicates the parent `AnimatePresence` key

## Implementation Plan
1. Add destination data with rich travel details (altitude, best season, duration, highlights array)
2. Build `DestinationDialog` component — full-width modal with destination details
3. Update `ExploreView` to open DestinationDialog on card/button click
4. Build `VaultItemDialog` component — shows vault category details
5. Update `VaultView` to open VaultItemDialog on item click
6. Build `SettingsSheet` component using Sheet from shadcn — shows settings panel for each setting type
7. Update `ProfileView` to open SettingsSheet per setting
8. Fix mobile nav active state — Dashboard button shows primary style only when activeNav === 'dashboard', otherwise matches other nav buttons
9. Polish stats cards and hero section spacing
