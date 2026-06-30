import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await authApi.forgotPassword(email);
      setStatus({
        type: 'success',
        message: 'If that email exists in our system, we have sent a reset link. Please check your inbox.'
      });
      setEmail(''); // clear the form
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Something went wrong. Please try again later.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>☕ LearnIn Prep</h1>
        <p className="auth-sub">Reset your password</p>

        {status.message && (
          <div className={status.type === 'success' ? 'auth-success' : 'auth-error'}
               style={status.type === 'success' ? { background: '#064e3b', color: '#34d399', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' } : {}}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your registered email"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting || status.type === 'success'}>
            {submitting ? 'Sending Link…' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: '24px' }}>
          Remembered your password? <Link to="/login">Back to Sign in</Link>
        </div>
      </div>
    </div>
  );
}