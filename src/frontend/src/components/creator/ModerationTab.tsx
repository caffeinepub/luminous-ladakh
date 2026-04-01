import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type {
  Account,
  FlagReport,
  PermissionRequest,
  Violation,
} from "../../types";

interface Props {
  accounts: Account[];
  violations: Violation[];
  permissionRequests: PermissionRequest[];
  flagReports: FlagReport[];
  onIssueViolation: (v: Omit<Violation, "id" | "timestamp">) => void;
  onResolveViolation: (id: string) => void;
  onUpdatePermissionRequest: (
    id: string,
    updates: Partial<PermissionRequest>,
  ) => void;
  onUpdateFlagReport: (id: string, updates: Partial<FlagReport>) => void;
  onUpdateAccount: (id: string, updates: Partial<Account>) => void;
}

const VIOLATION_LEVELS = [
  { level: 1, label: "Level 1 — Warning", desc: "Formal written warning" },
  {
    level: 2,
    label: "Level 2 — Second Warning",
    desc: "Final warning before action",
  },
  {
    level: 3,
    label: "Level 3 — Content Removal",
    desc: "Offending content removed",
  },
  { level: 4, label: "Level 4 — Fine ₹500", desc: "Monetary penalty issued" },
  { level: 5, label: "Level 5 — Fine ₹1,000", desc: "Higher monetary penalty" },
  {
    level: 6,
    label: "Level 6 — 30-day Suspension",
    desc: "Temporary account suspension",
  },
  {
    level: 7,
    label: "Level 7 — Permanent Ban",
    desc: "Account permanently banned",
  },
];

