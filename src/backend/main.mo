import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module CommunityLink {
    public func compare(link1 : CommunityLink, link2 : CommunityLink) : Order.Order {
      if (link1.id < link2.id) { #less } else if (link1.id > link2.id) { #greater } else {
        #equal;
      };
    };
  };

  type CommunityLink = {
    id : Nat;
    title : Text;
    url : Text;
    iconType : Text;
  };

  type DashboardStats = {
    newApplications : Nat;
    totalRevenue : Text;
    reportsCount : Nat;
    applicationsTrend : Text;
    payoutNote : Text;
  };

  type PaymentInfo = {
    bankName : Text;
    lastFour : Text;
    status : Text;
  };

  type ModerationCounts = {
    flaggedComments : Nat;
    pendingReviews : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Persistent state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let communityLinks = Map.empty<Nat, CommunityLink>();
  var nextLinkId = 3;

  let userProfiles = Map.empty<Principal, UserProfile>();

  let initialStats : DashboardStats = {
    newApplications = 0;
    totalRevenue = "₹0";
    reportsCount = 0;
    applicationsTrend = "Stable";
    payoutNote = "No payouts pending.";
  };

  var dashboardStats : DashboardStats = initialStats;

  let initialPaymentInfo : PaymentInfo = {
    bankName = "Sample Bank";
    lastFour = "1234";
    status = "Active";
  };

  var paymentInfo : PaymentInfo = initialPaymentInfo;

  let initialModerationCounts : ModerationCounts = {
    flaggedComments = 0;
    pendingReviews = 0;
  };

  var moderationCounts : ModerationCounts = initialModerationCounts;

  // Seed with 2 sample Ladakh-themed links
  communityLinks.add(1, {
    id = 1;
    title = "Ladakh Tourism";
    url = "https://www.leh-ladakh.com";
    iconType = "🏔️";
  });

  communityLinks.add(2, {
    id = 2;
    title = "Pangong Lake Guide";
    url = "https://www.pangonglake.info";
    iconType = "🌊";
  });

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Community Links CRUD
  public shared ({ caller }) func addCommunityLink(title : Text, url : Text, iconType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add community links");
    };
    let newLink : CommunityLink = {
      id = nextLinkId;
      title = title;
      url = url;
      iconType = iconType;
    };
    communityLinks.add(nextLinkId, newLink);
    nextLinkId += 1;
  };

  public shared ({ caller }) func editCommunityLink(id : Nat, title : Text, url : Text, iconType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit community links");
    };
    switch (communityLinks.get(id)) {
      case null {
        Runtime.trap("Community link not found");
      };
      case (?_) {
        let updatedLink : CommunityLink = {
          id = id;
          title = title;
          url = url;
          iconType = iconType;
        };
        communityLinks.add(id, updatedLink);
      };
    };
  };

  public shared ({ caller }) func deleteCommunityLink(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete community links");
    };
    switch (communityLinks.get(id)) {
      case null {
        Runtime.trap("Community link not found");
      };
      case (?_) {
        communityLinks.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllCommunityLinks() : async [CommunityLink] {
    // Public access - no authorization check needed
    communityLinks.values().toArray();
  };

  // Dashboard Stats - Read Only (Public)
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    // Public access - no authorization check needed
    dashboardStats;
  };

  public shared ({ caller }) func updateDashboardStats(newStats : DashboardStats) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update dashboard stats");
    };
    dashboardStats := newStats;
  };

  // Payment Info - Admin Only
  public shared ({ caller }) func updatePaymentInfo(newInfo : PaymentInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment info");
    };
    paymentInfo := newInfo;
  };

  public query ({ caller }) func getPaymentInfo() : async PaymentInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view payment info");
    };
    paymentInfo;
  };

  // Moderation Counts - Admin Only
  public shared ({ caller }) func updateModerationCounts(newCounts : ModerationCounts) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update moderation counts");
    };
    moderationCounts := newCounts;
  };

  public query ({ caller }) func getModerationCounts() : async ModerationCounts {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view moderation counts");
    };
    moderationCounts;
  };
};
