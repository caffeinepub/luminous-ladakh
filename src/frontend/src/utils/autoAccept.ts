import { generateId } from "../data/seed";
import type {
  Account,
  AutoAcceptLogEntry,
  FlagReport,
  PendingPayment,
  Post,
  Violation,
} from "../types";
import { moderateContent } from "./contentModeration";

const AUTO_ACCEPT_HOURS = 24;

function getLS<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setLS<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function notify() {
  window.dispatchEvent(new Event("lc_data_changed"));
}

function isOlderThan24Hours(timestamp: string): boolean {
  const submitted = new Date(timestamp).getTime();
  const now = Date.now();
  return now - submitted >= AUTO_ACCEPT_HOURS * 60 * 60 * 1000;
}

function addAutoAcceptLog(entry: AutoAcceptLogEntry) {
  const log = getLS<AutoAcceptLogEntry>("lc_autoAcceptLog");
  log.unshift(entry);
  if (log.length > 100) log.splice(100);
  localStorage.setItem("lc_autoAcceptLog", JSON.stringify(log));
  const unread = Number.parseInt(
    localStorage.getItem("lc_autoAccept_unread") || "0",
    10,
  );
  localStorage.setItem("lc_autoAccept_unread", String(unread + 1));
}

// Suppress unused warning — kept for potential direct use
void addAutoAcceptLog;

function autoAcceptPayments(): number {
  const pending = getLS<PendingPayment>("lc_pendingPayments");
  const toProcess = pending.filter((p) => isOlderThan24Hours(p.timestamp));
  if (toProcess.length === 0) return 0;

  const accounts = getLS<Account>("lc_accounts");
  const transactions: any[] = getLS("lc_walletTransactions");
  const flagReports = getLS<FlagReport>("lc_flagReports");
  const violations: Violation[] = getLS("lc_violations");
  const autoLog = getLS<AutoAcceptLogEntry>("lc_autoAcceptLog");

  // Avoid double-processing
  const alreadyProcessed = new Set(autoLog.map((e) => e.itemId));

  let count = 0;
  const remainingPending: PendingPayment[] = [];

  for (const p of pending) {
    if (!isOlderThan24Hours(p.timestamp) || alreadyProcessed.has(p.id)) {
      remainingPending.push(p);
      continue;
    }

    // Content scan on any text fields
    const textToScan = [
      p.memberUsername,
      p.memberEmail,
      p.eventTitle,
      p.productName,
      p.roomTitle,
    ]
      .filter(Boolean)
      .join(" ");
    const scan = moderateContent(textToScan);
    const flagged = !scan.allowed;

    // Auto-approve: add wallet transaction
    const txn = {
      id: generateId(),
      type: "payment" as const,
      amount: p.amount,
      from: p.memberUsername,
      timestamp: new Date().toISOString(),
      note: `Auto-Approved (24h): ${
        p.paymentType === "event"
          ? `Event "${p.eventTitle}"`
          : p.paymentType === "announcement"
            ? "Shop Announcement"
            : p.paymentType === "room_rental"
              ? "Room Rental"
              : `${p.tier} Membership`
      } from @${p.memberUsername}`,
    };
    transactions.unshift(txn);

    // Activate membership if applicable
    if (p.paymentType === "membership" || !p.paymentType) {
      const idx = accounts.findIndex((a) => a.id === p.memberId);
      if (idx >= 0) {
        accounts[idx] = {
          ...accounts[idx],
          membershipStatus: "active",
          membershipTier:
            (p.tier as "Common" | "Premier") ||
            accounts[idx].membershipTier ||
            "Common",
        };
      }
    }

    // If flagged: add flag report + Level 1 violation
    if (flagged) {
      flagReports.unshift({
        id: generateId(),
        reporterId: "system",
        reporterUsername: "AutoMod",
        targetMemberId: p.memberId,
        targetMemberUsername: p.memberUsername,
        reason: `Auto-flagged during auto-accept: ${scan.reason}`,
        status: "pending",
        timestamp: new Date().toISOString(),
      } as FlagReport);
      violations.unshift({
        id: generateId(),
        targetUserId: p.memberId,
        targetUsername: p.memberUsername,
        targetRole: "member",
        level: 1,
        reason: `Automatic Level 1 warning: content flagged during auto-accept. ${scan.reason}`,
        issuedBy: "AutoMod",
        timestamp: new Date().toISOString(),
        resolved: false,
      } as Violation);
    }

    // Add to auto-accept log
    const logEntry: AutoAcceptLogEntry = {
      id: generateId(),
      itemType: "payment",
      itemId: p.id,
      itemTitle:
        p.paymentType === "event"
          ? `Event: ${p.eventTitle}`
          : `${p.tier} Membership`,
      submittedBy: p.memberUsername,
      amount: p.amount,
      flagged,
      flagReason: flagged ? scan.reason : undefined,
      autoApprovedAt: new Date().toISOString(),
    };
    autoLog.unshift(logEntry);
    count++;
    // Don't push back to remainingPending (it's approved and removed)
  }

  setLS("lc_pendingPayments", remainingPending);
  setLS("lc_walletTransactions", transactions);
  setLS("lc_accounts", accounts);
  setLS("lc_flagReports", flagReports);
  setLS("lc_violations", violations);
  if (autoLog.length > 100) autoLog.splice(100);
  localStorage.setItem("lc_autoAcceptLog", JSON.stringify(autoLog));

  return count;
}

