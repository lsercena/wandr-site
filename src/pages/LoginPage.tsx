import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import { useAuth } from '@/context/AuthContext';
import './LoginPage.css';

type Mode = 'login' | 'signup' | 'reset';

interface Props {
  initialMode?: Mode;
}

export default function LoginPage({ initialMode = 'login' }: Props) {
  const { user, loading, signIn, signUp, resetPassword, signInWithOAuth, supabaseConfigured } = useAuth();
  const [activeMode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const nextPath = searchParams.get('next') || '/dashboard';

  if (!loading && user) return <Navigate to={nextPath} replace />;

  const titles: Record<Mode, string> = {
    login: 'Welcome back',
    signup: 'Create your account',
    reset: 'Reset your password',
  };

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    // Supabase email-confirmation: account exists but session pending.
    if (/confirm your email/i.test(message)) {
      setNotice(message);
      setDone(true);
      return;
    }
    setError(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (activeMode === 'login') {
        await signIn(email, password);
        navigate(nextPath, { replace: true });
      } else if (activeMode === 'signup') {
        await signUp(name, email, password);
        navigate(nextPath, { replace: true });
      } else {
        await resetPassword(email);
        setNotice('If that email exists, a reset link is on its way.');
        setDone(true);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SeoHead
        title={activeMode === 'login' ? 'Login' : activeMode === 'signup' ? 'Create Account' : 'Reset Password'}
        description="Sign in to Wandr to save countries, track visa requirements, and get personalized travel recommendations."
        path={activeMode === 'signup' ? '/signup' : '/login'}
      />

      <div className="login-page">
        {/* Brand panel */}
        <div className="login-brand" aria-hidden="true">
          <Link to="/" className="login-brand__logo">
            <span>✦</span> Wandr
          </Link>
          <div className="login-brand__content">
            <h2>Your personal<br />travel intelligence</h2>
            <p>Save countries, track visa requirements, compare costs, and get AI-powered recommendations tailored to your passport and goals.</p>
            <div className="login-brand__features">
              {[
                '✓ Save countries and track visas',
                '✓ Personalised AI recommendations',
                '✓ Cost of living alerts',
                '✓ Visa expiry reminders',
                '✓ Compare countries side by side',
              ].map((f) => (
                <p key={f}>{f}</p>
              ))}
            </div>
          </div>
          <p className="login-brand__tagline">Know before you go anywhere.</p>
        </div>

        {/* Form panel */}
        <div className="login-form-panel">
          <div className="login-form-wrap">
            <h1 className="login-form__title">{titles[activeMode]}</h1>

            <p className="login-mode-note" role="status">
              {supabaseConfigured
                ? '✓ Accounts synced securely via Supabase'
                : 'Running in local mode — accounts and saves stay on this device and work offline.'}
            </p>

            {done ? (
              <div className="login-success">
                {notice ? <p>✓ {notice}</p> : <p>✓ All done.</p>}
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setMode('login'); setDone(false); setNotice(null); setError(null); setEmail(''); setPassword(''); setName(''); }}
                >
                  Back to login
                </button>
              </div>
            ) : (
              <>
                {/* Social login */}
                {activeMode !== 'reset' && (
                  <div className="login-social">
                    <button type="button" className="login-social-btn" onClick={() => void handleOAuth('google')} disabled={busy}>
                      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                        <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"/>
                      </svg>
                      Continue with Google
                    </button>
                    <button type="button" className="login-social-btn" onClick={() => void handleOAuth('apple')} disabled={busy}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                        <path d="M13.4 9.55c-.02-2.03 1.66-3.01 1.73-3.06-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.43.73-3.06.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.78-3.3 1.99-1.41 2.44-.36 6.07 1.01 8.06.67.97 1.47 2.06 2.52 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.44-1.96.77-1.12 1.09-2.2 1.1-2.26-.02-.01-2.12-.81-2.14-3.23z"/>
                        <path d="M11.36 3.38c.56-.67.93-1.61.83-2.54-.8.03-1.76.53-2.33 1.2-.51.59-.96 1.53-.84 2.43.89.07 1.79-.45 2.34-1.09z"/>
                      </svg>
                      Continue with Apple
                    </button>
                  </div>
                )}

                {activeMode !== 'reset' && (
                  <div className="login-divider">
                    <span>or</span>
                  </div>
                )}

                {error && (
                  <div className="login-error" role="alert">
                    ⚠ {error}
                    <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
                  </div>
                )}

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                  {activeMode === 'signup' && (
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        required
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  {activeMode !== 'reset' && (
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor="password" className="form-label">Password</label>
                        {activeMode === 'login' && (
                          <button type="button" className="login-forgot" onClick={() => { setMode('reset'); setError(null); }}>
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <input
                        id="password"
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={activeMode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                        required
                        minLength={activeMode === 'signup' ? 8 : undefined}
                        autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'}
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={busy}>
                    {busy ? 'Please wait…' : activeMode === 'login' ? 'Sign In' : activeMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  </button>

                  {activeMode === 'signup' && (
                    <p className="login-terms">
                      By creating an account you agree to our{' '}
                      <a href="/resources">Terms of Service</a> and{' '}
                      <a href="/resources">Privacy Policy</a>.
                    </p>
                  )}
                </form>

                <div className="login-switch">
                  {activeMode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <Link to="/signup" className="login-switch-btn">Sign up free</Link>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <Link to="/login" className="login-switch-btn">Sign in</Link>
                    </>
                  )}
                  {activeMode === 'reset' && (
                    <>
                      {' '}· <Link to="/login" className="login-switch-btn">Back to sign in</Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
