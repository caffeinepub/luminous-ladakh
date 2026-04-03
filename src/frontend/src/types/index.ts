export type Role = "user" | "member" | "community" | "creator";

export type BusinessType = "hotel" | "restaurant" | "rental" | "shop" | "other";

export interface RoomType {
  id: string;
  type: "Suite" | "Deluxe" | "Standard" | "Family";
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  availableCount: number;
  photos: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  photo?: string;
  isVeg: boolean;
}

export interface MenuItemReview {
  id: string;
  menuItemId: string;
  businessId: string;
  reviewerUserId: string;
  reviewerUsername: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface RentalAddon {
  id: string;
  vehicleType: string;
  model: string;
  pricePerDay: number;
  pricePerMonth?: number;
  photo?: string;
  available: boolean;
}

export interface PharmacyEntry {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  mapsUrl: string;
  photos: string[];
  videoUrl?: string;
  businessType?: BusinessType;
  phone?: string;
  email?: string;
  roomTypes?: RoomType[];
  menuItems?: MenuItem[];
  rentalAddons?: RentalAddon[];
  lastAvailabilityUpdate?: string;
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
  securityWord?: string;
  failedLoginAttempts?: number;
  lockoutUntil?: string;
  businessName?: string;
  businessCategory?: string;
  businessLocation?: string;
  membershipTier?: "Common" | "Premier";
  membershipStatus?: "active" | "trial" | "suspended";
  businessDescription?: string;
  trialStartDate?: string;
  hotelTrialStartDate?: string;
  businesses?: Business[];
  editPermissionStatus?: "none" | "pending" | "approved" | "denied";
  lastLoginAt?: string;
  lastLogoutAt?: string;
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
  paymentType?: "membership" | "event";
  eventTitle?: string;
}

export interface LCEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  postedBy: string;
  postedByUsername: string;
  postedByRole: string;
  paymentId: string;
  status: "pending" | "approved";
  timestamp: string;
}

export interface DiscoveryPost {
  id: string;
  title: string;
  area: string;
  description: string;
  imageUrl?: string;
  postedBy: string;
  postedByUsername: string;
  timestamp: string;
  upvotes: string[];
  promoted: boolean;
}

export interface RoadStatus {
  id: string;
  name: string;
  status: "open" | "closed" | "caution";
  note?: string;
  updatedBy?: string;
  updatedAt?: string;
}
