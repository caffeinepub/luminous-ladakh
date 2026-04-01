import type {
  Account,
  FlagReport,
  PermissionRequest,
  Post,
  Review,
  Violation,
  WalletTransaction,
} from "../types";

function hashPassword(p: string): string {
  return btoa(`${p}_lc_salt`);
}

export function initSeedData() {
  if (localStorage.getItem("lc_seeded") === "v8") return;

  // Keep existing accounts if already present (real user data), but ensure creator exists
  const existingRaw = localStorage.getItem("lc_accounts");
  const existingAccounts: Account[] = existingRaw
    ? JSON.parse(existingRaw)
    : [];

  const creatorExists = existingAccounts.some((a) => a.id === "creator_1");

  const accounts: Account[] = creatorExists
    ? existingAccounts
    : [
        {
          id: "creator_1",
          username: "hunter",
          email: "bigbhi52@gmail.com",
          passwordHash: hashPassword("admin123"),
          role: "creator",
          electronicId: "LC-CRTX1",
          bio: "Founder & Creator of Ladakh Connect. Building Ladakh in one app.",
          createdAt: new Date().toISOString(),
        },
      ];

  // Only reset everything on fresh start (no existing data)
  if (!existingRaw) {
    localStorage.setItem("lc_accounts", JSON.stringify(accounts));
    localStorage.setItem("lc_posts", JSON.stringify([]));
    localStorage.setItem("lc_reviews", JSON.stringify([]));
    localStorage.setItem("lc_violations", JSON.stringify([]));
    localStorage.setItem("lc_permissionRequests", JSON.stringify([]));
    localStorage.setItem("lc_walletBalance", "0");
    localStorage.setItem("lc_walletTransactions", JSON.stringify([]));
    localStorage.setItem("lc_flagReports", JSON.stringify([]));
  } else {
    // Just ensure creator account exists in existing data
    localStorage.setItem("lc_accounts", JSON.stringify(accounts));
  }

  localStorage.setItem("lc_seeded", "v8");
}

export function verifyPassword(plain: string, hash: string): boolean {
  return btoa(`${plain}_lc_salt`) === hash;
}

export function generateElectronicId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "LC-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function hashPw(p: string): string {
  return btoa(`${p}_lc_salt`);
}
