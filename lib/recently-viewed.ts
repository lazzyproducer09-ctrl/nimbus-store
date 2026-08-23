// ---------------------------------------------------------------------------
// "Recently viewed" — the last few products this browser opened.
//
// Kept in localStorage rather than the database on purpose: it should work for
// signed-out shoppers (who are most of the traffic from an ad), needs no
// migration, and carries nothing personal.
// ---------------------------------------------------------------------------

const KEY = "yoink-recently-viewed";
const MAX = 8;

export function readRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((i) => typeof i === "string").slice(0, MAX) : [];
  } catch {
    // Private mode, quota, or hand-edited junk — never let this throw.
    return [];
  }
}

/** Record a view. Most recent first, no duplicates, capped at MAX. */
export function recordView(productId: string) {
  if (typeof window === "undefined" || !productId) return;
  try {
    const next = [productId, ...readRecentlyViewed().filter((i) => i !== productId)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
