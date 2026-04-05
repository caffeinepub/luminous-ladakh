import { useCallback, useEffect, useState } from "react";
import {
  generateElectronicId,
  generateId,
  hashPw,
  verifyPassword,
} from "../data/seed";
import type { Account, Role, Violation } from "../types";
import { isValidCreatorSecurityWord } from "../utils/contentModeration";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

interface SignupData {
  username: string;
  email: string;
  password: string;
  role: Exclude<Role, "creator">;
  communityCode?: string;
  securityWord?: string;
}

interface AuthState {
  currentUser: Account | null;
  isLoading: boolean;
}

export interface LinkedAccountGroup {
  email: string;
  accountIds: string[];
}

function getAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem("lc_accounts") || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem("lc_accounts", JSON.stringify(accounts));
}

function getLinkedGroups(): LinkedAccountGroup[] {
  try {
    return JSON.parse(localStorage.getItem("lc_linked_accounts") || "[]");
  } catch {
    return [];
  }
}

function saveLinkedGroups(groups: LinkedAccountGroup[]) {
  localStorage.setItem("lc_linked_accounts", JSON.stringify(groups));
}

/** Add an account to the linked groups structure */
function addToLinkedGroups(email: string, accountId: string) {
  if (!email) return;
  const groups = getLinkedGroups();
  const normalizedEmail = email.toLowerCase();
  const existing = groups.find(
    (g) => g.email.toLowerCase() === normalizedEmail,
  );
  if (existing) {
    if (!existing.accountIds.includes(accountId)) {
      existing.accountIds.push(accountId);
    }
  } else {
    groups.push({ email: normalizedEmail, accountIds: [accountId] });
  }
  saveLinkedGroups(groups);
}

/** Check if new account should receive Level 2 violation due to linked account with L6/L7 */
function checkViolationCarryOver(
  email: string,
  newAccountId: string,
  newAccountCreatedAt: string,
) {
  if (!email) return;
  try {
    const accounts = getAccounts();
    const violations: Violation[] = JSON.parse(
      localStorage.getItem("lc_violations") || "[]",
    );
    // Find all existing accounts with same email (NOT the new account itself)
    const linkedAccounts = accounts.filter(
      (a) =>
        a.email.toLowerCase() === email.toLowerCase() &&
        a.id !== newAccountId &&
        a.createdAt < newAccountCreatedAt,
    );
    let hasSerious = false;
    for (const acc of linkedAccounts) {
      const serious = violations.filter(
        (v) =>
          v.targetUserId === acc.id &&
          (v.level === 6 || v.level === 7) &&
          !v.resolved,
      );
      if (serious.length > 0) {
        hasSerious = true;
        break;
      }
    }
    if (hasSerious) {
      // Auto-apply Level 2 violation to new account
      const newAccounts = getAccounts();
      const targetAccount = newAccounts.find((a) => a.id === newAccountId);
      if (!targetAccount) return;
      const autoViolation: Violation = {
        id: generateId(),
        targetUserId: newAccountId,
        targetUsername: targetAccount.username,
        targetRole: targetAccount.role,
        level: 2,
        reason:
          "Linked account (same email) has serious violations. This account has been flagged.",
        issuedBy: "system",
        timestamp: new Date().toISOString(),
        resolved: false,
      };
      violations.push(autoViolation);
      localStorage.setItem("lc_violations", JSON.stringify(violations));
    }
  } catch {
    // safe to ignore
  }
}

const FONT_COLOR_MAP: Record<string, string> = {
  default: "#f0e8d8",
  gold: "#e8c55a",
  sky: "#7dd3fc",
  mint: "#6ee7b7",
  rose: "#fda4af",
  lavender: "#c4b5fd",
};

export function applyTheme(theme?: string) {
  const t = theme || "dark";
  document.documentElement.setAttribute("data-theme", t);
}

