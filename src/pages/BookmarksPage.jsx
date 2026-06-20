import { useState, useEffect } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { bookmarksApi } from '../api/userActivity';
import { questionsApi } from '../api/questions';
import QuestionCard from '../components/QuestionCard';

export default function BookmarksPage() {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // 1. Fetch the lightweight list of all bookmark IDs
  const { data: bookmarks, isLoading: loadingBookmarks, isError: bookmarksError } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.list,
    staleTime: 30_000,
  });

  // 2. CHUNKING LOGIC: Only take the first (page * 10) bookmarks to render
  const visibleBookmarks = (bookmarks || []).slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = visibleBookmarks.length < (bookmarks || []).length;

  // 3. Fetch details ONLY for the visible chunk
  const questionQueries = useQueries({
    queries: visibleBookmarks.map((b) => ({
      queryKey: ['question', b.questionId],
      queryFn: () => questionsApi.getById(b.questionId),
      enabled: !!bookmarks,
      staleTime: 60_000,
    })),
  });

  const loadingQuestions = questionQueries.some((q) => q.isLoading);
  const questions = questionQueries.map((q) => q.data).filter(Boolean);

  // 4. INFINITE SCROLL LISTENER
  useEffect(() => {
      const handleScroll = () => {
          const isNearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100;
          if (isNearBottom && !loadingQuestions && hasMore) {
              setPage(p => p + 1);
          }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingQuestions, hasMore]);

  return (
    <div id="page-bookmarks" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🔖 Bookmarks</div>
          <div className="section-desc">Questions you've saved for later review.</div>
        </div>
      </div>

      {(loadingBookmarks || (loadingQuestions && page === 0)) && <div className="loading-state">Loading bookmarks…</div>}
      {bookmarksError && <div className="error-state">Couldn't load your bookmarks. Please try again.</div>}

      {!loadingBookmarks && !bookmarksError && (bookmarks || []).length === 0 && (
        <div className="empty-state">
          No bookmarks yet. Tap the 📑 icon on any question to save it here.
        </div>
      )}

      {!loadingBookmarks && !bookmarksError && (bookmarks || []).length > 0 && (
        <div className="mt-6 space-y-4">
          {questions.map((q) => <QuestionCard q={{ ...q, bookmarked: true }} key={q.id} />)}

          {loadingQuestions && page > 0 && (
            <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {!hasMore && questions.length > 0 && (
            <div className="text-center py-8 text-gray-500 text-sm border-t mt-4">
                You've reached the end of your bookmarks.
            </div>
          )}
        </div>
      )}
    </div>
  );
}