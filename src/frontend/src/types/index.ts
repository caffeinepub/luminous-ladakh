export type Role = "user" | "member" | "community" | "creator";

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  mapsUrl: string;
  photos: string[];
  videoUrl?: string;
}

export interface LocationReview {
  id: string;
  locationId: string;
  reviewerUserId: string;
  reviewerUsername: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Account {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: Role;
  electronicId: string;
  avatar?: string;
  profilePhoto?: string;
  bio?: string;
  createdAt: string;
  status?: "active" | "suspended" | "banned";
  theme?: "dark" | "slate" | "warm";
  themePhoto?: string;
  fontColor?: "default" | "gold" | "sky" | "mint" | "rose" | "lavender";
  authProvider?: "email" | "google" | "facebook";
  // member-only (legacy single business)
  businessName?: string;
  businessCategory?: string;
  businessLocation?: string;
  membershipTier?: "Common" | "Premier";
  membershipStatus?: "active" | "trial" | "suspended";
  businessDescription?: string;
  trialStartDate?: string;
  // multi-business array
  businesses?: Business[];
  // community-only
  editPermissionStatus?: "none" | "pending" | "approved" | "denied";
}

export interface Post {
  id: string;
  title: string;
  category: string;
  locationName: string;
  description: string;
  imageUrl?: string;
  googleMapsLink?: string;
  submittedBy: string;
  submitterUsername: string;
  timestamp: string;
  status: "pending" | "approved";
}

export interface Review {
  id: string;
  targetMemberId: string;
  targetMemberName: string;
  reviewerUserId: string;
  reviewerUsername: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Violation {
  id: string;
  targetUserId: string;
  targetUsername: string;
  targetRole: Role;
  level: number;
  reason: string;
  issuedBy: string;
  timestamp: string;
  resolved: boolean;
}

export interface PermissionRequest {
  id: string;
  requesterId: string;
  requesterUsername: string;
  requestedAction: string;
  status: "pending" | "approved" | "denied";
  creatorNote?: string;
  timestamp: string;
}

export interface WalletTransaction {
  id: string;
  type: "payment" | "withdrawal";
  amount: number;
  from?: string;
  bankName?: string;
  timestamp: string;
  note?: string;
}

export interface FlagReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetMemberId: string;
  targetMemberUsername: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  timestamp: string;
}

export interface PendingPayment {
  id: string;
  memberId: string;
  memberUsername: string;
  memberEmail: string;
  amount: number;
  tier: string;
  timestamp: string;
  status: "pending";
}
