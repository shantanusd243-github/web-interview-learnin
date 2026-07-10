import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  // If there's no token in the URL, show an error immediately
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-error">Invalid or missing reset token.</div>
          <Link to="/forgot-password" style={{ color: '#10b981', fontSize: '14px' }}>Request a new link</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await authApi.resetPassword({ token, newPassword });
      setStatus({ type: 'success', message: 'Password updated successfully! Redirecting to login...' });

      // Send them to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Token may be expired. Please request a new link.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>☕ LearnIn Prep</h1>
        <p className="auth-sub">Create a new password</p>

        {status.message && (
          <div className={status.type === 'success' ? 'auth-success' : 'auth-error'}
               style={status.type === 'success' ? { background: '#064e3b', color: '#34d399', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' } : {}}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting || status.type === 'success'}>
            {submitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}