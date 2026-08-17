import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/** Local Unsplash travel hero (airplane wing — journeys abroad) */
const HERO_IMG = "/login-hero.jpg";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/leads/radar" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-navy">
      <img
        src={HERO_IMG}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,20,64,0.82)_0%,rgba(16,28,85,0.55)_48%,rgba(16,28,85,0.28)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.16),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 grid-rows-[auto_1fr_auto] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:grid-rows-[1fr_auto] lg:items-center lg:gap-x-12 lg:gap-y-8 lg:px-10 lg:py-12">
        {/* Brand panel */}
        <section className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <img
            src="/nanak-migration-logo.png"
            alt="Nanak Migration Group"
            className="h-14 w-auto max-w-[280px] object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:h-16 lg:mb-2"
          />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-gold lg:mt-6">
            Registered Migration Agents
          </p>
          <h1 className="mt-3 max-w-lg font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Your pathway starts here
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
            Pathways across borders — student, skilled, partner and employer visas, guided with care from Australia to
            home.
          </p>

          <div className="mt-10 hidden max-w-md lg:block">
            <div className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-md">
              <p className="text-sm leading-relaxed text-white/95">
                “Every journey starts with a clear runway. Your lead desk keeps visa timelines, consults and first contact
                in one calm place.”
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-gold">Runway · Lead Desk</p>
            </div>
            <div className="mt-8 flex gap-6 text-white/70">
              <div>
                <div className="font-serif text-2xl font-semibold text-white">AU</div>
                <div className="text-[11px]">Onshore & offshore</div>
              </div>
              <div className="w-px bg-white/25" />
              <div>
                <div className="font-serif text-2xl font-semibold text-white">MARN</div>
                <div className="text-[11px]">2619467</div>
              </div>
              <div className="w-px bg-white/25" />
              <div>
                <div className="font-serif text-2xl font-semibold text-white">SLA</div>
                <div className="text-[11px]">First-contact clock</div>
              </div>
            </div>
          </div>
        </section>

        {/* Login card */}
        <section className="flex w-full items-center justify-center lg:justify-end">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_28px_60px_-16px_rgba(11,20,64,0.55)]"
          >
            <div className="h-1 w-full bg-gradient-to-r from-gold via-gold-soft to-gold-deep" />

            <div className="p-7 sm:p-8">
              <div className="mb-6 text-center lg:hidden">
                <img
                  src="/nanak-migration-logo.png"
                  alt="Nanak Migration Group"
                  className="mx-auto mb-3 h-12 w-auto max-w-[220px] object-contain"
                />
              </div>

              <div className="mb-6 text-center lg:text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">Staff access</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Welcome back</h2>
                <p className="mt-1.5 text-sm text-muted">Sign in to the Nanak Migration Runway desk.</p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70"
                  >
                    Email
                  </label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-navy" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@nanakmigration.com.au"
                      className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-navy/35 focus:bg-white focus:ring-2 focus:ring-navy/10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70"
                  >
                    Password
                  </label>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-navy" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-10 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-navy/35 focus:bg-white focus:ring-2 focus:ring-navy/10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-navy"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-center">
                    <p className="text-sm font-medium text-crit">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy text-[15px] font-bold text-white shadow-soft transition hover:bg-navy-mid active:scale-[0.99] disabled:opacity-60"
                >
                  {submitting ? "Signing in…" : "Sign in to Runway"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>

              <p className="mt-6 text-center text-[11px] leading-relaxed text-muted lg:text-left">
                Navpreet Aulakh · Registered Migration Agent
                <br />
                MARN 2619467 · Nanak Migration Group
              </p>
            </div>
          </form>
        </section>

        <footer className="col-span-1 text-center text-[11px] font-medium tracking-wide text-white/80 lg:col-span-2">
          Nanak Migration Group · Pathways across borders
        </footer>
      </div>
    </div>
  );
}
