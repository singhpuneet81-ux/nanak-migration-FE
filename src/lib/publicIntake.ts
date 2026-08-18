/**
 * Public website intake — no JWT, no admin session, no intake API key.
 * Used by WordPress iframe embeds only.
 */
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "https://api.nanakmigration.com.au/api"
).replace(/\/$/, "");

export async function submitPublicIntake(body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return (json.data ?? json) as { ok: boolean; created?: boolean; skipped?: boolean };
}
