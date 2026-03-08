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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Copy,
  Loader2,
  LogOut,
  Pencil,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  Announcement,
  MembershipTier,
  StaffMember,
} from "../backend.d.ts";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

import AdminAdminsTab from "./admin/AdminAdminsTab";
import AdminAnnouncementsTab from "./admin/AdminAnnouncementsTab";
import AdminContentTab from "./admin/AdminContentTab";
import AdminStaffTab from "./admin/AdminStaffTab";
import AdminTiersTab from "./admin/AdminTiersTab";

// ─── Re-exports used by child tabs ────────────────────────────────────────
export type { MembershipTier, StaffMember, Announcement };
export { toast };
export { Button, Input, Textarea, Label, Skeleton, Switch, Badge };
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
};
export { Copy, Loader2, PlusCircle, Pencil, Trash2, Check, X };

// ─── Login Screen ─────────────────────────────────────────────────────────
function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();
  return (
    <div
      className="min-h-screen bg-primary flex items-center justify-center px-6"
      data-ocid="admin.page"
    >
      <div className="absolute inset-0 court-texture opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-card rounded-lg border border-border shadow-club p-10 max-w-sm w-full text-center"
        data-ocid="admin.dialog"
      >
        <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="font-display font-bold text-primary text-lg">
            MRC
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Admin Access
        </h1>
        <p className="font-sans text-sm text-muted-foreground mb-8 leading-relaxed">
          Sign in with your Internet Identity to access the club CMS dashboard.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
          data-ocid="admin.login.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Admin Login"
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────
function AccessDenied() {
  const { clear, identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  function copyPrincipal() {
    if (!myPrincipal) return;
    void navigator.clipboard.writeText(myPrincipal).then(() => {
      toast("Principal ID copied to clipboard.");
    });
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="absolute inset-0 court-texture opacity-20" />
      <div
        className="relative z-10 bg-card rounded-lg border border-border shadow-club p-10 max-w-md w-full text-center"
        data-ocid="admin.error_state"
      >
        <div className="font-display text-xl font-bold text-foreground mb-2">
          Access Denied
        </div>
        <p className="font-sans text-sm text-muted-foreground mb-5">
          Your account does not have admin access. Share your Principal ID below
          with an existing admin so they can add you from the Admins tab.
        </p>
        {myPrincipal && (
          <div className="mb-6 text-left">
            <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Your Principal ID
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs bg-muted rounded px-3 py-2 text-foreground break-all">
                {myPrincipal}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyPrincipal}
                className="shrink-0 font-sans text-xs"
                data-ocid="admin.access_denied.button"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </Button>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          onClick={clear}
          className="font-sans w-full"
          data-ocid="admin.logout.secondary_button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────
function Dashboard({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { clear, identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();
  const short = principal ? `${principal.slice(0, 8)}…` : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-sidebar border-b border-sidebar-border px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm bg-sidebar-primary/20 flex items-center justify-center">
            <span className="font-display font-bold text-sidebar-primary text-xs">
              MRC
            </span>
          </div>
          <span className="font-sans text-sm font-semibold text-sidebar-foreground">
            CMS Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          {short && (
            <span className="font-mono text-xs text-sidebar-foreground/50 hidden sm:block">
              {short}
            </span>
          )}
          {/* Role badge */}
          {isSuperAdmin ? (
            <Badge
              className="font-sans text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 hidden sm:inline-flex"
              variant="outline"
              data-ocid="admin.superadmin.toggle"
            >
              Superadmin
            </Badge>
          ) : (
            <Badge
              className="font-sans text-xs font-semibold px-2 py-0.5 hidden sm:inline-flex"
              variant="secondary"
              data-ocid="admin.admin.toggle"
            >
              Admin
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={clear}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent font-sans text-xs"
            data-ocid="admin.logout.button"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            Manhattan Racquet Club
          </h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Manage website content, membership tiers, staff, and announcements.
          </p>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-6 bg-secondary" data-ocid="admin.tab">
              <TabsTrigger
                value="content"
                className="font-sans text-sm"
                data-ocid="admin.content.tab"
              >
                Site Content
              </TabsTrigger>
              <TabsTrigger
                value="tiers"
                className="font-sans text-sm"
                data-ocid="admin.tiers.tab"
              >
                Membership
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="font-sans text-sm"
                data-ocid="admin.staff.tab"
              >
                Staff
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="font-sans text-sm"
                data-ocid="admin.announcements.tab"
              >
                Announcements
              </TabsTrigger>
              <TabsTrigger
                value="admins"
                className="font-sans text-sm"
                data-ocid="admin.admins.tab"
              >
                Admins
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <AdminContentTab />
            </TabsContent>
            <TabsContent value="tiers">
              <AdminTiersTab />
            </TabsContent>
            <TabsContent value="staff">
              <AdminStaffTab />
            </TabsContent>
            <TabsContent value="announcements">
              <AdminAnnouncementsTab />
            </TabsContent>
            <TabsContent value="admins">
              <AdminAdminsTab isSuperAdmin={isSuperAdmin} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Auth state type ──────────────────────────────────────────────────────
type AdminAuthState = "loading" | "login" | "dashboard" | "denied";

// ─── Main Admin Page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [authState, setAuthState] = useState<AdminAuthState>("loading");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  // Track which identity we've already processed to avoid re-running the flow
  const processedPrincipal = useRef<string | null>(null);

  useEffect(() => {
    // Wait until identity and actor are both ready
    if (isInitializing || actorFetching) return;

    // No identity → show login
    if (!identity) {
      processedPrincipal.current = null;
      setAuthState("login");
      return;
    }

    if (!actor) return;

    const principal = identity.getPrincipal().toString();

    // Don't re-run the flow for the same principal
    if (processedPrincipal.current === principal) return;

    let cancelled = false;

    async function runAuthFlow() {
      setAuthState("loading");
      try {
        const hasAdmin = await actor!.hasAnyAdmin();

        if (cancelled) return;

        if (!hasAdmin) {
          // No admin yet — try to claim the first-admin slot
          const claimed = await actor!.claimFirstAdmin();
          if (cancelled) return;
          if (claimed) {
            processedPrincipal.current = principal;
            // First admin is always superadmin
            setIsSuperAdmin(true);
            setAuthState("dashboard");
          } else {
            // Race condition: someone else claimed it first
            processedPrincipal.current = principal;
            setAuthState("denied");
          }
        } else {
          // Admin already exists — check if this caller is an admin
          let isAdmin = false;
          let superAdmin = false;
          try {
            [isAdmin, superAdmin] = await Promise.all([
              actor!.isCallerAdmin(),
              actor!.isCallerSuperAdmin(),
            ]);
          } catch {
            isAdmin = false;
            superAdmin = false;
          }
          if (cancelled) return;
          processedPrincipal.current = principal;
          setIsSuperAdmin(superAdmin);
          setAuthState(isAdmin ? "dashboard" : "denied");
        }
      } catch {
        if (!cancelled) {
          processedPrincipal.current = principal;
          setAuthState("denied");
        }
      }
    }

    void runAuthFlow();

    return () => {
      cancelled = true;
    };
  }, [identity, actor, isInitializing, actorFetching]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="absolute inset-0 court-texture opacity-20" />
        <div
          className="relative z-10 flex flex-col items-center gap-3"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="w-8 h-8 text-primary-foreground/60 animate-spin" />
          <span className="font-sans text-sm text-primary-foreground/60">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (authState === "login") {
    return <LoginScreen />;
  }

  if (authState === "denied") {
    return <AccessDenied />;
  }

  return <Dashboard isSuperAdmin={isSuperAdmin} />;
}
