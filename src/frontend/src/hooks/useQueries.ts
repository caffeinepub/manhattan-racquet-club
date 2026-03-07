import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Announcement,
  MembershipTier,
  StaffMember,
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
