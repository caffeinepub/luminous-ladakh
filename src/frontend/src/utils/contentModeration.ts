const MILITARY_KEYWORDS = [
  "army",
  "military",
  "soldier",
  "weapon",
  "bomb",
  "explosive",
  "rifle",
  "gun",
  "ammunition",
  "artillery",
  "barracks",
  "regiment",
  "battalion",
  "brigade",
  "corps",
  "sepoy",
  "jawans",
  "bsf",
  "crpf",
  "cisf",
  "defence",
  "cantonment",
  "bunker",
  "patrol",
  "armed forces",
];

const EXPLICIT_KEYWORDS = [
  "nude",
  "naked",
  "pornography",
  "explicit",
  "adult content",
  "nsfw",
  "obscene",
];

const SPAM_KEYWORDS = [
  "click here",
  "buy now",
  "free money",
  "lottery",
  "casino",
  "bet",
];

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  violationLevel: 1 | 2 | null;
}

export function moderateContent(text: string): ModerationResult {
  const lower = text.toLowerCase();
  for (const kw of MILITARY_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        allowed: false,
        reason:
          "Military/army content detected. This is strictly prohibited and will result in a Level 2 violation.",
        violationLevel: 2,
      };
    }
  }
  for (const kw of EXPLICIT_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        allowed: false,
        reason:
          "Explicit content detected. This is not allowed on Ladakh Connect.",
        violationLevel: 1,
      };
    }
  }
  for (const kw of SPAM_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        allowed: false,
        reason: "Spam content detected. Please keep posts relevant to Ladakh.",
        violationLevel: 1,
      };
    }
  }
  return { allowed: true, violationLevel: null };
}

const CARD_RANKS = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
];
const CARD_SUITS = ["hearts", "diamonds", "clubs", "spades"];

export function isValidCreatorSecurityWord(word: string): boolean {
  const normalized = word.trim().toLowerCase();
  if (normalized === "52 decks of cards") return true;
  for (const r of CARD_RANKS) {
    for (const s of CARD_SUITS) {
      if (normalized === `${r} of ${s}`) return true;
    }
  }
  return false;
}
