import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StaffMember {
    id: bigint;
    bio: string;
    displayOrder: bigint;
    name: string;
    role: string;
}
export interface AdminEntry {
    principal: Principal;
    isSuperAdmin: boolean;
}
export interface ActivityLogEntry {
    id: string;
    action: string;
    adminName: string;
    timestamp: bigint;
    details: string;
    principalText: string;
}
export interface GalleryImage {
    id: string;
    displayOrder: bigint;
    createdAt: bigint;
    storageKey: string;
    altText: string;
}
export interface Booking {
    id: string;
    status: string;
    date: string;
    name: string;
    createdAt: bigint;
    email: string;
    notes: string;
    timeSlot: string;
    courtType: string;
}
export interface MembershipTier {
    id: bigint;
    displayOrder: bigint;
    name: string;
    benefits: Array<string>;
    price: string;
}
export interface Enquiry {
    id: string;
    status: string;
    tierId: string;
    name: string;
    createdAt: bigint;
    email: string;
    message: string;
    phone: string;
}
export interface Announcement {
    id: bigint;
    title: string;
    body: string;
    published: boolean;
    createdAt: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGalleryImage(storageKey: string, altText: string, displayOrder: bigint): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignCallerUserRoleWithSuperAdminCheck(user: Principal, role: UserRole): Promise<void>;
    claimFirstAdmin(): Promise<boolean>;
    createAnnouncement(title: string, body: string): Promise<bigint>;
    createMembershipTier(name: string, price: string, benefits: Array<string>, displayOrder: bigint): Promise<bigint>;
    createStaffMember(name: string, role: string, bio: string, displayOrder: bigint): Promise<bigint>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteGalleryImage(id: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteMembershipTier(id: bigint): Promise<void>;
    deleteStaffMember(id: bigint): Promise<void>;
    getActivityLog(limit: bigint): Promise<Array<ActivityLogEntry>>;
    getAllAdmins(): Promise<Array<AdminEntry>>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllContent(): Promise<Array<[string, string]>>;
    getAllEnquiries(): Promise<Array<Enquiry>>;
    getAllGalleryImages(): Promise<Array<GalleryImage>>;
    getAllMembershipTiers(): Promise<Array<MembershipTier>>;
    getAllStaffMembers(): Promise<Array<StaffMember>>;
    getAnnouncement(id: bigint): Promise<Announcement>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContentByKey(key: string): Promise<string>;
    getMembershipTier(id: bigint): Promise<MembershipTier>;
    getPublishedAnnouncements(): Promise<Array<Announcement>>;
    getStaffMember(id: bigint): Promise<StaffMember>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAnyAdmin(): Promise<boolean>;
    initDefaultContent(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerSuperAdmin(): Promise<boolean>;
    reorderGalleryImages(ids: Array<string>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAnnouncementPublished(id: bigint, published: boolean): Promise<void>;
    setContentByKey(key: string, content: string): Promise<void>;
    setSuperAdmin(user: Principal, promote: boolean): Promise<void>;
    submitBooking(name: string, email: string, date: string, timeSlot: string, courtType: string, notes: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitEnquiry(name: string, email: string, phone: string, tierId: string, message: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateAnnouncement(id: bigint, title: string, body: string): Promise<void>;
    updateBookingStatus(id: string, status: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateEnquiryStatus(id: string, status: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateGalleryImage(id: string, altText: string, displayOrder: bigint): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateMembershipTier(id: bigint, name: string, price: string, benefits: Array<string>, displayOrder: bigint): Promise<void>;
    updateStaffMember(id: bigint, name: string, role: string, bio: string, displayOrder: bigint): Promise<void>;
}
