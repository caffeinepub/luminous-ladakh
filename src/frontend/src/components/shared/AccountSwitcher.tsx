import { useState } from "react";
import { toast } from "sonner";
import type { Account } from "../../types";

export interface LinkedAccountGroup {
  email: string;
  accountIds: string[];
}

function getLinkedGroups(): LinkedAccountGroup[] {
  try {
    return JSON.parse(localStorage.getItem("lc_linked_accounts") || "[]");
  } catch {
    return [];
  }
}

function getAllAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem("lc_accounts") || "[]");
  } catch {
    return [];
  }
}

interface Props {
  currentUser: Account;
  onSwitch: (accountId: string) => void;
  onAddAccount: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  user: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  member: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  community: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  creator: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-400",
  suspended: "text-yellow-400",
  banned: "text-red-400",
};

export function AccountSwitcher({
  currentUser,
  onSwitch,
  onAddAccount,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const groups = getLinkedGroups();
  const allAccounts = getAllAccounts();

  // Find the group for the current user
  const myGroup = groups.find((g) => g.accountIds.includes(currentUser.id));
  const linkedIds = myGroup ? myGroup.accountIds : [currentUser.id];
  const linkedAccounts = allAccounts.filter((a) => linkedIds.includes(a.id));
  const otherAccounts = linkedAccounts.filter((a) => a.id !== currentUser.id);
  const linkedCount = linkedAccounts.length;

  function handleSwitch(accountId: string) {
    const target = allAccounts.find((a) => a.id === accountId);
    if (!target) return;
    // Same email group check
    const targetGroup = groups.find((g) => g.accountIds.includes(accountId));
    const currentGroup = groups.find((g) =>
      g.accountIds.includes(currentUser.id),
    );
    if (
      targetGroup?.email.toLowerCase() !== currentGroup?.email.toLowerCase()
    ) {
      toast.error("Cannot switch — different email address.");
      return;
    }
    onSwitch(accountId);
    setExpanded(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
        data-ocid="accounts.toggle"
      >
        <span className="material-symbols-outlined text-amber-400 text-lg">
          manage_accounts
        </span>
        <div className="text-left flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Accounts</p>
          {linkedCount > 1 && (
            <p className="text-xs text-zinc-400">
              {linkedCount} accounts linked
            </p>
          )}
        </div>
        <span className="material-symbols-outlined text-zinc-500 text-base">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800">
          {/* Soft notice for multiple linked accounts */}
          {linkedCount > 1 && (
            <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/10">
              <p className="text-xs text-amber-300/70 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs">info</span>
                You have {linkedCount} accounts linked to{" "}
                <span className="font-mono">{currentUser.email}</span>
              </p>
            </div>
          )}

          {/* Current account */}
          <div className="px-4 py-3 bg-zinc-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.username[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  @{currentUser.username}
                </p>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${
                    ROLE_COLORS[currentUser.role] || ROLE_COLORS.user
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <span className="material-symbols-outlined text-blue-400 text-lg">
                check_circle
              </span>
            </div>
          </div>

          {/* Other linked accounts */}
          {otherAccounts.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => handleSwitch(account.id)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/60 transition-colors border-t border-zinc-800/60"
              data-ocid="accounts.button"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                {account.profilePhoto ? (
                  <img
                    src={account.profilePhoto}
                    alt={account.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  account.username[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  @{account.username}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${
                      ROLE_COLORS[account.role] || ROLE_COLORS.user
                    }`}
                  >
                    {account.role}
                  </span>
                  <span
                    className={`text-xs ${
                      STATUS_COLORS[account.status || "active"] ||
                      STATUS_COLORS.active
                    }`}
                  >
                    {account.status || "active"}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-zinc-500 text-base">
                chevron_right
              </span>
            </button>
          ))}

          {/* Add Account */}
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              onAddAccount();
            }}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/40 transition-colors border-t border-zinc-800"
            data-ocid="accounts.open_modal_button"
          >
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-zinc-400 text-base">
                add
              </span>
            </div>
            <span className="text-sm text-zinc-400">Add Account</span>
          </button>
        </div>
      )}
    </div>
  );
}
