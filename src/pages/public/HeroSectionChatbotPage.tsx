import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { submitPublicIntake } from "@/lib/publicIntake";
import { postEmbedResize, bindEmbedResizeListener } from "@/lib/embedResize";

type Phase = "goal" | "status" | "timeline" | "summary" | "form" | "success";

type ChatItem =
  | { kind: "bot"; text: string; isQuestion?: boolean }
  | { kind: "user"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "typing" };

type StepDef = {
  key: "goal" | "status" | "timeline";
  question: string;
  sub?: string;
  options: { t: string; s: string }[];
};

const STEPS: StepDef[] = [
  {
    key: "goal",
    question: "What is your main goal in Australia?",
    sub: "Three quick questions. Your answers go directly to the agent before your consultation.",
    options: [
      { t: "Work and career", s: "Skilled, sponsored or regional work" },
      { t: "Study", s: "Courses and further study planning" },
      { t: "Join family", s: "Partner, parent or child matters" },
      { t: "Start a business", s: "Business and investment streams" },
      { t: "Visit", s: "Tourism or short stays" },
    ],
  },
  {
    key: "status",
    question: "Where are you right now?",
    options: [
      { t: "In Australia, visa is fine", s: "Plenty of time left on my current visa" },
      { t: "In Australia, visa expiring soon", s: "Less than 6 months remaining" },
      { t: "Outside Australia", s: "Enquiring from overseas" },
    ],
  },
  {
    key: "timeline",
    question: "When do you want to act on this?",
    options: [
      { t: "As soon as possible", s: "I need to speak to someone now" },
      { t: "In the next 3 to 6 months", s: "Preparing ahead" },
      { t: "Just exploring", s: "Understanding the process first" },
    ],
  },
];

const BOOK_URL = "https://nanakmigration.com.au/book-consultation";

function parentPage() {
  try {
    if (document.referrer) return new URL(document.referrer).pathname || "/";
  } catch {
    /* ignore */
  }
  return "/";
}

