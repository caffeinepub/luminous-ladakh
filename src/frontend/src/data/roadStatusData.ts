import type { RoadStatus } from "../types";

const KEY = "lc_road_status";

const DEFAULTS: RoadStatus[] = [
  {
    id: "r1",
    name: "Manali–Leh Highway",
    status: "open",
    note: "Open to all vehicles. Road conditions good.",
  },
  {
    id: "r2",
    name: "Srinagar–Leh Highway",
    status: "open",
    note: "All clear. NH1 fully operational.",
  },
  {
    id: "r3",
    name: "Khardung La Pass",
    status: "open",
    note: "Open 6 AM–8 PM. Altitude 5,359m. Drive carefully.",
  },
  {
    id: "r4",
    name: "Chang La Pass",
    status: "caution",
    note: "Light snowfall reported. Drive with caution.",
  },
  {
    id: "r5",
    name: "Zoji La Pass",
    status: "open",
    note: "Open to traffic. Snow clearing done.",
  },
];

export function loadRoadStatus(): RoadStatus[] {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULTS;
}

export function saveRoadStatus(roads: RoadStatus[]) {
  localStorage.setItem(KEY, JSON.stringify(roads));
  window.dispatchEvent(new Event("lc_data_changed"));
}
