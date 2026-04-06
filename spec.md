# Ladakh Connect

## Current State

The app has a working ParcelConnectTab with a single unified view: a list of travel posts and a form modal to post a trip. Each post has a destination, travel date, parcel size (category), and phone number. The tab has a search filter but no capacity/slot tracking and no tab split.

Members sign up without any location restriction — no check enforces that their business must be in Ladakh.

## Requested Changes (Diff)

### Add
- Two tabs inside ParcelConnectTab: "I'm Going" and "Send a Parcel"
- "I'm Going" tab: travellers post their route + capacity (number of packages, 1–10), manually reduce slots when they accept a parcel, mark as Full
- "Send a Parcel" tab: senders search by destination, see all travellers going there, see available slots, call directly
- Full posts still show in both tabs but with a grey "Full" badge so people know someone is going that route
- Ladakh-only business rule: during Member signup and business listing creation, must confirm business is located in Ladakh (checkbox + validation)

### Modify
- ParcelConnectTab.tsx: complete rewrite to support two-tab layout, slot capacity (number input 1–10), manual slot reduction, Full badge, and separate "Send a Parcel" search view
- ParcelTrip interface: add `capacity` (number), `slotsLeft` (number), `isFull` (boolean) fields
- AuthScreen.tsx: add Ladakh business location confirmation checkbox for Member role signup
- MyBusinessTab.tsx: add Ladakh location confirmation when creating a new listing

### Remove
- Old single-view parcel layout (replaced by two-tab layout)
- CARRY_OPTIONS dropdown (replaced by numeric capacity input)

## Implementation Plan

1. Update ParcelTrip interface to include capacity, slotsLeft, isFull
2. Rewrite ParcelConnectTab with two tabs: "I'm Going" and "Send a Parcel"
   - "I'm Going": shows own posts with slot controls (reduce, mark full); also shows all active trips; post form uses numeric capacity
   - "Send a Parcel": search/filter by destination, shows all trips including full ones (grey badge), call button
3. Add Ladakh location confirmation to Member signup in AuthScreen
4. Add Ladakh location validation to MyBusinessTab listing creation
5. Validate build — no TypeScript errors, no crashes
