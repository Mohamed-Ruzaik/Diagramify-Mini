import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Fingerprint, Hash, Layers3, Lock, Mail, ShieldCheck, Terminal } from 'lucide-react';
import GridBackground from '../components/GridBackground';
import { useAuth } from '../auth/useAuth';

type AuthMode = 'signin' | 'signup' | 'confirm';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signIn, signUp, confirmSignUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Cognito email/password auth ready.');

  if (loading) {
    return (
      <GridBackground>
        <main className="grid min-h-screen place-items-center px-4 py-10">
          <section className="w-full max-w-[420px] rounded-lg border border-white/10 bg-black/82 px-7 py-6 text-center shadow-2xl shadow-black/60 backdrop-blur">
            <div className="inline-flex items-center gap-2 text-lg font-black tracking-[0.24em] text-white">
              <Layers3 className="h-5 w-5 text-red-500" />
              DIAGRAMIFY MINI
            </div>
            <p className="mt-3 font-mono text-[11px] text-neutral-500">Checking Cognito session...</p>
          </section>
        </main>
      </GridBackground>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';
        navigate(from, { replace: true });
        return;
      }

      if (mode === 'signup') {
        await signUp(email, password);
        setMode('confirm');
        setStatus('Account created. Enter the confirmation code from your email.');
        return;
      }

      await confirmSignUp(email, confirmationCode);
      setMode('signin');
      setStatus('Email confirmed. You can sign in now.');
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <GridBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-[420px] overflow-hidden rounded-lg border border-white/10 bg-black/82 shadow-2xl shadow-black/60 backdrop-blur">
          <div className="border-b border-white/5 bg-white/[0.025] px-7 py-6 text-center">
            <div className="inline-flex items-center gap-2 text-lg font-black tracking-[0.24em] text-white">
              <Layers3 className="h-5 w-5 text-red-500" />
              DIAGRAMIFY MINI
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Protected diagram workspace
            </p>
          </div>

          <div className="px-7 py-7">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {mode === 'signin' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'confirm' && 'Confirm email'}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Cognito email/password only.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Email
                </span>
                <span className="relative block">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded border border-white/10 bg-black/55 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition focus:border-red-500/60"
                    placeholder="you@example.com"
                  />
                </span>
              </label>

              {mode !== 'confirm' && (
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Password
                  </span>
                  <span className="relative block">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      required
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className="w-full rounded border border-white/10 bg-black/55 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition focus:border-red-500/60"
                      placeholder="Password"
                    />
                  </span>
                </label>
              )}

              {mode === 'confirm' && (
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Confirmation code
                  </span>
                  <span className="relative block">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      value={confirmationCode}
                      onChange={(event) => setConfirmationCode(event.target.value)}
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="w-full rounded border border-white/10 bg-black/55 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition focus:border-red-500/60"
                      placeholder="123456"
                    />
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-60"
              >
                {mode === 'signin' && <Terminal className="h-4 w-4" />}
                {mode === 'signup' && <Fingerprint className="h-4 w-4" />}
                {mode === 'confirm' && <ShieldCheck className="h-4 w-4" />}
                {mode === 'signin' && 'Sign in'}
                {mode === 'signup' && 'Sign up'}
                {mode === 'confirm' && 'Confirm sign up'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setStatus('Cognito email/password auth ready.');
                }}
                className="font-mono text-neutral-400 transition hover:text-red-300"
              >
                {mode === 'signin' ? 'Need an account?' : 'Back to sign in'}
              </button>
              {mode !== 'confirm' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('confirm');
                    setStatus('Enter the confirmation code sent by Cognito.');
                  }}
                  className="font-mono text-neutral-400 transition hover:text-red-300"
                >
                  Confirm code
                </button>
              )}
            </div>

            <p
              className="mt-5 rounded border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-[11px] leading-5 text-neutral-400"
              aria-live="polite"
            >
              {status}
            </p>
          </div>
        </section>
      </main>
    </GridBackground>
  );
}