function autoAcceptPosts(): number {
  const posts = getLS<Post>("lc_posts");
  const autoLog = getLS<AutoAcceptLogEntry>("lc_autoAcceptLog");
  const alreadyProcessed = new Set(autoLog.map((e) => e.itemId));
  const violations: Violation[] = getLS("lc_violations");
  const accounts = getLS<Account>("lc_accounts");
  let count = 0;

  const updatedPosts = posts.map((p) => {
    if (
      p.status !== "pending" ||
      !isOlderThan24Hours(p.timestamp) ||
      alreadyProcessed.has(p.id)
    ) {
      return p;
    }

    const textToScan = [p.title, p.description, p.locationName, p.category]
      .filter(Boolean)
      .join(" ");
    const scan = moderateContent(textToScan);
    const flagged = !scan.allowed;

    if (flagged) {
      const acc = accounts.find((a) => a.id === p.submittedBy);
      if (acc) {
        violations.unshift({
          id: generateId(),
          targetUserId: p.submittedBy,
          targetUsername: p.submitterUsername,
          targetRole: acc.role,
          level: 1,
          reason: `Automatic Level 1 warning: post content flagged during auto-accept. ${scan.reason}`,
          issuedBy: "AutoMod",
          timestamp: new Date().toISOString(),
          resolved: false,
        } as Violation);
      }
    }

    const logEntry: AutoAcceptLogEntry = {
      id: generateId(),
      itemType: "post",
      itemId: p.id,
      itemTitle: p.title,
      submittedBy: p.submitterUsername,
      flagged,
      flagReason: flagged ? scan.reason : undefined,
      autoApprovedAt: new Date().toISOString(),
    };
    autoLog.unshift(logEntry);
    count++;

    return { ...p, status: "approved" as const, autoApproved: true };
  });

  setLS("lc_posts", updatedPosts);
  setLS("lc_violations", violations);
  if (autoLog.length > 100) autoLog.splice(100);
  localStorage.setItem("lc_autoAcceptLog", JSON.stringify(autoLog));

  return count;
}

function autoAcceptDiscoveryPosts(): number {
  type DiscoveryPostLocal = {
    id: string;
    title: string;
    area: string;
    description: string;
    postedBy: string;
    postedByUsername: string;
    timestamp: string;
    status?: string;
    autoApproved?: boolean;
    [key: string]: any;
  };

  const posts = getLS<DiscoveryPostLocal>("lc_discoveryPosts");
  const autoLog = getLS<AutoAcceptLogEntry>("lc_autoAcceptLog");
  const alreadyProcessed = new Set(autoLog.map((e) => e.itemId));
  const violations: Violation[] = getLS("lc_violations");
  const accounts = getLS<Account>("lc_accounts");
  let count = 0;

  const updatedPosts = posts.map((p) => {
    // Only auto-approve ones that are explicitly pending
    if (
      p.status !== "pending" ||
      !isOlderThan24Hours(p.timestamp) ||
      alreadyProcessed.has(p.id)
    ) {
      return p;
    }

    const textToScan = [p.title, p.description, p.area]
      .filter(Boolean)
      .join(" ");
    const scan = moderateContent(textToScan);
    const flagged = !scan.allowed;

    if (flagged) {
      const acc = accounts.find((a) => a.id === p.postedBy);
      if (acc) {
        violations.unshift({
          id: generateId(),
          targetUserId: p.postedBy,
          targetUsername: p.postedByUsername,
          targetRole: acc.role,
          level: 1,
          reason: `Automatic Level 1 warning: discovery post flagged during auto-accept. ${scan.reason}`,
          issuedBy: "AutoMod",
          timestamp: new Date().toISOString(),
          resolved: false,
        } as Violation);
      }
    }

    const logEntry: AutoAcceptLogEntry = {
      id: generateId(),
      itemType: "discovery_post",
      itemId: p.id,
      itemTitle: p.title,
      submittedBy: p.postedByUsername,
      flagged,
      flagReason: flagged ? scan.reason : undefined,
      autoApprovedAt: new Date().toISOString(),
    };
    autoLog.unshift(logEntry);
    count++;

    return { ...p, status: "approved", autoApproved: true };
  });

  setLS("lc_discoveryPosts", updatedPosts);
  setLS("lc_violations", violations);
  if (autoLog.length > 100) autoLog.splice(100);
  localStorage.setItem("lc_autoAcceptLog", JSON.stringify(autoLog));

  return count;
}

export function runAutoAccept(): void {
  try {
    const p = autoAcceptPayments();
    const po = autoAcceptPosts();
    const dp = autoAcceptDiscoveryPosts();
    const total = p + po + dp;
    if (total > 0) {
      // update unread badge
      const unread = Number.parseInt(
        localStorage.getItem("lc_autoAccept_unread") || "0",
        10,
      );
      localStorage.setItem("lc_autoAccept_unread", String(unread + total));
      notify();
    }
  } catch (err) {
    // Silent fail — never crash the app
    console.warn("AutoAccept engine error:", err);
  }
}
