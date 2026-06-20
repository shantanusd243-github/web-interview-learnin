import { useEffect, useMemo, useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import QuestionCard from '../components/QuestionCard';

const CATEGORIES = ['Infrastructure', 'Storage', 'Real-time', 'Social', 'Commerce', 'AI'];

export default function SystemDesignPage() {
  const [cat, setCat] = useState('all');

  // Convert local state to backend-friendly query parameter
  const apiCat = cat === 'all' ? '' : cat;

  // Initialize the infinite scroll hook
  const { questions, loading, hasMore, loadMore, updateFilters } = useQuestions({
      type: 'SYSTEM_DESIGN',
      category: apiCat
  });

  // Whenever user clicks a chip, fetch the new filtered list from backend
  useEffect(() => {
      updateFilters({
          category: apiCat
      });
  }, [apiCat, updateFilters]);

  // Infinite Scroll Listener
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

  // Group accumulated questions by category natively
  const byCategory = useMemo(() => {
    const grouped = {};
    for (const q of questions) {
      const key = q.category || 'Uncategorized';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(q);
    }
    return grouped;
  }, [questions]);

  return (
    <div id="page-sysdesign" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🏗️ System Design — Classic Problems</div>
          <div className="section-desc">
            Deep-dive system design questions with architecture, scaling, tradeoffs and interview talk tracks.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className={`filter-chip${cat === 'all' ? ' active' : ''}`} onClick={() => setCat('all')}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`filter-chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
            {c === 'Social' ? 'Social/Media' : c === 'AI' ? 'AI/ML' : c}
          </button>
        ))}
      </div>

      <div id="sdContainer">

        {loading && questions.length === 0 && <div className="loading-state">Loading problems…</div>}

        {!loading && questions.length === 0 && (
          <div className="empty-state">No problems match your filters.</div>
        )}

        {Object.entries(byCategory).map(([catName, qs]) => (
            <div className="sd-category" key={catName}>
              <div className="sd-category-title">
                {catName} <span style={{ fontSize: 12, fontWeight: 400, color: '#0284c7' }}>({qs.length} problems)</span>
              </div>
              {qs.map((q) => (
                <QuestionCard q={q} key={q.id} />
              ))}
            </div>
        ))}

        {loading && questions.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
             <div className="loading-state">Loading more...</div>
          </div>
        )}

        {!loading && !hasMore && questions.length > 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: '14px', borderTop: '1px solid #e5e7eb', marginTop: '16px' }}>
              You've reached the end of the list.
          </div>
        )}
      </div>
    </div>
  );
}