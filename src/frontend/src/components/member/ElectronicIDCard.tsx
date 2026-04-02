import { useState } from "react";
import type { Account } from "../../types";

interface Props {
  account: Account;
}

function formatJoinDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "2026";
  }
}

// Simple QR-like pattern using CSS grid
function QRPattern({ value }: { value: string }) {
  // Generate a stable pseudo-random pattern from the value
  const cells: boolean[] = [];
  for (let i = 0; i < 49; i++) {
    const charCode = value.charCodeAt(i % value.length);
    cells.push((charCode + i * 7) % 3 !== 0);
  }
  return (
    <div className="grid grid-cols-7 gap-0.5 w-16 h-16 p-1 bg-white rounded-sm">
      {cells.map((filled, i) => (
        <div
          key={`qr-cell-${value.charCodeAt(i % value.length)}-${i}`}
          className={`rounded-[1px] ${filled ? "bg-black" : "bg-white"}`}
        />
      ))}
    </div>
  );
}

export function ElectronicIDCard({ account }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isPremier = account.membershipTier === "Premier";
  const role = account.role;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/15 transition-colors"
        data-ocid="profile.toggle"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            badge
          </span>
          <span className="text-sm font-semibold">Electronic ID Card</span>
        </div>
        <span className="material-symbols-outlined text-muted-foreground text-sm">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div
          className="mt-2 rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #1a1000 50%, #0a0a0a 100%)",
            border: "1px solid rgba(232, 197, 90, 0.4)",
            boxShadow: "0 4px 24px rgba(232, 197, 90, 0.15)",
          }}
        >
          {/* Top stripe */}
          <div
            className="h-1.5"
            style={{
              background: "linear-gradient(90deg, #e8c55a, #f59e0b, #e8c55a)",
            }}
          />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-base">
                  landscape
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                  Ladakh Connect
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Official Member ID
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  {account.profilePhoto ? (
                    <img
                      src={account.profilePhoto}
                      alt="Profile"
                      className="w-14 h-14 rounded-full object-cover border-2"
                      style={{ borderColor: "rgba(232, 197, 90, 0.5)" }}
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                      style={{
                        background: "rgba(232, 197, 90, 0.15)",
                        border: "2px solid rgba(232, 197, 90, 0.4)",
                      }}
                    >
                      <span style={{ color: "#e8c55a" }}>
                        {account.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-base text-white">
                      @{account.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account.email}
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      ID Number
                    </p>
                    <p className="text-sm font-mono font-bold text-amber-400">
                      {account.electronicId}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Role
                      </p>
                      <p className="text-xs font-semibold capitalize text-white">
                        {role}
                      </p>
                    </div>
                    {account.membershipTier && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Tier
                        </p>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isPremier
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {account.membershipTier}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Joined
                      </p>
                      <p className="text-xs text-white">
                        {formatJoinDate(account.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1">
                <QRPattern value={account.electronicId} />
                <p className="text-[9px] text-muted-foreground">
                  Scan to verify
                </p>
              </div>
            </div>
          </div>

          {/* Bottom stripe */}
          <div
            className="h-0.5 opacity-40"
            style={{
              background:
                "linear-gradient(90deg, transparent, #e8c55a, transparent)",
            }}
          />
          <div className="px-5 py-2 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Valid · Cloud-verified
            </p>
            <p className="text-[10px] text-amber-400/60">ladakhconnect.app</p>
          </div>
        </div>
      )}
    </div>
  );
}
