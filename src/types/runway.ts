export type LeadStatus = "new" | "engaged" | "consult" | "won" | "lost";

export type LeadSignal = {
  type: "calc" | "gate" | "cta" | "view";
  detail: string;
  at: string;
};

export type LeadNote = {
  _id?: string;
  text: string;
  at: string;
};

export type Lead = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  mobile: string;
  subclass: string;
  expiry: string | null;
  goal: string;
  occupation: string;
  location: string;
  source: string;
  article: string;
  status: LeadStatus;
  owner: string;
  contactedAt: string | null;
  consent: { email: boolean; sms: boolean; wa: boolean };
  notes: LeadNote[];
  signals: LeadSignal[];
  createdAt: string;
  band?: string;
  bandLabel?: string;
  daysToExpiry?: number | null;
  sla?: { s: string; mins: number };
  pathway?: { c: string; f: number }[];
  ltv?: number;
  score?: number;
  nba?: { title: string; why: string; wa: string; ch: string };
  triggers?: { at: number; what: string }[];
  visaLabel?: string;
  goalLabel?: string;
};

export type Booking = {
  _id: string;
  id?: string;
  leadId?: string;
  name: string;
  email: string;
  mobile: string;
  type: string;
  office: string;
  mode: "Video" | "Phone";
  at: string;
  status: "confirmed" | "completed" | "no-show" | "cancelled";
  topic: string;
  heard: string;
  oaf: { status: string; data: Record<string, string> | null };
  msgs: { kind: string; due: string; sent: string | null; body?: string }[];
  consultType?: { id: string; name: string; dur: number; fee: number; who: string; desc: string };
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Kpis = {
  monthNew: number;
  awaitingContact: number;
  slaBreaches: number;
  criticalRunway: number;
  pipelineLtv: number;
};

export type Counts = {
  breach: number;
  crit: number;
  unalloc: number;
};

export const WIDGETS = [
  { w: "Visa Expiry Checker", where: "Every visa page + home", asks: "Subclass + expiry date", gives: "Instant options window verdict", data: "Subclass + expiry for Radar", magnet: "Subclass endgame checklist" },
  { w: "PR Points Calculator", where: "Skilled visa pages + blog", asks: "Age, English, occupation, experience", gives: "Points score on screen", data: "Score, occupation code, weak areas", magnet: "Emailed points breakdown PDF" },
  { w: "Fee Estimator", where: "Fees page + service pages", asks: "Visa type + situation", gives: "Honest fee range", data: "Target subclass, budget intent", magnet: "Full fee schedule PDF" },
  { w: "Sponsor Cost Estimator", where: "Employer pages", asks: "Nominations, salary, term", gives: "SAF levy + total cost", data: "B2B lead, company size, roles", magnet: "2026 sponsorship cost sheet" },
  { w: "Partner Evidence Scorecard", where: "Partner visa pages", asks: "12 yes/no relationship questions", gives: "Evidence strength rating", data: "Relationship stage, evidence gaps", magnet: "Partner evidence checklist" },
  { w: "Micro CTA strip", where: "End of every article", asks: "Does this apply to you?", gives: "Yes → WhatsApp deep link", data: "Article + intent", magnet: "—" },
  { w: "Newsletter", where: "Sidebar + footer", asks: "Email only", gives: "Monthly policy-change brief", data: "Top-of-funnel pool", magnet: "—" },
];
