import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LinkedInCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Only extract what you need
  const { linkedinLogin } = useAuth();
  const [error, setError] = useState(null);

  // Use a ref to strictly prevent double-firing in React 18 Strict Mode
  const hasAttempted = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('LinkedIn authentication was cancelled or failed.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    if (code) {
      // If we haven't attempted the login yet, do it now.
      if (!hasAttempted.current) {
        hasAttempted.current = true;
        setIsProcessing(true);

        linkedinLogin(code)
          .then(() => {
            // Check if there's a saved return URL
            const returnUrl = sessionStorage.getItem('returnUrl');

            // Redirect accordingly
            if (returnUrl) {
              sessionStorage.removeItem('returnUrl');
              navigate(returnUrl, { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          })
          .catch((err) => {
            setIsProcessing(false);
            hasAttempted.current = false; // Allow retry on failure
            console.error('LinkedIn authentication failed', err);
            setError('Failed to securely log in with LinkedIn.');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
          });
      }
      // Notice there is NO 'else' here. If code exists and we are processing, just wait.
    } else {
      // If there is absolutely no code in the URL, send them away.
      navigate('/login', { replace: true });
    }
  }, [location, linkedinLogin, navigate]);

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