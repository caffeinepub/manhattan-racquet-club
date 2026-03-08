import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  BookOpen,
  Copy,
  Info,
  Loader2,
  Save,
  ShieldCheck,
  ShieldMinus,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAssignUserRole,
  useCallerUserProfile,
  useSaveCallerUserProfile,
} from "../../hooks/useQueries";

// ─── localStorage helpers ──────────────────────────────────────────────────

const LS_KEY = "mrc_admin_names";

function loadAdminNames(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveAdminNames(map: Record<string, string>) {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function parsePrincipal(text: string): Principal | null {
  try {
    return Principal.fromText(text.trim());
  } catch {
    return null;
  }
}

// ─── Name Badge ───────────────────────────────────────────────────────────

function NameBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-sans text-xs font-medium">
      {name}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────

export default function AdminAdminsTab() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const assignRole = useAssignUserRole();
  const profileQuery = useCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  // Admin names stored in localStorage
  const [adminNames, setAdminNames] =
    useState<Record<string, string>>(loadAdminNames);

  // Your name (profile)
  const [myName, setMyName] = useState("");
  const [myNameDirty, setMyNameDirty] = useState(false);

  // Sync from backend profile on load
  useEffect(() => {
    if (profileQuery.data?.name && !myNameDirty) {
      setMyName(profileQuery.data.name);
    }
  }, [profileQuery.data, myNameDirty]);

  // Also pre-fill from localStorage for own principal
  useEffect(() => {
    if (myPrincipal && adminNames[myPrincipal] && !myNameDirty) {
      setMyName(adminNames[myPrincipal]);
    }
  }, [myPrincipal, adminNames, myNameDirty]);

  // Add admin
  const [addInput, setAddInput] = useState("");
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState("");

  // Remove admin
  const [removeInput, setRemoveInput] = useState("");
  const [removeError, setRemoveError] = useState("");

  const isSelfRemoval =
    removeInput.trim() !== "" && removeInput.trim() === myPrincipal;

  // Name label for the remove input field (looked up from localStorage)
  const removeName = removeInput.trim()
    ? (adminNames[removeInput.trim()] ?? "")
    : "";

  async function handleSaveMyName() {
    const trimmed = myName.trim();
    // Save to localStorage
    const updated = { ...adminNames, [myPrincipal]: trimmed };
    setAdminNames(updated);
    saveAdminNames(updated);
    // Save to backend
    try {
      await saveProfile.mutateAsync({ name: trimmed });
      toast.success("Your name has been saved.");
      setMyNameDirty(false);
    } catch {
      toast.error("Failed to save name to backend, but saved locally.");
    }
  }

  async function handleAddAdmin() {
    setAddError("");
    const principal = parsePrincipal(addInput);
    if (!principal) {
      setAddError("Invalid Principal ID format.");
      return;
    }
    try {
      await assignRole.mutateAsync({ user: principal, role: UserRole.admin });
      // Save name to localStorage if provided
      if (addName.trim()) {
        const updated = { ...adminNames, [addInput.trim()]: addName.trim() };
        setAdminNames(updated);
        saveAdminNames(updated);
      }
      toast.success("Admin added successfully.");
      setAddInput("");
      setAddName("");
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
        {/* Your Name / Profile */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h4 className="font-sans text-sm font-semibold text-foreground">
              Your Profile
            </h4>
          </div>
          <p className="font-sans text-xs text-muted-foreground mb-4">
            Set a display name for yourself so other admins know who you are.
            This is stored both locally and in the backend.
          </p>

          <div className="space-y-4">
            {/* Name input */}
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-medium">Your Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={myName}
                  onChange={(e) => {
                    setMyName(e.target.value);
                    setMyNameDirty(true);
                  }}
                  placeholder="e.g. Alex Johnson"
                  className="font-sans text-sm"
                  data-ocid="admin.profile.input"
                />
                <Button
                  size="sm"
                  onClick={handleSaveMyName}
                  disabled={
                    !myName.trim() || saveProfile.isPending || !myPrincipal
                  }
                  className="shrink-0 font-sans font-semibold"
                  data-ocid="admin.profile.save_button"
                >
                  {saveProfile.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Principal ID */}
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-medium">
                Your Principal ID
              </Label>
              <p className="font-sans text-xs text-muted-foreground">
                Share this with other admins so they can add you to other
                systems.
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
          </div>
        </div>

        {/* How to get your Principal ID — Guide */}
        <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg overflow-hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="guide" className="border-0">
              <AccordionTrigger
                className="px-5 py-4 hover:no-underline hover:bg-sky-100/60 dark:hover:bg-sky-900/30 transition-colors"
                data-ocid="admin.guide.toggle"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="font-sans text-sm font-semibold text-sky-800 dark:text-sky-200">
                    How to get your Principal ID
                  </span>
                  <span className="font-sans text-xs text-sky-500 dark:text-sky-400 ml-1">
                    — Share these steps with your friends
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="pt-1 space-y-3">
                  <p className="font-sans text-xs text-sky-700 dark:text-sky-300">
                    Share these steps with anyone you want to add as an admin:
                  </p>
                  <ol className="space-y-3 list-none">
                    {[
                      {
                        step: 1,
                        text: (
                          <>
                            Visit the admin login page at{" "}
                            <code className="font-mono text-xs bg-sky-100 dark:bg-sky-900 px-1.5 py-0.5 rounded text-sky-700 dark:text-sky-300">
                              /admin
                            </code>{" "}
                            on this website.
                          </>
                        ),
                      },
                      {
                        step: 2,
                        text: 'Click "Admin Login" and sign in with Internet Identity.',
                      },
                      {
                        step: 3,
                        text: "You'll see an \"Access Denied\" screen — this is expected since you're not an admin yet.",
                      },
                      {
                        step: 4,
                        text: "On that screen, your Principal ID is displayed prominently. Copy it and send it to an existing admin.",
                      },
                      {
                        step: 5,
                        text: 'Once the admin adds your Principal ID via the "Add Admin" section, log out and back in — you\'ll have full access.',
                      },
                    ].map(({ step, text }) => (
                      <li key={step} className="flex gap-3 items-start">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-sky-200 dark:bg-sky-800 flex items-center justify-center font-sans text-xs font-bold text-sky-700 dark:text-sky-300">
                          {step}
                        </span>
                        <p className="font-sans text-xs text-sky-800 dark:text-sky-200 leading-relaxed pt-0.5">
                          {text}
                        </p>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 pt-3 border-t border-sky-200 dark:border-sky-800">
                    <p className="font-sans text-xs text-sky-600 dark:text-sky-400">
                      <strong>Tip:</strong> If your friend is already on the
                      site and logged in as an admin, their Principal ID is
                      shown in the <strong>Your Profile</strong> section above.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
            Optionally give them a label so you remember who they are.
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
              {/* Show existing label if we already have one in localStorage */}
              {addInput.trim() && adminNames[addInput.trim()] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-sans text-xs text-muted-foreground">
                    Known as:
                  </span>
                  <NameBadge name={adminNames[addInput.trim()]} />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-medium">
                Name / Label{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Sarah — my doubles partner"
                className="font-sans text-sm"
                data-ocid="admin.add_admin.name.input"
              />
              <p className="font-sans text-xs text-muted-foreground">
                Stored locally in your browser so you remember who this is.
              </p>
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
              {removeName && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-sans text-xs text-muted-foreground">
                    Known as:
                  </span>
                  <NameBadge name={removeName} />
                </div>
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
                        Are you sure you want to remove{" "}
                        {removeName ? (
                          <>
                            <strong>{removeName}</strong> from admin access?
                          </>
                        ) : (
                          <>
                            this admin? They will lose access to the dashboard.
                          </>
                        )}
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