export function CreatorModeration({
  accounts,
  violations,
  permissionRequests,
  flagReports,
  onIssueViolation,
  onResolveViolation,
  onUpdatePermissionRequest,
  onUpdateFlagReport,
  onUpdateAccount,
}: Props) {
  const [subTab, setSubTab] = useState<
    "users" | "members" | "community" | "permissions" | "flags"
  >("users");
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [violationForm, setViolationForm] = useState({
    targetId: "",
    level: "1",
    reason: "",
  });

  const users = accounts.filter((a) => a.role === "user");
  const members = accounts.filter((a) => a.role === "member");
  const community = accounts.filter((a) => a.role === "community");
  const pendingPermissions = permissionRequests.filter(
    (r) => r.status === "pending",
  );
  const pendingFlags = flagReports.filter((r) => r.status === "pending");

  const getViolations = (role: string) =>
    violations.filter((v) => {
      const acct = accounts.find((a) => a.id === v.targetUserId);
      return acct?.role === role;
    });

  const targetPool =
    subTab === "users" ? users : subTab === "members" ? members : community;

  const handleIssueViolation = () => {
    if (!violationForm.targetId || !violationForm.reason.trim()) {
      toast.error("Select a target and provide a reason");
      return;
    }
    const target = accounts.find((a) => a.id === violationForm.targetId);
    if (!target) return;
    onIssueViolation({
      targetUserId: target.id,
      targetUsername: target.username,
      targetRole: target.role,
      level: Number.parseInt(violationForm.level, 10),
      reason: violationForm.reason,
      issuedBy: "hunter",
      resolved: false,
    });
    toast.success("Violation issued successfully.");
    setViolationForm({ targetId: "", level: "1", reason: "" });
    setShowIssueForm(false);
  };

  const roleViolations = getViolations(
    subTab === "users" ? "user" : subTab === "members" ? "member" : "community",
  );

  const SUB_TABS = [
    {
      id: "users",
      label: "Users",
      badge: getViolations("user").filter((v) => !v.resolved).length,
    },
    {
      id: "members",
      label: "Members",
      badge: getViolations("member").filter((v) => !v.resolved).length,
    },
    {
      id: "community",
      label: "Community",
      badge: getViolations("community").filter((v) => !v.resolved).length,
    },
    {
      id: "permissions",
      label: "Permissions",
      badge: pendingPermissions.length,
    },
    { id: "flags", label: "Reports", badge: pendingFlags.length },
  ];

  return (
    <div className="fade-in">
      {/* Sub-tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSubTab(t.id as typeof subTab);
              setShowIssueForm(false);
            }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              subTab === t.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground"
            }`}
            type="button"
            data-ocid="moderation.tab"
          >
            {t.label}
            {t.badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Violations Panels */}
      {["users", "members", "community"].includes(subTab) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold capitalize">
              {subTab} Violations
            </h2>
            <Button
              size="sm"
              className="bg-primary/15 text-primary border border-primary/30"
              onClick={() => setShowIssueForm(!showIssueForm)}
              data-ocid="moderation.open_modal_button"
            >
              Issue Violation
            </Button>
          </div>

          {showIssueForm && (
            <div
              className="bg-card border border-primary/30 rounded-xl p-4 space-y-3"
              data-ocid="moderation.panel"
            >
              <h3 className="font-semibold text-sm">Issue New Violation</h3>
              <select
                value={violationForm.targetId}
                onChange={(e) =>
                  setViolationForm((p) => ({ ...p, targetId: e.target.value }))
                }
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                data-ocid="moderation.select"
              >
                <option value="">Select target account...</option>
                {targetPool.map((a) => (
                  <option key={a.id} value={a.id}>
                    @{a.username}
                  </option>
                ))}
              </select>
              <select
                value={violationForm.level}
                onChange={(e) =>
                  setViolationForm((p) => ({ ...p, level: e.target.value }))
                }
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                data-ocid="moderation.select"
              >
                {VIOLATION_LEVELS.map((l) => (
                  <option key={l.level} value={l.level}>
                    {l.label} — {l.desc}
                  </option>
                ))}
              </select>
              <Textarea
                placeholder="Reason for violation..."
                value={violationForm.reason}
                onChange={(e) =>
                  setViolationForm((p) => ({ ...p, reason: e.target.value }))
                }
                rows={3}
                className="bg-input border-border text-sm"
                data-ocid="moderation.textarea"
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                  onClick={handleIssueViolation}
                  data-ocid="moderation.confirm_button"
                >
                  Issue
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border"
                  onClick={() => setShowIssueForm(false)}
                  data-ocid="moderation.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {roleViolations.length === 0 ? (
            <p
              className="text-sm text-muted-foreground py-4 text-center"
              data-ocid="moderation.empty_state"
            >
              No violations for this group.
            </p>
          ) : (
            <div className="space-y-3">
              {roleViolations.map((v, i) => (
                <div
                  key={v.id}
                  className={`bg-card border rounded-xl p-4 ${
                    v.resolved
                      ? "border-border opacity-60"
                      : "border-red-500/30"
                  }`}
                  data-ocid={`moderation.row.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-sm">
                        @{v.targetUsername}
                      </span>
                      <span className="ml-2 text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
                        Level {v.level}
                      </span>
                    </div>
                    {!v.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-green-500/30 text-green-400 h-7"
                        onClick={() => {
                          onResolveViolation(v.id);
                          toast.success("Violation resolved.");
                        }}
                        data-ocid="moderation.button"
                      >
                        Resolve
                      </Button>
                    )}
                    {v.resolved && (
                      <span className="text-xs text-green-400">✓ Resolved</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{v.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(v.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permission Requests */}
      {subTab === "permissions" && (
        <div className="space-y-3">
          <h2 className="font-heading font-semibold">
            Edit Permission Requests ({pendingPermissions.length} pending)
          </h2>
          {permissionRequests.length === 0 ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="moderation.empty_state"
            >
              No permission requests.
            </p>
          ) : (
            permissionRequests.map((req, i) => (
              <div
                key={req.id}
                className="bg-card border border-border rounded-xl p-4"
                data-ocid={`moderation.row.${i + 1}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">
                      @{req.requesterUsername}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {req.requestedAction.replace("_", " ")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      req.status === "approved"
                        ? "bg-green-500/15 text-green-400"
                        : req.status === "denied"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(req.timestamp).toLocaleDateString()}
                </p>
                {req.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs"
                      onClick={() => {
                        onUpdatePermissionRequest(req.id, {
                          status: "approved",
                        });
                        const acct = accounts.find(
                          (a) => a.id === req.requesterId,
                        );
                        if (acct)
                          onUpdateAccount(acct.id, {
                            editPermissionStatus: "approved",
                          });
                        toast.success("Permission approved!");
                      }}
                      data-ocid="moderation.confirm_button"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 text-xs"
                      onClick={() => {
                        onUpdatePermissionRequest(req.id, { status: "denied" });
                        const acct = accounts.find(
                          (a) => a.id === req.requesterId,
                        );
                        if (acct)
                          onUpdateAccount(acct.id, {
                            editPermissionStatus: "denied",
                          });
                        toast.success("Permission denied.");
                      }}
                      data-ocid="moderation.delete_button"
                    >
                      Deny
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Flag Reports */}
      {subTab === "flags" && (
        <div className="space-y-3">
          <h2 className="font-heading font-semibold">
            Member Reports ({pendingFlags.length} pending)
          </h2>
          {flagReports.length === 0 ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="moderation.empty_state"
            >
              No reports submitted.
            </p>
          ) : (
            flagReports.map((r, i) => (
              <div
                key={r.id}
                className="bg-card border border-border rounded-xl p-4"
                data-ocid={`moderation.row.${i + 1}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold">
                      @{r.targetMemberUsername}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      reported by @{r.reporterUsername}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "reviewed"
                        ? "bg-green-500/15 text-green-400"
                        : r.status === "dismissed"
                          ? "bg-secondary text-muted-foreground"
                          : "bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{r.reason}</p>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary/15 text-primary border border-primary/30 text-xs"
                      onClick={() => {
                        onUpdateFlagReport(r.id, { status: "reviewed" });
                        toast.success("Report marked as reviewed.");
                      }}
                      data-ocid="moderation.confirm_button"
                    >
                      Mark Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border text-xs"
                      onClick={() => {
                        onUpdateFlagReport(r.id, { status: "dismissed" });
                        toast.success("Report dismissed.");
                      }}
                      data-ocid="moderation.cancel_button"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
