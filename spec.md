# Ladakh Connect — Version 31

## Current State
- Multi-role PWA: User, Member, Community Member, Creator
- Hotels: Premier members only, with 2-hour trial for Common. After trial, Common sees locked/upgrade UI.
- Restaurants/Rentals: Common + Premier members
- Membership tab: Shows both Common (₹1,000) and Premier (₹1,500) plans with working Pay buttons
- Trial logic: All new members get 2-hour trial (trialStartDate set at signup). After trial, business tab locked until payment.
- Security: brute-force protection, security word recovery, role isolation, Creator wallet 4-layer protection
- Language: English/Hindi/Ladakhi (web); 90+ world languages downloadable (PWA)
- Stability: ErrorBoundary wraps every tab; LanguageProvider in main.tsx is sometimes missing (root crash cause)
- Profile photo: upload via hidden file input — no camera permission prompt
- Onboarding T&C: accepted at signup, 2 generic rules shown
- Auth screen: role selector for all 4 roles including Creator

## Requested Changes (Diff)

### Add
- **Trial access for all roles at signup**: Every new member (any role) gets to choose any role during signup and access that role's features for the 2-hour trial. This is already the case for members — confirm it's consistent and clearly labeled in UI.
- **Camera/media permission request**: Before opening the file picker for profile photo upload (in all profile tabs: User, Member, Community Member, Creator) OR before using camera features, the app must show a permission dialog explaining WHY access is needed ("To upload your profile photo, we need access to your photos/camera. Allow?"). User can Allow or Deny. If denied, the upload button is disabled with a message. This is a soft permission gate — using browser's getUserMedia/permissions API where possible, otherwise a custom modal confirmation.
- **Two new platform rules/guidelines**: Added to the signup T&C acceptance step AND visible in a "Platform Rules" section on each profile tab. Rules:
  1. **Respect & Authenticity Rule**: "All content posted on Ladakh Connect must be genuine and respectful. Posting fake reviews, misleading business information, or impersonating other users is strictly prohibited and may result in immediate account suspension or permanent ban (Violation Level 5+)."
  2. **Privacy & Safety Rule**: "Do not share personal contact details, addresses, or private information of other users publicly. Content that endangers personal safety, spreads misinformation, or violates another person's privacy will be removed and penalized under the Violation System."
- **Hotel business locked to Premier after trial**: After the 2-hour trial, if a member tries to select Hotel as their business type, they must be on Premier plan. Common members trying to select Hotel after trial expiry should see: "Hotel promotion requires the Premier Plan (₹1,500/mo). Upgrade to access." with an Upgrade button.
- **Other businesses (Restaurant, Rental) available on Common or Premier after trial**: After trial, Common members can still access Restaurant and Rental business types by paying the Common plan.

### Modify
- **main.tsx**: Ensure `LanguageProvider` wraps `App` — this is the single most common crash cause. Must be: `<QueryClientProvider> → <InternetIdentityProvider> → <LanguageProvider> → <App />`.
- **Profile photo upload (all 4 profile tabs)**: Replace direct `photoRef.current?.click()` with a permission-check-first flow. Show a custom modal: "Ladakh Connect would like to access your camera/photos to update your profile photo. [Allow] [Deny]". Only proceed to file picker if allowed. Store permission decision in state (not persistent — ask once per session).
- **Cleanup dead code**: Remove any unused imports, unused state variables, and dead conditional branches. Do NOT remove working features — only clearly unused utilities.
- **Trial messaging**: Make trial banners clearer — "Your 2-hour free trial includes access to all business types. After the trial, Hotel promotion requires Premier Plan. Restaurant and Rental promotion available on any paid plan."
- **Business type selection gate**: When trial is expired, enforce: Hotel → Premier only. Restaurant/Rental → Common or Premier.

### Remove
- Any redundant `applyFontColor` function that is duplicated across profile tab files (it's copy-pasted in 3 files — consolidate to import from useAuth or keep as-is but note for future)
- Remove any `console.log` or debug statements if present

## Implementation Plan
1. Fix `main.tsx` — add `LanguageProvider` wrapper (critical stability fix)
2. Add `CameraPermissionModal` component — reusable modal that gates file/camera access with Allow/Deny. Used in all 4 profile tabs.
3. Update all 4 profile photo handlers (UserProfileTab, MemberProfileTab, CreatorProfileTab, CommunityProfileTab or equivalent) to use permission modal before opening file picker.
4. Update `AuthScreen.tsx` — add 2 new platform rules to the T&C section shown before signup confirmation.
5. Add `PlatformRules` section to each profile tab — collapsible card showing the 2 rules.
6. Update `MyBusinessTab.tsx` — enforce Hotel = Premier only after trial. Show upgrade prompt for Common members trying to access Hotel after trial.
7. Update `MembershipTab.tsx` trial banner to clarify Hotel vs other business trial rules.
8. Clean up: scan all files for unused imports and dead code, remove safely.
9. Validate: run lint + typecheck + build, fix all errors before deploy.
