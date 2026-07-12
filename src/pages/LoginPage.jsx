import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  // We extract the new googleLogin function from our AuthContext
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setSubmitting(true);
    try {
      // Send the Google ID token to the backend
      await googleLogin(credentialResponse.credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Google sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

const handleLinkedInLogin = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_LINKEDIN_REDIRECT_URI);
    const scope = encodeURIComponent('openid profile email');

    // Redirects user to LinkedIn OAuth screen
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
            {/* Added Flexbox to put label and Forgot link on the same line */}
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
        <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '24px 0',
              color: '#94a3b8',
              fontSize: '12px',
              letterSpacing: '1px'
            }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #334155', margin: '0 10px 0 0' }} />
              <span>OR</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #334155', margin: '0 0 0 10px' }} />
        </div>

        {/* Google Login Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google popup closed or failed. Please try again.')}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            size="large"
            text="signin_with"
          />
        </div>

        {/* Example LinkedIn Button Styling - adjust classes to match your theme */}
        <button
          type="button"
          onClick={handleLinkedInLogin}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 mt-3"
        >
          <svg
            className="w-5 h-5 mr-2 text-[#0A66C2]"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Sign in with LinkedIn
        </button>

        <div className="auth-switch" style={{ marginTop: '24px' }}>
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}