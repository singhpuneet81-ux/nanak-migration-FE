import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { submitPathwayIntake } from "@/lib/api";

type GoalId = "work" | "study" | "family" | "business" | "visit";
type LocId = "onshore" | "offshore";
type JobId = "sponsored" | "independent";

type Msg =
  | { kind: "bot"; text: string }
  | { kind: "user"; text: string }
  | { kind: "pathway"; title: string; code: string };

const GOALS: { id: GoalId; label: string }[] = [
  { id: "work", label: "Work & Career" },
  { id: "study", label: "Study" },
  { id: "family", label: "Join Family" },
  { id: "business", label: "Start a Business" },
  { id: "visit", label: "Visit / Tourism" },
];

const LOCS: { id: LocId; label: string }[] = [
  { id: "onshore", label: "In Australia (onshore)" },
  { id: "offshore", label: "Outside Australia (offshore)" },
];

const JOBS: { id: JobId; label: string }[] = [
  { id: "sponsored", label: "Yes — employer sponsored" },
  { id: "independent", label: "No — independent pathway" },
];

const INTRO =
  "Hello — I'll ask a few quick questions and give you preliminary pathway guidance. Nothing here is migration advice.";

function resolvePathway(goal: GoalId, loc: LocId, job: JobId | null) {
  if (goal === "work" && job === "sponsored") {
    return {
      title: "Temporary Skill Shortage (TSS)",
      code: "482",
      blurb:
        "With an Australian job offer, a common starting point is the Temporary Skill Shortage (TSS) visa (subclass 482). Occupation lists, sponsorship and timing still need an RMA to confirm — this is not advice.",
    };
  }
  if (goal === "work") {
    return {
      title: loc === "onshore" ? "Skilled Nominated" : "Skilled Independent",
      code: loc === "onshore" ? "190" : "189",
      blurb:
        "Without a sponsor, people often look at independent skilled visas (189 / 190 / 491) if the occupation is on the relevant list. Points, English and state nomination decide the realistic route.",
    };
  }
  if (goal === "study") {
    return {
      title: "Student visa",
      code: "500",
      blurb:
        "A student visa (subclass 500) is the usual first look for study. Course, Genuine Student requirement and funds still need a proper assessment.",
    };
  }
  if (goal === "family") {
    return {
      title: loc === "onshore" ? "Partner visa (onshore)" : "Partner / family visa",
      code: loc === "onshore" ? "820" : "309",
      blurb:
        "Family pathways usually turn on relationship evidence, sponsorship and timing. A consult confirms which subclass actually fits.",
    };
  }
  if (goal === "business") {
    return {
      title: "Business Innovation & Investment",
      code: "188",
      blurb:
        "Business and investment visas are highly specific. Turnover, assets and the intended activity decide whether a 188-style pathway is even on the table.",
    };
  }
  return {
    title: "Visitor visa",
    code: "600",
    blurb:
      "A visitor visa (subclass 600) is the usual starting point for short stays. Conditions, stay length and any later onshore options need an RMA to confirm.",
  };
}

function parentPage() {
  try {
    if (document.referrer) return new URL(document.referrer).pathname || "/";
  } catch {
    /* ignore */
  }
  return "/";
}

function postEmbedHeight(el: HTMLElement | null) {
  if (!el || window.parent === window) return;
  const h = Math.ceil(Math.max(el.getBoundingClientRect().height, el.offsetHeight, el.scrollHeight));
  if (h < 40) return;
  const payload = {
    type: "nanak-embed-resize",
    height: h,
    source: "herosection_chatbot",
    compact: true,
    maxHeight: 640,
  };
  try {
    window.parent.postMessage(payload, "*");
  } catch {
    /* ignore */
  }
  try {
    window.parent.document.querySelectorAll("iframe").forEach((frame) => {
      try {
        if (frame.contentWindow === window) {
          frame.style.height = `${h}px`;
          frame.style.minHeight = "0";
          frame.style.maxHeight = "none";
          frame.style.overflow = "hidden";
          frame.style.display = "block";
          frame.style.width = "100%";
          frame.removeAttribute("height");
          frame.setAttribute("scrolling", "no");
        }
      } catch {
        /* ignore */
      }
    });
  } catch {
    /* ignore */
  }
}

