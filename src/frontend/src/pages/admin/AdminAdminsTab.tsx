import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Principal } from "@icp-sdk/core/principal";
import {
  Copy,
  Info,
  Loader2,
  ShieldCheck,
  ShieldMinus,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useAssignUserRole } from "../../hooks/useQueries";

function parsePrincipal(text: string): Principal | null {
  try {
    return Principal.fromText(text.trim());
  } catch {
    return null;
  }
}

export default function AdminAdminsTab() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const assignRole = useAssignUserRole();

  const [addInput, setAddInput] = useState("");
  const [addError, setAddError] = useState("");
  const [removeInput, setRemoveInput] = useState("");
  const [removeError, setRemoveError] = useState("");

  const isSelfRemoval =
    removeInput.trim() !== "" && removeInput.trim() === myPrincipal;

  async function handleAddAdmin() {
    setAddError("");
    const principal = parsePrincipal(addInput);
    if (!principal) {
      setAddError("Invalid Principal ID format.");
      return;
    }
    try {
      await assignRole.mutateAsync({ user: principal, role: UserRole.admin });
      toast.success("Admin added successfully.");
      setAddInput("");
    } catch {
      toast.error("Failed to add admin. Please try again.");
    }
  }

  async function handleRemoveAdmin() {
    setRemoveError("");
    const principal = parsePrincipal(removeInput);
    if (!principal) {
      setRemoveError("Invalid Principal ID format.");
      return;
    }
    try {
      await assignRole.mutateAsync({ user: principal, role: UserRole.user });
      toast.success("Admin removed successfully.");
      setRemoveInput("");
    } catch {
      toast.error("Failed to remove admin. Please try again.");
    }
  }

  function copyPrincipal() {
    if (!myPrincipal) return;
    void navigator.clipboard.writeText(myPrincipal).then(() => {
      toast.success("Principal ID copied to clipboard.");
    });
  }

  return (
    <div>
      <h3 className="font-display text-xl font-bold text-foreground mb-1">
        Admin Management
      </h3>
      <p className="font-sans text-sm text-muted-foreground mb-6">
        Grant or revoke admin access for other users by their Principal ID.
      </p>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 mb-6">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="font-sans text-sm text-foreground/80 leading-relaxed">
          Share your Principal ID with other users so they can grant you access.
          The <strong>first person to log in</strong> automatically becomes an
          admin — no setup required.
        </p>
      </div>

      <div className="space-y-6">
        {/* Your Principal ID */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h4 className="font-sans text-sm font-semibold text-foreground">
              Your Principal ID
            </h4>
          </div>
          <p className="font-sans text-xs text-muted-foreground mb-3">
            Share this with other admins so they can grant you access to other
            canisters or systems.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs bg-muted rounded px-3 py-2 text-foreground truncate">
              {myPrincipal || "—"}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyPrincipal}
              disabled={!myPrincipal}
              className="shrink-0 font-sans text-xs"
              data-ocid="admin.admins.button"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy
            </Button>
          </div>
        </div>

        {/* Add Admin */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="h-4 w-4 text-primary" />
            <h4 className="font-sans text-sm font-semibold text-foreground">
              Add Admin
            </h4>
          </div>
          <p className="font-sans text-xs text-muted-foreground mb-4">
            Enter the Principal ID of the user you want to grant admin access.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-medium">
                Principal ID
              </Label>
              <Input
                value={addInput}
                onChange={(e) => {
                  setAddInput(e.target.value);
                  if (addError) setAddError("");
                }}
                placeholder="e.g. aaaaa-aa"
                className="font-mono text-sm"
                data-ocid="admin.add_admin.input"
              />
              {addError && (
                <p
                  className="font-sans text-xs text-destructive"
                  data-ocid="admin.add_admin.error_state"
                >
                  {addError}
                </p>
              )}
            </div>
            <Button
              onClick={handleAddAdmin}
              disabled={!addInput.trim() || assignRole.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
              data-ocid="admin.add_admin.primary_button"
            >
              {assignRole.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add as Admin
            </Button>
          </div>
        </div>

        {/* Remove Admin */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldMinus className="h-4 w-4 text-destructive" />
            <h4 className="font-sans text-sm font-semibold text-foreground">
              Remove Admin
            </h4>
          </div>
          <p className="font-sans text-xs text-muted-foreground mb-4">
            Downgrade a user from admin to regular user. They will lose access
            to this dashboard.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-medium">
                Principal ID
              </Label>
              <Input
                value={removeInput}
                onChange={(e) => {
                  setRemoveInput(e.target.value);
                  if (removeError) setRemoveError("");
                }}
                placeholder="e.g. aaaaa-aa"
                className="font-mono text-sm"
                data-ocid="admin.remove_admin.input"
              />
              {removeError && (
                <p
                  className="font-sans text-xs text-destructive"
                  data-ocid="admin.remove_admin.error_state"
                >
                  {removeError}
                </p>
              )}
              {isSelfRemoval && (
                <p className="font-sans text-xs text-amber-600 dark:text-amber-400">
                  ⚠ This is your own Principal ID. Removing yourself will lock
                  you out of the dashboard.
                </p>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={!removeInput.trim() || assignRole.isPending}
                  className="font-sans font-semibold"
                  data-ocid="admin.remove_admin.delete_button"
                >
                  {assignRole.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Remove Admin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="admin.remove_admin.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">
                    Remove Admin Access
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-sans">
                    {isSelfRemoval ? (
                      <>
                        <strong>Warning:</strong> You are about to remove{" "}
                        <strong>yourself</strong> as an admin. You will
                        immediately lose access to this dashboard and will need
                        another admin to restore your access.
                      </>
                    ) : (
                      <>
                        Are you sure you want to remove this admin? They will
                        lose access to the dashboard.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="font-sans"
                    data-ocid="admin.remove_admin.cancel_button"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveAdmin}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                    data-ocid="admin.remove_admin.confirm_button"
                  >
                    Remove Admin
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
