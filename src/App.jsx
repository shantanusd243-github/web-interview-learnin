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

        {/* Pages that are accessible without login (if any) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mock" element={<MockInterviewPage />} />
        <Route path="/cheat" element={<CheatSheetPage />} />
        <Route path="/reference/:pageKey" element={<ReferencePage />} />

        {/* 🔒 Protected Routes: Redirects to Login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/questions" element={<QuestionsPage />} /> {/* Moved here */}
          <Route path="/dsa" element={<DsaPage />} />             {/* Moved here */}
          <Route path="/sysdesign" element={<SystemDesignPage />} /> {/* Moved here */}
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