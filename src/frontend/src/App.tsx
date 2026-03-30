import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
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
      <Skeleton className="h-16 w-28 mb-2 bg-[#282a2b]" />
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

interface Destination {
  name: string;
  icon: string;
  color: string;
  desc: string;
  tag: string;
  altitude: string;
  bestSeason: string;
  duration: string;
  gettingThere: string;
  highlights: string[];
}

const destinations: Destination[] = [
  {
    name: "Pangong Lake",
    icon: "water",
    color: "#b2c5ff",
    desc: "A breathtaking high-altitude salt lake stretching across India and China at 4,350m, famous for its vivid color shifts from deep blue to emerald green throughout the day.",
    tag: "Lakes",
    altitude: "4,350m",
    bestSeason: "May – September",
    duration: "2–3 days",
    gettingThere: "Drive from Leh via Chang La Pass (~5h)",
    highlights: [
      "Dramatic color shifts from azure to emerald",
      "Two-thirds of the lake lies in Tibet",
      "Famous 3 Idiots filming location",
      "Spectacular stargazing at night",
    ],
  },
  {
    name: "Nubra Valley",
    icon: "terrain",
    color: "#3cdccf",
    desc: "A tri-armed valley beyond Khardung La, home to Bactrian camels, sand dunes, and ancient monasteries amidst dramatic desert terrain.",
    tag: "Valleys",
    altitude: "3,048m",
    bestSeason: "June – September",
    duration: "2–3 days",
    gettingThere: "Drive via Khardung La Pass from Leh (~4h)",
    highlights: [
      "Double-humped Bactrian camel rides on sand dunes",
      "Diskit Monastery with giant Maitreya Buddha",
      "Hot springs at Panamik village",
      "Apple orchards and local culture",
    ],
  },
  {
    name: "Leh Palace",
    icon: "castle",
    color: "#ffb77a",
    desc: "A nine-storey palace built in the 17th century overlooking Leh town — a crumbling echo of Ladakh's royal era with panoramic Himalayan views.",
    tag: "Heritage",
    altitude: "3,500m",
    bestSeason: "April – October",
    duration: "2–3 hours",
    gettingThere: "15-min walk uphill from Leh Bazaar",
    highlights: [
      "Nine-storey Tibetan-style architecture",
      "360° views of Leh and Zanskar range",
      "Ancient royal artifacts and thangka paintings",
      "Best views at sunrise and sunset",
    ],
  },
  {
    name: "Khardung La Pass",
    icon: "landscape",
    color: "#b2c5ff",
    desc: "One of the world's highest motorable passes at 5,359m, gateway to Nubra Valley and Shyok region — a bucket-list milestone for every traveler.",
    tag: "Passes",
    altitude: "5,359m",
    bestSeason: "June – September",
    duration: "Day trip",
    gettingThere: "40km north of Leh on Nubra road (~2h)",
    highlights: [
      "One of the world's highest motorable roads",
      "Snow-covered peaks year-round nearby",
      "Military base and chai shops at summit",
      "Starting point for Nubra Valley descent",
    ],
  },
  {
    name: "Hemis Monastery",
    icon: "temple_buddhist",
    color: "#ffb77a",
    desc: "The largest and wealthiest monastery in Ladakh, hosting the famous Hemis Festival every summer — a cultural spectacle of masked dances and sacred rituals.",
    tag: "Monasteries",
    altitude: "3,600m",
    bestSeason: "April – October",
    duration: "3–4 hours",
    gettingThere: "45km southeast of Leh on Manali road (~1.5h)",
    highlights: [
      "Annual Hemis Festival (Tse Chu) in June/July",
      "Rare thangka embroideries on display",
      "Hemis snow leopard conservation area nearby",
      "11th-century founding, Drukpa Kagyu order",
    ],
  },
  {
    name: "Magnetic Hill",
    icon: "explore",
    color: "#3cdccf",
    desc: "An optical illusion on NH1 where vehicles appear to roll uphill — a gravitational anomaly that mystifies travelers and defies belief.",
    tag: "Wonders",
    altitude: "3,390m",
    bestSeason: "Year Round",
    duration: "1–2 hours",
    gettingThere: "30km from Leh on NH1 towards Kargil",
    highlights: [
      "Vehicles appear to roll uphill on their own",
      "Confluence of Indus and Zanskar rivers nearby",
      "Gurudwara Pathar Sahib just 3km away",
      "Hall of Fame military museum en route",
    ],
  },
];

