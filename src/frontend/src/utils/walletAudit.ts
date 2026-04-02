export interface AuditEntry {
  id: string;
  timestamp: string;
  action:
    | "payment_confirmed"
    | "payment_rejected"
    | "withdrawal_attempted"
    | "withdrawal_blocked"
    | "withdrawal_processed"
    | "security_check_failed"
    | "security_check_passed";
  description: string;
  amount?: number;
  status: "success" | "blocked" | "info";
}

const MAX_ENTRIES = 50;
const STORAGE_KEY = "lc_walletAuditLog";

export function getAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addAuditEntry(
  action: AuditEntry["action"],
  description: string,
  status: AuditEntry["status"],
  amount?: number,
): AuditEntry {
  const entry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    description,
    status,
    ...(amount !== undefined ? { amount } : {}),
  };
  const log = getAuditLog();
  const updated = [entry, ...log].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return entry;
}
