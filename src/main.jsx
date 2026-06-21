import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google'; // <-- 1. ADD IMPORT
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

// <-- 2. ADD YOUR CLIENT ID HERE
const GOOGLE_CLIENT_ID = import.meta.env.VITE_API_BASE_URL

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. WRAP YOUR APP IN THE GOOGLE PROVIDER */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <FilterProvider>
                  <App />
                </FilterProvider>
              </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);