export default function HeroSectionChatbotPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const framed = typeof window !== "undefined" && window.parent !== window;

  const [msgs, setMsgs] = useState<Msg[]>([
    { kind: "bot", text: INTRO },
    { kind: "bot", text: "What's your main goal in Australia?" },
  ]);
  const [step, setStep] = useState<"goal" | "loc" | "job" | "capture" | "done">("goal");
  const [goal, setGoal] = useState<(typeof GOALS)[0] | null>(null);
  const [loc, setLoc] = useState<(typeof LOCS)[0] | null>(null);
  const [job, setJob] = useState<(typeof JOBS)[0] | null>(null);
  const [pathway, setPathway] = useState<ReturnType<typeof resolvePathway> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("pa-embed-html");
    document.body.classList.add("pa-embed-body");
    if (framed) {
      document.documentElement.classList.add("pa-framed");
      document.body.classList.add("pa-framed");
    }
    return () => {
      document.documentElement.classList.remove("pa-embed-html", "pa-framed");
      document.body.classList.remove("pa-embed-body", "pa-framed");
    };
  }, [framed]);

  useLayoutEffect(() => {
    postEmbedHeight(rootRef.current);
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => postEmbedHeight(el));
    ro.observe(el);
    const timers = [80, 240, 600, 1200].map((ms) => window.setTimeout(() => postEmbedHeight(el), ms));
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [msgs, step, err, busy]);

  useEffect(() => {
    const box = logRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [msgs, step]);

  function push(...next: Msg[]) {
    setMsgs((cur) => [...cur, ...next]);
  }

  function pickGoal(g: (typeof GOALS)[0]) {
    setGoal(g);
    push({ kind: "user", text: g.label }, { kind: "bot", text: "Where are you currently located?" });
    setStep("loc");
  }

  function pickLoc(l: (typeof LOCS)[0]) {
    setLoc(l);
    push({ kind: "user", text: l.label });
    if (goal?.id === "work") {
      push({ kind: "bot", text: "Do you have a job offer from an Australian employer?" });
      setStep("job");
      return;
    }
    finish(goal!, l, null);
  }

  function pickJob(j: (typeof JOBS)[0]) {
    setJob(j);
    push({ kind: "user", text: j.label });
    finish(goal!, loc!, j);
  }

  function finish(g: (typeof GOALS)[0], l: (typeof LOCS)[0], j: (typeof JOBS)[0] | null) {
    const p = resolvePathway(g.id, l.id, j?.id ?? null);
    setPathway(p);
    push(
      { kind: "bot", text: p.blurb },
      { kind: "pathway", title: p.title, code: p.code },
      { kind: "bot", text: "Leave your details and we’ll send this note plus a link to book a free consult." }
    );
    setStep("capture");
  }

  function startOver() {
    setMsgs([
      { kind: "bot", text: INTRO },
      { kind: "bot", text: "What's your main goal in Australia?" },
    ]);
    setStep("goal");
    setGoal(null);
    setLoc(null);
    setJob(null);
    setPathway(null);
    setName("");
    setEmail("");
    setMobile("");
    setErr("");
    setBusy(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pathway || !goal || !loc) return;
    const em = email.trim();
    if (!name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      setErr("Add your name and a valid email.");
      return;
    }
    setBusy(true);
    setErr("");
    const summary = `${goal.label} · ${loc.label}${job ? ` · ${job.label}` : ""} → ${pathway.title} ${pathway.code}`;
    try {
      await submitPathwayIntake({
        widget: "herosection_chatbot",
        page: parentPage(),
        company_website: hp,
        result: { summary, code: pathway.code, title: pathway.title },
        fields: { goal: goal.id, location: loc.id, jobOffer: job?.id || "" },
        lead: {
          name: name.trim(),
          email: em,
          mobile: mobile.trim(),
          goal: pathway.code,
          subclass: pathway.code,
          location: loc.label,
          source: "Pathway assessment",
          consent: { email: true, sms: false, wa: false },
        },
      });
      push({ kind: "bot", text: `Thanks ${name.trim().split(" ")[0]}. You’re on the list — check All leads in the desk, and book a consult when you’re ready.` });
      setStep("done");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not send just now. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const options =
    step === "goal" ? GOALS.map((g) => ({ id: g.id, label: g.label, run: () => pickGoal(g) })) : step === "loc" ? LOCS.map((l) => ({ id: l.id, label: l.label, run: () => pickLoc(l) })) : step === "job" ? JOBS.map((j) => ({ id: j.id, label: j.label, run: () => pickJob(j) })) : [];

  return (
    <div className={`pa-shell${framed ? " pa-shell-framed" : ""}`}>
      <div ref={rootRef} id="pa-root" className="pa-root" data-embed-tight="1">
        <header className="pa-head">
          <div className="pa-head-l">
            <span className="pa-dot" aria-hidden />
            <h1>Pathway Assessment</h1>
          </div>
          <span className="pa-tag">Preliminary · Not advice</span>
        </header>

        <div ref={logRef} className="pa-log">
          {msgs.map((m, i) =>
            m.kind === "pathway" ? (
              <div key={i} className="pa-path">
                <div className="pa-path-l">Suggested pathway</div>
                <div className="pa-path-r">
                  <span className="pa-path-t">{m.title}</span>
                  <span className="pa-path-c">{m.code}</span>
                </div>
              </div>
            ) : (
              <div key={i} className={`pa-row pa-${m.kind}`}>
                <div className={`pa-bub pa-bub-${m.kind}`}>{m.text}</div>
              </div>
            )
          )}
        </div>

        {options.length > 0 && (
          <div className="pa-opts">
            {options.map((o) => (
              <button key={o.id} type="button" className="pa-opt" onClick={o.run}>
                {o.label}
              </button>
            ))}
          </div>
        )}

        {step === "capture" && (
          <form className="pa-form" onSubmit={onSubmit}>
            <input className="pa-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden />
            <div className="pa-grid">
              <input className="pa-in" placeholder="Full name *" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="pa-in" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <input className="pa-in" type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
            {err && <div className="pa-err">{err}</div>}
            <div className="pa-actions">
              <button type="submit" className="pa-go" disabled={busy}>
                {busy ? "Sending…" : "Book Free Consultation →"}
              </button>
              <button type="button" className="pa-reset" onClick={startOver}>
                Start over
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="pa-actions pa-actions-done">
            <a className="pa-go" href="https://nanakmigration.com.au/book-consultation" target="_top" rel="noreferrer">
              Book Free Consultation →
            </a>
            <button type="button" className="pa-reset" onClick={startOver}>
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
