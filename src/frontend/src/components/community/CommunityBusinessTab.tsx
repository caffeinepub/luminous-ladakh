import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { Account, PermissionRequest } from "../../types";

interface Props {
  currentUser: Account;
  permissionRequests: PermissionRequest[];
  onUpdate: (updates: Partial<Account>) => void;
  onRequestPermission: (
    req: Omit<PermissionRequest, "id" | "timestamp">,
  ) => void;
}

export function CommunityBusinessTab({
  currentUser,
  permissionRequests,
  onUpdate,
  onRequestPermission,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: currentUser.businessName || "",
    businessCategory: currentUser.businessCategory || "",
    businessLocation: currentUser.businessLocation || "",
    businessDescription: currentUser.businessDescription || "",
  });

  const myRequest = permissionRequests.find(
    (r) =>
      r.requesterId === currentUser.id && r.requestedAction === "edit_business",
  );
  const hasEditAccess = currentUser.editPermissionStatus === "approved";
  const isPending =
    currentUser.editPermissionStatus === "pending" ||
    myRequest?.status === "pending";

  const saveChanges = () => {
    if (!form.businessName) {
      toast.error("Business name required");
      return;
    }
    onUpdate(form);
    setEditing(false);
    toast.success("Business info updated!");
  };

  const requestEdit = () => {
    onRequestPermission({
      requesterId: currentUser.id,
      requesterUsername: currentUser.username,
      requestedAction: "edit_business",
      status: "pending",
    });
    onUpdate({ editPermissionStatus: "pending" });
    toast.success("Edit permission requested! Awaiting creator approval.");
  };

  return (
    <div className="fade-in space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading text-xl font-bold mb-1">My Business</h2>
        <div className="flex items-center gap-2 mb-4">
          {hasEditAccess ? (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                lock_open
              </span>
              Edit Access Granted
            </span>
          ) : isPending ? (
            <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">pending</span>
              Permission Pending
            </span>
          ) : (
            <span className="text-xs bg-secondary text-muted-foreground border border-border px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              View Only
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Business Name</p>
            <p className="font-semibold">
              {currentUser.businessName || "— Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-sm">{currentUser.businessCategory || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm">{currentUser.businessLocation || "—"}</p>
          </div>
          {currentUser.businessDescription && (
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm text-muted-foreground">
                {currentUser.businessDescription}
              </p>
            </div>
          )}
        </div>

        {!hasEditAccess && !isPending && (
          <div className="mt-4 p-4 bg-secondary rounded-lg text-center">
            <span className="material-symbols-outlined text-3xl text-muted-foreground block mb-2">
              lock
            </span>
            <p className="text-sm text-muted-foreground mb-3">
              You need edit permission to modify your business information.
            </p>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={requestEdit}
              data-ocid="business.primary_button"
            >
              Request Edit Access
            </Button>
          </div>
        )}

        {isPending && !hasEditAccess && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
            <span className="material-symbols-outlined text-3xl text-yellow-400 block mb-2">
              hourglass_empty
            </span>
            <p className="text-sm text-yellow-400 font-semibold">
              Request Submitted
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting Creator approval...
            </p>
          </div>
        )}

        {hasEditAccess && !editing && (
          <Button
            size="sm"
            className="mt-4 bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
            onClick={() => setEditing(true)}
            data-ocid="business.edit_button"
          >
            Edit Business Info
          </Button>
        )}

        {editing && (
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Business Name
              </Label>
              <Input
                value={form.businessName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, businessName: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="business.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Category</Label>
              <Input
                value={form.businessCategory}
                onChange={(e) =>
                  setForm((p) => ({ ...p, businessCategory: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="business.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Location</Label>
              <Input
                value={form.businessLocation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, businessLocation: e.target.value }))
                }
                className="bg-input border-border"
                data-ocid="business.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.businessDescription}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    businessDescription: e.target.value,
                  }))
                }
                rows={4}
                className="bg-input border-border text-sm"
                data-ocid="business.textarea"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={saveChanges}
                data-ocid="business.save_button"
              >
                Save
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setEditing(false)}
                data-ocid="business.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
