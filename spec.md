# Ladakh Connect — Version 8

## Current State
- Full-stack React + Motoko app with 4 roles: User, Member, Community, Creator
- LocalStorage-based data (accounts, posts, reviews, violations, wallet, etc.)
- Dark theme using BricolageGrotesque + Figtree fonts
- AuthScreen has Login/Signup tabs with Google/Facebook social buttons
- Input text visibility issues on login screen (partially fixed)
- Violation system levels 1–7 but penalty values differ from requirement
- Creator moderation tab has sub-panels per role group
- No theme switching per user, no army content moderation, no account banning with data cleanup

## Requested Changes (Diff)

### Add
- **Deeper black theme**: Make background truly pitch black (oklch ~8% lightness), cards very dark charcoal. All input backgrounds should be clearly visible dark surfaces with white/light text
- **Premium photo theme**: Premium members (membershipTier=Premier) can upload/set a photo as their theme background (stored as dataURL in account)
- **Theme switcher**: User, Member, Community can switch between 3 preset themes (Dark/Default, Slate/Cool, Warm/Amber) in their Profile settings. Creator always stays on default.
- **Reviews in white card**: Review cards use white/light background with dark (black) text regardless of global theme
- **Army/military content auto-block**: When user uploads a photo in PostPlaceModal, scan the filename and description for military keywords (army, military, camp, cantonment, base, barracks, soldier, uniform, weapon, ammunition, patrol, restricted zone). If detected, auto-block the upload and show a toast error. Issue a Level 2 violation automatically on that user's account.
- **Account banning with data cleanup**: When Creator issues Level 7 ban to an account, add `status: "banned"` to Account. On ban: delete all that user's posts, delete all reviews they gave/received, delete their business listing content. Account ID + username remain in cloud/storage as a record but with `status: "banned"` and all content fields blanked. Show "BANNED" badge on that account in Creator moderation.
- **Account suspension**: Level 6 = set `status: "suspended"`. Suspended users can still see the app but cannot post/review.
- **Creator close/deactivate account action**: In ModerationTab, each account row gets a "Ban" button (triggers Level 7) and "Suspend" button (triggers Level 6) directly.

### Modify
- **Violation system levels** (update VIOLATION_LEVELS in ModerationTab and update T&C text):
  - Level 1: Warning — formal warning
  - Level 2: Final Warning — last warning, applies automatically to army content violations
  - Level 3: Fine ₹500 — monetary penalty
  - Level 4: Fine ₹1,000 — higher monetary penalty
  - Level 5: Fine ₹1,500 — highest monetary penalty
  - Level 6: Suspension — temporary account suspension
  - Level 7: Permanent Ban — account banned, content deleted, ID remains in cloud
- **Input visibility across all forms**: All `<Input>`, `<Textarea>`, `<select>` elements must have explicit `text-white` or `text-foreground` + `bg-[#1a1a1a]` or equivalent so typed text is always visible on dark background
- **Login/AuthScreen redesign**: Google-flow feel — center-card on black/dark background, clean single-column form, clear "Welcome back" vs "Create account" headings, all inputs with placeholder text visible, social login buttons with proper Google/Facebook icons
- **Typography**:
  - App name "Ladakh Connect" in header: use `font-heading` with a stylish/display variant, larger and bolder
  - Location names in ExploreTab cards: `font-bold`
  - Overviews/descriptions/key points: `font-normal` weight
- **Account type in types/index.ts**: Add `status?: "active" | "suspended" | "banned"`, `theme?: string`, `themePhoto?: string`
- **Banned user login block**: In useAuth login function, if account has `status === "banned"`, reject login with message: "This account has been permanently banned. Your ID remains on record."
- **Suspended user UI**: Show a yellow warning banner at top of their home screen: "Your account is suspended. Some actions are restricted."

### Remove
- Old Level 3 "Content Removal" and old fine values (replace with new violation levels above)

## Implementation Plan
1. Update `types/index.ts` — add `status`, `theme`, `themePhoto` fields to Account
2. Update `index.css` — deepen background to true black, ensure input/card contrast is clear, add theme CSS variables for alternate themes
3. Update `tailwind.config.js` if needed for new color tokens
4. Redesign `AuthScreen.tsx` — Google-flow login/signup, all inputs visible, black theme
5. Update `data/seed.ts` — update initSeedData version to v9, handle banned status
6. Update `hooks/useAuth.ts` — block banned users on login, apply theme on login
7. Update `components/creator/ModerationTab.tsx` — new violation levels, Ban/Suspend buttons per account row, show banned status
8. Update `hooks/useData.ts` — add `banAccount` function that sets status=banned and clears content
9. Update `components/user/PostPlaceModal.tsx` — army keyword detection on upload, auto-block + issue Level 2 violation
10. Update `App.tsx` — pass `banAccount`/`suspendAccount` to ModerationTab, show suspension banner, apply user theme
11. Update Profile tabs (UserProfileTab, MemberProfileTab, CreatorProfileTab) — add theme switcher; add photo theme picker for Premier members
12. Update review cards in ExploreTab — white background, dark text
13. Update T&C text in AuthScreen to reflect new violation levels
