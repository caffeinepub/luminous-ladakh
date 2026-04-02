import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthScreen } from "./components/AuthScreen";
import { EventsTab } from "./components/EventsTab";
import { ExploreTab } from "./components/ExploreTab";
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
import { initEventsData } from "./data/eventsData";
import { initSeedData } from "./data/seed";
import { useAuth } from "./hooks/useAuth";
import { useData } from "./hooks/useData";

// Init seed data once
initSeedData();
initEventsData();

const USER_NAV = [
  { id: "explore", icon: "explore", label: "Explore" },
  { id: "discover", icon: "travel_explore", label: "Discover" },
  { id: "events", icon: "event", label: "Events" },
  { id: "search", icon: "search", label: "Search" },
  { id: "post", icon: "add_circle", label: "Post" },
  { id: "profile", icon: "person", label: "Profile" },
];

const MEMBER_NAV = [
  { id: "explore", icon: "explore", label: "Explore" },
  { id: "events", icon: "event", label: "Events" },
  { id: "search", icon: "search", label: "Search" },
  { id: "business", icon: "store", label: "My Business" },
  { id: "membership", icon: "card_membership", label: "Membership" },
  { id: "profile", icon: "person", label: "Profile" },
];

const COMMUNITY_NAV = [
  { id: "explore", icon: "explore", label: "Explore" },
  { id: "events", icon: "event", label: "Events" },
  { id: "search", icon: "search", label: "Search" },
  { id: "business", icon: "store", label: "My Business" },
  { id: "permissions", icon: "key", label: "Permissions" },
  { id: "profile", icon: "person", label: "Profile" },
];

const CREATOR_NAV = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "explore", icon: "explore", label: "Explore" },
  { id: "discover", icon: "travel_explore", label: "Discover" },
  { id: "events", icon: "event", label: "Events" },
  { id: "vault", icon: "inventory_2", label: "Vault" },
  { id: "wallet", icon: "account_balance_wallet", label: "Wallet" },
  { id: "moderation", icon: "shield", label: "Moderation" },
  { id: "profile", icon: "person", label: "Profile" },
];

