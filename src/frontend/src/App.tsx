import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthScreen } from "./components/AuthScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { EventsTab } from "./components/EventsTab";
import { ExploreTab } from "./components/ExploreTab";
import { HotelsTab } from "./components/HotelsTab";
import { LanguageSelectScreen } from "./components/LanguageSelectScreen";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { RentalsTab } from "./components/RentalsTab";
import { RestaurantsTab } from "./components/RestaurantsTab";
import { RoomRentalsTab } from "./components/RoomRentalsTab";
import { ShopTab } from "./components/ShopTab";
import { CommunityBusinessTab } from "./components/community/CommunityBusinessTab";
import { CommunityPermissionsTab } from "./components/community/PermissionsTab";
import { CreatorProfileTab } from "./components/creator/CreatorProfileTab";
import { CreatorDashboard } from "./components/creator/DashboardTab";
import { CreatorModeration } from "./components/creator/ModerationTab";
import { VaultTab } from "./components/creator/VaultTab";
import { CreatorWallet } from "./components/creator/WalletTab";
import { MemberProfileTab } from "./components/member/MemberProfileTab";
import { MembershipTab } from "./components/member/MembershipTab";
import { MemberBusinessTab } from "./components/member/MyBusinessTab";
import { BottomNav } from "./components/shared/BottomNav";
import { DiscoverTab } from "./components/user/DiscoverTab";
import { PostPlaceModal } from "./components/user/PostPlaceModal";
import { SearchTab } from "./components/user/SearchTab";
import { UserProfileTab } from "./components/user/UserProfileTab";
import { useLanguage } from "./context/LanguageContext";
import { initEventsData } from "./data/eventsData";
import { initSeedData } from "./data/seed";
import { useAuth } from "./hooks/useAuth";
import { useData } from "./hooks/useData";

// Init seed data once
initSeedData();
initEventsData();

