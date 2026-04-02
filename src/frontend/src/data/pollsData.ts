export interface Poll {
  id: string;
  question: string;
  options: string[];
  createdBy: string;
  expiryDate?: string;
  closed: boolean;
  createdAt: string;
}

// { pollId: { userId: optionIndex } }
export type PollVotes = Record<string, Record<string, number>>;

const POLLS_KEY = "lc_polls";
const VOTES_KEY = "lc_poll_votes";

export function loadPolls(): Poll[] {
  try {
    return JSON.parse(localStorage.getItem(POLLS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePolls(polls: Poll[]) {
  try {
    localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  } catch {}
}

export function loadVotes(): PollVotes {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveVotes(votes: PollVotes) {
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  } catch {}
}

export function generatePollId(): string {
  return `poll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
