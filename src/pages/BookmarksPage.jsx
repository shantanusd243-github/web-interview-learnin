import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookmarksApi } from '../api/userActivity';
import QuestionCard from '../components/QuestionCard';
import SkeletonCard from '../components/SkeletonCard';

export default function BookmarksPage() {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // 1. Fetch ALL fully populated bookmarked questions in ONE lightning-fast API call
  // Make sure bookmarksApi.getDetails points to your new /api/bookmarks/details endpoint
  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ['bookmarkedQuestionsDetails'],
    queryFn: bookmarksApi.getDetails,
    staleTime: 30_000,
  });

  // 2. CHUNKING LOGIC: We already have all the data instantly in RAM from the query above.
  // We just slice it to only render 10 items at a time so the browser doesn't lag.
  const visibleQuestions = (questions || []).slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = visibleQuestions.length < (questions || []).length;

  // 3. INFINITE SCROLL LISTENER (Now 100% Client-Side and Instant)
  useEffect(() => {
      const handleScroll = () => {
          const isNearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100;
          if (isNearBottom && hasMore) {
              setPage(p => p + 1);
          }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

  return (
    <div id="page-bookmarks" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🔖 Bookmarks</div>
          <div className="section-desc">Questions you've saved for later review.</div>
        </div>
      </div>

      {/* Sleek animated skeleton loader */}
            {(isLoading && page === 0) && (
              <div className="mt-6 space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}
      {isError && <div className="error-state">Couldn't load your bookmarks. Please try again.</div>}

      {!isLoading && !isError && (questions || []).length === 0 && (
        <div className="empty-state">
          No bookmarks yet. Tap the 📑 icon on any question to save it here.
        </div>
      )}

      {!isLoading && !isError && (questions || []).length > 0 && (
        <div className="mt-6 space-y-4">

          {/* We just pass 'q' directly now because your backend already sets bookmarked: true! */}
          {visibleQuestions.map((q) => <QuestionCard q={q} key={q.id} />)}

          {/* We don't need a loading spinner here anymore because scrolling down is instant! */}

          {!hasMore && visibleQuestions.length > 0 && (
            <div className="text-center py-8 text-gray-500 text-sm border-t mt-4">
                You've reached the end of your bookmarks.
            </div>
          )}
        </div>
      )}
    </div>
  );
}