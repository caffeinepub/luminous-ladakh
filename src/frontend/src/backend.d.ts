import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CommunityLink {
    id: bigint;
    url: string;
    title: string;
    iconType: string;
}
export interface PaymentInfo {
    status: string;
    bankName: string;
    lastFour: string;
}
export interface DashboardStats {
    totalRevenue: string;
    newApplications: bigint;
    reportsCount: bigint;
    payoutNote: string;
    applicationsTrend: string;
}
export interface UserProfile {
    name: string;
}
export interface ModerationCounts {
    flaggedComments: bigint;
    pendingReviews: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCommunityLink(title: string, url: string, iconType: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCommunityLink(id: bigint): Promise<void>;
    editCommunityLink(id: bigint, title: string, url: string, iconType: string): Promise<void>;
    getAllCommunityLinks(): Promise<Array<CommunityLink>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getModerationCounts(): Promise<ModerationCounts>;
    getPaymentInfo(): Promise<PaymentInfo>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDashboardStats(newStats: DashboardStats): Promise<void>;
    updateModerationCounts(newCounts: ModerationCounts): Promise<void>;
    updatePaymentInfo(newInfo: PaymentInfo): Promise<void>;
}
