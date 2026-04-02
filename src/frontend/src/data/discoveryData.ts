import type { DiscoveryPost } from "../types";

const KEY = "lc_discoveries";

export function loadDiscoveries(): DiscoveryPost[] {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveDiscoveries(posts: DiscoveryPost[]) {
  localStorage.setItem(KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event("lc_data_changed"));
}
