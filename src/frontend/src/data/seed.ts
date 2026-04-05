import type { Account } from "../types";

function hashPassword(p: string): string {
  return btoa(`${p}_lc_salt`);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export { generateId };

export function initSeedData() {
  // Version check:
  // v12: LanguageProvider crash fix + button security audit
  // v13: Q&A, business hours, discounts, menu card, dark/light mode, inquiry form
  // v14: UPI payment flow, wallet analytics-only reset (fake data wiped), LanguageProvider in main.tsx
  // v15: T&C modal, account switcher, linked accounts, violation carry-over, user/member/hybrid logs
  // v16: Hotels tab, Room Rentals tab, Feedback system, Search improvements
  const currentVersion = "v16";

  if (localStorage.getItem("lc_seeded") !== currentVersion) {
    // Auto-cleanup: remove test/demo accounts but PRESERVE:
    // - creator_1 (always kept)
    // - any account in lc_specialAccounts
    // - any account that has actual activity (lastLoginAt set)
    try {
      const specialList: { usernameOrEmail: string }[] = JSON.parse(
        localStorage.getItem("lc_specialAccounts") || "[]",
      );
      const specialIds = new Set(
        specialList.map((s) => s.usernameOrEmail?.toLowerCase()),
      );
      const rawAccounts = localStorage.getItem("lc_accounts");
      if (rawAccounts) {
        const accounts: Account[] = JSON.parse(rawAccounts);
        const cleaned = accounts.filter(
          (a) =>
            a.id === "creator_1" ||
            specialIds.has(a.username?.toLowerCase()) ||
            specialIds.has(a.email?.toLowerCase()) ||
            !!a.lastLoginAt, // keep accounts with real activity
        );
        if (cleaned.length < accounts.length) {
          localStorage.setItem("lc_accounts", JSON.stringify(cleaned));
        }
      }
    } catch {
      // Ignore cleanup errors — safer to keep data than lose it
    }

    // Initialize lc_linked_accounts from existing accounts if not already set
    if (!localStorage.getItem("lc_linked_accounts")) {
      const accounts: Account[] = JSON.parse(
        localStorage.getItem("lc_accounts") || "[]",
      );
      const groups: { email: string; accountIds: string[] }[] = [];
      for (const acc of accounts) {
        if (!acc.email) continue;
        const existing = groups.find(
          (g) => g.email.toLowerCase() === acc.email.toLowerCase(),
        );
        if (existing) {
          existing.accountIds.push(acc.id);
        } else {
          groups.push({ email: acc.email.toLowerCase(), accountIds: [acc.id] });
        }
      }
      localStorage.setItem("lc_linked_accounts", JSON.stringify(groups));
    }

    // v16: Initialize new storage keys
    if (!localStorage.getItem("lc_feedbacks")) {
      localStorage.setItem("lc_feedbacks", JSON.stringify([]));
    }
    if (!localStorage.getItem("lc_room_rentals")) {
      localStorage.setItem("lc_room_rentals", JSON.stringify([]));
    }
  }

  if (localStorage.getItem("lc_seeded") === currentVersion) return;

  const existingRaw = localStorage.getItem("lc_accounts");
  const existingAccounts: Account[] = existingRaw
    ? JSON.parse(existingRaw)
    : [];

  // Migrate old single-business to businesses array
  const migratedAccounts = existingAccounts.map((a) => {
    if (a.role === "member" && !a.businesses && (a as any).businessName) {
      return {
        ...a,
        businesses: [
          {
            id: generateId(),
            name: (a as any).businessName || "",
            category: (a as any).businessCategory || "General",
            description: (a as any).businessDescription || "",
            mapsUrl: "",
            photos: [],
          },
        ],
      };
    }
    return a;
  });

  const creatorExists = migratedAccounts.some((a) => a.id === "creator_1");

  const accounts: Account[] = creatorExists
    ? migratedAccounts.map((a) =>
        a.id === "creator_1"
          ? {
              ...a,
              username: "hunter",
              passwordHash: hashPassword("admin123"),
              role: "creator" as const,
            }
          : a,
      )
    : [
        {
          id: "creator_1",
          username: "hunter",
          email: "bigbhi52@gmail.com",
          passwordHash: hashPassword("admin123"),
          role: "creator" as const,
          electronicId: "LC-CRTX1",
          status: "active" as const,
          bio: "Founder & Creator of Ladakh Connect. Building Ladakh in one app.",
          createdAt: new Date().toISOString(),
        },
        ...migratedAccounts.filter((a) => a.id !== "creator_1"),
      ];

  localStorage.setItem("lc_accounts", JSON.stringify(accounts));

  if (!existingRaw) {
    localStorage.setItem("lc_posts", JSON.stringify([]));
    localStorage.setItem("lc_reviews", JSON.stringify([]));
    localStorage.setItem("lc_violations", JSON.stringify([]));
    localStorage.setItem("lc_permissionRequests", JSON.stringify([]));
    localStorage.setItem("lc_walletBalance", "0");
    localStorage.setItem("lc_walletTransactions", JSON.stringify([]));
    localStorage.setItem("lc_pendingPayments", JSON.stringify([]));
    localStorage.setItem("lc_flagReports", JSON.stringify([]));
    localStorage.setItem("lc_locationReviews", JSON.stringify([]));
    localStorage.setItem("lc_menuItemReviews", JSON.stringify([]));
  }

  if (!localStorage.getItem("lc_communityCode")) {
    localStorage.setItem("lc_communityCode", "blackjack");
  }

  if (!localStorage.getItem("lc_pendingPayments")) {
    localStorage.setItem("lc_pendingPayments", JSON.stringify([]));
  }

  if (!localStorage.getItem("lc_menuItemReviews")) {
    localStorage.setItem("lc_menuItemReviews", JSON.stringify([]));
  }

  if (!localStorage.getItem("lc_business_qa")) {
    localStorage.setItem("lc_business_qa", JSON.stringify([]));
  }
  if (!localStorage.getItem("lc_discounts")) {
    localStorage.setItem("lc_discounts", JSON.stringify([]));
  }
  if (!localStorage.getItem("lc_inquiries")) {
    localStorage.setItem("lc_inquiries", JSON.stringify([]));
  }
  if (!localStorage.getItem("lc_feedbacks")) {
    localStorage.setItem("lc_feedbacks", JSON.stringify([]));
  }
  if (!localStorage.getItem("lc_room_rentals")) {
    localStorage.setItem("lc_room_rentals", JSON.stringify([]));
  }

  localStorage.setItem("lc_seeded", currentVersion);
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

export function hashPw(p: string): string {
  return btoa(`${p}_lc_salt`);
}
