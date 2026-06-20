import { useEffect, useMemo } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';
import QuestionCard from '../components/QuestionCard';
import { topicIcon } from '../utils/badges';

export default function QuestionsPage() {
  const { debouncedSearch, topic, priority, difficulty } = useFilters();

  // 1. Clean Mapping: If it's "All Topics", send empty string so backend returns everything.
  const apiTopic = (!topic || topic === 'All Topics') ? '' : topic;
  const apiPriority = (!priority || priority === 'All Priority') ? '' : priority;
  const apiDifficulty = (!difficulty || difficulty === 'All Levels') ? '' : difficulty;

  // 2. Initialize the hook
  const {
      questions,
      loading,
      hasMore,
      loadMore,
      updateFilters
  } = useQuestions({
      type: 'THEORY',
      topic: apiTopic,
      priority: apiPriority,
      difficulty: apiDifficulty,
      search: debouncedSearch,
  });

  // 3. Sync FilterContext changes to the hook
  useEffect(() => {
      updateFilters({
          topic: apiTopic,
          priority: apiPriority,
          difficulty: apiDifficulty,
          search: debouncedSearch,
      });
  }, [apiTopic, apiPriority, apiDifficulty, debouncedSearch, updateFilters]);

  // 4. Infinite Scroll Listener
  useEffect(() => {
      const handleScroll = () => {
          const isNearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100;
          if (isNearBottom && !loading && hasMore) {
              loadMore();
          }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loading, hasMore]);

  // 5. Group the accumulated questions by topic
  const grouped = useMemo(() => {
    const byTopic = {};
    for (const q of questions) {
      const key = q.topic || 'Uncategorized';
      if (!byTopic[key]) byTopic[key] = [];
      byTopic[key].push(q);
    }

    // Optional: Sort the keys alphabetically so the headers stay strictly alphabetical
    const sortedGroups = {};
    Object.keys(byTopic).sort().forEach(key => {
        sortedGroups[key] = byTopic[key];
    });

    return sortedGroups;
  }, [questions]);

  return (
    <div id="page-questions" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">❓ Interview Questions</div>
          <div className="section-desc">Click any question to expand the answer, deep explanation, and follow-ups.</div>
        </div>
      </div>

      <div id="questionsContainer">

        {loading && questions.length === 0 && <div className="loading-state">Loading questions…</div>}

        {!loading && questions.length === 0 && (
          <div className="empty-state py-12 text-center text-gray-500">
             No questions match your filters.
          </div>
        )}

        {Object.entries(grouped).map(([topicName, qs]) => (
          <div style={{ marginBottom: 24 }} key={topicName}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{topicIcon(topicName)}</span> {topicName}{' '}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>({qs.length})</span>
            </div>
            {qs.map((q) => (
              <QuestionCard q={q} key={q.id} />
            ))}
          </div>
        ))}

        {loading && questions.length > 0 && (
          <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!loading && !hasMore && questions.length > 0 && (
          <div className="text-center py-8 text-gray-500 text-sm border-t mt-4">
              You've reached the end of the list.
          </div>
        )}

      </div>
    </div>
  );
}