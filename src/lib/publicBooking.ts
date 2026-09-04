/**
 * Public self-serve booking — no JWT / admin session.
 */
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "https://api.nanakmigration.com.au/api"
).replace(/\/$/, "");

export type PublicConsultType = {
  id: string;
  name: string;
  dur: number;
  fee: number;
  who: string;
  desc: string;
};

export type PublicBookingOptions = {
  consultTypes: PublicConsultType[];
  offices: string[];
  heard: string[];
  takenSlots: string[];
};

export async function fetchPublicBookingOptions(): Promise<PublicBookingOptions> {
  const res = await fetch(`${API_BASE}/public/bookings/options`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Could not load booking options (${res.status})`);
  }
  return json.data as PublicBookingOptions;
}

export async function createPublicBooking(body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/public/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Booking failed (${res.status})`);
  }
  return json.data as {
    id: string;
    at: string;
    type: string;
    mode: string;
    office: string;
    consultType: PublicConsultType;
    ok: boolean;
    skipped?: boolean;
  };
}
