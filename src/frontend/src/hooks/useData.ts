import { useCallback, useState } from "react";
import { generateId } from "../data/seed";
import type {
  Account,
  FlagReport,
  PermissionRequest,
  Post,
  Review,
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
        themePhoto: undefined,
        businessName: undefined,
        businessDescription: undefined,
        businessCategory: undefined,
        businessLocation: undefined,
      };
      setLS("lc_accounts", accounts);
    }
    // Delete all posts by this user
    const posts = getLS<Post>("lc_posts").filter(
      (p) => p.submittedBy !== accountId,
    );
    localStorage.setItem("lc_posts", JSON.stringify(posts));
    // Delete all reviews by or for this user
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
    getViolations,
    addViolation,
    resolveViolation,
    getPermissionRequests,
    addPermissionRequest,
    updatePermissionRequest,
    getWalletBalance,
    getWalletTransactions,
    addWalletTransaction,
    getFlagReports,
    addFlagReport,
    updateFlagReport,
  };
}
