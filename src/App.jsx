import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { ProtectedRoute, AdminRoute } from './components/guards';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* The original app had no auth wall — browsing is public, only personal
          features (progress, bookmarks, submissions) require login. Most pages
          below are therefore reachable without ProtectedRoute; only account-only
          views (bookmarks, submit-question, admin) are gated. */}
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
