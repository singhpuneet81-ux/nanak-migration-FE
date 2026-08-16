import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-navy">Nanak Migration</div>
          <div className="font-mono text-xs uppercase tracking-widest text-gold">Runway · Lead Desk</div>
        </div>
        <form onSubmit={onSubmit} className="card p-8">
          <h1 className="text-lg font-bold text-navy">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Migration CRM admin panel</p>
          {error && <p className="mt-3 text-sm text-crit">{error}</p>}
          <label className="mt-6 block text-xs font-semibold">
            Email
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="mt-4 block text-xs font-semibold">
            Password
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={submitting} className="btn-gold mt-6 w-full rounded-full py-3 text-sm font-semibold">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
