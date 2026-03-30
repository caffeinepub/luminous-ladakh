import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CommunityLink } from "./backend.d";
import {
  useAddCommunityLink,
  useCommunityLinks,
  useDashboardStats,
  useDeleteCommunityLink,
  useEditCommunityLink,
  useModerationCounts,
  usePaymentInfo,
  useUserProfile,
} from "./hooks/useQueries";

function MatIcon({
  name,
  className = "",
}: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCardSkeleton() {
  return (
    <div className="bg-[#191c1d] p-8 rounded-xl relative overflow-hidden">
      <Skeleton className="h-3 w-32 mb-4 bg-[#282a2b]" />
      <Skeleton className="h-12 w-24 mb-2 bg-[#282a2b]" />
      <Skeleton className="h-3 w-40 bg-[#282a2b]" />
    </div>
  );
}

function LinkItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 bg-[#323536] rounded-xl">
      <Skeleton className="w-12 h-12 rounded-lg bg-[#282a2b]" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40 mb-2 bg-[#282a2b]" />
        <Skeleton className="h-3 w-56 bg-[#282a2b]" />
      </div>
    </div>
  );
}

interface LinkFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, url: string) => void;
  isPending: boolean;
  initial?: { title: string; url: string };
  mode: "add" | "edit";
}

function LinkFormDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  initial,
  mode,
}: LinkFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setUrl(initial?.url ?? "");
    }
  }, [open, initial?.title, initial?.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSubmit(title.trim(), url.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-[#1d2021] border-[#43474f]/30 text-[#e1e3e4] max-w-md"
        data-ocid={mode === "add" ? "link.dialog" : "link.edit.dialog"}
      >
        <DialogHeader>
          <DialogTitle className="font-headline text-xl text-[#e1e3e4]">
            {mode === "add" ? "Add New Link" : "Edit Link"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[#c3c6d1] text-xs uppercase tracking-wider">
              Title
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pangong Lake Guide"
              className="bg-[#282a2b] border-[#43474f]/40 text-[#e1e3e4] placeholder:text-[#8d919a] focus:border-[#b2c5ff]/50"
              data-ocid="link.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#c3c6d1] text-xs uppercase tracking-wider">
              URL
            </Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="bg-[#282a2b] border-[#43474f]/40 text-[#e1e3e4] placeholder:text-[#8d919a] focus:border-[#b2c5ff]/50"
              data-ocid="link.input"
            />
          </div>
          <DialogFooter className="pt-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#c3c6d1] bg-[#282a2b] hover:bg-[#323536] transition-colors"
              data-ocid="link.cancel_button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim() || !url.trim()}
              className="px-5 py-2 rounded-full text-sm font-bold bg-[#b2c5ff] text-[#002b73] hover:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-ocid="link.submit_button"
            >
              {isPending
                ? "Saving..."
                : mode === "add"
                  ? "Add Link"
                  : "Save Changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Explore View ─────────────────────────────────────────────────────────────

const destinations = [
  {
    name: "Pangong Lake",
    icon: "water",
    color: "#b2c5ff",
    desc: "A breathtaking high-altitude salt lake stretching across India and China at 4,350m, famous for its vivid color shifts.",
    tag: "Lakes",
  },
  {
    name: "Nubra Valley",
    icon: "terrain",
    color: "#3cdccf",
    desc: "A tri-armed valley beyond Khardung La, home to Bactrian camels, sand dunes, and ancient monasteries.",
    tag: "Valleys",
  },
  {
    name: "Leh Palace",
    icon: "castle",
    color: "#ffb77a",
    desc: "A nine-storey palace built in the 17th century overlooking Leh town — a crumbling echo of Ladakh's royal era.",
    tag: "Heritage",
  },
  {
    name: "Khardung La Pass",
    icon: "landscape",
    color: "#b2c5ff",
    desc: "One of the world's highest motorable passes at 5,359m, gateway to Nubra Valley and Shyok region.",
    tag: "Passes",
  },
  {
    name: "Hemis Monastery",
    icon: "temple_buddhist",
    color: "#ffb77a",
    desc: "The largest and wealthiest monastery in Ladakh, hosting the famous Hemis Festival every summer.",
    tag: "Monasteries",
  },
  {
    name: "Magnetic Hill",
    icon: "explore",
    color: "#3cdccf",
    desc: "An optical illusion on NH1 where vehicles appear to roll uphill — a gravitational anomaly that mystifies travelers.",
    tag: "Wonders",
  },
];

function ExploreView() {
  return (
    <motion.div
      key="explore"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-10">
        <span className="text-[#ffb77a] font-label text-sm uppercase tracking-[0.2em] mb-2 block">
          Discover the Region
        </span>
        <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-[#e1e3e4]">
          Explore <span className="text-[#b2c5ff]">Ladakh</span>
        </h2>
        <p className="text-[#8d919a] mt-3 max-w-xl">
          Curated destinations, hidden gems, and essential travel knowledge for
          the world's highest plateau.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest, idx) => (
          <motion.div
            key={dest.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.07 }}
            className="bg-[#191c1d] p-7 rounded-xl border border-[#43474f]/10 group hover:border-[#43474f]/40 transition-all cursor-pointer"
            data-ocid={`explore.item.${idx + 1}`}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${dest.color}18` }}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ color: dest.color }}
                >
                  {dest.icon}
                </span>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
                style={
                  {
                    background: `${dest.color}18`,
                    color: dest.color,
                  } as React.CSSProperties
                }
              >
                {dest.tag}
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#e1e3e4] mb-2 group-hover:text-[#b2c5ff] transition-colors">
              {dest.name}
            </h3>
            <p className="text-sm text-[#8d919a] leading-relaxed">
              {dest.desc}
            </p>
            <div
              className="mt-5 flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: dest.color } as React.CSSProperties}
            >
              <span>View Guide</span>
              <MatIcon name="arrow_forward" className="text-sm" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Vault View ────────────────────────────────────────────────────────────────

const vaultItems = [
  {
    icon: "folder_special",
    title: "Private Guides",
    desc: "Unpublished travel guides and insider routes",
    count: 4,
    color: "#b2c5ff",
  },
  {
    icon: "edit_document",
    title: "Draft Articles",
    desc: "Work-in-progress content pending review",
    count: 7,
    color: "#ffb77a",
  },
  {
    icon: "photo_library",
    title: "Media Archive",
    desc: "Saved photos, videos and raw assets",
    count: 23,
    color: "#3cdccf",
  },
  {
    icon: "bookmark",
    title: "Saved Resources",
    desc: "Bookmarked links and external references",
    count: 11,
    color: "#b2c5ff",
  },
];

function VaultView() {
  return (
    <motion.div
      key="vault"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-10">
        <span className="text-[#ffb77a] font-label text-sm uppercase tracking-[0.2em] mb-2 block">
          Secure Storage
        </span>
        <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-[#e1e3e4]">
          Creator <span className="text-[#b2c5ff]">Vault</span>
        </h2>
        <p className="text-[#8d919a] mt-3 max-w-xl">
          Your private workspace — saved resources, private guides, and draft
          content secured on the Internet Computer.
        </p>
      </div>

      {/* Vault status banner */}
      <div className="flex items-center gap-4 p-5 bg-[#191c1d] rounded-xl border border-[#43474f]/20 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#b2c5ff]/10 flex items-center justify-center shrink-0">
          <MatIcon
            name="enhanced_encryption"
            className="text-2xl text-[#b2c5ff]"
          />
        </div>
        <div>
          <p className="font-bold text-[#e1e3e4] text-sm">
            End-to-End Encrypted
          </p>
          <p className="text-xs text-[#8d919a] mt-0.5">
            All vault contents are stored on-chain and only accessible with your
            identity
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3cdccf] animate-pulse" />
          <span className="text-xs text-[#3cdccf] font-medium">Secured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vaultItems.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="bg-[#191c1d] p-7 rounded-xl border border-[#43474f]/10 flex items-start gap-5 hover:border-[#43474f]/40 transition-all cursor-pointer group"
            data-ocid={`vault.item.${idx + 1}`}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${item.color}18` }}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ color: item.color }}
              >
                {item.icon}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-[#e1e3e4] group-hover:text-[#b2c5ff] transition-colors">
                  {item.title}
                </h3>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={
                    {
                      background: `${item.color}18`,
                      color: item.color,
                    } as React.CSSProperties
                  }
                >
                  {item.count}
                </span>
              </div>
              <p className="text-sm text-[#8d919a] mt-1">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Profile View ──────────────────────────────────────────────────────────────

function ProfileView({ userName }: { userName: string }) {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-10">
        <span className="text-[#ffb77a] font-label text-sm uppercase tracking-[0.2em] mb-2 block">
          Account
        </span>
        <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-[#e1e3e4]">
          Your <span className="text-[#b2c5ff]">Profile</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-[#191c1d] p-8 rounded-xl border border-[#43474f]/10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b2c5ff] to-[#5a8cff] flex items-center justify-center mb-4 shadow-lg shadow-[#b2c5ff]/10">
                <span className="text-3xl font-headline font-bold text-[#002b73]">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-[#e1e3e4]">
                {userName}
              </h3>
              <p className="text-sm text-[#8d919a] mt-1">
                creator@luminous.ladakh
              </p>
              <span className="mt-3 px-3 py-1 bg-[#b2c5ff]/10 text-[#b2c5ff] text-xs font-bold rounded-full uppercase tracking-widest">
                Creator
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#1d2021] rounded-lg">
                <span className="text-xs text-[#8d919a] uppercase tracking-wider">
                  Member Since
                </span>
                <span className="text-sm font-bold text-[#e1e3e4]">
                  Jan 2024
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#1d2021] rounded-lg">
                <span className="text-xs text-[#8d919a] uppercase tracking-wider">
                  Status
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-[#3cdccf]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3cdccf]" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#1d2021] rounded-lg">
                <span className="text-xs text-[#8d919a] uppercase tracking-wider">
                  Tier
                </span>
                <span className="text-sm font-bold text-[#ffb77a]">
                  Premium
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Settings */}
        <div className="lg:col-span-8 space-y-6">
          {/* Summary Stats */}
          <div className="bg-[#191c1d] p-8 rounded-xl border border-[#43474f]/10">
            <h3 className="font-headline text-xl font-bold text-[#e1e3e4] mb-6">
              Activity Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Links Created", value: "12", color: "#b2c5ff" },
                { label: "Total Guides", value: "4", color: "#ffb77a" },
                { label: "Reach (Monthly)", value: "2.4K", color: "#3cdccf" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#1d2021] p-5 rounded-xl text-center"
                >
                  <p
                    className="text-3xl font-headline font-bold mb-1"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#8d919a] uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-[#191c1d] p-8 rounded-xl border border-[#43474f]/10">
            <h3 className="font-headline text-xl font-bold text-[#e1e3e4] mb-6">
              Account Settings
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: "notifications",
                  label: "Notification Preferences",
                  desc: "Manage alerts and updates",
                },
                {
                  icon: "lock",
                  label: "Privacy & Security",
                  desc: "Identity and access controls",
                },
                {
                  icon: "language",
                  label: "Region & Language",
                  desc: "Ladakh, India • English",
                },
                {
                  icon: "palette",
                  label: "Appearance",
                  desc: "Dark mode • Enabled",
                },
              ].map((setting, idx) => (
                <button
                  key={setting.label}
                  type="button"
                  onClick={() => toast.info(`Opening ${setting.label}`)}
                  className="w-full flex items-center gap-4 p-4 bg-[#1d2021] hover:bg-[#282a2b] rounded-xl text-left transition-colors group"
                  data-ocid={`profile.button.${idx + 1}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#b2c5ff]/10 flex items-center justify-center shrink-0">
                    <MatIcon
                      name={setting.icon}
                      className="text-xl text-[#b2c5ff]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#e1e3e4]">
                      {setting.label}
                    </p>
                    <p className="text-xs text-[#8d919a] mt-0.5">
                      {setting.desc}
                    </p>
                  </div>
                  <MatIcon
                    name="chevron_right"
                    className="text-[#43474f] group-hover:text-[#b2c5ff] transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CommunityLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommunityLink | null>(null);
  const [activeNav, setActiveNav] = useState("dashboard");

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: links, isLoading: linksLoading } = useCommunityLinks();
  const { data: paymentInfo, isLoading: paymentLoading } = usePaymentInfo();
  const { data: modCounts, isLoading: modLoading } = useModerationCounts();
  const { data: userProfile } = useUserProfile();

  const addLink = useAddCommunityLink();
  const editLink = useEditCommunityLink();
  const deleteLink = useDeleteCommunityLink();

  const userName = userProfile?.name ?? "hunter";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleAddLink = useCallback(
    (title: string, url: string) => {
      addLink.mutate(
        { title, url, iconType: "link" },
        {
          onSuccess: () => {
            setAddOpen(false);
            toast.success("Link added successfully");
          },
          onError: () => toast.error("Failed to add link"),
        },
      );
    },
    [addLink],
  );

  const handleEditLink = useCallback(
    (title: string, url: string) => {
      if (!editTarget) return;
      editLink.mutate(
        { id: editTarget.id, title, url, iconType: editTarget.iconType },
        {
          onSuccess: () => {
            setEditTarget(null);
            toast.success("Link updated");
          },
          onError: () => toast.error("Failed to update link"),
        },
      );
    },
    [editLink, editTarget],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteLink.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("Link deleted");
      },
      onError: () => toast.error("Failed to delete link"),
    });
  }, [deleteLink, deleteTarget]);

  const iconForType = (iconType: string) => {
    const map: Record<string, string> = {
      link: "link",
      campaign: "campaign",
      event: "event",
      map: "map",
      photo: "photo_camera",
      guide: "menu_book",
    };
    return map[iconType] ?? "link";
  };

  const iconColorForType = (iconType: string) => {
    const map: Record<string, string> = {
      link: "text-[#b2c5ff]",
      campaign: "text-[#3cdccf]",
      event: "text-[#ffb77a]",
      map: "text-[#3cdccf]",
      photo: "text-[#b2c5ff]",
      guide: "text-[#ffb77a]",
    };
    return map[iconType] ?? "text-[#b2c5ff]";
  };

  const navBtnClass = (key: string) =>
    `transition-colors font-medium ${
      activeNav === key
        ? "text-[#b2c5ff]"
        : "text-[#8d919a] hover:text-[#ffb77a]"
    }`;

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-body">
      <Toaster position="top-right" theme="dark" />

      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 h-20 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <MatIcon name="shield_person" className="text-[#b2c5ff] text-2xl" />
            <h1 className="font-headline font-bold tracking-tighter text-xl text-[#b2c5ff] uppercase">
              Luminous Ladakh
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6 text-sm" data-ocid="nav.panel">
              <button
                type="button"
                onClick={() => setActiveNav("explore")}
                className={navBtnClass("explore")}
                data-ocid="nav.link"
              >
                Explore
              </button>
              <button
                type="button"
                onClick={() => setActiveNav("dashboard")}
                className={navBtnClass("dashboard")}
                data-ocid="nav.link"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActiveNav("vault")}
                className={navBtnClass("vault")}
                data-ocid="nav.link"
              >
                Vault
              </button>
              <button
                type="button"
                onClick={() => setActiveNav("profile")}
                className={navBtnClass("profile")}
                data-ocid="nav.link"
              >
                Profile
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#b2c5ff]">{userName}</p>
              <p className="text-[10px] text-[#8d919a]">
                creator@luminous.ladakh
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveNav("profile")}
              className="w-10 h-10 rounded-full bg-[#323536] border border-[#43474f] flex items-center justify-center hover:border-[#b2c5ff]/50 transition-colors"
              data-ocid="profile.button"
            >
              <span className="text-sm font-bold text-[#b2c5ff] font-headline">
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-32 px-6 max-w-screen-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeNav === "explore" && <ExploreView key="explore" />}
          {activeNav === "vault" && <VaultView key="vault" />}
          {activeNav === "profile" && (
            <ProfileView key="profile" userName={userName} />
          )}
          {activeNav === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Greeting */}
              <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <span className="text-[#ffb77a] font-label text-sm uppercase tracking-[0.2em] mb-2 block">
                      Creator Command Center
                    </span>
                    <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-[#e1e3e4]">
                      Welcome back,{" "}
                      <span className="text-[#b2c5ff]">{userName}.</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 bg-[#191c1d] px-5 py-3 rounded-xl border border-[#43474f]/20">
                    <div className="w-2 h-2 rounded-full bg-[#3cdccf] animate-pulse" />
                    <span className="text-xs font-medium text-[#c3c6d1] tracking-wide">
                      SYSTEMS OPERATIONAL • {currentTime}
                    </span>
                  </div>
                </div>
              </section>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {statsLoading ? (
                  <>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                  </>
                ) : (
                  <>
                    {/* New Applications */}
                    <motion.div
                      className="bg-[#191c1d] p-8 rounded-xl relative overflow-hidden group"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      data-ocid="stats.card"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <MatIcon
                          name="group_add"
                          className="text-[#b2c5ff]/20 text-6xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-[#c3c6d1] font-label text-xs uppercase tracking-widest mb-4">
                        New Applications
                      </h3>
                      <p className="text-5xl font-headline font-bold text-[#b2c5ff] mb-2">
                        {stats ? String(stats.newApplications) : "—"}
                      </p>
                      <div className="flex items-center gap-2 text-[#3cdccf] text-sm">
                        <MatIcon name="trending_up" className="text-sm" />
                        <span>{stats?.applicationsTrend ?? "Loading..."}</span>
                      </div>
                    </motion.div>

                    {/* Total Revenue */}
                    <motion.div
                      className="bg-[#191c1d] p-8 rounded-xl relative overflow-hidden group"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      data-ocid="stats.card"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <MatIcon
                          name="payments"
                          className="text-[#ffb77a]/20 text-6xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-[#c3c6d1] font-label text-xs uppercase tracking-widest mb-4">
                        Total Revenue
                      </h3>
                      <p className="text-5xl font-headline font-bold text-[#ffb77a] mb-2">
                        {stats?.totalRevenue ?? "—"}
                      </p>
                      <div className="flex items-center gap-2 text-[#b2c5ff] text-sm">
                        <MatIcon name="verified" className="text-sm" />
                        <span>{stats?.payoutNote ?? "Loading..."}</span>
                      </div>
                    </motion.div>

                    {/* Reports */}
                    <motion.div
                      className="bg-[#191c1d] p-8 rounded-xl relative overflow-hidden group"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      data-ocid="stats.card"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <MatIcon
                          name="flag"
                          className="text-[#ffb4ab]/20 text-6xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-[#c3c6d1] font-label text-xs uppercase tracking-widest mb-4">
                        Reports
                      </h3>
                      <p className="text-5xl font-headline font-bold text-[#e1e3e4] mb-2">
                        {stats
                          ? String(stats.reportsCount).padStart(2, "0")
                          : "—"}
                      </p>
                      <div className="flex items-center gap-2 text-[#ffb4ab] text-sm">
                        <MatIcon name="priority_high" className="text-sm" />
                        <span>Requires immediate action</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Community Management */}
                <motion.section
                  className="lg:col-span-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="bg-[#1d2021] p-8 rounded-xl h-full border border-[#43474f]/10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="font-headline text-2xl font-bold text-[#e1e3e4]">
                          Community Management
                        </h3>
                        <p className="text-[#c3c6d1] text-sm mt-1">
                          Manage external resources and curated links
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddOpen(true)}
                        className="bg-[#b2c5ff] text-[#002b73] px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-95 transition-all"
                        data-ocid="link.open_modal_button"
                      >
                        <MatIcon name="add" className="text-sm" />
                        Add New Link
                      </button>
                    </div>

                    <div className="space-y-4">
                      {linksLoading ? (
                        <>
                          <LinkItemSkeleton />
                          <LinkItemSkeleton />
                        </>
                      ) : links && links.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                          {links.map((link, idx) => (
                            <motion.div
                              key={String(link.id)}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.25, delay: idx * 0.04 }}
                              className="flex items-center justify-between p-5 bg-[#323536] rounded-xl group"
                              data-ocid={`link.item.${idx + 1}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#191c1d] flex items-center justify-center">
                                  <MatIcon
                                    name={iconForType(link.iconType)}
                                    className={iconColorForType(link.iconType)}
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-[#e1e3e4]">
                                    {link.title}
                                  </p>
                                  <p className="text-xs text-[#8d919a] truncate max-w-xs">
                                    {link.url}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setEditTarget(link)}
                                  className="p-2 text-[#c3c6d1] hover:text-[#b2c5ff] transition-colors"
                                  data-ocid={`link.edit_button.${idx + 1}`}
                                  title="Edit link"
                                >
                                  <MatIcon name="edit" className="text-xl" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(link)}
                                  className="p-2 text-[#c3c6d1] hover:text-[#ffb4ab] transition-colors"
                                  data-ocid={`link.delete_button.${idx + 1}`}
                                  title="Delete link"
                                >
                                  <MatIcon name="delete" className="text-xl" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      ) : (
                        <div
                          className="text-center py-16 text-[#8d919a]"
                          data-ocid="link.empty_state"
                        >
                          <MatIcon
                            name="link_off"
                            className="text-5xl mb-3 opacity-30"
                          />
                          <p className="text-sm">
                            No community links yet. Add your first link.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.section>

                {/* Sidebar */}
                <motion.aside
                  className="lg:col-span-4 space-y-8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {/* Payment Settings */}
                  <div className="bg-[#1d2021] p-8 rounded-xl border border-[#43474f]/10">
                    <h3 className="font-headline text-xl font-bold text-[#e1e3e4] mb-6 flex items-center gap-2">
                      <MatIcon
                        name="account_balance"
                        className="text-[#ffb77a]"
                      />
                      Payment Settings
                    </h3>
                    {paymentLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full bg-[#282a2b] rounded-xl" />
                        <Skeleton className="h-10 w-full bg-[#282a2b] rounded-full" />
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-[#191c1d] rounded-xl mb-6">
                          <p className="text-[10px] uppercase tracking-widest text-[#c3c6d1] mb-1">
                            Active Bank Info
                          </p>
                          <p className="font-bold text-[#e1e3e4] truncate">
                            {paymentInfo
                              ? `${paymentInfo.bankName} •••• ${paymentInfo.lastFour}`
                              : "Not connected"}
                          </p>
                          <p className="text-xs text-[#ffb77a] mt-2">
                            {paymentInfo?.status ?? "—"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toast.info("Update Bank Info clicked")}
                          className="w-full py-3 bg-[#323536] border border-[#43474f]/20 rounded-full text-sm font-bold text-[#e1e3e4] hover:bg-[#373a3b] transition-colors"
                          data-ocid="payment.button"
                        >
                          Update Bank Info
                        </button>
                      </>
                    )}
                  </div>

                  {/* App Moderation */}
                  <div className="bg-[#191c1d] p-8 rounded-xl border border-[#43474f]/10">
                    <h3 className="font-headline text-xl font-bold text-[#e1e3e4] mb-6 flex items-center gap-2">
                      <MatIcon name="gavel" className="text-[#b2c5ff]" />
                      App Moderation
                    </h3>
                    {modLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full bg-[#282a2b] rounded-lg" />
                        <Skeleton className="h-10 w-full bg-[#282a2b] rounded-lg" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4 p-3 hover:bg-[#1d2021] rounded-lg transition-colors">
                          <span className="text-sm font-medium text-[#e1e3e4]">
                            Flagged Comments
                          </span>
                          <span className="bg-[#93000a] text-[#ffdad6] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {modCounts
                              ? String(modCounts.flaggedComments).padStart(
                                  2,
                                  "0",
                                )
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 p-3 hover:bg-[#1d2021] rounded-lg transition-colors">
                          <span className="text-sm font-medium text-[#e1e3e4]">
                            Pending Reviews
                          </span>
                          <span className="bg-[#003a36] text-[#00aea3] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {modCounts
                              ? String(modCounts.pendingReviews).padStart(
                                  2,
                                  "0",
                                )
                              : "—"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => toast.warning("Delete Content clicked")}
                        className="flex flex-col items-center justify-center p-4 bg-[#323536] rounded-xl hover:text-[#ffb4ab] transition-colors group"
                        data-ocid="moderation.delete_button"
                      >
                        <MatIcon
                          name="delete_sweep"
                          className="mb-2 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[10px] uppercase tracking-tighter font-bold">
                          Delete Content
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info("Edit Content clicked")}
                        className="flex flex-col items-center justify-center p-4 bg-[#323536] rounded-xl hover:text-[#b2c5ff] transition-colors group"
                        data-ocid="moderation.edit_button"
                      >
                        <MatIcon
                          name="edit_note"
                          className="mb-2 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[10px] uppercase tracking-tighter font-bold">
                          Edit Content
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-full border border-white/10 bg-slate-900/40 backdrop-blur-2xl z-50">
        <div className="flex justify-around items-center px-4 h-20">
          <button
            type="button"
            onClick={() => setActiveNav("explore")}
            className={`flex flex-col items-center justify-center p-2 transition-all ${
              activeNav === "explore"
                ? "text-[#b2c5ff]"
                : "text-[#8d919a] hover:text-[#b2c5ff]"
            }`}
            data-ocid="mobile.nav.link"
          >
            <MatIcon name="explore" />
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">
              Explore
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNav("dashboard")}
            className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-300 to-blue-700 text-slate-950 rounded-full w-14 h-14 -translate-y-2.5 shadow-lg shadow-blue-500/20 animate-pulse-slow"
            data-ocid="mobile.nav.link"
          >
            <MatIcon name="dashboard_customize" />
            <span className="font-label text-[8px] uppercase font-bold">
              Dash
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNav("vault")}
            className={`flex flex-col items-center justify-center p-2 transition-all ${
              activeNav === "vault"
                ? "text-[#b2c5ff]"
                : "text-[#8d919a] hover:text-[#b2c5ff]"
            }`}
            data-ocid="mobile.nav.link"
          >
            <MatIcon name="enhanced_encryption" />
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">
              Vault
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNav("profile")}
            className={`flex flex-col items-center justify-center p-2 transition-all ${
              activeNav === "profile"
                ? "text-[#b2c5ff]"
                : "text-[#8d919a] hover:text-[#b2c5ff]"
            }`}
            data-ocid="mobile.nav.link"
          >
            <MatIcon name="account_circle" />
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">
              Profile
            </span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block text-center py-6 text-[#8d919a] text-xs border-t border-[#43474f]/20">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#b2c5ff] transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </footer>

      {/* Add Link Dialog */}
      <LinkFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddLink}
        isPending={addLink.isPending}
        mode="add"
      />

      {/* Edit Link Dialog */}
      <LinkFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditLink}
        isPending={editLink.isPending}
        initial={
          editTarget
            ? { title: editTarget.title, url: editTarget.url }
            : undefined
        }
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent
          className="bg-[#1d2021] border-[#43474f]/30 text-[#e1e3e4] max-w-sm"
          data-ocid="link.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-headline text-xl text-[#e1e3e4]">
              Delete Link
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#c3c6d1] text-sm mt-2">
            Are you sure you want to delete{" "}
            <span className="font-bold text-[#e1e3e4]">
              {deleteTarget?.title}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="pt-4 gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#c3c6d1] bg-[#282a2b] hover:bg-[#323536] transition-colors"
              data-ocid="link.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteLink.isPending}
              className="px-5 py-2 rounded-full text-sm font-bold bg-[#93000a] text-[#ffdad6] hover:scale-95 transition-all disabled:opacity-50"
              data-ocid="link.confirm_button"
            >
              {deleteLink.isPending ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
