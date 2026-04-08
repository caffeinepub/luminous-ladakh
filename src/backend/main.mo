import Order "mo:core/Order";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
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
  let communityLinks = Map.empty<Nat, CommunityLink>();
  var nextLinkId = 3;

  let userProfiles = Map.empty<Principal, UserProfile>();

  var dashboardStats : DashboardStats = {
    newApplications = 0;
    totalRevenue = "₹0";
    reportsCount = 0;
    applicationsTrend = "Stable";
    payoutNote = "No payouts pending.";
  };

  var paymentInfo : PaymentInfo = {
    bankName = "Sample Bank";
    lastFour = "1234";
    status = "Active";
  };

  var moderationCounts : ModerationCounts = {
    flaggedComments = 0;
    pendingReviews = 0;
  };

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
  public query func getCallerUserProfile() : async ?UserProfile {
    null;
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Community Links CRUD
  public shared func addCommunityLink(title : Text, url : Text, iconType : Text) : async () {
    let newLink : CommunityLink = {
      id = nextLinkId;
      title = title;
      url = url;
      iconType = iconType;
    };
    communityLinks.add(nextLinkId, newLink);
    nextLinkId += 1;
  };

  public shared func editCommunityLink(id : Nat, title : Text, url : Text, iconType : Text) : async () {
    switch (communityLinks.get(id)) {
      case null {};
      case (?_) {
        communityLinks.add(id, { id = id; title = title; url = url; iconType = iconType });
      };
    };
  };

  public shared func deleteCommunityLink(id : Nat) : async () {
    communityLinks.remove(id);
  };

  public query func getAllCommunityLinks() : async [CommunityLink] {
    communityLinks.values().toArray();
  };

  // Dashboard Stats
  public query func getDashboardStats() : async DashboardStats {
    dashboardStats;
  };

  public shared func updateDashboardStats(newStats : DashboardStats) : async () {
    dashboardStats := newStats;
  };

  // Payment Info
  public shared func updatePaymentInfo(newInfo : PaymentInfo) : async () {
    paymentInfo := newInfo;
  };

  public query func getPaymentInfo() : async PaymentInfo {
    paymentInfo;
  };

  // Moderation Counts
  public shared func updateModerationCounts(newCounts : ModerationCounts) : async () {
    moderationCounts := newCounts;
  };

  public query func getModerationCounts() : async ModerationCounts {
    moderationCounts;
  };
};
