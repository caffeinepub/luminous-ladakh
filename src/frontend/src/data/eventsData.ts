import type { LCEvent } from "../types";

const KEY = "lc_events";

const SEED_EVENTS: LCEvent[] = [
  {
    id: "ev1",
    title: "Hemis Festival",
    date: "2026-06-16",
    location: "Hemis Monastery, Ladakh",
    description:
      "The grandest of all Ladakhi festivals. Two-day Cham mask dance (Tsechu) celebrating the birth of Guru Padmasambhava. Monks perform elaborate rituals in colorful costumes.",
    postedBy: "system",
    postedByUsername: "ladakhconnect",
    postedByRole: "creator",
    paymentId: "",
    status: "approved",
    timestamp: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "ev2",
    title: "Losar Festival",
    date: "2026-02-10",
    location: "Leh, Ladakh",
    description:
      "Ladakhi New Year celebration with traditional dances, prayers at monasteries, exchange of gifts, and feasts. Communities gather to welcome the new year with rituals and joy.",
    postedBy: "system",
    postedByUsername: "ladakhconnect",
    postedByRole: "creator",
    paymentId: "",
    status: "approved",
    timestamp: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "ev3",
    title: "Sindhu Darshan Festival",
    date: "2026-06-13",
    location: "Shey, Banks of the Indus River",
    description:
      "A three-day cultural confluence celebrating the Sindhu (Indus) river as a symbol of national unity. Features folk dances, music, sports, and cultural programs from across India.",
    postedBy: "system",
    postedByUsername: "ladakhconnect",
    postedByRole: "creator",
    paymentId: "",
    status: "approved",
    timestamp: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "ev4",
    title: "Ladakh Festival",
    date: "2026-09-01",
    location: "Leh, Ladakh",
    description:
      "A 10-day government-organized cultural extravaganza showcasing Ladakhi culture — polo matches, archery, mask dances, handicraft exhibitions, and processions through Leh town.",
    postedBy: "system",
    postedByUsername: "ladakhconnect",
    postedByRole: "creator",
    paymentId: "",
    status: "approved",
    timestamp: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "ev5",
    title: "Dosmoche Festival",
    date: "2026-03-05",
    location: "Leh, Ladakh",
    description:
      "A two-day religious festival held at Leh Mosque and Namgyal Tsemo Monastery. Features scapegoat ritual, prayers for a prosperous harvest, and colorful processions.",
    postedBy: "system",
    postedByUsername: "ladakhconnect",
    postedByRole: "creator",
    paymentId: "",
    status: "approved",
    timestamp: "2026-04-02T00:00:00.000Z",
  },
];

export function initEventsData() {
  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) {
      localStorage.setItem(KEY, JSON.stringify(SEED_EVENTS));
    }
  } catch {}
}

export function loadEvents(): LCEvent[] {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : SEED_EVENTS;
  } catch {
    return SEED_EVENTS;
  }
}

export function saveEvents(events: LCEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("lc_data_changed"));
}
