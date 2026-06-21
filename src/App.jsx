import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/guards'; // <-- Only ONE import line here!

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // <-- Added missing import
import ResetPasswordPage from './pages/ResetPasswordPage';   // <-- Added missing import

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

export default function App() {
  return (
    <Routes>
      {/* Public Auth Pages (No Sidebar/Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPasswordPage /></PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute><ResetPasswordPage /></PublicRoute>
      } />

      {/* Main Application (With Sidebar/Layout) */}
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/mock" element={<MockInterviewPage />} />
        <Route path="/cheat" element={<CheatSheetPage />} />
        <Route path="/dsa" element={<DsaPage />} />
        <Route path="/sysdesign" element={<SystemDesignPage />} />
        <Route path="/reference/:pageKey" element={<ReferencePage />} />

        {/* Account-only */}
        <Route element={<ProtectedRoute />}>
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
  );
}