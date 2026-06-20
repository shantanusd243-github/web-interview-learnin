import { useQueries, useQuery } from '@tanstack/react-query';
import { bookmarksApi } from '../api/userActivity';
import { questionsApi } from '../api/questions';
import QuestionCard from '../components/QuestionCard';

export default function BookmarksPage() {
  const { data: bookmarks, isLoading: loadingBookmarks, isError: bookmarksError } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.list,
    staleTime: 30_000,
  });

  // BookmarkResponse only carries {id, questionId, createdAt} — no embedded question
  // detail — so each bookmarked question is fetched individually here.
  const questionQueries = useQueries({
    queries: (bookmarks || []).map((b) => ({
      queryKey: ['question', b.questionId],
      queryFn: () => questionsApi.getById(b.questionId),
      enabled: !!bookmarks,
      staleTime: 60_000,
    })),
  });

  const loadingQuestions = questionQueries.some((q) => q.isLoading);
  const questions = questionQueries.map((q) => q.data).filter(Boolean);

  return (
    <div id="page-bookmarks" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🔖 Bookmarks</div>
          <div className="section-desc">Questions you've saved for later review.</div>
        </div>
      </div>

      {(loadingBookmarks || loadingQuestions) && <div className="loading-state">Loading bookmarks…</div>}
      {bookmarksError && <div className="error-state">Couldn't load your bookmarks. Please try again.</div>}

      {!loadingBookmarks && !bookmarksError && (bookmarks || []).length === 0 && (
        <div className="empty-state">
          No bookmarks yet. Tap the 📑 icon on any question to save it here.
        </div>
      )}

      {!loadingQuestions &&
        questions.map((q) => <QuestionCard q={{ ...q, bookmarked: true }} key={q.id} />)}
    </div>
  );
}
