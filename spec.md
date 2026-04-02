# Ladakh Connect

## Current State
Version 17 is live with: multi-role app (User, Member, Community Member, Creator), explore with 22 preloaded locations, business listings, payments, violation system, weather widget, road status alerts, electronic ID, undiscovered places feed, festival/event calendar with ₹650 fee, emergency SOS, and language support (3 main + all world languages downloadable).

## Requested Changes (Diff)

### Add
1. **Offline Mode / Saved Locations** -- Bookmark button on every location/business card; saved locations accessible from a new "Saved" tab or section in User profile; cached locally so details viewable without signal
2. **Trip Planner** -- New "Trip Planner" tab for Users; add locations from Explore to itinerary by day; reorder days; share trip as a readable summary; free for all roles
3. **Business Review Verification Badge** -- When a user leaves a review on a business, show a "Visited" badge if their check-in location is near the business (within Leh area); unverified reviews show without badge; businesses display verified review count
4. **Seasonal Attraction Alerts** -- Each location card shows a season tag ("Open May–Oct", "Year Round", etc.); saved locations trigger a banner notification when their season opens; Creator can edit season info per location
5. **Member Loyalty Tier** -- Track consecutive payment months per member; after 6 months Common members get "Trusted Seller" badge; after 12 months Premier members get "Verified Partner" badge; badges shown on business cards and member profiles
6. **Community Polls** -- Creator can create polls (question + up to 4 options) from Creator Dashboard; polls visible to all roles in Explore or a dedicated section; users can vote once; results shown as percentage bars; Creator can close/delete polls
7. **Visitor Count / Check-in Stats** -- Each location/business card shows a visitor count ("X visitors"); users can tap a "Check In" button when viewing a location; count increments and is stored; shown on cards and in Details panel
8. **Business Analytics for Members** -- In the My Business section, each business listing shows a stats panel: total views, total Directions taps, total reviews, check-ins this week; data is per-business and visible only to the owning member

### Modify
- ExploreTab: add bookmark button, visitor count, check-in button, seasonal tag on cards
- UserProfileTab: add Saved Locations section; add Trip Planner access
- MyBusinessTab: add analytics panel per business
- DashboardTab (Creator): add Poll creation panel
- Member business cards: show loyalty badge if earned
- Review submission: record whether user is near Leh for verification badge

### Remove
- Nothing removed

## Implementation Plan
1. Add `savedLocations`, `checkIns`, `tripPlans`, `polls`, `memberStats` to local state/data layer in types/index.ts and relevant data files
2. Add bookmark (save) button to every location card in ExploreTab; persist to localStorage under user account
3. Add "Saved" section to UserProfileTab showing bookmarked locations with remove option
4. Create TripPlannerTab component: add locations to days, reorder, share as text summary
5. Add seasonal tags to location data (seed.ts); render tag badge on cards; show open/closed status
6. Add check-in button to location Details panel; increment visitor count stored per location in localStorage
7. Show visitor count on all location/business cards
8. Add "Verified" badge logic on reviews: if user's browser geolocation is within Ladakh region, mark review as verified
9. Add loyalty tier tracking: count payment months per member account; render badge on business cards and profile
10. Add PollsSection component; Creator creates polls from Dashboard; all roles can view and vote in Explore
11. Add analytics panel in MyBusinessTab per business: views, directions taps, reviews, check-ins
12. Wire all new features to existing language translation system
