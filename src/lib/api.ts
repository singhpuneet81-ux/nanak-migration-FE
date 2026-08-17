const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "https://api.nanakmigration.com.au/api"
).replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("runway_token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json.data as T;
}

export async function login(email: string, password: string) {
  localStorage.removeItem("runway_token");

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || (res.status === 401 ? "Invalid email or password" : `Login failed (${res.status})`));
  }
  return json.data as { token: string; user: { id: string; name: string; email: string; role: string } };
}

export async function getMe() {
  return request<{ id: string; name: string; email: string; role: string }>("/auth/me");
}

export async function getRadar() {
  return request<{
    kpis: import("@/types/runway").Kpis;
    counts: import("@/types/runway").Counts;
    chips: import("@/types/runway").Lead[];
    noExpiry: import("@/types/runway").Lead[];
    firstContactQueue: import("@/types/runway").Lead[];
    shortRunway: import("@/types/runway").Lead[];
  }>("/admin/leads/radar");
}

export async function getLeads(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return request<{
    leads: import("@/types/runway").Lead[];
    kpis: import("@/types/runway").Kpis;
    counts: import("@/types/runway").Counts;
  }>(`/admin/leads${q ? `?${q}` : ""}`);
}

export async function getLead(id: string) {
  return request<import("@/types/runway").Lead>(`/admin/leads/${id}`);
}

export async function createLead(body: Partial<import("@/types/runway").Lead>) {
  return request<import("@/types/runway").Lead>("/admin/leads", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateLead(id: string, body: Record<string, unknown>) {
  return request<import("@/types/runway").Lead>(`/admin/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function exportLeads(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return request<{ rows: (string | number | boolean)[][] }>(`/admin/leads/export${q ? `?${q}` : ""}`);
}

export async function getSources() {
  return request<{
    sources: { source: string; leads: number; consult: number; won: number; ltv: number; consultRate: number }[];
    articles: { article: string; leads: number; consult: number }[];
  }>("/admin/leads/sources");
}

export async function getPathways() {
  return request<{
    openCount: number;
    pipelineLtv: number;
    triggerCount: number;
    upcomingTriggers: { lead: import("@/types/runway").Lead; trigger: { at: number; what: string } }[];
    leads: import("@/types/runway").Lead[];
  }>("/admin/leads/pathways");
}

export async function getTeam() {
  return request<{
    members: {
      name: string;
      role: string;
      office: string;
      capacity: number;
      scope: string;
      load: number;
      full: boolean;
      leads: import("@/types/runway").Lead[];
    }[];
    unallocated: import("@/types/runway").Lead[];
  }>("/admin/leads/team");
}

export async function getSegments(channel = "email") {
  return request<{
    channel: string;
    segments: { id: string; name: string; desc: string; count: number }[];
  }>(`/admin/leads/segments?channel=${channel}`);
}

export async function exportSegment(segment: string, channel = "email") {
  return request<{ rows: (string | number)[][]; count: number }>(
    `/admin/leads/segments/export?segment=${segment}&channel=${channel}`
  );
}

export async function getMeta() {
  return request<{
    sources: string[];
    bandLabels: Record<string, string>;
    statuses: string[];
  }>("/admin/meta");
}

export async function getBookings() {
  return request<{
    bookings: import("@/types/runway").Booking[];
    today: number;
    upcoming: import("@/types/runway").Booking[];
    past: import("@/types/runway").Booking[];
    remindersQueued: number;
    noShowRate: number | null;
    consultTypes: { id: string; name: string; dur: number; fee: number; who: string; desc: string }[];
    offices: string[];
    heard: string[];
    msgLabels: Record<string, string>;
  }>("/admin/bookings");
}

export async function createBooking(body: Record<string, unknown>) {
  return request<import("@/types/runway").Booking>("/admin/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateBooking(id: string, body: Record<string, unknown>) {
  return request<import("@/types/runway").Booking>(`/admin/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getComms() {
  return request<{
    queue: { booking: import("@/types/runway").Booking; message: { kind: string; due: string; sent: string | null; body?: string } }[];
    msgLabels: Record<string, string>;
  }>("/admin/bookings/comms");
}

export async function submitOaf(bookingId: string, data: Record<string, string | boolean>) {
  return request<{ booking: import("@/types/runway").Booking; lead: import("@/types/runway").Lead | null }>(
    `/admin/bookings/${bookingId}/oaf`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export function downloadCsv(filename: string, rows: (string | number | boolean | null | undefined)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export function fm(n: number) {
  return "$" + n.toLocaleString("en-AU");
}

export function fdate(ts: string | number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export function fmins(m: number) {
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.round((m / 60) * 10) / 10}h`;
  return `${Math.round((m / 1440) * 10) / 10}d`;
}

export function ftime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

export function fday(ts: string) {
  return new Date(ts).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short" });
}
