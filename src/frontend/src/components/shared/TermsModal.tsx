import { useEffect, useRef, useState } from "react";

interface Props {
  onAccept: () => void;
  onClose: () => void;
}

const TERMS_SECTIONS = [
  {
    title: "1. ACCEPTANCE OF TERMS",
    content:
      "By registering, browsing, or using any feature of Ladakh Connect, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, do not use this app.",
  },
  {
    title: "2. ELIGIBILITY",
    content:
      "You must be at least 13 years old to use this app. By creating an account, you confirm that you meet this requirement.",
  },
  {
    title: "3. USER ROLES & RESPONSIBILITIES",
    content:
      "3.1 Users (Explorers): You may browse locations, post community tips, submit reviews, and contribute photos. All content must be honest, original, and respectful.\n\n3.2 Members (Businesses): You may promote businesses, restaurants, rental agencies, and shops. All business information must be accurate. Misleading listings are prohibited.\n\n3.3 Community Members: You have additional access to community tools and moderation features. You are expected to uphold community standards at all times.\n\n3.4 Creator: The Creator has full administrative control and is solely responsible for platform moderation, payment confirmation, and account management.",
  },
  {
    title: "4. PROHIBITED CONTENT & BEHAVIOUR",
    content:
      "The following are strictly prohibited and will result in immediate violation penalties:\n\n• Military, army, or defence-related content of any kind\n• Nudity, explicit, or sexually suggestive content\n• Fake reviews, misleading business information, or impersonation of any person\n• Sharing another user's private information publicly (addresses, phone numbers, personal data)\n• Spam, automated bots, or any form of artificial engagement\n• Content that incites violence, hatred, or discrimination\n• Any content that endangers the safety of individuals or communities",
  },
  {
    title: "5. VIOLATION SYSTEM",
    content:
      "Ladakh Connect enforces a 7-level violation system:\n\n• Level 1: Formal warning — no restrictions\n• Level 2: Written notice — account flagged for monitoring\n• Level 3: Temporary feature restriction (24–48 hours)\n• Level 4: Posting suspended (7 days)\n• Level 5: Account suspended (30 days) — applies to fake reviews or impersonation\n• Level 6: Extended suspension (90 days) — account under review\n• Level 7: Permanent ban — electronic ID recorded; linked accounts flagged\n\nAccounts that reach Level 6 or Level 7 will result in any new accounts created using the same email being automatically issued a Level 2 violation.",
  },
  {
    title: "6. PAYMENTS & FEES",
    content:
      "6.1 Membership fees (Common: ₹1,000/month, Premier: ₹1,500/month) are non-refundable once confirmed.\n\n6.2 Event posting fee: ₹500 per event. Events remain visible for 7 days. Extensions: ₹10/day (days 8–14), ₹70 per 2 days (after 14 days).\n\n6.3 Shop announcement fee: ₹200 per new product announcement.\n\n6.4 All payments are processed via UPI. Confirmation is required by the Creator before access is granted.\n\n6.5 Ladakh Connect is not responsible for failed UPI transfers. Always keep your transaction reference number.",
  },
  {
    title: "7. PRIVACY & DATA",
    content:
      "7.1 Your personal data (email, username, electronic ID) is stored securely and never shared with third parties.\n\n7.2 All data is encrypted and accessible only to you and the Creator (for moderation purposes).\n\n7.3 Do not share your login credentials with anyone.\n\n7.4 Profile photos and uploaded content may be visible to other users within the app.",
  },
  {
    title: "8. CONTENT OWNERSHIP",
    content:
      "By posting content (photos, reviews, tips, business listings) on Ladakh Connect, you grant Ladakh Connect a non-exclusive license to display that content within the app. You retain ownership of your content.",
  },
  {
    title: "9. ACCOUNT TERMINATION",
    content:
      "The Creator reserves the right to suspend or permanently ban any account that violates these Terms. Banned accounts will have their electronic ID recorded. No refund will be issued for banned accounts.",
  },
  {
    title: "10. LIMITATION OF LIABILITY",
    content:
      "Ladakh Connect is a community platform. We do not verify the accuracy of user-submitted content. Always verify business information independently before making decisions.",
  },
  {
    title: "11. CHANGES TO TERMS",
    content:
      "These Terms may be updated at any time. Continued use of the app after updates constitutes acceptance of the revised Terms.",
  },
  {
    title: "12. CONTACT",
    content:
      'For support or disputes, contact the Creator through the in-app messaging system.\n\nBy tapping "Accept", you confirm you have read, understood, and agree to these Terms & Conditions.',
  },
];

export function TermsModal({ onAccept, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Handle touch scroll on mobile - defined inside useEffect to avoid dep issue
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
        setScrolledToBottom(true);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function handleAccept() {
    if (!agreed) return;
    onAccept();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]"
      data-ocid="terms.modal"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          data-ocid="terms.close_button"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
        </button>
        <div>
          <h2 className="text-white font-bold text-base leading-tight">
            Terms &amp; Conditions
          </h2>
          <p className="text-zinc-500 text-xs">Last updated: April 2026</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
            Read to the end
          </span>
        </div>
      </div>

      {/* Intro */}
      <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/20 flex-shrink-0">
        <p className="text-xs text-amber-200/80 leading-relaxed">
          Welcome to Ladakh Connect. By creating an account or using this app,
          you agree to the following Terms &amp; Conditions. Please read
          carefully before proceeding.
        </p>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-5"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {TERMS_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-amber-400 font-bold text-sm mb-2">
              {section.title}
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}

        {/* Bottom padding so last content isn't hidden behind sticky footer */}
        <div className="h-4" />

        {/* Scroll indicator */}
        {!scrolledToBottom && (
          <div className="sticky bottom-0 flex justify-center pb-1">
            <span className="text-xs text-zinc-500 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800">
              ↓ Scroll to the bottom to continue
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-zinc-800 bg-zinc-900/80 space-y-3">
        {scrolledToBottom ? (
          <label
            className="flex items-start gap-3 cursor-pointer"
            data-ocid="terms.checkbox"
          >
            <input
              type="checkbox"
              className="mt-0.5 accent-amber-500"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-sm text-zinc-300">
              I have read and agree to the Terms &amp; Conditions
            </span>
          </label>
        ) : (
          <div className="flex items-start gap-3 opacity-40 cursor-not-allowed">
            <input
              type="checkbox"
              className="mt-0.5"
              disabled
              checked={false}
              readOnly
            />
            <span className="text-sm text-zinc-400">
              Scroll to the bottom to enable this checkbox
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleAccept}
          disabled={!agreed}
          className="w-full py-3 rounded-xl font-bold transition-all text-sm"
          style={{
            backgroundColor: agreed ? "#f59e0b" : "#3f3f46",
            color: agreed ? "#000" : "#71717a",
            cursor: agreed ? "pointer" : "not-allowed",
          }}
          data-ocid="terms.submit_button"
        >
          Accept Terms &amp; Conditions
        </button>
      </div>
    </div>
  );
}
