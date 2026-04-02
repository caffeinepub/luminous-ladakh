# Ladakh Connect — Version 23: Stability & Security Layer

## Current State
Version 22 is live. The app has:
- 4 roles: User, Member, Community Member, Creator
- Role-based navigation and conditional rendering
- Auth via useAuth hook (localStorage-based accounts)
- Account model (Account type in types/index.ts)
- Creator wallet (WalletTab.tsx) with pending payments, confirm/reject, withdraw
- AuthScreen.tsx handles login/signup with role selector
- Language system (LanguageContext.tsx) with 3 main languages
- main.tsx wraps App in QueryClientProvider + InternetIdentityProvider
- No global error boundary — a crash in any component takes down the whole app
- No security word / password recovery in Account model or AuthScreen
- No content moderation on uploads
- No withdrawal security watch or wallet audit log
- No role isolation enforcement beyond UI conditionals

## Requested Changes (Diff)

### Add
- **Global Error Boundary** (ErrorBoundary.tsx): React class component wrapping entire app. Catches any render crash, shows a friendly retry/refresh UI instead of blank screen. Also wraps individual tabs so one tab crash doesn't kill the whole app.
- **AppErrorBoundary** in main.tsx: Wrap `<App />` with the error boundary
- **Security Word field** on Account type: `securityWord?: string` — stored hashed alongside passwordHash
- **Security Word setup during signup**: All roles (user, member, community, creator) must set a security word during signup. Creator's security word must be a valid 52-card deck card name (e.g. "King of Hearts", "Ace of Spades") OR the phrase "52 decks of cards".
- **Forgot Password flow** in AuthScreen: "Forgot Password?" link on login screen → enter username → enter security word → set new password + confirm → save. Works for all roles.
- **Security Word validation for Creator withdrawal**: Before processing any withdrawal in WalletTab, Creator must enter their security word. Wrong word blocks withdrawal.
- **Wallet Audit Log**: Every payment confirmation, rejection, and withdrawal attempt (successful or blocked) is logged with timestamp, amount, and action type. Displayed in WalletTab as a scrollable log.
- **ROG-style Security Watch panel** in WalletTab: Shows a security status monitor during withdrawal — logs the attempt in real time, validates the security word, shows a visual "scanning" state before approving or blocking.
- **Content moderation on uploads**: When any file/text is submitted (photo contribution, business photo, post), scan for banned keywords (military, army, nude, explicit, spam keywords). Block flagged content and show warning.
- **Role isolation enforcement**: Add guard utilities so Creator-only data (wallet balance, wallet transactions, moderation data) cannot be accessed from non-Creator components. Each role's data access is scoped.
- **Auto-retry wrapper**: A `RetryWrapper` component that catches failed data loads and shows a retry button with countdown.

### Modify
- **Account type** (types/index.ts): Add `securityWord?: string` field
- **useAuth hook** (hooks/useAuth.ts): 
  - signup() requires securityWord parameter, hashes and stores it
  - Add recoverPassword(username, securityWord, newPassword) function
  - login() brute-force protection: track failed attempts per username in localStorage, lock account UI after 5 failed attempts for 15 minutes
- **AuthScreen.tsx**: 
  - Add securityWord field to all signup forms (email + social)
  - Add "Forgot Password?" link on login → recovery flow UI
  - Creator signup not allowed (login only), but Creator already has security word set via a one-time setup prompt if not set
- **WalletTab.tsx**: 
  - Add security word confirmation step before withdrawal processes
  - Add ROG Edge Pro style security watch UI (scanning animation, status log)
  - Add full wallet audit log section
- **main.tsx**: Wrap App in ErrorBoundary

### Remove
- Nothing removed — this is additive

## Implementation Plan
1. Create `src/frontend/src/components/ErrorBoundary.tsx` — React class-based error boundary with retry button
2. Create `src/frontend/src/components/RetryWrapper.tsx` — functional wrapper for async data with retry UI  
3. Update `src/frontend/src/types/index.ts` — add securityWord to Account
4. Update `src/frontend/src/hooks/useAuth.ts` — add securityWord to signup, add recoverPassword(), add brute-force tracking
5. Update `src/frontend/src/components/AuthScreen.tsx` — add security word field to signup, add forgot password flow
6. Update `src/frontend/src/components/creator/WalletTab.tsx` — add security word gate on withdrawal, ROG security watch UI, full audit log
7. Update `src/frontend/src/main.tsx` — wrap App in ErrorBoundary
8. Create `src/frontend/src/utils/contentModeration.ts` — keyword scanner for uploads
9. Create `src/frontend/src/utils/cardValidator.ts` — validates Creator security word as valid card name
