# Ladakh Connect – Version 16 (6 New Features)

## Current State
Version 15 is live with: deep black theme, role-based navigation (User/Member/Community/Creator), ExploreTab with 22 preloaded locations, Member business listings, violation system, Creator dashboard/wallet/moderation, user photo contributions with Creator approval, back buttons on panels.

## Requested Changes (Diff)

### Add
1. Live Weather Widget – top of Explore, shows Leh/Pangong/Nubra weather (temp, condition, wind) using realistic static data.
2. Road Status Alerts – section in Explore showing status of Manali-Leh, Srinagar-Leh, Khardung La, Chang La, Zoji La. Creator/Community can update status.
3. Electronic ID Card – digital membership card in Member profile with name, tier, unique ID, join date, QR code.
4. Undiscovered Places Feed – "Discover" tab for Users to submit new spots (name, desc, photo, area), upvote, Creator promotes to Explore.
5. Festival & Event Calendar – "Events" tab for all roles. Creator manages official list. Any role can post event by paying Rs650 (pending payment to Creator wallet, requires Creator confirmation before going live).
6. Emergency SOS Button – floating button on Explore, opens panel with SNM Hospital, Leh Police, fire, mountain rescue numbers.

### Modify
- App.tsx: Add discover tab (User), events tab (all roles)
- ExploreTab.tsx: Add weather widget, road status, SOS button
- DashboardTab.tsx: Add event approvals panel, road status management
- WalletTab.tsx: Event payments (Rs650) as pending payments
- MemberProfileTab.tsx: Add Electronic ID card section

### Remove
Nothing removed.

## Implementation Plan
1. Add Event, RoadStatus, DiscoveryPost types to types.ts
2. Create weatherData.ts, roadStatus.ts (localStorage), events.ts (localStorage with 5 seed festivals)
3. Create WeatherWidget.tsx, RoadStatusWidget.tsx, EmergencySOS.tsx
4. Create EventsTab.tsx with Rs650 payment gate and Creator approval flow
5. Create DiscoverTab.tsx with submit + upvote for Users
6. Create ElectronicIDCard.tsx for Member profile
7. Update ExploreTab.tsx, App.tsx, DashboardTab.tsx, MemberProfileTab.tsx
