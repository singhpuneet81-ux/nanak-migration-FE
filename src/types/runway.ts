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

export type Client = {
  _id: string;
  id?: string;
  kind: "person" | "business";
  status: "lead" | "active" | "inactive";
  name: string;
  email: string;
  mobile: string;
  occupation: string;
  location: string;
  preferredChannel: "email" | "phone" | "whatsapp";
  visaCurrent: string;
  visaGoal: string;
  visaExpiry: string | null;
  source: string;
  assignedTo: string;
  matterCount?: number;
  openMatterCount?: number;
  tags: string[];
  notes: { text: string; at: string }[];
};

export type Matter = {
  _id: string;
  id?: string;
  title: string;
  clientId: string;
  clientName?: string;
  leadId?: string | null;
  bookingId?: string | null;
  type: string;
  visaCategory: string;
  stage: "intake" | "advice" | "engaged" | "docs" | "review" | "lodgement" | "post-lodgement" | "closed";
  status: "open" | "on-hold" | "lodged" | "approved" | "closed";
  assignedTo: string;
  office: string;
  feeStatus: "unpaid" | "part-paid" | "paid";
  lodgementStatus: "not-ready" | "ready" | "lodged" | "decision";
  nextAction: string;
  nextActionAt: string | null;
  documentsOutstanding: number;
  riskLevel: "low" | "medium" | "high";
  documentCount?: number;
  overdueDocs?: number;
  deadlines: { _id?: string; label: string; due: string; done: boolean }[];
  notes: { text: string; at: string }[];
};

export type DocumentRecord = {
  _id: string;
  id?: string;
  clientId: string;
  clientName?: string;
  matterId?: string | null;
  matterTitle?: string;
  category: string;
  name: string;
  status: "required" | "requested" | "received" | "verified" | "expired";
  requestedAt: string | null;
  receivedAt: string | null;
  expiryAt: string | null;
  version: number;
  source: "client" | "agent" | "generated";
  notes: string;
};

export type ComplianceCheck = {
  _id: string;
  id?: string;
  clientId: string;
  clientName?: string;
  matterId?: string | null;
  matterTitle?: string;
  kycStatus: "pending" | "in-review" | "verified";
  sourceOfFundsStatus: "pending" | "review" | "cleared";
  sanctionsStatus: "pending" | "clear" | "manual-review";
  pepStatus: "clear" | "watch";
  riskRating: "low" | "medium" | "high";
  overallStatus: "pending" | "approved" | "escalated";
  reviewer: string;
  reviewedAt: string | null;
  notes: { text: string; at: string }[];
};

export type ReportsData = {
  kpis: {
    leads: number;
    bookings: number;
    clients: number;
    openMatters: number;
    pendingCompliance: number;
  };
  funnel: {
    newLeads: number;
    engagedLeads: number;
    consultLeads: number;
    wonLeads: number;
    activeClients: number;
  };
  bookings: {
    confirmed: number;
    completed: number;
    noShow: number;
  };
  documents: {
    total: number;
    ready: number;
    outstanding: number;
  };
  compliance: {
    low: number;
    medium: number;
    high: number;
  };
  upcomingDeadlines: { matterId: string; title: string; label: string; due: string }[];
  teamWorkload: { assignee: string; matters: number; highRisk: number; docsOutstanding: number }[];
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
  { w: "Hero pathway chatbot", where: "WordPress hero banner (iframe)", asks: "Goal, location, job offer, name + email", gives: "Suggested subclass in-chat", data: "Lead in All leads · Pathway assessment", magnet: "Book free consult" },
];
