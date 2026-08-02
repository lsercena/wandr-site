import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import './LoginPage.css';

type Mode = 'login' | 'signup' | 'reset';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with Supabase / Firebase / Auth0
    setSubmitted(true);
  };

  const titles: Record<Mode, string> = {
    login: 'Welcome back',
    signup: 'Create your account',
    reset: 'Reset your password',
  };

  return (
    <>
      <SeoHead
        title={mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
        description="Sign in to Wandr to save countries, track visa requirements, and get personalized travel recommendations."
        path="/login"
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
            <h1 className="login-form__title">{titles[mode]}</h1>

            {submitted && mode === 'reset' ? (
              <div className="login-success">
                <p>✓ If that email exists, you'll receive a reset link shortly.</p>
                <button type="button" className="btn btn-ghost" onClick={() => { setMode('login'); setSubmitted(false); }}>
                  Back to login
                </button>
              </div>
            ) : (
              <>
                {/* Social login */}
                {mode !== 'reset' && (
                  <div className="login-social">
                    <button
                      type="button"
                      className="login-social-btn"
                      onClick={() => { /* TODO: Google OAuth */ }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                        <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                      </svg>
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      className="login-social-btn"
                      onClick={() => { /* TODO: Apple Sign In */ }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                        <path d="M13.4 9.55c-.02-2.03 1.66-3.01 1.73-3.06-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.43.73-3.06.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.78-3.3 1.99-1.41 2.44-.36 6.07 1.01 8.06.67.97 1.47 2.06 2.52 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.44-1.96.77-1.12 1.09-2.2 1.1-2.26-.02-.01-2.12-.81-2.14-3.23z"/>
                        <path d="M11.36 3.38c.56-.67.93-1.61.83-2.54-.8.03-1.76.53-2.33 1.2-.51.59-.96 1.53-.84 2.43.89.07 1.79-.45 2.34-1.09z"/>
                      </svg>
                      Continue with Apple
                    </button>
                  </div>
                )}

                {mode !== 'reset' && (
                  <div className="login-divider">
                    <span>or</span>
                  </div>
                )}

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                  {mode === 'signup' && (
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        required={mode === 'signup'}
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

                  {mode !== 'reset' && (
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor="password" className="form-label">Password</label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            className="login-forgot"
                            onClick={() => setMode('reset')}
                          >
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
                        placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                        required
                        minLength={mode === 'signup' ? 8 : undefined}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg login-submit">
                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  </button>

                  {mode === 'signup' && (
                    <p className="login-terms">
                      By creating an account you agree to our{' '}
                      <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{' '}
                      <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                    </p>
                  )}
                </form>

                <div className="login-switch">
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button type="button" className="login-switch-btn" onClick={() => setMode('signup')}>
                        Sign up free
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button type="button" className="login-switch-btn" onClick={() => setMode('login')}>
                        Sign in
                      </button>
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
