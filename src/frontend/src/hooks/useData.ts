import { useCallback, useState } from "react";
import { generateId } from "../data/seed";
import type {
  Account,
  FlagReport,
  LocationReview,
  PendingPayment,
  PermissionRequest,
  Post,
  Review,
  ShopAnnouncement,
  Violation,
  WalletTransaction,
} from "../types";

function notify() {
  window.dispatchEvent(new Event("lc_data_changed"));
}

function getLS<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function setLS<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
  notify();
}

export function useData() {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  // Accounts
  const getAccounts = useCallback(
    (): Account[] => getLS<Account>("lc_accounts"),
    [],
  );
  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    const accounts = getLS<Account>("lc_accounts");
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...updates };
      setLS("lc_accounts", accounts);
    }
  }, []);

  const banAccount = useCallback((accountId: string) => {
    const accounts = getLS<Account>("lc_accounts");
    const idx = accounts.findIndex((a) => a.id === accountId);
    if (idx >= 0) {
      accounts[idx] = {
        ...accounts[idx],
        status: "banned",
        bio: undefined,
        avatar: undefined,
        profilePhoto: undefined,
        themePhoto: undefined,
        businessName: undefined,
        businessDescription: undefined,
        businessCategory: undefined,
        businessLocation: undefined,
        businesses: [],
      };
      setLS("lc_accounts", accounts);
    }
    const posts = getLS<Post>("lc_posts").filter(
      (p) => p.submittedBy !== accountId,
    );
    localStorage.setItem("lc_posts", JSON.stringify(posts));
    const reviews = getLS<Review>("lc_reviews").filter(
      (r) => r.reviewerUserId !== accountId && r.targetMemberId !== accountId,
    );
    localStorage.setItem("lc_reviews", JSON.stringify(reviews));
    notify();
  }, []);

  const suspendAccount = useCallback((accountId: string) => {
    const accounts = getLS<Account>("lc_accounts");
    const idx = accounts.findIndex((a) => a.id === accountId);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], status: "suspended" };
      setLS("lc_accounts", accounts);
    }
  }, []);

  // Posts
  const getPosts = useCallback((): Post[] => getLS<Post>("lc_posts"), []);
  const addPost = useCallback((post: Omit<Post, "id" | "timestamp">) => {
    const posts = getLS<Post>("lc_posts");
    posts.unshift({
      ...post,
      id: generateId(),
      timestamp: new Date().toISOString(),
    });
    setLS("lc_posts", posts);
  }, []);
  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    const posts = getLS<Post>("lc_posts");
    const idx = posts.findIndex((p) => p.id === id);
    if (idx >= 0) {
      posts[idx] = { ...posts[idx], ...updates };
      setLS("lc_posts", posts);
    }
  }, []);
  const deletePost = useCallback((id: string) => {
    setLS(
      "lc_posts",
      getLS<Post>("lc_posts").filter((p) => p.id !== id),
    );
  }, []);

  // Reviews
  const getReviews = useCallback(
    (): Review[] => getLS<Review>("lc_reviews"),
    [],
  );
  const addReview = useCallback((review: Omit<Review, "id" | "timestamp">) => {
    const reviews = getLS<Review>("lc_reviews");
    reviews.unshift({
      ...review,
      id: generateId(),
      timestamp: new Date().toISOString(),
    });
    setLS("lc_reviews", reviews);
  }, []);

  // Location Reviews
  const getLocationReviews = useCallback(
    (): LocationReview[] => getLS<LocationReview>("lc_locationReviews"),
    [],
  );
  const addLocationReview = useCallback(
    (review: Omit<LocationReview, "id" | "timestamp">) => {
      const reviews = getLS<LocationReview>("lc_locationReviews");
      reviews.unshift({
        ...review,
        id: generateId(),
        timestamp: new Date().toISOString(),
      });
      setLS("lc_locationReviews", reviews);
    },
    [],
  );

  // Storage tracking
  const getStorageUsedMB = useCallback((userId: string): number => {
    const bytes = Number.parseInt(
      localStorage.getItem(`lc_storageUsed_${userId}`) || "0",
      10,
    );
    return bytes / (1024 * 1024);
  }, []);
  const updateStorageUsed = useCallback(
    (userId: string, addedBytes: number) => {
      const current = Number.parseInt(
        localStorage.getItem(`lc_storageUsed_${userId}`) || "0",
        10,
      );
      localStorage.setItem(
        `lc_storageUsed_${userId}`,
        String(Math.max(0, current + addedBytes)),
      );
    },
    [],
  );

  // Community Code
  const getCommunityCode = useCallback((): string => {
    return localStorage.getItem("lc_communityCode") || "blackjack";
  }, []);
  const setCommunityCode = useCallback((code: string) => {
    localStorage.setItem("lc_communityCode", code);
    notify();
  }, []);

  // Special Accounts
  type SpecialEntry = {
    id: string;
    usernameOrEmail: string;
    addedAt: string;
    greetingShown?: boolean;
  };
  const getSpecialAccounts = (): SpecialEntry[] => {
    try {
      return JSON.parse(localStorage.getItem("lc_specialAccounts") || "[]");
    } catch {
      return [];
    }
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: getSpecialAccounts reads localStorage, not React state
  const addSpecialAccount = useCallback((usernameOrEmail: string) => {
    const list = getSpecialAccounts();
    if (
      list.find(
        (e: SpecialEntry) =>
          e.usernameOrEmail.toLowerCase() === usernameOrEmail.toLowerCase(),
      )
    )
      return;
    const entry: SpecialEntry = {
      id: Math.random().toString(36).slice(2),
      usernameOrEmail,
      addedAt: new Date().toISOString(),
    };
    list.push(entry);
    localStorage.setItem("lc_specialAccounts", JSON.stringify(list));
    const accs = getLS<Account>("lc_accounts");
    const idx = accs.findIndex(
      (a: Account) =>
        a.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        a.email.toLowerCase() === usernameOrEmail.toLowerCase(),
    );
    if (idx >= 0) {
      accs[idx] = {
        ...accs[idx],
        membershipTier: "Premier",
        membershipStatus: "active",
      };
      setLS("lc_accounts", accs);
    }
    notify();
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: getSpecialAccounts reads localStorage, not React state
  const removeSpecialAccount = useCallback((entryId: string) => {
    const list = getSpecialAccounts().filter(
      (e: SpecialEntry) => e.id !== entryId,
    );
    localStorage.setItem("lc_specialAccounts", JSON.stringify(list));
    notify();
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: getSpecialAccounts reads localStorage, not React state
  const getSpecialAccountsList = useCallback(
    (): SpecialEntry[] => getSpecialAccounts(),
    [],
  );

  // Violations
  const getViolations = useCallback(
    (): Violation[] => getLS<Violation>("lc_violations"),
    [],
  );
  const addViolation = useCallback((v: Omit<Violation, "id" | "timestamp">) => {
    const violations = getLS<Violation>("lc_violations");
    violations.unshift({
      ...v,
      id: generateId(),
      timestamp: new Date().toISOString(),
    });
    setLS("lc_violations", violations);
  }, []);
  const resolveViolation = useCallback((id: string) => {
    const violations = getLS<Violation>("lc_violations");
    const idx = violations.findIndex((v) => v.id === id);
    if (idx >= 0) {
      violations[idx].resolved = true;
      setLS("lc_violations", violations);
    }
  }, []);

  // Permission Requests
  const getPermissionRequests = useCallback(
    (): PermissionRequest[] =>
      getLS<PermissionRequest>("lc_permissionRequests"),
    [],
  );
  const addPermissionRequest = useCallback(
    (req: Omit<PermissionRequest, "id" | "timestamp">) => {
      const reqs = getLS<PermissionRequest>("lc_permissionRequests");
      reqs.unshift({
        ...req,
        id: generateId(),
        timestamp: new Date().toISOString(),
      });
      setLS("lc_permissionRequests", reqs);
    },
    [],
  );
  const updatePermissionRequest = useCallback(
    (id: string, updates: Partial<PermissionRequest>) => {
      const reqs = getLS<PermissionRequest>("lc_permissionRequests");
      const idx = reqs.findIndex((r) => r.id === id);
      if (idx >= 0) {
        reqs[idx] = { ...reqs[idx], ...updates };
        setLS("lc_permissionRequests", reqs);
      }
    },
    [],
  );

  // Wallet
  const getWalletBalance = useCallback((): number => {
    return Number.parseInt(localStorage.getItem("lc_walletBalance") || "0", 10);
  }, []);
  const getWalletTransactions = useCallback(
    (): WalletTransaction[] =>
      getLS<WalletTransaction>("lc_walletTransactions"),
    [],
  );
  const addWalletTransaction = useCallback(
    (txn: Omit<WalletTransaction, "id" | "timestamp">) => {
      const txns = getLS<WalletTransaction>("lc_walletTransactions");
      const newTxn = {
        ...txn,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };
      txns.unshift(newTxn);
      setLS("lc_walletTransactions", txns);
      const current = Number.parseInt(
        localStorage.getItem("lc_walletBalance") || "0",
        10,
      );
      const newBalance =
        txn.type === "payment" ? current + txn.amount : current - txn.amount;
      localStorage.setItem("lc_walletBalance", String(Math.max(0, newBalance)));
      notify();
    },
    [],
  );

  // Pending Payments
  const getPendingPayments = useCallback(
    (): PendingPayment[] => getLS<PendingPayment>("lc_pendingPayments"),
    [],
  );
  const addPendingPayment = useCallback(
    (p: Omit<PendingPayment, "id" | "timestamp">) => {
      const payments = getLS<PendingPayment>("lc_pendingPayments");
      payments.unshift({
        ...p,
        id: generateId(),
        timestamp: new Date().toISOString(),
      });
      setLS("lc_pendingPayments", payments);
    },
    [],
  );
  const removePendingPayment = useCallback((id: string) => {
    setLS(
      "lc_pendingPayments",
      getLS<PendingPayment>("lc_pendingPayments").filter((p) => p.id !== id),
    );
  }, []);

  // Flag Reports
  const getFlagReports = useCallback(
    (): FlagReport[] => getLS<FlagReport>("lc_flagReports"),
    [],
  );
  const addFlagReport = useCallback(
    (report: Omit<FlagReport, "id" | "timestamp">) => {
      const reports = getLS<FlagReport>("lc_flagReports");
      reports.unshift({
        ...report,
        id: generateId(),
        timestamp: new Date().toISOString(),
      });
      setLS("lc_flagReports", reports);
    },
    [],
  );
  const updateFlagReport = useCallback(
    (id: string, updates: Partial<FlagReport>) => {
      const reports = getLS<FlagReport>("lc_flagReports");
      const idx = reports.findIndex((r) => r.id === id);
      if (idx >= 0) {
        reports[idx] = { ...reports[idx], ...updates };
        setLS("lc_flagReports", reports);
      }
    },
    [],
  );

  // User Activity Tracking
  const logUserLogin = useCallback((userId: string) => {
    const accounts = getLS<Account>("lc_accounts");
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx >= 0) {
      accounts[idx] = {
        ...accounts[idx],
        lastLoginAt: new Date().toISOString(),
      };
      setLS("lc_accounts", accounts);
    }
  }, []);

  const logUserLogout = useCallback((userId: string) => {
    const accounts = getLS<Account>("lc_accounts");
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx >= 0) {
      accounts[idx] = {
        ...accounts[idx],
        lastLogoutAt: new Date().toISOString(),
      };
      setLS("lc_accounts", accounts);
    }
  }, []);

  const getUserActivity = useCallback(
    (
      userId: string,
    ): {
      lastLoginAt?: string;
      lastLogoutAt?: string;
      daysInactive: number;
    } => {
      const accounts = getLS<Account>("lc_accounts");
      const account = accounts.find((a) => a.id === userId);
      if (!account) return { daysInactive: 0 };
      let daysInactive = 0;
      if (account.lastLoginAt) {
        const lastLogin = new Date(account.lastLoginAt);
        const now = new Date();
        daysInactive = Math.floor(
          (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
      return {
        lastLoginAt: account.lastLoginAt,
        lastLogoutAt: account.lastLogoutAt,
        daysInactive,
      };
    },
    [],
  );

  // Shop Announcements
  const addShopAnnouncement = useCallback(
    (a: Omit<ShopAnnouncement, "id" | "timestamp">) => {
      const announcements = getLS<ShopAnnouncement>("lc_shopAnnouncements");
      announcements.unshift({
        ...a,
        id: generateId(),
        timestamp: new Date().toISOString(),
      });
      setLS("lc_shopAnnouncements", announcements);
    },
    [],
  );

  const getShopAnnouncements = useCallback(
    (): ShopAnnouncement[] => getLS<ShopAnnouncement>("lc_shopAnnouncements"),
    [],
  );

  return {
    refresh,
    getAccounts,
    updateAccount,
    banAccount,
    suspendAccount,
    getPosts,
    addPost,
    updatePost,
    deletePost,
    getReviews,
    addReview,
    getLocationReviews,
    addLocationReview,
    getStorageUsedMB,
    updateStorageUsed,
    getCommunityCode,
    setCommunityCode,
    addSpecialAccount,
    removeSpecialAccount,
    getSpecialAccountsList,
    getViolations,
    addViolation,
    resolveViolation,
    getPermissionRequests,
    addPermissionRequest,
    updatePermissionRequest,
    getWalletBalance,
    getWalletTransactions,
    addWalletTransaction,
    getPendingPayments,
    addPendingPayment,
    removePendingPayment,
    getFlagReports,
    addFlagReport,
    updateFlagReport,
    logUserLogin,
    logUserLogout,
    getUserActivity,
    addShopAnnouncement,
    getShopAnnouncements,
  };
}
