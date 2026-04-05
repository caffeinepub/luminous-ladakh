# Ladakh Connect – Version 41

## Current State
- App is stable at v40 with full navigation, role-based tabs, UPI payment flow, wallet analytics, Restaurants/Rentals/Shop tabs, and all v39 features (weather, community posts, Q&A, photo contributions, business hours, discounts, menu QR, dark/light mode, inquiry form).
- AuthScreen has a basic T&C checkbox with a one-liner agreement text — not a full readable modal.
- No account switcher feature exists.
- No multi-account linking logic or violation carry-over.
- No User Log / Member Log / Hybrid Log in analytics.
- Logout clears only the current session with no multi-account awareness.

## Requested Changes (Diff)

### Add
1. **Terms & Conditions full modal** — scrollable full-screen modal accessible by tapping a "Read Terms & Conditions" link in signup form. Must scroll to bottom before the checkbox becomes enabled. T&C text covers all user types (User, Member, Community Member), abuse rules, violation levels, business listing rules, payment terms. T&C also accessible from all profile settings pages (User, Member, Creator) via a "Terms & Conditions" button.
2. **Account switcher** — Instagram-style account switcher in all profile tabs (UserProfileTab, MemberProfileTab, CreatorProfileTab). Shows current account at top with all linked accounts (same email group) below. "+ Add Account" button at bottom. Switching between same-email accounts is instant (no re-login). Different-email accounts cannot switch. Unlimited accounts can be added.
3. **Linked account soft notice** — when a user has multiple accounts on the same email, show a quiet info banner in their profile: "You have X accounts linked to this email."
4. **Violation carry-over rule** — new logic in data layer: when an account reaches violation Level 6 or 7, any NEW account created AFTER that violation using the same email automatically receives a Level 2 violation. Accounts created BEFORE the violation are not affected.
5. **User Log, Member Log, Hybrid Log** — new collapsible sections in CreatorDashboard (AnalyticsPanel) and visible also to Community Members in their PermissionsTab. User Log shows total users, active, inactive. Member Log shows total members, active, recently updated listings. Hybrid Log shows accounts where one email has multiple roles, with status of each account (Active/Inactive/Deactivated).
6. **Multi-account logout** — logging out hides all linked accounts from view. Session clears completely. App returns to login screen. Creator log reflects all linked accounts as logged out.

### Modify
- `AuthScreen.tsx` — replace T&C checkbox one-liner with a "Read T&C" link that opens a full scrollable modal; checkbox only activates after scrolling to bottom.
- `useAuth.ts` — add violation carry-over logic on signup; add multi-account session tracking (lc_linked_accounts in localStorage).
- `seed.ts` — bump version to v15; initialize lc_linked_accounts if not present.
- `DashboardTab.tsx` — add User Log, Member Log, Hybrid Log sections to AnalyticsPanel.
- `UserProfileTab.tsx`, `MemberProfileTab.tsx`, `CreatorProfileTab.tsx` — add account switcher UI and T&C link.
- `community/PermissionsTab.tsx` — add read-only Hybrid Log view.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `TermsModal.tsx` — full scrollable T&C modal with scroll-to-bottom enforcement.
2. Create `AccountSwitcher.tsx` — Instagram-style account switcher component.
3. Update `useAuth.ts` — add linked account tracking, violation carry-over on signup, multi-account logout.
4. Update `seed.ts` — bump to v15, initialize linked accounts store.
5. Update `AuthScreen.tsx` — wire TermsModal, disable checkbox until scrolled.
6. Update `DashboardTab.tsx` — add User/Member/Hybrid logs to AnalyticsPanel.
7. Update `UserProfileTab.tsx`, `MemberProfileTab.tsx`, `CreatorProfileTab.tsx` — embed AccountSwitcher and T&C link.
8. Update `community/PermissionsTab.tsx` — add read-only Hybrid Log.
9. Validate build — lint, typecheck, build. Fix any errors before deploying.
