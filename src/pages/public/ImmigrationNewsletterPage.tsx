import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { submitPublicIntake } from "@/lib/publicIntake";
import { postEmbedResize, bindEmbedResizeListener } from "@/lib/embedResize";

function parentPage() {
  try {
    if (document.referrer) return new URL(document.referrer).pathname || "/";
  } catch {
    /* ignore */
  }
  return "/";
}

function postEmbedHeight(el: HTMLElement | null) {
  postEmbedResize(el, "immigration_newsletter");
}

export default function ImmigrationNewsletterPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const framed = typeof window !== "undefined" && window.parent !== window;

  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("nl-embed-html");
    document.body.classList.add("nl-embed-body");
    if (framed) {
      document.documentElement.classList.add("nl-framed");
      document.body.classList.add("nl-framed");
    }
    return () => {
      document.documentElement.classList.remove("nl-embed-html", "nl-framed");
      document.body.classList.remove("nl-embed-body", "nl-framed");
    };
  }, [framed]);

  useLayoutEffect(() => {
    postEmbedHeight(rootRef.current);
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => postEmbedHeight(el));
    ro.observe(el);
    const unbind = bindEmbedResizeListener(el, "immigration_newsletter");
    const timers = [80, 240, 600].map((ms) => window.setTimeout(() => postEmbedHeight(el), ms));
    return () => {
      ro.disconnect();
      unbind();
      timers.forEach(clearTimeout);
    };
  }, [done, err, busy]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setErr("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await submitPublicIntake({
        widget: "immigration_newsletter",
        page: parentPage(),
        company_website: hp,
        lead: {
          email: em,
          name: "Newsletter subscriber",
          consent: { email: true, sms: false, wa: false },
        },
      });
      setDone(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not subscribe just now. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`nl-shell${framed ? " nl-shell-framed" : ""}`}>
      <div ref={rootRef} id="nl-root" className="nl-root" data-embed-tight="1">
        <div className="nl-inner">
          <div className="nl-copy">
            <div className="nl-badge">
              <span className="nl-dot" aria-hidden />
              Immigration Updates
            </div>
            <h2 className="nl-title">Australia immigration news straight to your inbox</h2>
            <p className="nl-sub">
              Policy updates, visa changes, occupation list alerts — no spam, unsubscribe any time.
            </p>
          </div>

          {done ? (
            <div className="nl-done">
              <span className="nl-done-icon" aria-hidden>
                ✓
              </span>
              <div>
                <strong>You&apos;re subscribed</strong>
                <span>Look out for our next immigration update.</span>
              </div>
            </div>
          ) : (
            <form className="nl-form" onSubmit={onSubmit}>
              <div className="nl-row">
                <input
                  className="nl-field"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  enterKeyHint="send"
                  disabled={busy}
                />
                <button className="nl-btn" type="submit" disabled={busy}>
                  {busy ? "…" : "Subscribe →"}
                </button>
              </div>
              <input
                className="nl-hp"
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={hp}
                onChange={(e) => setHp(e.target.value)}
              />
              {err && <p className="nl-err">{err}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