export default function App() {
  const { currentUser, login, socialLogin, signup, logout, updateCurrentUser } =
    useAuth();
  const data = useData();
  const [activeTab, setActiveTab] = useState<string>("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [_renderTick, setRenderTick] = useState(0);

  useEffect(() => {
    const handler = () => setRenderTick((t) => t + 1);
    window.addEventListener("lc_data_changed", handler);
    return () => window.removeEventListener("lc_data_changed", handler);
  }, []);

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

  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onLogin={login}
          onSignup={signup}
          onSocialLogin={socialLogin}
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
  const walletBalance = data.getWalletBalance();
  const walletTransactions = data.getWalletTransactions();
  const flagReports = data.getFlagReports();
  const members = accounts.filter((a) => a.role === "member");

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
    <div className="min-h-screen bg-background">
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
            <span
              className={`text-xs px-2 py-0.5 rounded-full border capitalize ${roleColors[currentUser.role] || roleColors.user}`}
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
        className={`max-w-lg mx-auto px-4 pb-24 ${isCreator ? "pt-28" : "pt-20"}`}
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
            )}
            {activeTab === "discover" && (
              <DiscoverTab currentUser={currentUser} />
            )}
            {activeTab === "events" && (
              <EventsTab
                currentUser={currentUser}
                onAddPendingPayment={data.addPendingPayment}
              />
            )}
            {activeTab === "search" && (
              <SearchTab
                accounts={accounts}
                posts={posts}
                reviews={reviews}
                currentUserId={currentUser.id}
                currentUserRole={currentUser.role}
                onAddReview={data.addReview}
              />
            )}
            {activeTab === "profile" && (
              <UserProfileTab
                currentUser={currentUser}
                posts={posts}
                violations={violations}
                onUpdateBio={(bio) => updateCurrentUser({ bio })}
                onUpdateUser={updateCurrentUser}
                onLogout={logout}
              />
            )}
          </>
        )}

        {/* MEMBER tabs */}
        {currentUser.role === "member" && (
          <>
            {activeTab === "explore" && (
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
            )}
            {activeTab === "events" && (
              <EventsTab
                currentUser={currentUser}
                onAddPendingPayment={data.addPendingPayment}
              />
            )}
            {activeTab === "search" && (
              <SearchTab
                accounts={accounts}
                posts={posts}
                reviews={reviews}
                currentUserId={currentUser.id}
                currentUserRole={currentUser.role}
                onAddReview={data.addReview}
              />
            )}
            {activeTab === "business" && (
              <MemberBusinessTab
                currentUser={currentUser}
                reviews={reviews}
                onUpdate={(updates) => {
                  data.updateAccount(currentUser.id, updates);
                  updateCurrentUser(updates);
                }}
                onIssueViolation={data.addViolation}
              />
            )}
            {activeTab === "membership" && (
              <MembershipTab
                currentUser={currentUser}
                paymentHistory={JSON.parse(
                  localStorage.getItem(`lc_memberPayments_${currentUser.id}`) ||
                    "[]",
                )}
              />
            )}
            {activeTab === "profile" && (
              <MemberProfileTab
                currentUser={currentUser}
                violations={violations}
                onUpdateBio={(bio) => updateCurrentUser({ bio })}
                onUpdateUser={updateCurrentUser}
                onLogout={logout}
              />
            )}
          </>
        )}

        {/* COMMUNITY tabs */}
        {currentUser.role === "community" && (
          <>
            {activeTab === "explore" && (
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
            )}
            {activeTab === "events" && (
              <EventsTab
                currentUser={currentUser}
                onAddPendingPayment={data.addPendingPayment}
              />
            )}
            {activeTab === "search" && (
              <SearchTab
                accounts={accounts}
                posts={posts}
                reviews={reviews}
                currentUserId={currentUser.id}
                currentUserRole={currentUser.role}
                onAddReview={data.addReview}
              />
            )}
            {activeTab === "business" && (
              <CommunityBusinessTab
                currentUser={currentUser}
                permissionRequests={permissionRequests}
                onUpdate={(updates) => {
                  data.updateAccount(currentUser.id, updates);
                  updateCurrentUser(updates);
                }}
                onRequestPermission={data.addPermissionRequest}
              />
            )}
            {activeTab === "permissions" && (
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
              />
            )}
            {activeTab === "profile" && (
              <MemberProfileTab
                currentUser={currentUser}
                violations={violations}
                onUpdateBio={(bio) => updateCurrentUser({ bio })}
                onUpdateUser={updateCurrentUser}
                onLogout={logout}
              />
            )}
          </>
        )}

        {/* CREATOR tabs */}
        {currentUser.role === "creator" && (
          <>
            {activeTab === "dashboard" && (
              <CreatorDashboard
                accounts={accounts}
                posts={posts}
                violations={violations}
                walletBalance={walletBalance}
              />
            )}
            {activeTab === "explore" && (
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
                  setRenderTick((t) => t + 1);
                }}
                onRejectPost={(id) => {
                  data.deletePost(id);
                  toast.success("Post rejected and removed.");
                  setRenderTick((t) => t + 1);
                }}
              />
            )}
            {activeTab === "discover" && (
              <DiscoverTab
                currentUser={currentUser}
                isCreator
                onPromoteToExplore={() => {
                  setRenderTick((t) => t + 1);
                }}
              />
            )}
            {activeTab === "events" && (
              <EventsTab
                currentUser={currentUser}
                onAddPendingPayment={data.addPendingPayment}
              />
            )}
            {activeTab === "vault" && <VaultTab />}
            {activeTab === "wallet" && (
              <CreatorWallet
                balance={walletBalance}
                transactions={walletTransactions}
                pendingPayments={data.getPendingPayments()}
                members={members}
                onWithdraw={(amount, bankName) => {
                  data.addWalletTransaction({
                    type: "withdrawal",
                    amount,
                    bankName,
                    note: `Withdrawal to ${bankName}`,
                  });
                  setRenderTick((t) => t + 1);
                }}
                onConfirmPayment={(id) => {
                  const pending = data.getPendingPayments();
                  const p = pending.find((x) => x.id === id);
                  if (p) {
                    const note =
                      p.paymentType === "event"
                        ? `Event Post: ${p.eventTitle || "Event"} from @${p.memberUsername}`
                        : `${p.tier} Membership from @${p.memberUsername}`;
                    data.addWalletTransaction({
                      type: "payment",
                      amount: p.amount,
                      from: p.memberUsername,
                      note,
                    });
                    data.removePendingPayment(id);
                    setRenderTick((t) => t + 1);
                  }
                }}
                onRejectPayment={(id) => {
                  data.removePendingPayment(id);
                  setRenderTick((t) => t + 1);
                }}
              />
            )}
            {activeTab === "moderation" && (
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
                  setRenderTick((t) => t + 1);
                }}
                onSuspendAccount={(id) => {
                  data.suspendAccount(id);
                  setRenderTick((t) => t + 1);
                }}
              />
            )}
            {activeTab === "profile" && (
              <CreatorProfileTab
                currentUser={currentUser}
                accounts={accounts}
                posts={posts}
                reviews={reviews}
                violations={violations}
                walletBalance={walletBalance}
                onLogout={logout}
                onUpdateUser={updateCurrentUser}
                onSetCommunityCode={data.setCommunityCode}
              />
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
            setRenderTick((t) => t + 1);
          }}
          onIssueViolation={data.addViolation}
        />
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
