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

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem("lc_session");
    if (stored) {
      try {
        const { userId } = JSON.parse(stored);
        const accounts = getAccounts();
        const user = accounts.find((a) => a.id === userId) || null;
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
      if (!verifyPassword(password, account.passwordHash))
        return { success: false, error: "Incorrect password" };
      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: account.id }),
      );
      setState({ currentUser: account, isLoading: false });
      return { success: true };
    },
    [],
  );

  const signup = useCallback(
    (
      data: SignupData,
    ): { success: boolean; error?: string; electronicId?: string } => {
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
        createdAt: new Date().toISOString(),
        ...(data.role === "member"
          ? {
              membershipTier: "Common",
              membershipStatus: "trial",
              trialStartDate: new Date().toISOString(),
            }
          : {}),
        ...(data.role === "community" ? { editPermissionStatus: "none" } : {}),
      };
      saveAccounts([...accounts, newAccount]);
      localStorage.setItem(
        "lc_session",
        JSON.stringify({ userId: newAccount.id }),
      );
      setState({ currentUser: newAccount, isLoading: false });
      return { success: true, electronicId };
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("lc_session");
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
      return { ...prev, currentUser: updated };
    });
  }, []);

  // Refresh current user from storage (e.g., after data changes)
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

  return { ...state, login, signup, logout, updateCurrentUser, refreshUser };
}
