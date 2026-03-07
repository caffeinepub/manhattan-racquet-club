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
export interface Announcement {
    id: bigint;
    title: string;
    body: string;
    published: boolean;
    createdAt: bigint;
}
export interface MembershipTier {
    id: bigint;
    displayOrder: bigint;
    name: string;
    benefits: Array<string>;
    price: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAnnouncement(title: string, body: string): Promise<bigint>;
    createMembershipTier(name: string, price: string, benefits: Array<string>, displayOrder: bigint): Promise<bigint>;
    createStaffMember(name: string, role: string, bio: string, displayOrder: bigint): Promise<bigint>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteMembershipTier(id: bigint): Promise<void>;
    deleteStaffMember(id: bigint): Promise<void>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllContent(): Promise<Array<[string, string]>>;
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
    initDefaultContent(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAnnouncementPublished(id: bigint, published: boolean): Promise<void>;
    setContentByKey(key: string, content: string): Promise<void>;
    updateAnnouncement(id: bigint, title: string, body: string): Promise<void>;
    updateMembershipTier(id: bigint, name: string, price: string, benefits: Array<string>, displayOrder: bigint): Promise<void>;
    updateStaffMember(id: bigint, name: string, role: string, bio: string, displayOrder: bigint): Promise<void>;
}
