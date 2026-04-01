# Ladakh Connect

## Current State
Version 14 is live. ExploreTab.tsx contains all location data and renders Details/Reviews as overlay panels. Creator can edit location text details. Location images are preloaded (AI/Wikimedia). No back button exists on overlay panels -- mobile users exit the app when pressing the browser back button.

## Requested Changes (Diff)

### Add
- In-app back/close button on all Details and Reviews overlay panels (visible, tappable, returns to Explore without leaving the app)
- User photo contribution: any logged-in user can submit a photo for any location via a "Contribute Photo" button on the location card/details panel
- Pending photo queue in Creator dashboard -- shows submitted photos with location name, submitter, and approve/reject actions
- Creator photo management: upload new photos, delete existing photos (including AI-generated or false ones) on any location
- Creator can delete individual user reviews (but cannot edit review text)

### Modify
- Details panel: add back button at top, add "Contribute Photo" button for logged-in non-creator users
- Reviews panel: add back button at top; Creator sees a delete button on each review
- Creator dashboard: add "Photo Approvals" section showing pending user-submitted photos
- Location data structure: support dynamic photo arrays that can be modified by Creator

### Remove
- Nothing removed

## Implementation Plan
1. Add `pendingPhotos` and `locationPhotos` state to app-level state (localStorage-backed)
2. In ExploreTab: add visible X/back button on all overlay panels (Details, Reviews)
3. Add "Contribute Photo" button in Details panel for non-creator logged-in users -- opens file picker, stores to pending queue
4. Creator controls in Details panel: upload photo button, delete button on each photo in the gallery
5. Creator delete button on each review in Reviews panel
6. Creator dashboard (DashboardTab or new section): Photo Approvals panel listing pending photos with Approve/Reject
7. On approval, photo moves from pending to the location's photo array and appears in gallery
