import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/guards';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import DashboardPage from './pages/DashboardPage';
import QuestionsPage from './pages/QuestionsPage';
import MockInterviewPage from './pages/MockInterviewPage';
import CheatSheetPage from './pages/CheatSheetPage';
import DsaPage from './pages/DsaPage';
import SystemDesignPage from './pages/SystemDesignPage';
import ReferencePage from './pages/ReferencePage';
import BookmarksPage from './pages/BookmarksPage';
import SubmitQuestionPage from './pages/SubmitQuestionPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import LinkedInCallbackPage from './pages/LinkedInCallbackPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';

// 1. Import HelmetProvider
import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    // 2. Wrap EVERYTHING in HelmetProvider
    <HelmetProvider>
      <Routes>
        {/* Public Auth Pages (No Sidebar/Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={
          <PublicRoute><ForgotPasswordPage /></PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute><ResetPasswordPage /></PublicRoute>
        } />\
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/linkedin-callback" element={<LinkedInCallbackPage />} />
        {/* Main Application (With Sidebar/Layout) */}
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Pages that are accessible without login (if any) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mock" element={<MockInterviewPage />} />
          <Route path="/cheat" element={<CheatSheetPage />} />
          <Route path="/reference/:pageKey" element={<ReferencePage />} />

          {/* 🔒 Protected Routes: Redirects to Login if not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/dsa" element={<DsaPage />} />
            <Route path="/sysdesign" element={<SystemDesignPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/submit" element={<SubmitQuestionPage />} />
          </Route>

          {/* Admin-only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HelmetProvider>
  );
}