export function applyFontColorById(colorId?: string) {
  const hex = FONT_COLOR_MAP[colorId || "default"] || FONT_COLOR_MAP.default;
  document.body.style.color = hex;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem("lc_session");
    if (stored) {
      try {
        const { userId } = JSON.parse(stored);
        const accounts = getAccounts();
        const user = accounts.find((a) => a.id === userId) || null;
        if (user) {
          applyTheme(user.theme);
          applyFontColorById(user.fontColor);
        }
        return { currentUser: user, isLoading: false };
      } catch {
        return { currentUser: null, isLoading: false };
      }
    }
    return { currentUser: null, isLoading: false };
  });

  const login = useCallback(
    (
      username: string,
      password: string,
    ): { success: boolean; error?: string } => {
      const accounts = getAccounts();
      const account = accounts.find(
        (a) => a.username.toLowerCase() === username.toLowerCase(),
      );
      if (!account) return { success: false, error: "Username not found" };
      if (account.status === "banned")
        return {
          success: false,
          error:
            "This account has been permanently banned. Your electronic ID remains on record.",
        };

      // Lockout check
      if (account.lockoutUntil) {
        const lockoutDate = new Date(account.lockoutUntil);
        if (lockoutDate > new Date()) {
          const minsLeft = Math.ceil(
            (lockoutDate.getTime() - Date.now()) / 60000,
          );
          return {
            success: false,
            error: `Account temporarily locked due to too many failed attempts. Try again in ${minsLeft} minute${
              minsLeft !== 1 ? "s" : ""
            }.`,
          };
        }
      }

      if (!verifyPassword(password, account.passwordHash)) {
        const failedAttempts = (account.failedLoginAttempts || 0) + 1;
        const updates: Partial<Account> = {
          failedLoginAttempts: failedAttempts,
        };
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = new Date(
            Date.now() + LOCKOUT_MINUTES * 60 * 1000,
          ).toISOString();
          updates.lockoutUntil = lockoutUntil;
          updates.failedLoginAttempts = 0;
          const idx = accounts.findIndex((a) => a.id === account.id);
          if (idx >= 0) {
            accounts[idx] = { ...accounts[idx], ...updates };
            saveAccounts(accounts);
          }
          return {
            success: false,
            error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
          };
        }
        const idx = accounts.findIndex((a) => a.id === account.id);
        if (idx >= 0) {
          accounts[idx] = { ...accounts[idx], ...updates };
          saveAccounts(accounts);
        }
        const remaining = MAX_FAILED_ATTEMPTS - failedAttempts;
        return {
          success: false,
          error: `Incorrect password. ${remaining} attempt${
            remaining !== 1 ? "s" : ""
          } remaining before lockout.`,
        };
      }

      const idx = accounts.findIndex((a) => a.id === account.id);
      let finalAccount = account;
      if (idx >= 0) {
        accounts[idx] = {
          ...accounts[idx],
          failedLoginAttempts: 0,
          lockoutUntil: undefined,
          lastLoginAt: new Date().toISOString(),
        };
        saveAccounts(accounts);
        finalAccount = accounts[idx];
      }

      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: finalAccount.id }),
      );
      applyTheme(finalAccount.theme);
      applyFontColorById(finalAccount.fontColor);
      setState({ currentUser: finalAccount, isLoading: false });
      return { success: true };
    },
    [],
  );

  const socialLogin = useCallback(
    (
      provider: "google" | "facebook",
      email: string,
      name: string,
      role: Exclude<Role, "creator">,
    ): {
      success: boolean;
      error?: string;
      isNew?: boolean;
      electronicId?: string;
    } => {
      const accounts = getAccounts();
      const existing = accounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase(),
      );
      if (existing) {
        if (existing.status === "banned") {
          return {
            success: false,
            error: "This account has been permanently banned.",
          };
        }
        // Update lastLoginAt
        const idx = accounts.findIndex((a) => a.id === existing.id);
        if (idx >= 0) {
          accounts[idx] = {
            ...accounts[idx],
            lastLoginAt: new Date().toISOString(),
          };
          saveAccounts(accounts);
        }
        localStorage.setItem(
          "lc_session",
          JSON.stringify({ userId: existing.id }),
        );
        applyTheme(existing.theme);
        applyFontColorById(existing.fontColor);
        setState({
          currentUser:
            accounts[accounts.findIndex((a) => a.id === existing.id)],
          isLoading: false,
        });
        return { success: true, isNew: false };
      }
      // Create new account
      const baseUsername = email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9_]/g, "")
        .toLowerCase();
      let username = baseUsername;
      let suffix = 1;
      while (
        accounts.find(
          (a) => a.username.toLowerCase() === username.toLowerCase(),
        )
      ) {
        username = `${baseUsername}${suffix++}`;
      }
      const electronicId = generateElectronicId();
      const newAccount: Account = {
        id: generateId(),
        username,
        email,
        passwordHash: hashPw(`${provider}_${email}`),
        role,
        electronicId,
        status: "active",
        authProvider: provider,
        bio: name,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        ...(role === "member"
          ? {
              membershipTier: "Common",
              membershipStatus: "trial",
              trialStartDate: new Date().toISOString(),
              businesses: [],
            }
          : {}),
        ...(role === "community" ? { editPermissionStatus: "none" } : {}),
      };
      saveAccounts([...accounts, newAccount]);
      // Update linked accounts
      addToLinkedGroups(email, newAccount.id);
      // Check violation carry-over
      checkViolationCarryOver(email, newAccount.id, newAccount.createdAt);
      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: newAccount.id }),
      );
      applyTheme(newAccount.theme);
      applyFontColorById(newAccount.fontColor);
      setState({ currentUser: newAccount, isLoading: false });
      return { success: true, isNew: true, electronicId };
    },
    [],
  );

  const signup = useCallback(
    (
      data: SignupData,
    ): { success: boolean; error?: string; electronicId?: string } => {
      // Community code validation
      if (data.role === "community") {
        const correctCode =
          localStorage.getItem("lc_communityCode") || "blackjack";
        if (!data.communityCode || data.communityCode !== correctCode) {
          return { success: false, error: "Invalid community access code" };
        }
      }
      const accounts = getAccounts();
      if (
        accounts.find(
          (a) => a.username.toLowerCase() === data.username.toLowerCase(),
        )
      ) {
        return {
          success: false,
          error:
            "This username is already taken. Please choose a different username.",
        };
      }
      if (data.username.toLowerCase() === "hunter") {
        return { success: false, error: "This username is reserved" };
      }
      const electronicId = generateElectronicId();
      const hashedSecurityWord = data.securityWord
        ? hashPw(data.securityWord.trim().toLowerCase())
        : undefined;
      const newAccountId = generateId();
      const createdAt = new Date().toISOString();
      const newAccount: Account = {
        id: newAccountId,
        username: data.username,
        email: data.email,
        passwordHash: hashPw(data.password),
        role: data.role,
        electronicId,
        status: "active",
        authProvider: "email",
        createdAt,
        lastLoginAt: new Date().toISOString(),
        ...(hashedSecurityWord ? { securityWord: hashedSecurityWord } : {}),
        ...(data.role === "member"
          ? {
              membershipTier: "Common",
              membershipStatus: "trial",
              trialStartDate: new Date().toISOString(),
              businesses: [],
            }
          : {}),
        ...(data.role === "community" ? { editPermissionStatus: "none" } : {}),
      };
      saveAccounts([...accounts, newAccount]);
      // Update linked accounts groups
      addToLinkedGroups(data.email, newAccountId);
      // Violation carry-over check
      checkViolationCarryOver(data.email, newAccountId, createdAt);
      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: newAccount.id }),
      );
      applyTheme(newAccount.theme);
      applyFontColorById(newAccount.fontColor);
      setState({ currentUser: newAccount, isLoading: false });
      return { success: true, electronicId };
    },
    [],
  );

  /** Switch to a different account (must be in the same email group) */
  const switchAccount = useCallback(
    (accountId: string): { success: boolean; error?: string } => {
      const accounts = getAccounts();
      const target = accounts.find((a) => a.id === accountId);
      if (!target) return { success: false, error: "Account not found." };
      if (target.status === "banned")
        return { success: false, error: "This account has been banned." };

      // Verify same email group
      const groups = getLinkedGroups();
      const currentGroup = groups.find((g) =>
        g.accountIds.includes(
          JSON.parse(localStorage.getItem("lc_session") || "{}").userId || "",
        ),
      );
      const targetGroup = groups.find((g) => g.accountIds.includes(accountId));
      if (
        !currentGroup ||
        !targetGroup ||
        currentGroup.email.toLowerCase() !== targetGroup.email.toLowerCase()
      ) {
        return {
          success: false,
          error: "Cannot switch — different email address.",
        };
      }

      // Update lastLoginAt for target
      const idx = accounts.findIndex((a) => a.id === accountId);
      if (idx >= 0) {
        accounts[idx] = {
          ...accounts[idx],
          lastLoginAt: new Date().toISOString(),
        };
        saveAccounts(accounts);
      }

      const finalTarget = accounts[idx] || target;
      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: finalTarget.id }),
      );
      applyTheme(finalTarget.theme);
      applyFontColorById(finalTarget.fontColor);
      setState({ currentUser: finalTarget, isLoading: false });
      return { success: true };
    },
    [],
  );

  const recoverPassword = useCallback(
    (
      username: string,
      securityWordInput: string,
      newPassword: string,
    ): { success: boolean; error?: string } => {
      const accounts = getAccounts();
      const account = accounts.find(
        (a) => a.username.toLowerCase() === username.toLowerCase(),
      );
      if (!account) return { success: false, error: "Username not found" };
      if (account.status === "banned") {
        return { success: false, error: "This account has been banned." };
      }

      const normalized = securityWordInput.trim().toLowerCase();

      if (account.role === "creator") {
        if (!isValidCreatorSecurityWord(normalized)) {
          return {
            success: false,
            error:
              'Invalid security card. Enter a valid card name (e.g. King of Hearts) or "52 decks of cards".',
          };
        }
      } else {
        if (!account.securityWord) {
          return {
            success: false,
            error:
              "No security word set for this account. Please contact support.",
          };
        }
        const hashedInput = hashPw(normalized);
        if (hashedInput !== account.securityWord) {
          return {
            success: false,
            error: "Incorrect security word. Please try again.",
          };
        }
      }

      const idx = accounts.findIndex((a) => a.id === account.id);
      if (idx >= 0) {
        accounts[idx] = {
          ...accounts[idx],
          passwordHash: hashPw(newPassword),
          failedLoginAttempts: 0,
          lockoutUntil: undefined,
        };
        saveAccounts(accounts);
      }
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    const sessionRaw = localStorage.getItem("lc_session");
    if (sessionRaw) {
      try {
        const { userId } = JSON.parse(sessionRaw);
        const accounts = getAccounts();
        const idx = accounts.findIndex((a) => a.id === userId);
        if (idx >= 0) {
          accounts[idx] = {
            ...accounts[idx],
            lastLogoutAt: new Date().toISOString(),
          };
          saveAccounts(accounts);
        }
      } catch {
        // safe to ignore
      }
    }
    // Clear session — do NOT auto-login to linked account
    localStorage.removeItem("lc_session");
    applyTheme("dark");
    applyFontColorById("default");
    setState({ currentUser: null, isLoading: false });
  }, []);

  const updateCurrentUser = useCallback((updates: Partial<Account>) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const updated = { ...prev.currentUser, ...updates };
      const accounts = getAccounts();
      const idx = accounts.findIndex((a) => a.id === updated.id);
      if (idx >= 0) {
        accounts[idx] = updated;
        saveAccounts(accounts);
      }
      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: updated.id }),
      );
      if (updates.theme) applyTheme(updates.theme);
      if (updates.fontColor) applyFontColorById(updates.fontColor);
      return { ...prev, currentUser: updated };
    });
  }, []);

  const refreshUser = useCallback(() => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const accounts = getAccounts();
      const updated = accounts.find((a) => a.id === prev.currentUser!.id);
      return { ...prev, currentUser: updated || prev.currentUser };
    });
  }, []);

  useEffect(() => {
    const handler = () => refreshUser();
    window.addEventListener("lc_data_changed", handler);
    return () => window.removeEventListener("lc_data_changed", handler);
  }, [refreshUser]);

  return {
    ...state,
    login,
    socialLogin,
    signup,
    logout,
    switchAccount,
    updateCurrentUser,
    refreshUser,
    recoverPassword,
  };
}