function DestinationDialog({
  dest,
  open,
  onClose,
}: {
  dest: Destination | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!dest) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-[#1d2021] border-[#43474f]/30 text-[#e1e3e4] max-w-lg p-0 overflow-hidden"
        data-ocid="explore.dialog"
      >
        {/* Header */}
        <div className="p-6 pb-5" style={{ background: `${dest.color}12` }}>
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${dest.color}20` }}
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{ color: dest.color }}
              >
                {dest.icon}
              </span>
            </div>
            <span
              className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full"
              style={{ background: `${dest.color}20`, color: dest.color }}
            >
              {dest.tag}
            </span>
          </div>
          <DialogTitle className="font-headline text-2xl font-bold text-[#e1e3e4] mb-2">
            {dest.name}
          </DialogTitle>
          <p className="text-sm text-[#8d919a] leading-relaxed">{dest.desc}</p>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Quick Facts Grid */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-[#8d919a] font-bold mb-3">
                Quick Facts
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Altitude", value: dest.altitude, icon: "terrain" },
                  {
                    label: "Best Season",
                    value: dest.bestSeason,
                    icon: "wb_sunny",
                  },
                  { label: "Duration", value: dest.duration, icon: "schedule" },
                  {
                    label: "Getting There",
                    value: dest.gettingThere,
                    icon: "directions_car",
                  },
                ].map((fact) => (
                  <div
                    key={fact.label}
                    className="bg-[#191c1d] rounded-xl p-4 border border-[#43474f]/10"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ color: dest.color }}
                      >
                        {fact.icon}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[#8d919a] font-bold">
                        {fact.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#e1e3e4] leading-tight">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-[#8d919a] font-bold mb-3">
                Key Highlights
              </h4>
              <ul className="space-y-2.5">
                {dest.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: dest.color }}
                    />
                    <span className="text-sm text-[#c3c6d1] leading-snug">
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-[#43474f]/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-semibold text-[#c3c6d1] bg-[#282a2b] hover:bg-[#323536] transition-colors"
            data-ocid="explore.close_button"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success(`Added ${dest.name} to your travel list`);
              onClose();
            }}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-95"
            style={{ background: dest.color, color: "#111415" }}
            data-ocid="explore.primary_button"
          >
            Save to Vault
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExploreView() {
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDest = (dest: Destination) => {
    setSelectedDest(dest);
    setDialogOpen(true);
  };

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
            onClick={() => openDest(dest)}
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
            <p className="text-sm text-[#8d919a] leading-relaxed line-clamp-2">
              {dest.desc}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-[#8d919a]">
              <span className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-xs"
                  style={{ color: dest.color }}
                >
                  terrain
                </span>
                {dest.altitude}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#43474f]" />
              <span>{dest.duration}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDest(dest);
              }}
              className="mt-5 flex items-center gap-1.5 text-xs font-semibold bg-transparent border-0 p-0 cursor-pointer"
              style={{ color: dest.color } as React.CSSProperties}
              data-ocid={`explore.button.${idx + 1}`}
            >
              <span>View Guide</span>
              <MatIcon name="arrow_forward" className="text-sm" />
            </button>
          </motion.div>
        ))}
      </div>

      <DestinationDialog
        dest={selectedDest}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </motion.div>
  );
}

// ── Vault View ────────────────────────────────────────────────────────────────

interface VaultItem {
  icon: string;
  title: string;
  desc: string;
  count: number;
  color: string;
  detail: string;
}

const vaultItems: VaultItem[] = [
  {
    icon: "folder_special",
    title: "Private Guides",
    desc: "Unpublished travel guides and insider routes",
    count: 4,
    color: "#b2c5ff",
    detail:
      "4 unpublished guides stored securely. These drafts are only visible to you and can be published to the platform when ready.",
  },
  {
    icon: "edit_document",
    title: "Draft Articles",
    desc: "Work-in-progress content pending review",
    count: 7,
    color: "#ffb77a",
    detail:
      "7 articles pending creator review before publishing. Each article goes through quality checks before appearing on the Explore page.",
  },
  {
    icon: "photo_library",
    title: "Media Archive",
    desc: "Saved photos, videos and raw assets",
    count: 23,
    color: "#3cdccf",
    detail:
      "23 media assets including photos, videos, and raw files. All media is stored on-chain and backed up to the Internet Computer.",
  },
  {
    icon: "bookmark",
    title: "Saved Resources",
    desc: "Bookmarked links and external references",
    count: 11,
    color: "#b2c5ff",
    detail:
      "11 bookmarked external links and references. Saved from the web for future content ideas, research, and community links.",
  },
];

function VaultItemDialog({
  item,
  open,
  onClose,
}: {
  item: VaultItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-[#1d2021] border-[#43474f]/30 text-[#e1e3e4] max-w-md"
        data-ocid="vault.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-4 mb-1">
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
            <div>
              <DialogTitle className="font-headline text-xl text-[#e1e3e4]">
                {item.title}
              </DialogTitle>
              <p className="text-xs text-[#8d919a] mt-0.5">{item.desc}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{
              background: `${item.color}0a`,
              borderColor: `${item.color}30`,
            }}
          >
            <span className="text-sm text-[#c3c6d1]">Total Items</span>
            <span
              className="text-2xl font-headline font-bold"
              style={{ color: item.color }}
            >
              {item.count}
            </span>
          </div>
          <p className="text-sm text-[#8d919a] leading-relaxed">
            {item.detail}
          </p>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-semibold text-[#c3c6d1] bg-[#282a2b] hover:bg-[#323536] transition-colors"
            data-ocid="vault.close_button"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              toast.info("Feature coming soon");
            }}
            className="px-5 py-2 rounded-full text-sm font-bold bg-[#b2c5ff] text-[#002b73] hover:scale-95 transition-all"
            data-ocid="vault.primary_button"
          >
            Browse Items
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VaultView() {
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openItem = (item: VaultItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

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
            onClick={() => openItem(item)}
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

      <VaultItemDialog
        item={selectedItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </motion.div>
  );
}

// ── Profile View ──────────────────────────────────────────────────────────────

type SettingKey = "notifications" | "privacy" | "region" | "appearance" | null;

interface SettingsDef {
  key: SettingKey;
  icon: string;
  label: string;
  desc: string;
}

const settingsDefs: SettingsDef[] = [
  {
    key: "notifications",
    icon: "notifications",
    label: "Notification Preferences",
    desc: "Manage alerts and updates",
  },
  {
    key: "privacy",
    icon: "lock",
    label: "Privacy & Security",
    desc: "Identity and access controls",
  },
  {
    key: "region",
    icon: "language",
    label: "Region & Language",
    desc: "Ladakh, India • English",
  },
  {
    key: "appearance",
    icon: "palette",
    label: "Appearance",
    desc: "Dark mode • Enabled",
  },
];

function NotificationsPanel() {
  const [alerts, setAlerts] = useState({
    community: true,
    applications: true,
    payments: true,
    digest: false,
  });
  return (
    <div className="space-y-4 mt-2">
      {[
        {
          key: "community" as const,
          label: "Community Alerts",
          desc: "New posts and community activity",
        },
        {
          key: "applications" as const,
          label: "New Applications",
          desc: "Member and business sign-ups",
        },
        {
          key: "payments" as const,
          label: "Payment Updates",
          desc: "Subscription renewals and revenue",
        },
        {
          key: "digest" as const,
          label: "Weekly Digest",
          desc: "Summary every Monday morning",
        },
      ].map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between p-4 bg-[#191c1d] rounded-xl"
        >
          <div>
            <p className="text-sm font-semibold text-[#e1e3e4]">{item.label}</p>
            <p className="text-xs text-[#8d919a] mt-0.5">{item.desc}</p>
          </div>
          <Switch
            checked={alerts[item.key]}
            onCheckedChange={(v) =>
              setAlerts((prev) => ({ ...prev, [item.key]: v }))
            }
            data-ocid={`profile.${item.key}.switch`}
          />
        </div>
      ))}
    </div>
  );
}

function PrivacyPanel() {
  const [eid, setEid] = useState<string | null>(null);
  const generateId = () => {
    setEid(Math.floor(10000000 + Math.random() * 90000000).toString());
  };
  return (
    <div className="space-y-4 mt-2">
      <div className="p-4 bg-[#191c1d] rounded-xl">
        <p className="text-xs text-[#8d919a] uppercase tracking-widest mb-1">
          Identity
        </p>
        <p className="text-sm font-semibold text-[#e1e3e4]">
          Linked to Internet Computer
        </p>
      </div>
      <div className="p-4 bg-[#191c1d] rounded-xl">
        <p className="text-xs text-[#8d919a] uppercase tracking-widest mb-1">
          Access Level
        </p>
        <p className="text-sm font-semibold text-[#3cdccf]">
          Creator — Full Access
        </p>
      </div>
      <div className="p-4 bg-[#191c1d] rounded-xl">
        <p className="text-xs text-[#8d919a] uppercase tracking-widest mb-2">
          Electronic ID
        </p>
        {eid ? (
          <div className="flex items-center gap-3">
            <span className="font-headline text-xl font-bold text-[#b2c5ff] tracking-widest">
              {eid}
            </span>
            <button
              type="button"
              onClick={() => setEid(null)}
              className="text-xs text-[#8d919a] hover:text-[#e1e3e4] transition-colors"
            >
              Hide
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={generateId}
            className="text-sm font-semibold text-[#b2c5ff] hover:text-[#8ab4ff] transition-colors flex items-center gap-1.5"
            data-ocid="profile.button"
          >
            <MatIcon name="visibility" className="text-sm" />
            View Electronic ID
          </button>
        )}
      </div>
    </div>
  );
}

function RegionPanel() {
  return (
    <div className="space-y-3 mt-2">
      {[
        { label: "Region", value: "Ladakh, India" },
        { label: "Language", value: "English" },
        { label: "Currency", value: "INR (₹)" },
        { label: "Timezone", value: "IST (UTC+5:30)" },
      ].map((row) => (
        <div
          key={row.label}
          className="flex justify-between items-center p-4 bg-[#191c1d] rounded-xl"
        >
          <span className="text-xs text-[#8d919a] uppercase tracking-wider">
            {row.label}
          </span>
          <span className="text-sm font-semibold text-[#e1e3e4]">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function AppearancePanel() {
  const [dark, setDark] = useState(true);
  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-center justify-between p-4 bg-[#191c1d] rounded-xl">
        <div>
          <p className="text-sm font-semibold text-[#e1e3e4]">Dark Mode</p>
          <p className="text-xs text-[#8d919a] mt-0.5">
            Currently {dark ? "enabled" : "disabled"}
          </p>
        </div>
        <Switch
          checked={dark}
          onCheckedChange={setDark}
          data-ocid="profile.dark_mode.switch"
        />
      </div>
      <div className="p-4 bg-[#191c1d] rounded-xl border border-[#43474f]/20">
        <p className="text-xs text-[#8d919a] italic">
          Light mode coming soon — the platform currently runs in dark mode
          only.
        </p>
      </div>
    </div>
  );
}

function SettingsSheet({
  setting,
  onClose,
}: {
  setting: SettingKey;
  onClose: () => void;
}) {
  const def = settingsDefs.find((s) => s.key === setting);
  return (
    <Sheet open={!!setting} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="bg-[#1d2021] border-[#43474f]/30 text-[#e1e3e4] w-full sm:max-w-sm p-0"
        data-ocid="profile.sheet"
      >
        <SheetHeader className="p-6 border-b border-[#43474f]/20">
          <div className="flex items-center gap-3">
            {def && (
              <div className="w-9 h-9 rounded-lg bg-[#b2c5ff]/10 flex items-center justify-center shrink-0">
                <MatIcon name={def.icon} className="text-lg text-[#b2c5ff]" />
              </div>
            )}
            <SheetTitle className="font-headline text-lg text-[#e1e3e4]">
              {def?.label}
            </SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-6">
            {setting === "notifications" && <NotificationsPanel />}
            {setting === "privacy" && <PrivacyPanel />}
            {setting === "region" && <RegionPanel />}
            {setting === "appearance" && <AppearancePanel />}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ProfileView({ userName }: { userName: string }) {
  const [activeSetting, setActiveSetting] = useState<SettingKey>(null);

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
              {settingsDefs.map((setting, idx) => (
                <button
                  key={setting.label}
                  type="button"
                  onClick={() => setActiveSetting(setting.key)}
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

      <SettingsSheet
        setting={activeSetting}
        onClose={() => setActiveSetting(null)}
      />
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
                      className="bg-[#191c1d] p-8 rounded-xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(178,197,255,0.08)] transition-shadow"
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
                      <p className="text-6xl font-headline font-bold text-[#b2c5ff] mb-3">
                        {stats ? String(stats.newApplications) : "—"}
                      </p>
                      <div className="flex items-center gap-2 text-[#3cdccf] text-sm">
                        <MatIcon name="trending_up" className="text-sm" />
                        <span>{stats?.applicationsTrend ?? "Loading..."}</span>
                      </div>
                    </motion.div>

                    {/* Total Revenue */}
                    <motion.div
                      className="bg-[#191c1d] p-8 rounded-xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,183,122,0.08)] transition-shadow"
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
                      <p className="text-6xl font-headline font-bold text-[#ffb77a] mb-3">
                        {stats?.totalRevenue ?? "—"}
                      </p>
                      <div className="flex items-center gap-2 text-[#b2c5ff] text-sm">
                        <MatIcon name="verified" className="text-sm" />
                        <span>{stats?.payoutNote ?? "Loading..."}</span>
                      </div>
                    </motion.div>

                    {/* Reports */}
                    <motion.div
                      className="bg-[#191c1d] p-8 rounded-xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,180,171,0.08)] transition-shadow"
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
                      <p className="text-6xl font-headline font-bold text-[#e1e3e4] mb-3">
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
                                  className="p-2 text-[#8d919a] hover:text-[#b2c5ff] transition-colors rounded-lg hover:bg-[#282a2b]"
                                  data-ocid={`link.edit_button.${idx + 1}`}
                                >
                                  <MatIcon name="edit" className="text-xl" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(link)}
                                  className="p-2 text-[#8d919a] hover:text-[#ffb4ab] transition-colors rounded-lg hover:bg-[#282a2b]"
                                  data-ocid={`link.delete_button.${idx + 1}`}
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
                        <div className="flex items-center justify-between p-4 bg-[#1d2021] rounded-xl">
                          <span className="text-sm font-bold text-[#e1e3e4]">
                            Pending Reviews
                          </span>
                          <span className="text-lg font-headline font-bold text-[#ffb77a]">
                            {modCounts?.pendingReviews ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#1d2021] rounded-xl">
                          <span className="text-sm font-bold text-[#e1e3e4]">
                            Flagged Content
                          </span>
                          <span className="text-lg font-headline font-bold text-[#ffb4ab]">
                            {modCounts?.flaggedComments ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#1d2021] rounded-xl">
                          <span className="text-sm font-bold text-[#e1e3e4]">
                            Active Users
                          </span>
                          <span className="text-lg font-headline font-bold text-[#3cdccf]">
                            {"—"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => toast.info("Review Queue opened")}
                        className="flex flex-col items-center justify-center p-4 bg-[#323536] rounded-xl hover:text-[#b2c5ff] transition-colors group"
                        data-ocid="moderation.primary_button"
                      >
                        <MatIcon
                          name="rate_review"
                          className="mb-2 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[10px] uppercase tracking-tighter font-bold">
                          Review Queue
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
            className={`flex flex-col items-center justify-center transition-all ${
              activeNav === "dashboard"
                ? "bg-gradient-to-br from-blue-300 to-blue-700 text-slate-950 rounded-full w-14 h-14 -translate-y-2.5 shadow-lg shadow-blue-500/20"
                : "text-[#8d919a] hover:text-[#b2c5ff] p-2"
            }`}
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

      {/* Dialogs */}
      <LinkFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddLink}
        isPending={addLink.isPending}
        mode="add"
      />
      <LinkFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditLink}
        isPending={editLink.isPending}
        initial={editTarget ?? undefined}
        mode="edit"
      />
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
          <p className="text-sm text-[#8d919a] mt-1">
            Are you sure you want to delete{" "}
            <span className="text-[#e1e3e4] font-semibold">
              {deleteTarget?.title}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4 gap-2">
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
              className="px-5 py-2 rounded-full text-sm font-bold bg-[#ffb4ab] text-[#690005] hover:scale-95 transition-all disabled:opacity-50"
              data-ocid="link.delete_button"
            >
              {deleteLink.isPending ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