function refNumber() {
  const d = new Date();
  const yy = d.getFullYear().toString().slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NMG-${yy}${mm}-${rand}`;
}

function postEmbedHeight(el: HTMLElement | null) {
  postEmbedResize(el, "herosection_chatbot");
}

function runwayIndex(phase: Phase) {
  if (phase === "goal") return 0;
  if (phase === "status") return 1;
  if (phase === "timeline") return 2;
  return 3;
}

export default function HeroSectionChatbotPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const framed = typeof window !== "undefined" && window.parent !== window;

  const [phase, setPhase] = useState<Phase>("goal");
  const [stepIdx, setStepIdx] = useState(0);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [showOpts, setShowOpts] = useState(false);
  const [answers, setAnswers] = useState<{ goal?: string; status?: string; timeline?: string }>({});
  const [briefRef, setBriefRef] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const booted = useRef(false);

  const scrollChat = useCallback(() => {
    const box = chatRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, []);

  const botSay = useCallback(
    (text: string, isQuestion = false, sub?: string) =>
      new Promise<void>((resolve) => {
        setItems((cur) => [...cur, { kind: "typing" }]);
        scrollChat();
        window.setTimeout(() => {
          setItems((cur) => {
            const without = cur.filter((x) => x.kind !== "typing");
            const next: ChatItem[] = [...without, { kind: "bot", text, isQuestion }];
            if (sub) next.push({ kind: "sub", text: sub });
            return next;
          });
          scrollChat();
          resolve();
        }, 550);
      }),
    [scrollChat]
  );

  useEffect(() => {
    document.documentElement.classList.add("pc-embed-html");
    document.body.classList.add("pc-embed-body");
    if (framed) {
      document.documentElement.classList.add("pc-framed");
      document.body.classList.add("pc-framed");
    }
    return () => {
      document.documentElement.classList.remove("pc-embed-html", "pc-framed");
      document.body.classList.remove("pc-embed-body", "pc-framed");
    };
  }, [framed]);

  useLayoutEffect(() => {
    postEmbedHeight(rootRef.current);
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => postEmbedHeight(el));
    ro.observe(el);
    const unbind = bindEmbedResizeListener(el, "herosection_chatbot");
    const timers = [80, 240, 600, 1200].map((ms) => window.setTimeout(() => postEmbedHeight(el), ms));
    return () => {
      ro.disconnect();
      unbind();
      timers.forEach(clearTimeout);
    };
  }, [items, phase, showOpts, err, busy]);

  useEffect(() => {
    scrollChat();
  }, [items, showOpts, phase, scrollChat]);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      const s = STEPS[0];
      await botSay(s.question, true, s.sub);
      setShowOpts(true);
    })();
  }, [botSay]);

  async function pickOption(opt: { t: string; s: string }) {
    const step = STEPS[stepIdx];
    if (!step) return;
    setShowOpts(false);
    setAnswers((a) => ({ ...a, [step.key]: opt.t }));
    setItems((cur) => [...cur, { kind: "user", text: opt.t }]);

    const nextIdx = stepIdx + 1;
    if (nextIdx < STEPS.length) {
      setStepIdx(nextIdx);
      const nextPhase = STEPS[nextIdx].key;
      setPhase(nextPhase);
      window.setTimeout(async () => {
        const ns = STEPS[nextIdx];
        await botSay(ns.question, true);
        setShowOpts(true);
      }, 320);
      return;
    }

    setPhase("summary");
    window.setTimeout(async () => {
      await botSay("Thank you. Your consultation brief is ready.", false);
      setBriefRef(refNumber());
    }, 320);
  }

  function openForm() {
    setPhase("form");
    setItems((cur) => [...cur, { kind: "user", text: "Book my consultation" }]);
    window.setTimeout(async () => {
      await botSay("Your details, and we will confirm your appointment.", true);
    }, 280);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const em = email.trim();
    if (!name.trim() || !mobile.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      setErr("Please complete all fields with a valid email.");
      return;
    }
    if (!consent) {
      setErr("Please tick the acknowledgement box.");
      return;
    }
    setBusy(true);
    setErr("");
    const ref = briefRef || refNumber();
    const summary = `${answers.goal} · ${answers.status} · ${answers.timeline}`;
    const urgent = answers.status === "In Australia, visa expiring soon";
    try {
      await submitPublicIntake({
        widget: "herosection_chatbot",
        page: parentPage(),
        company_website: hp,
        fields: {
          goal: answers.goal,
          status: answers.status,
          timeline: answers.timeline,
          ref,
        },
        result: {
          summary,
          ref,
          urgent,
          title: "Pre-Consultation Check",
        },
        lead: {
          name: name.trim(),
          email: em,
          mobile: mobile.trim(),
          goal: answers.goal,
          location: answers.status,
          article: ref,
          source: "Pre-Consultation Check",
          consent: { email: true, sms: true, wa: false },
        },
      });
      setPhase("success");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not send just now. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const runway = runwayIndex(phase);
  const urgent = answers.status === "In Australia, visa expiring soon";
  const currentOpts = showOpts && stepIdx < STEPS.length ? STEPS[stepIdx].options : [];

  return (
    <div className={`pc-shell${framed ? " pc-shell-framed" : ""}`}>
      <div ref={rootRef} id="pc-root" className="pc-card" data-embed-tight="1">
        <header className="pc-head">
          <div className="pc-pulse" aria-hidden />
          <h2>Pre-Consultation Check</h2>
          <span className="pc-badge">Intake only · Not advice</span>
        </header>

        <div className="pc-runway" aria-hidden>
          <div className="pc-runway-track">
            <div className="pc-runway-line" />
            <div className="pc-runway-fill" style={{ width: `${(runway / 3) * 100}%` }} />
            <div className="pc-runway-stops">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`pc-stop${i < runway ? " done" : ""}${i === runway ? " now" : ""}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="pc-runway-labels">
            <span>Goal</span>
            <span>Status</span>
            <span>Timeline</span>
            <span>Consult</span>
          </div>
        </div>

        <div ref={chatRef} className="pc-chat" aria-live="polite">
          {items.map((m, i) => {
            if (m.kind === "typing") {
              return (
                <div key={i} className="pc-msg pc-msg-bot pc-typing">
                  <i /><i /><i />
                </div>
              );
            }
            if (m.kind === "sub") {
              return (
                <div key={i} className="pc-subcta">
                  {m.text}
                </div>
              );
            }
            if (m.kind === "user") {
              return (
                <div key={i} className="pc-msg pc-msg-user">
                  {m.text}
                </div>
              );
            }
            return (
              <div key={i} className="pc-msg pc-msg-bot">
                {m.isQuestion ? <div className="pc-q">{m.text}</div> : m.text}
              </div>
            );
          })}

          {currentOpts.length > 0 && (
            <div className="pc-opts" role="group">
              {currentOpts.map((o, i) => (
                <button
                  key={o.t}
                  type="button"
                  className="pc-opt"
                  style={{ animationDelay: `${i * 70}ms` }}
                  onClick={() => pickOption(o)}
                >
                  {o.t}
                  <small>{o.s}</small>
                </button>
              ))}
            </div>
          )}

          {phase === "summary" && briefRef && (
            <div className="pc-summary">
              <div className="pc-summary-head">
                <h3>Your consultation brief is ready</h3>
                <p>
                  Book a consultation and our Registered Migration Agent reviews this brief before you arrive,
                  so your paid time is spent on answers, not background.
                </p>
              </div>
              <div className="pc-brief">
                <div className="pc-brief-title">
                  <span>Consultation brief</span>
                  <span className="pc-ref">Ref {briefRef}</span>
                </div>
                <div className="pc-brief-row">
                  <span className="k">Main goal</span>
                  <span className="v">{answers.goal}</span>
                </div>
                <div className="pc-brief-row">
                  <span className="k">Current status</span>
                  <span className="v">{answers.status}</span>
                </div>
                <div className="pc-brief-row">
                  <span className="k">Timeline</span>
                  <span className="v">{answers.timeline}</span>
                </div>
                <div className="pc-brief-row">
                  <span className="k">Reviewed by</span>
                  <span className="v">Registered Migration Agent</span>
                </div>
              </div>
              {urgent && (
                <div className="pc-priority">
                  <b>Limited visa time noted.</b> Enquiries with less than 6 months of visa runway are offered our
                  earliest available consultation times.
                </div>
              )}
              <button type="button" className="pc-cta" onClick={openForm}>
                Book my consultation
                <small>Personalised advice from a Registered Migration Agent</small>
              </button>
              <div className="pc-subcta">
                Consultations are paid appointments · <b>MARN 2619467</b> · Bound by the Code of Conduct
              </div>
            </div>
          )}

          {phase === "form" && (
            <form className="pc-leadform" onSubmit={onSubmit}>
              <input className="pc-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden />
              <div>
                <label htmlFor="pc-nm">Full name</label>
                <input id="pc-nm" type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="pc-ph">Mobile</label>
                <input id="pc-ph" type="tel" autoComplete="tel" placeholder="04XX XXX XXX" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
              <div>
                <label htmlFor="pc-em">Email</label>
                <input id="pc-em" type="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <label className="pc-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                I understand this check is an intake tool only and does not provide migration advice, that consultations
                are paid appointments, and I consent to Nanak Migration Group contacting me about my enquiry.
              </label>
              {err && <div className="pc-err">{err}</div>}
              <button type="submit" className="pc-cta" disabled={busy}>
                {busy ? "Sending…" : "Continue to booking"}
              </button>
            </form>
          )}

          {phase === "success" && (
            <div className="pc-success">
              <div className="pc-tick" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <polyline points="4 13 10 19 20 6" />
                </svg>
              </div>
              <h3>Almost there, {name.trim().split(" ")[0]}</h3>
              <p>
                Your brief (Ref {briefRef}) has been saved. Choose a consultation time below and it will be with the
                agent before you arrive.
              </p>
              <a className="pc-cta" href={BOOK_URL} target="_top" rel="noreferrer">
                Choose my consultation time
                <small>Registered Migration Agent · MARN 2619467</small>
              </a>
            </div>
          )}
        </div>

        <div className="pc-disc">
          <b>Intake tool only — this is not migration advice.</b> This check collects information to prepare your
          enquiry. It does not assess your eligibility for any visa and no outcome is suggested or guaranteed.
          Immigration assistance is provided only in a paid consultation with our Registered Migration Agent (MARN
          2619467), who is bound by the Migration Agents Code of Conduct.
        </div>
      </div>
    </div>
  );
}
