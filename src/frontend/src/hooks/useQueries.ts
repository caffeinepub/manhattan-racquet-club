import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Announcement,
  MembershipTier,
  StaffMember,
  UserProfile,
} from "../backend.d.ts";
import { useActor } from "./useActor";

// ─── Content ────────────────────────────────────────────────────────────────

export function useAllContent() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, string]>>({
    queryKey: ["content", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContent();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useContentByKey(key: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["content", key],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getContentByKey(key);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSetContent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.setContentByKey(key, value);
    },
    onSuccess: (_data, { key }) => {
      void qc.invalidateQueries({ queryKey: ["content", key] });
      void qc.invalidateQueries({ queryKey: ["content", "all"] });
    },
  });
}

// ─── Init ────────────────────────────────────────────────────────────────────

export function useInitDefaultContent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.initDefaultContent();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["content"] });
      void qc.invalidateQueries({ queryKey: ["tiers"] });
      void qc.invalidateQueries({ queryKey: ["staff"] });
      void qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

// ─── Membership Tiers ────────────────────────────────────────────────────────

export function useAllMembershipTiers() {
  const { actor, isFetching } = useActor();
  return useQuery<MembershipTier[]>({
    queryKey: ["tiers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembershipTiers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateMembershipTier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      price: string;
      benefits: string[];
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createMembershipTier(
        data.name,
        data.price,
        data.benefits,
        data.displayOrder,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tiers"] }),
  });
}

export function useUpdateMembershipTier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      price: string;
      benefits: string[];
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateMembershipTier(
        data.id,
        data.name,
        data.price,
        data.benefits,
        data.displayOrder,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tiers"] }),
  });
}

export function useDeleteMembershipTier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMembershipTier(id);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tiers"] }),
  });
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export function useAllStaffMembers() {
  const { actor, isFetching } = useActor();
  return useQuery<StaffMember[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStaffMembers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateStaffMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      role: string;
      bio: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createStaffMember(
        data.name,
        data.role,
        data.bio,
        data.displayOrder,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useUpdateStaffMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      role: string;
      bio: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStaffMember(
        data.id,
        data.name,
        data.role,
        data.bio,
        data.displayOrder,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useDeleteStaffMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStaffMember(id);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

// ─── Announcements ───────────────────────────────────────────────────────────

export function usePublishedAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["announcements", "published"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedAnnouncements();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAllAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["announcements", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; body: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createAnnouncement(data.title, data.body);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      body: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAnnouncement(data.id, data.title, data.body);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAnnouncement(id);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useSetAnnouncementPublished() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; published: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.setAnnouncementPublished(data.id, data.published);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useHasAnyAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasAnyAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.hasAnyAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.claimFirstAdmin();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["isAdmin"] });
      void qc.invalidateQueries({ queryKey: ["hasAnyAdmin"] });
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", "caller"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userProfile", "caller"] });
    },
  });
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export function useSubmitEnquiry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      tierId: string;
      message: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitEnquiry(
        data.name,
        data.email,
        data.phone,
        data.tierId,
        data.message,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["enquiries"] }),
  });
}

export function useGetAllEnquiries() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d.ts").Enquiry[]>({
    queryKey: ["enquiries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEnquiries();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUpdateEnquiryStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateEnquiryStatus(data.id, data.status);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["enquiries"] }),
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export function useSubmitBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      date: string;
      timeSlot: string;
      courtType: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitBooking(
        data.name,
        data.email,
        data.date,
        data.timeSlot,
        data.courtType,
        data.notes,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d.ts").Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateBookingStatus(data.id, data.status);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export function useGetActivityLog(limit: bigint = BigInt(50)) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d.ts").ActivityLogEntry[]>({
    queryKey: ["activityLog", limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLog(limit);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export function useGetAllGalleryImages() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d.ts").GalleryImage[]>({
    queryKey: ["gallery"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGalleryImages();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAddGalleryImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      storageKey: string;
      altText: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addGalleryImage(
        data.storageKey,
        data.altText,
        data.displayOrder,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useUpdateGalleryImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      altText: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateGalleryImage(data.id, data.altText, data.displayOrder);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useDeleteGalleryImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteGalleryImage(id);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useReorderGalleryImages() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error("No actor");
      return actor.reorderGalleryImages(ids);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

// ─── Admin Management ─────────────────────────────────────────────────────────

export function useAssignUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      user: import("@icp-sdk/core/principal").Principal;
      role: import("../backend.d.ts").UserRole;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignCallerUserRole(data.user, data.role);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useIsCallerSuperAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerSuperAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetAllAdmins() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d.ts").AdminEntry[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAdmins();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSetSuperAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      user: import("@icp-sdk/core/principal").Principal;
      promote: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.setSuperAdmin(data.user, data.promote);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admins"] });
      void qc.invalidateQueries({ queryKey: ["isSuperAdmin"] });
    },
  });
}

export function useAssignUserRoleWithSuperAdminCheck() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      user: import("@icp-sdk/core/principal").Principal;
      role: import("../backend.d.ts").UserRole;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignCallerUserRoleWithSuperAdminCheck(
        data.user,
        data.role,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}
