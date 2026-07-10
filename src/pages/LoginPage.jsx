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

        <div className="auth-switch" style={{ marginTop: '24px' }}>
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}