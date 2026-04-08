// migration.mo — drops old stable variables that no longer exist in the new actor.
// Old fields consumed: accessControlState, initialStats, initialPaymentInfo, initialModerationCounts
// Old fields preserved: communityLinks, dashboardStats, moderationCounts, nextLinkId, paymentInfo, userProfiles
import Map "mo:core/Map";

module {
  // ── Old types (inline — do NOT import from .old/) ────────────────────────
  type UserRole = { #admin; #guest; #user };

  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type OldStats = {
    newApplications : Nat;
    totalRevenue : Text;
    reportsCount : Nat;
    applicationsTrend : Text;
    payoutNote : Text;
  };

  type OldPaymentInfo = {
    bankName : Text;
    lastFour : Text;
    status : Text;
  };

  type OldModerationCounts = {
    flaggedComments : Nat;
    pendingReviews : Nat;
  };

  type OldCommunityLink = {
    id : Nat;
    title : Text;
    url : Text;
    iconType : Text;
  };

  type OldUserProfile = { name : Text };

  // ── Record types matching old/new stable signatures ───────────────────────
  type OldActor = {
    accessControlState : OldAccessControlState;
    communityLinks : Map.Map<Nat, OldCommunityLink>;
    var dashboardStats : OldStats;
    initialModerationCounts : OldModerationCounts;
    initialPaymentInfo : OldPaymentInfo;
    initialStats : OldStats;
    var moderationCounts : OldModerationCounts;
    var nextLinkId : Nat;
    var paymentInfo : OldPaymentInfo;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    communityLinks : Map.Map<Nat, OldCommunityLink>;
    var dashboardStats : OldStats;
    var moderationCounts : OldModerationCounts;
    var nextLinkId : Nat;
    var paymentInfo : OldPaymentInfo;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // ── Migration function ────────────────────────────────────────────────────
  public func run(old : OldActor) : NewActor {
    // Intentionally drop: accessControlState, initialStats, initialPaymentInfo, initialModerationCounts
    {
      communityLinks = old.communityLinks;
      var dashboardStats = old.dashboardStats;
      var moderationCounts = old.moderationCounts;
      var nextLinkId = old.nextLinkId;
      var paymentInfo = old.paymentInfo;
      userProfiles = old.userProfiles;
    };
  };
};
