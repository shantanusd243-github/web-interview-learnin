import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [inAppBrowser, setInAppBrowser] = useState({ isWebView: false, os: 'other', canShare: false });

  useEffect(() => {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      const isWebView = /Instagram|FBAN|FBAV|LinkedInApp|Slack/i.test(ua);

      let os = 'other';
      if (/android/i.test(ua)) os = 'android';
      else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) os = 'ios';

      setInAppBrowser({
        isWebView,
        os,
        canShare: !!navigator.share
      });
    }, []);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not sign in. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

    const handleLoginSuccess = () => {
      const returnUrl = sessionStorage.getItem('returnUrl');

      if (returnUrl) {
        sessionStorage.removeItem('returnUrl'); // Clean up
        navigate(returnUrl); // Send them back to where they clicked the bookmark
      } else {
        navigate('/dashboard'); // Default fallback
      }
    };

  const handleGoogleLogin = async () => {
    // Escape Hatch Logic
    if (inAppBrowser.isWebView) {
      if (inAppBrowser.os === 'android') {
        // Android: Force open Chrome using Intent URL
        const currentUrl = window.location.href.replace(/^https?:\/\//, '');
        window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end;`;
      } else if (inAppBrowser.os === 'ios') {
        // iOS: Attempt to use the native Share sheet to force an external open
        if (navigator.share) {
          try {
            await navigator.share({
              url: window.location.href,
            });
          } catch (err) {
            console.error('Share dialog failed or dismissed:', err);
          }
        }
      }
      return; // Stop standard execution
  }

    // Standard Browser Flow
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_GOOGLE_REDIRECT_URI);
    const scope = encodeURIComponent('openid profile email');
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleLinkedInLogin = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_LINKEDIN_REDIRECT_URI);
    const scope = encodeURIComponent('openid profile email');

    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>☕ LearnIn Prep</h1>
        <p className="auth-sub">Sign in to track progress and bookmarks.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Visual "OR" Divider */}
        <div style={{          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: '#94a3b8',
          fontSize: '12px',
          letterSpacing: '1px'
        }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #334155', margin: '0 10px 0 0' }} />
          <span>OR</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #334155', margin: '0 0 0 10px' }} />    </div>

        {/* NEW: Inline Escape Banner */}
        {inAppBrowser.isWebView && (
          <div style={{
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            color: '#eab308',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>In-App Browser Detected</strong>
            Google prevents signing in from here.
            {inAppBrowser.os === 'android'
              ? ' Tap the Google button below to securely continue in Chrome.'
              : inAppBrowser.os === 'ios' && inAppBrowser.canShare
                ? " Tap the Google button below, then choose 'Open in Browser' or Safari."
                : ' Please tap the menu icon (•••) and select "Open in System Browser" or Safari.'
            }
          </div>
        )}

        {/* Custom Google Login Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '40px', minWidth: '187px', padding: '0 12px',
              backgroundColor: '#ffffff', color: '#3c4043', // Google brand colors
              border: '1px solid #dadce0', borderRadius: '4px',
              fontSize: '14px', fontWeight: '500', fontFamily: 'Roboto, Arial, sans-serif',
              cursor: 'pointer', transition: 'background-color 0.2s',
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <svg style={{ width: '18px', height: '18px', marginRight: '10px' }} viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* LinkedIn Login Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <button
            type="button"
            onClick={handleLinkedInLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',          /* Matches Google size="large" */
              minWidth: '187px',       /* Matches standard Google text width */
              padding: '0 12px',
              backgroundColor: '#131314', /* Matches Google filled_black theme */
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',     /* Matches Google shape="rectangular" */
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Roboto, Arial, sans-serif',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2b2b2b')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#131314')}
          >
            <svg
              style={{ width: '18px', height: '18px', marginRight: '10px', color: '#ffffff' }}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Sign in with LinkedIn
          </button>
        </div>

        <div className="auth-switch" style={{ marginTop: '24px' }}>
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}