export default function App() {
  const {
    currentUser,
    login,
    socialLogin,
    signup,
    logout,
    switchAccount,
    updateCurrentUser,
    recoverPassword,
  } = useAuth();
  const data = useData();
  const { t, languageSelected } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [renderTick, setRenderTick] = useState(0);
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    try {
      return (
        (localStorage.getItem("lc_theme_mode") as "dark" | "light") || "dark"
      );
    } catch {
      return "dark";
    }
  });

  // Single lc_data_changed listener for re-renders
  useEffect(() => {
    const handler = () => {
      setRenderTick((n) => n + 1);
      try {
        const mode =
          (localStorage.getItem("lc_theme_mode") as "dark" | "light") || "dark";
        setThemeMode(mode);
      } catch {
        // ignore
      }
    };
    window.addEventListener("lc_data_changed", handler);
    return () => window.removeEventListener("lc_data_changed", handler);
  }, []);

  // Set default tab when user logs in
  useEffect(() => {
    if (currentUser) {
      const defaults: Record<string, string> = {
        user: "explore",
        member: "explore",
        community: "explore",
        creator: "dashboard",
      };
      setActiveTab(defaults[currentUser.role] || "explore");
    }
  }, [currentUser]);

  const handleTabSelect = useCallback((tabId: string) => {
    if (tabId === "post") {
      setShowPostModal(true);
    } else {
      setActiveTab(tabId);
    }
  }, []);

  // Language selection gate
  if (!languageSelected) {
    return (
      <>
        <LanguageSelectScreen />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onLogin={login}
          onSignup={signup}
          onSocialLogin={socialLogin}
          onRecoverPassword={recoverPassword}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const accounts = data.getAccounts();
  const posts = data.getPosts();
  const reviews = data.getReviews();
  const locationReviews = data.getLocationReviews();
  const violations = data.getViolations();
  const permissionRequests = data.getPermissionRequests();
  const walletTransactions = data.getWalletTransactions();
  const flagReports = data.getFlagReports();
  const members = accounts.filter((a) => a.role === "member");
  // suppress unused renderTick lint
  void renderTick;

  const USER_NAV = [
    { id: "explore", icon: "explore", label: t("explore") },
    { id: "events", icon: "event", label: t("events") },
    { id: "post", icon: "add_circle", label: t("post") },
    { id: "search", icon: "search", label: t("search") },
    { id: "profile", icon: "person", label: t("profile") },
    { id: "discover", icon: "travel_explore", label: t("discover") },
    { id: "restaurants", icon: "restaurant", label: t("restaurants") },
    { id: "rentals", icon: "directions_car", label: t("rentals") },
    { id: "shop", icon: "storefront", label: t("shop") },
    { id: "hotels", icon: "hotel", label: t("hotels") },
    { id: "rooms", icon: "meeting_room", label: t("rooms") },
  ];

  const MEMBER_NAV = [
    { id: "explore", icon: "explore", label: t("explore") },
    { id: "business", icon: "store", label: t("business") },
    { id: "membership", icon: "card_membership", label: t("membership") },
    { id: "search", icon: "search", label: t("search") },
    { id: "profile", icon: "person", label: t("profile") },
    { id: "events", icon: "event", label: t("events") },
    { id: "restaurants", icon: "restaurant", label: t("restaurants") },
    { id: "rentals", icon: "directions_car", label: t("rentals") },
    { id: "shop", icon: "storefront", label: t("shop") },
    { id: "hotels", icon: "hotel", label: t("hotels") },
    { id: "rooms", icon: "meeting_room", label: t("rooms") },
  ];

  const COMMUNITY_NAV = [
    { id: "explore", icon: "explore", label: t("explore") },
    { id: "business", icon: "store", label: t("business") },
    { id: "permissions", icon: "key", label: t("permissions") },
    { id: "search", icon: "search", label: t("search") },
    { id: "profile", icon: "person", label: t("profile") },
    { id: "events", icon: "event", label: t("events") },
    { id: "restaurants", icon: "restaurant", label: t("restaurants") },
    { id: "rentals", icon: "directions_car", label: t("rentals") },
    { id: "shop", icon: "storefront", label: t("shop") },
    { id: "hotels", icon: "hotel", label: t("hotels") },
    { id: "rooms", icon: "meeting_room", label: t("rooms") },
  ];

  const CREATOR_NAV = [
    { id: "dashboard", icon: "dashboard", label: t("dashboard") },
    { id: "explore", icon: "explore", label: t("explore") },
    { id: "discover", icon: "travel_explore", label: t("discover") },
    { id: "restaurants", icon: "restaurant", label: t("restaurants") },
    { id: "rentals", icon: "directions_car", label: t("rentals") },
    { id: "shop", icon: "storefront", label: t("shop") },
    { id: "hotels", icon: "hotel", label: t("hotels") },
    { id: "rooms", icon: "meeting_room", label: t("rooms") },
    { id: "events", icon: "event", label: t("events") },
    { id: "vault", icon: "inventory_2", label: t("vault") },
    { id: "wallet", icon: "account_balance_wallet", label: t("wallet") },
    { id: "moderation", icon: "shield", label: t("moderation") },
    { id: "profile", icon: "person", label: t("profile") },
  ];

  const navItems =
    currentUser.role === "user"
      ? USER_NAV
      : currentUser.role === "member"
        ? MEMBER_NAV
        : currentUser.role === "community"
          ? COMMUNITY_NAV
          : CREATOR_NAV;

  const isCreator = currentUser.role === "creator";
  const isSuspended = currentUser.status === "suspended";

  const roleColors: Record<string, string> = {
    creator: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    member: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    community: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    user: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <div
      className={`min-h-screen bg-background${themeMode === "light" ? " light-mode" : ""}`}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img
              src="/assets/ladakh-connect-logo.png"
              alt="Logo"
              className="w-7 h-7"
            />
            <span
              className="text-base amber-text"
              style={{
                fontFamily: "PlayfairDisplay, serif",
                fontStyle: "italic",
                fontWeight: 700,
              }}
            >
              Ladakh Connect
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <span
              className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                roleColors[currentUser.role] || roleColors.user
              }`}
            >
              {currentUser.role}
            </span>
            {currentUser.profilePhoto ? (
              <img
                src={currentUser.profilePhoto}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                {currentUser.username[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
        {isCreator && (
          <div className="flex gap-0 overflow-x-auto scrollbar-hide border-t border-border">
            {CREATOR_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium transition-all border-b-2 ${
                  activeTab === item.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main
        className={`max-w-lg mx-auto px-4 pb-32 ${isCreator ? "pt-28" : "pt-20"}`}
      >
        {isSuspended && (
          <div className="mb-4 bg-yellow-500/15 border border-yellow-500/40 rounded-xl p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-lg">
              warning
            </span>
            <p className="text-sm text-yellow-300">
              Your account is currently <strong>suspended</strong>. Some actions
              are restricted.
            </p>
          </div>
        )}

        {/* USER tabs */}
        {currentUser.role === "user" && (
          <>
            {activeTab === "explore" && (
              <ErrorBoundary minimal>
                <ExploreTab
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  locationReviews={locationReviews}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onAddReview={data.addReview}
                  onAddLocationReview={data.addLocationReview}
                />
              </ErrorBoundary>
            )}
            {activeTab === "discover" && (
              <ErrorBoundary minimal>
                <DiscoverTab currentUser={currentUser} />
              </ErrorBoundary>
            )}
            {activeTab === "events" && (
              <ErrorBoundary minimal>
                <EventsTab
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "search" && (
              <ErrorBoundary minimal>
                <SearchTab
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onAddReview={data.addReview}
                />
              </ErrorBoundary>
            )}
            {activeTab === "profile" && (
              <ErrorBoundary minimal>
                <UserProfileTab
                  currentUser={currentUser}
                  posts={posts}
                  violations={violations}
                  onUpdateBio={(bio) => updateCurrentUser({ bio })}
                  onUpdateUser={updateCurrentUser}
                  onLogout={logout}
                  onSwitchAccount={
                    switchAccount
                      ? (id) => {
                          switchAccount(id);
                        }
                      : undefined
                  }
                  onAddAccount={() => logout()}
                />
              </ErrorBoundary>
            )}
            {activeTab === "restaurants" && (
              <ErrorBoundary minimal>
                <RestaurantsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "rentals" && (
              <ErrorBoundary minimal>
                <RentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "shop" && (
              <ErrorBoundary minimal>
                <ShopTab
                  currentUserRole={currentUser.role}
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "hotels" && (
              <ErrorBoundary minimal>
                <HotelsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "rooms" && (
              <ErrorBoundary minimal>
                <RoomRentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
          </>
        )}

        {/* MEMBER tabs */}
        {currentUser.role === "member" && (
          <>
            {activeTab === "explore" && (
              <ErrorBoundary minimal>
                <ExploreTab
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  locationReviews={locationReviews}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onAddReview={data.addReview}
                  onAddLocationReview={data.addLocationReview}
                />
              </ErrorBoundary>
            )}
            {activeTab === "events" && (
              <ErrorBoundary minimal>
                <EventsTab
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "search" && (
              <ErrorBoundary minimal>
                <SearchTab
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onAddReview={data.addReview}
                />
              </ErrorBoundary>
            )}
            {activeTab === "business" && (
              <ErrorBoundary minimal>
                <MemberBusinessTab
                  currentUser={currentUser}
                  reviews={reviews}
                  onUpdate={(updates) => {
                    data.updateAccount(currentUser.id, updates);
                    updateCurrentUser(updates);
                  }}
                  onIssueViolation={data.addViolation}
                />
              </ErrorBoundary>
            )}
            {activeTab === "membership" && (
              <ErrorBoundary minimal>
                <MembershipTab
                  currentUser={currentUser}
                  paymentHistory={JSON.parse(
                    localStorage.getItem(
                      `lc_memberPayments_${currentUser.id}`,
                    ) || "[]",
                  )}
                  onAddPendingPayment={data.addPendingPayment}
                  onUpgrade={(tier) => {
                    data.updateAccount(currentUser.id, {
                      membershipTier: tier,
                      membershipStatus: "active",
                    });
                    updateCurrentUser({
                      membershipTier: tier,
                      membershipStatus: "active",
                    });
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "profile" && (
              <ErrorBoundary minimal>
                <MemberProfileTab
                  currentUser={currentUser}
                  violations={violations}
                  onUpdateBio={(bio) => updateCurrentUser({ bio })}
                  onUpdateUser={updateCurrentUser}
                  onLogout={logout}
                  onSwitchAccount={
                    switchAccount
                      ? (id) => {
                          switchAccount(id);
                        }
                      : undefined
                  }
                  onAddAccount={() => logout()}
                />
              </ErrorBoundary>
            )}
            {activeTab === "restaurants" && (
              <ErrorBoundary minimal>
                <RestaurantsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "rentals" && (
              <ErrorBoundary minimal>
                <RentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "shop" && (
              <ErrorBoundary minimal>
                <ShopTab
                  currentUserRole={currentUser.role}
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "hotels" && (
              <ErrorBoundary minimal>
                <HotelsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "rooms" && (
              <ErrorBoundary minimal>
                <RoomRentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
          </>
        )}

        {/* COMMUNITY tabs */}
        {currentUser.role === "community" && (
          <>
            {activeTab === "explore" && (
              <ErrorBoundary minimal>
                <ExploreTab
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  locationReviews={locationReviews}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onAddReview={data.addReview}
                  onAddLocationReview={data.addLocationReview}
                />
              </ErrorBoundary>
            )}
            {activeTab === "events" && (
              <ErrorBoundary minimal>
                <EventsTab
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "search" && (
              <ErrorBoundary minimal>
                <SearchTab
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onAddReview={data.addReview}
                />
              </ErrorBoundary>
            )}
            {activeTab === "business" && (
              <ErrorBoundary minimal>
                <CommunityBusinessTab
                  currentUser={currentUser}
                  permissionRequests={permissionRequests}
                  onUpdate={(updates) => {
                    data.updateAccount(currentUser.id, updates);
                    updateCurrentUser(updates);
                  }}
                  onRequestPermission={data.addPermissionRequest}
                />
              </ErrorBoundary>
            )}
            {activeTab === "permissions" && (
              <ErrorBoundary minimal>
                <CommunityPermissionsTab
                  currentUser={currentUser}
                  permissionRequests={permissionRequests}
                  violations={violations}
                  members={members}
                  flagReports={flagReports}
                  onRequestPermission={data.addPermissionRequest}
                  onFlagMember={data.addFlagReport}
                  onUpdateUser={(updates) => {
                    data.updateAccount(currentUser.id, updates);
                    updateCurrentUser(updates);
                  }}
                  onLogout={logout}
                  accounts={accounts}
                />
              </ErrorBoundary>
            )}
            {activeTab === "profile" && (
              <ErrorBoundary minimal>
                <MemberProfileTab
                  currentUser={currentUser}
                  violations={violations}
                  onUpdateBio={(bio) => updateCurrentUser({ bio })}
                  onUpdateUser={updateCurrentUser}
                  onLogout={logout}
                  onSwitchAccount={
                    switchAccount
                      ? (id) => {
                          switchAccount(id);
                        }
                      : undefined
                  }
                  onAddAccount={() => logout()}
                />
              </ErrorBoundary>
            )}
            {activeTab === "restaurants" && (
              <ErrorBoundary minimal>
                <RestaurantsTab currentUserRole={currentUser.role} />
              </ErrorBoundary>
            )}
            {activeTab === "rentals" && (
              <ErrorBoundary minimal>
                <RentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "shop" && (
              <ErrorBoundary minimal>
                <ShopTab
                  currentUserRole={currentUser.role}
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "hotels" && (
              <ErrorBoundary minimal>
                <HotelsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "rooms" && (
              <ErrorBoundary minimal>
                <RoomRentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
          </>
        )}

        {/* CREATOR tabs */}
        {currentUser.role === "creator" && (
          <>
            {activeTab === "dashboard" && (
              <ErrorBoundary minimal>
                <CreatorDashboard
                  accounts={accounts}
                  posts={posts}
                  violations={violations}
                  walletBalance={walletTransactions
                    .filter((t) => t.type === "payment")
                    .reduce((s, t) => s + t.amount, 0)}
                />
              </ErrorBoundary>
            )}
            {activeTab === "explore" && (
              <ErrorBoundary minimal>
                <ExploreTab
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  locationReviews={locationReviews}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  isCreator
                  onAddReview={data.addReview}
                  onAddLocationReview={data.addLocationReview}
                  onApprovePost={(id) => {
                    data.updatePost(id, { status: "approved" });
                    toast.success("Post approved!");
                    setRenderTick((n) => n + 1);
                  }}
                  onRejectPost={(id) => {
                    data.deletePost(id);
                    toast.success("Post rejected and removed.");
                    setRenderTick((n) => n + 1);
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "discover" && (
              <ErrorBoundary minimal>
                <DiscoverTab
                  currentUser={currentUser}
                  isCreator
                  onPromoteToExplore={() => setRenderTick((n) => n + 1)}
                />
              </ErrorBoundary>
            )}
            {activeTab === "restaurants" && (
              <ErrorBoundary minimal>
                <RestaurantsTab currentUserRole={currentUser.role} />
              </ErrorBoundary>
            )}
            {activeTab === "rentals" && (
              <ErrorBoundary minimal>
                <RentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "shop" && (
              <ErrorBoundary minimal>
                <ShopTab
                  currentUserRole={currentUser.role}
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "hotels" && (
              <ErrorBoundary minimal>
                <HotelsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "rooms" && (
              <ErrorBoundary minimal>
                <RoomRentalsTab
                  currentUserRole={currentUser.role}
                  currentUser={{
                    id: currentUser.id,
                    username: currentUser.username,
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "events" && (
              <ErrorBoundary minimal>
                <EventsTab
                  currentUser={currentUser}
                  onAddPendingPayment={data.addPendingPayment}
                />
              </ErrorBoundary>
            )}
            {activeTab === "vault" && (
              <ErrorBoundary minimal>
                <VaultTab />
              </ErrorBoundary>
            )}
            {activeTab === "wallet" && (
              <ErrorBoundary minimal>
                <CreatorWallet
                  transactions={walletTransactions}
                  pendingPayments={data.getPendingPayments()}
                  onConfirmPayment={(id) => {
                    const pending = data.getPendingPayments();
                    const p = pending.find((x) => x.id === id);
                    if (p) {
                      const note =
                        p.paymentType === "event"
                          ? `Event Post: ${p.eventTitle || "Event"} from @${p.memberUsername}`
                          : p.paymentType === "announcement"
                            ? `Shop Announcement: ${p.productName || "Product"} from @${p.memberUsername}`
                            : p.paymentType === "room_rental"
                              ? `Room Rental: "${p.roomTitle || "Room"}" from @${p.memberUsername}`
                              : `${p.tier} Membership from @${p.memberUsername}`;
                      data.addWalletTransaction({
                        type: "payment",
                        amount: p.amount,
                        from: p.memberUsername,
                        note,
                      });
                      // Activate room rental if this is a room rental payment
                      if (p.paymentType === "room_rental") {
                        try {
                          const rentals = JSON.parse(
                            localStorage.getItem("lc_room_rentals") || "[]",
                          );
                          const rIdx = rentals.findIndex(
                            (r: any) => r.paymentId === id,
                          );
                          if (rIdx >= 0) {
                            rentals[rIdx].status = "active";
                            localStorage.setItem(
                              "lc_room_rentals",
                              JSON.stringify(rentals),
                            );
                          }
                        } catch {
                          /* safe */
                        }
                      }
                      data.removePendingPayment(id);
                      setRenderTick((n) => n + 1);
                    }
                  }}
                  onRejectPayment={(id) => {
                    data.removePendingPayment(id);
                    setRenderTick((n) => n + 1);
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "moderation" && (
              <ErrorBoundary minimal>
                <CreatorModeration
                  accounts={accounts}
                  violations={violations}
                  permissionRequests={permissionRequests}
                  flagReports={flagReports}
                  onIssueViolation={data.addViolation}
                  onResolveViolation={data.resolveViolation}
                  onUpdatePermissionRequest={data.updatePermissionRequest}
                  onUpdateFlagReport={data.updateFlagReport}
                  onUpdateAccount={data.updateAccount}
                  onBanAccount={(id) => {
                    data.banAccount(id);
                    setRenderTick((n) => n + 1);
                  }}
                  onSuspendAccount={(id) => {
                    data.suspendAccount(id);
                    setRenderTick((n) => n + 1);
                  }}
                />
              </ErrorBoundary>
            )}
            {activeTab === "profile" && (
              <ErrorBoundary minimal>
                <CreatorProfileTab
                  currentUser={currentUser}
                  accounts={accounts}
                  posts={posts}
                  reviews={reviews}
                  violations={violations}
                  walletBalance={walletTransactions
                    .filter((t) => t.type === "payment")
                    .reduce((s, t) => s + t.amount, 0)}
                  onLogout={logout}
                  onUpdateUser={updateCurrentUser}
                  onSwitchAccount={
                    switchAccount
                      ? (id) => {
                          switchAccount(id);
                        }
                      : undefined
                  }
                  onAddAccount={() => logout()}
                  onSetCommunityCode={data.setCommunityCode}
                  specialAccounts={data.getSpecialAccountsList()}
                  onAddSpecialAccount={data.addSpecialAccount}
                  onRemoveSpecialAccount={data.removeSpecialAccount}
                />
              </ErrorBoundary>
            )}
          </>
        )}
      </main>

      {!isCreator && (
        <BottomNav
          items={navItems}
          active={showPostModal ? "post" : activeTab}
          onSelect={handleTabSelect}
        />
      )}

      {showPostModal && currentUser.role === "user" && (
        <PostPlaceModal
          currentUserId={currentUser.id}
          currentUsername={currentUser.username}
          currentUserRole={currentUser.role}
          onClose={() => setShowPostModal(false)}
          onSubmit={(postData) => {
            data.addPost(postData);
            setRenderTick((n) => n + 1);
          }}
          onIssueViolation={data.addViolation}
        />
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
