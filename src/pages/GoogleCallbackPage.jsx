import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { googleLogin } = useAuth();
  const hasCalled = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      if (!code) {
        navigate('/login', { state: { error: 'No authorization code found.' } });
        return;
      }

      try {
        await googleLogin(code);
        navigate('/dashboard');
      } catch (error) {
        console.error('Google Auth Error:', error);
        navigate('/login', { state: { error: 'Google authentication failed.' } });
      }
    };

    handleCallback();
  }, [location, navigate, googleLogin]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
      <h2>Authenticating with Google...</h2>
    </div>
  );
}