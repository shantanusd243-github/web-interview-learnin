import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth'; // Only import authApi

export default function LinkedInCallbackPage() {
    const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('LinkedIn authentication was cancelled or failed.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (code && !isProcessing) {
        setIsProcessing(true);
      // Call it as a method on the authApi object
      authApi.linkedinLogin(code)
        .then((data) => {
          login(data);
          navigate('/dashboard');
        })
        .catch((err) => {
            setIsProcessing(false);
          console.error('LinkedIn authentication failed', err);
          setError('Failed to securely log in with LinkedIn.');
          setTimeout(() => navigate('/login'), 3000);
        });
    } else {
      navigate('/login');
    }
  }, [location, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {error ? (
        <div className="text-red-500 font-medium">{error}</div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Completing LinkedIn Sign-In...</h2>
          <p className="text-gray-500 mt-2">Please wait while we securely log you in.</p>
        </div>
      )}
    </div>
  );
}