import { useCallback, useEffect, useState } from "react";
import {
  generateElectronicId,
  generateId,
  hashPw,
  verifyPassword,
} from "../data/seed";
import type { Account, Role } from "../types";

interface SignupData {
  username: string;
  email: string;
  password: string;
  role: Exclude<Role, "creator">;
  communityCode?: string;
}

interface AuthState {
  currentUser: Account | null;
  isLoading: boolean;
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
      if (!verifyPassword(password, account.passwordHash))
        return { success: false, error: "Incorrect password" };
      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: account.id }),
      );
      applyTheme(account.theme);
      applyFontColorById(account.fontColor);
      setState({ currentUser: account, isLoading: false });
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
        // Log them in regardless of authProvider
        localStorage.setItem(
          "lc_session",
          JSON.stringify({ userId: existing.id }),
        );
        applyTheme(existing.theme);
        applyFontColorById(existing.fontColor);
        setState({ currentUser: existing, isLoading: false });
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
        return { success: false, error: "Username already taken" };
      }
      if (
        accounts.find((a) => a.email.toLowerCase() === data.email.toLowerCase())
      ) {
        return { success: false, error: "Email already registered" };
      }
      if (data.username.toLowerCase() === "hunter") {
        return { success: false, error: "This username is reserved" };
      }
      const electronicId = generateElectronicId();
      const newAccount: Account = {
        id: generateId(),
        username: data.username,
        email: data.email,
        passwordHash: hashPw(data.password),
        role: data.role,
        electronicId,
        status: "active",
        authProvider: "email",
        createdAt: new Date().toISOString(),
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

  const logout = useCallback(() => {
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
    updateCurrentUser,
    refreshUser,
  };
}
