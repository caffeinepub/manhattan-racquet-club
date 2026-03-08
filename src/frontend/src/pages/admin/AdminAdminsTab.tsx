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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Principal } from "@icp-sdk/core/principal";
import {
  BookOpen,
  Copy,
  Loader2,
  Save,
  ShieldCheck,
  ShieldMinus,
  ShieldPlus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend";
import type { AdminEntry } from "../../backend.d.ts";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAssignUserRoleWithSuperAdminCheck,
  useCallerUserProfile,
  useGetAllAdmins,
  useSaveCallerUserProfile,
  useSetSuperAdmin,
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

function truncatePrincipal(p: string) {
  if (p.length <= 20) return p;
  return `${p.slice(0, 10)}…${p.slice(-6)}`;
}

// ─── Role Badge ───────────────────────────────────────────────────────────

function RoleBadge({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  if (isSuperAdmin) {
    return (
      <Badge
        variant="outline"
        className="font-sans text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 shrink-0"
      >
        Superadmin
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="font-sans text-xs font-semibold px-2 py-0.5 shrink-0"
    >
      Admin
    </Badge>
  );
}

// ─── Admin Row ────────────────────────────────────────────────────────────

interface AdminRowProps {
  entry: AdminEntry;
  index: number;
  isMe: boolean;
  isSuperAdmin: boolean; // viewer is superadmin
  adminNames: Record<string, string>;
  onPromote: (principal: string) => void;
  onDemote: (principal: string) => void;
  onRemove: (principal: string) => void;
  isPending: boolean;
}

function AdminRow({
  entry,
  index,
  isMe,
  isSuperAdmin,
  adminNames,
  onPromote,
  onDemote,
  onRemove,
  isPending,
}: AdminRowProps) {
  const pid = entry.principal.toString();
  const label = adminNames[pid] ?? "";

  function copyPid() {
    void navigator.clipboard.writeText(pid).then(() => {
      toast.success("Principal ID copied to clipboard.");
    });
  }

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
      data-ocid={`admins.list.item.${index}`}
    >
      {/* Left: role + identity */}
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        <RoleBadge isSuperAdmin={entry.isSuperAdmin} />

        <div className="flex flex-col min-w-0 gap-0.5">
          {label && (
            <span className="font-sans text-sm font-semibold text-foreground truncate">
              {label}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <code className="font-mono text-xs text-muted-foreground truncate">
              {truncatePrincipal(pid)}
            </code>
            <button
              type="button"
              onClick={copyPid}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Copy principal ID"
              data-ocid={`admins.list.button.${index}`}
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          {isMe && (
            <span className="font-sans text-xs text-primary font-medium">
              You
            </span>
          )}
        </div>
      </div>

      {/* Right: actions (superadmin viewer only, not for self) */}
      {isSuperAdmin && (
        <div className="flex items-center gap-2 shrink-0">
          {!isMe ? (
            <>
              {/* Promote / Demote */}
              {!entry.isSuperAdmin ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      className="font-sans text-xs gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 hover:border-amber-400 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/30"
                      data-ocid={`admins.promote.button.${index}`}
                    >
                      <ShieldPlus className="h-3.5 w-3.5" />
                      Promote
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    data-ocid={`admins.promote.dialog.${index}`}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Promote to Superadmin?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        {label ? (
                          <>
                            <strong>{label}</strong> will gain full Superadmin
                            access, including the ability to add, remove, and
                            promote other admins.
                          </>
                        ) : (
                          <>
                            This admin will gain full Superadmin access,
                            including the ability to add, remove, and promote
                            other admins.
                          </>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-sans"
                        data-ocid={`admins.promote.cancel_button.${index}`}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onPromote(pid)}
                        className="bg-amber-600 text-white hover:bg-amber-700 font-sans"
                        data-ocid={`admins.promote.confirm_button.${index}`}
                      >
                        Promote to Superadmin
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      className="font-sans text-xs gap-1.5 text-muted-foreground"
                      data-ocid={`admins.demote.button.${index}`}
                    >
                      <ShieldMinus className="h-3.5 w-3.5" />
                      Demote
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    data-ocid={`admins.demote.dialog.${index}`}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Demote to Admin?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        {label ? (
                          <>
                            <strong>{label}</strong> will be demoted to a
                            regular Admin. They will lose the ability to manage
                            other admins.
                          </>
                        ) : (
                          <>
                            This Superadmin will be demoted to a regular Admin
                            and will lose the ability to manage other admins.
                          </>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-sans"
                        data-ocid={`admins.demote.cancel_button.${index}`}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDemote(pid)}
                        className="font-sans"
                        data-ocid={`admins.demote.confirm_button.${index}`}
                      >
                        Demote to Admin
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Remove */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    className="font-sans text-xs gap-1.5 text-destructive hover:bg-destructive/10"
                    data-ocid={`admins.remove.delete_button.${index}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid={`admins.remove.dialog.${index}`}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">
                      Remove Admin Access
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-sans">
                      {label ? (
                        <>
                          Are you sure you want to remove{" "}
                          <strong>{label}</strong> as an admin? They will lose
                          all access to this dashboard.
                        </>
                      ) : (
                        <>
                          Are you sure you want to remove this admin? They will
                          lose all access to this dashboard.
                        </>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="font-sans"
                      data-ocid={`admins.remove.cancel_button.${index}`}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemove(pid)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                      data-ocid={`admins.remove.confirm_button.${index}`}
                    >
                      Remove Admin
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      className="font-sans text-xs gap-1.5 text-muted-foreground cursor-not-allowed opacity-50"
                      data-ocid={`admins.self.button.${index}`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      You
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  className="font-sans text-xs"
                  data-ocid={`admins.self.tooltip.${index}`}
                >
                  You cannot modify your own admin account.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────

interface AdminAdminsTabProps {
  isSuperAdmin: boolean;
}

export default function AdminAdminsTab({ isSuperAdmin }: AdminAdminsTabProps) {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const adminsQuery = useGetAllAdmins();
  const assignRoleWithCheck = useAssignUserRoleWithSuperAdminCheck();
  const setSuperAdmin = useSetSuperAdmin();
  const profileQuery = useCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const isPending = assignRoleWithCheck.isPending || setSuperAdmin.isPending;

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

  // Add admin form
  const [addInput, setAddInput] = useState("");
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState("");

  async function handleSaveMyName() {
    const trimmed = myName.trim();
    const updated = { ...adminNames, [myPrincipal]: trimmed };
    setAdminNames(updated);
    saveAdminNames(updated);
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
      await assignRoleWithCheck.mutateAsync({
        user: principal,
        role: UserRole.admin,
      });
      if (addName.trim()) {
        const updated = { ...adminNames, [addInput.trim()]: addName.trim() };
        setAdminNames(updated);
        saveAdminNames(updated);
      }
      toast.success("Admin added successfully.");
      setAddInput("");
      setAddName("");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unknown error";
      // Surface backend trap messages which contain useful info
      const backendMsg = msg.includes(":")
        ? msg.substring(msg.lastIndexOf(":") + 1).trim()
        : msg;
      setAddError(backendMsg || "Failed to add admin. Please try again.");
      toast.error(`Failed to add admin: ${backendMsg || "Please try again."}`);
    }
  }

  async function handlePromote(pid: string) {
    const principal = parsePrincipal(pid);
    if (!principal) return;
    try {
      await setSuperAdmin.mutateAsync({ user: principal, promote: true });
      toast.success("Admin promoted to Superadmin.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const backendMsg = msg.includes(":")
        ? msg.substring(msg.lastIndexOf(":") + 1).trim()
        : msg;
      toast.error(`Failed to promote: ${backendMsg || "Please try again."}`);
    }
  }

  async function handleDemote(pid: string) {
    const principal = parsePrincipal(pid);
    if (!principal) return;
    try {
      await setSuperAdmin.mutateAsync({ user: principal, promote: false });
      toast.success("Superadmin demoted to Admin.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const backendMsg = msg.includes(":")
        ? msg.substring(msg.lastIndexOf(":") + 1).trim()
        : msg;
      toast.error(`Failed to demote: ${backendMsg || "Please try again."}`);
    }
  }

  async function handleRemove(pid: string) {
    const principal = parsePrincipal(pid);
    if (!principal) return;
    try {
      await assignRoleWithCheck.mutateAsync({
        user: principal,
        role: UserRole.user,
      });
      toast.success("Admin removed successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const backendMsg = msg.includes(":")
        ? msg.substring(msg.lastIndexOf(":") + 1).trim()
        : msg;
      toast.error(`Failed to remove: ${backendMsg || "Please try again."}`);
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
        {isSuperAdmin
          ? "As a Superadmin, you can manage all admins, promote/demote them, and add new ones."
          : "View the list of admins for this club. Contact a Superadmin to change admin access."}
      </p>

      <div className="space-y-6">
        {/* ── Admin List ─────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="font-sans text-sm font-semibold text-foreground">
              All Admins
            </h4>
            {adminsQuery.data && (
              <span className="ml-auto font-sans text-xs text-muted-foreground">
                {adminsQuery.data.length}{" "}
                {adminsQuery.data.length === 1 ? "admin" : "admins"}
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-muted-foreground mb-4">
            {isSuperAdmin
              ? "Use the Promote/Demote buttons to change roles, or Remove to revoke access entirely."
              : "All users who have been granted access to this dashboard."}
          </p>

          {/* Loading skeleton */}
          {adminsQuery.isLoading && (
            <div className="space-y-3" data-ocid="admins.list.loading_state">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border"
                >
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {adminsQuery.isError && (
            <div
              className="text-center py-6"
              data-ocid="admins.list.error_state"
            >
              <p className="font-sans text-sm text-destructive">
                Failed to load admins. Please refresh the page.
              </p>
            </div>
          )}

          {/* Empty state */}
          {adminsQuery.data && adminsQuery.data.length === 0 && (
            <div
              className="text-center py-6 text-muted-foreground"
              data-ocid="admins.list.empty_state"
            >
              <p className="font-sans text-sm">No admins found.</p>
            </div>
          )}

          {/* Admin rows */}
          {adminsQuery.data && adminsQuery.data.length > 0 && (
            <div className="space-y-2" data-ocid="admins.list">
              {adminsQuery.data.map((entry, idx) => {
                const pid = entry.principal.toString();
                const isMe = pid === myPrincipal;
                return (
                  <AdminRow
                    key={pid}
                    entry={entry}
                    index={idx + 1}
                    isMe={isMe}
                    isSuperAdmin={isSuperAdmin}
                    adminNames={adminNames}
                    onPromote={handlePromote}
                    onDemote={handleDemote}
                    onRemove={handleRemove}
                    isPending={isPending}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Your Profile ───────────────────────────────────────────────── */}
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

        {/* ── How to get your Principal ID — Guide ───────────────────────── */}
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
                        text: "On that screen, your Principal ID is displayed prominently. Copy it and send it to an existing Superadmin.",
                      },
                      {
                        step: 5,
                        text: 'Once the Superadmin adds your Principal ID via the "Add Admin" section below, log out and back in — you\'ll have full access.',
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

        {/* ── Add Admin (Superadmin only) ─────────────────────────────────── */}
        {isSuperAdmin && (
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-sans text-xs font-medium">
                      {adminNames[addInput.trim()]}
                    </span>
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
                disabled={!addInput.trim() || assignRoleWithCheck.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                data-ocid="admin.add_admin.primary_button"
              >
                {assignRoleWithCheck.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add as Admin
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
