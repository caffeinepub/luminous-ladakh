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
import { ViolationCard } from "../shared/ViolationCard";

interface Props {
  currentUser: Account;
  permissionRequests: PermissionRequest[];
  violations: Violation[];
  members: Account[];
  flagReports: FlagReport[];
  onRequestPermission: (
    req: Omit<PermissionRequest, "id" | "timestamp">,
  ) => void;
  onFlagMember: (report: Omit<FlagReport, "id" | "timestamp">) => void;
  onUpdateUser: (updates: Partial<Account>) => void;
  onLogout: () => void;
}

export function CommunityPermissionsTab({
  currentUser,
  permissionRequests,
  violations,
  members,
  flagReports,
  onRequestPermission,
  onFlagMember,
  onUpdateUser,
  onLogout,
}: Props) {
  const [flagTarget, setFlagTarget] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [showFlagForm, setShowFlagForm] = useState(false);

  const myRequest = permissionRequests.filter(
    (r) => r.requesterId === currentUser.id,
  );
  const myFlags = flagReports.filter((r) => r.reporterId === currentUser.id);

  const submitFlag = () => {
    if (!flagTarget || !flagReason.trim()) {
      toast.error("Please select a member and provide a reason");
      return;
    }
    const target = members.find((m) => m.id === flagTarget);
    if (!target) return;
    onFlagMember({
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      targetMemberId: target.id,
      targetMemberUsername: target.username,
      reason: flagReason,
      status: "pending",
    });
    toast.success("Report submitted to Creator for review.");
    setFlagTarget("");
    setFlagReason("");
    setShowFlagForm(false);
  };

  return (
    <div className="fade-in space-y-4">
      {/* Permission Status */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading text-xl font-bold mb-4">
          Edit Permissions
        </h2>
        <div
          className={`rounded-xl p-4 border mb-4 ${
            currentUser.editPermissionStatus === "approved"
              ? "bg-green-500/10 border-green-500/30"
              : currentUser.editPermissionStatus === "pending"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-secondary border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`material-symbols-outlined text-2xl ${
                currentUser.editPermissionStatus === "approved"
                  ? "text-green-400"
                  : currentUser.editPermissionStatus === "pending"
                    ? "text-yellow-400"
                    : "text-muted-foreground"
              }`}
            >
              {currentUser.editPermissionStatus === "approved"
                ? "lock_open"
                : currentUser.editPermissionStatus === "pending"
                  ? "hourglass_empty"
                  : "lock"}
            </span>
            <div>
              <p className="font-semibold text-sm">
                {currentUser.editPermissionStatus === "approved"
                  ? "Edit Access Granted"
                  : currentUser.editPermissionStatus === "pending"
                    ? "Request Pending Approval"
                    : currentUser.editPermissionStatus === "denied"
                      ? "Request Denied"
                      : "No Edit Permission"}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentUser.editPermissionStatus === "approved"
                  ? "You can edit your business info in My Business tab."
                  : currentUser.editPermissionStatus === "pending"
                    ? "Creator will review your request shortly."
                    : "Request edit access to modify your business information."}
              </p>
            </div>
          </div>
        </div>

        {(!currentUser.editPermissionStatus ||
          currentUser.editPermissionStatus === "denied") && (
          <Button
            className="bg-primary text-primary-foreground w-full"
            onClick={() => {
              onRequestPermission({
                requesterId: currentUser.id,
                requesterUsername: currentUser.username,
                requestedAction: "edit_business",
                status: "pending",
              });
              onUpdateUser({ editPermissionStatus: "pending" });
              toast.success("Permission request sent to Creator.");
            }}
            data-ocid="permissions.primary_button"
          >
            Request Edit Permission
          </Button>
        )}

        {myRequest.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Request History
            </h4>
            {myRequest.map((r, i) => (
              <div
                key={r.id}
                className="bg-secondary rounded-lg p-2 flex justify-between items-center"
                data-ocid={`permissions.row.${i + 1}`}
              >
                <span className="text-xs">
                  {r.requestedAction.replace("_", " ")}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === "approved"
                      ? "bg-green-500/15 text-green-400"
                      : r.status === "denied"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ViolationCard violations={violations} userId={currentUser.id} />

      {/* Flag Members */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold">Flag a Member</h2>
          <button
            onClick={() => setShowFlagForm(!showFlagForm)}
            className="text-xs text-primary"
            type="button"
            data-ocid="permissions.toggle"
          >
            {showFlagForm ? "Cancel" : "Report"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Report members posting misleading or violating content. Reports go to
          Creator for review.
        </p>

        {showFlagForm && (
          <div className="space-y-3">
            <select
              value={flagTarget}
              onChange={(e) => setFlagTarget(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              data-ocid="permissions.select"
            >
              <option value="">Select a member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  @{m.username} — {m.businessName || "No business"}
                </option>
              ))}
            </select>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={3}
              className="bg-input border-border text-sm"
              data-ocid="permissions.textarea"
            />
            <Button
              className="w-full bg-red-600 hover:bg-red-500 text-white"
              onClick={submitFlag}
              data-ocid="permissions.submit_button"
            >
              Submit Report
            </Button>
          </div>
        )}

        {myFlags.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">
              My Reports
            </h4>
            {myFlags.map((f, i) => (
              <div
                key={f.id}
                className="bg-secondary rounded-lg p-2 text-xs"
                data-ocid={`permissions.row.${i + 1}`}
              >
                <span className="font-medium">@{f.targetMemberUsername}</span>
                <span
                  className={`ml-2 px-1.5 py-0.5 rounded-full ${
                    f.status === "reviewed"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full border-border text-muted-foreground"
        onClick={onLogout}
        data-ocid="profile.button"
      >
        <span className="material-symbols-outlined text-lg mr-2">logout</span>
        Sign Out
      </Button>
    </div>
  );
}
