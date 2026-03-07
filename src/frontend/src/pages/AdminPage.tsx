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
  Loader2,
  LogOut,
  Pencil,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  Announcement,
  MembershipTier,
  StaffMember,
} from "../backend.d.ts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

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
export { Loader2, PlusCircle, Pencil, Trash2, Check, X };

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
  const { clear } = useInternetIdentity();
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="absolute inset-0 court-texture opacity-20" />
      <div
        className="relative z-10 bg-card rounded-lg border border-border shadow-club p-10 max-w-sm w-full text-center"
        data-ocid="admin.error_state"
      >
        <div className="font-display text-xl font-bold text-foreground mb-2">
          Access Denied
        </div>
        <p className="font-sans text-sm text-muted-foreground mb-7">
          Your account does not have admin privileges. Contact the club
          administrator for access.
        </p>
        <Button
          variant="outline"
          onClick={clear}
          className="font-sans"
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
function Dashboard() {
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
              <AdminAdminsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  if (isInitializing || adminLoading) {
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

  if (!identity) {
    return <LoginScreen />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <Dashboard />;
}
