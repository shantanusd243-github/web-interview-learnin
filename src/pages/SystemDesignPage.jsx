import { useEffect, useMemo, useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';
import QuestionCard from '../components/QuestionCard';
import apiClient from '../api/client';
import SkeletonCard from '../components/SkeletonCard';

const CATEGORIES = ['Infrastructure', 'Storage', 'Real-time', 'Social', 'Commerce', 'AI'];

export default function SystemDesignPage() {
  const { debouncedSearch } = useFilters(); // 1. Bring in the search text
  const [cat, setCat] = useState('all');
  const [tag, setTag] = useState('all'); // 2. New Tag State

  const [availableTags, setAvailableTags] = useState([]); // Dynamic DB tags

  const apiCat = cat === 'all' ? '' : cat;
  const apiTag = tag === 'all' ? '' : tag;

  // 3. Dynamically fetch ALL tags for SYSTEM DESIGN directly from the DB
  useEffect(() => {
      apiClient.get('/questions?type=SYSTEM_DESIGN&size=1000')
          .then(res => {
              const qs = res.data?.content || res.data || [];
              const tags = [...new Set(qs.flatMap(q => q.tags || []))].filter(Boolean).sort();
              setAvailableTags(tags);
          }).catch(e => console.error("Failed to load tags", e));
  }, []);

  const { questions, loading, hasMore, loadMore, updateFilters } = useQuestions({
      type: 'SYSTEM_DESIGN',
      category: apiCat,
      tag: apiTag,
      search: debouncedSearch
  });

  // Refetch when filters or search changes
  useEffect(() => {
      updateFilters({
          category: apiCat,
          tag: apiTag,
          search: debouncedSearch
      });
  }, [apiCat, apiTag, debouncedSearch, updateFilters]);

  // Infinite Scroll Listener
  useEffect(() => {
      const handleScroll = () => {
          const isNearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100;
          if (isNearBottom && !loading && hasMore) loadMore();
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loading, hasMore]);

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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <button className={`filter-chip${cat === 'all' ? ' active' : ''}`} onClick={() => setCat('all')}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`filter-chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
            {c === 'Social' ? 'Social/Media' : c === 'AI' ? 'AI/ML' : c}
          </button>
        ))}

        {/* 4. THE NEW TAG DROPDOWN */}
        <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
        >
           <option value="all">🏷️ All Tags</option>
           {availableTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div id="sdContainer">
        {loading && (
          <div className="mt-6 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
        {!loading && questions.length === 0 && <div className="empty-state">No problems match your filters or search.</div>}

        {Object.entries(byCategory).map(([catName, qs]) => (
            <div className="sd-category" key={catName}>
              <div className="sd-category-title">
                {catName} <span style={{ fontSize: 12, fontWeight: 400, color: '#0284c7' }}>({qs.length} problems)</span>
              </div>
              {qs.map((q) => <QuestionCard q={q} key={q.id} />)}
            </div>
        ))}

        {loading && questions.length > 0 && (
                                                   <div className="mt-6 space-y-4">
                                                     <SkeletonCard />
                                                     <SkeletonCard />
                                                     <SkeletonCard />
                                                   </div>
                                                 )}
        {!loading && !hasMore && questions.length > 0 && <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: '14px', borderTop: '1px solid #e5e7eb', marginTop: '16px' }}>You've reached the end of the list.</div>}
      </div>
    </div>
  );
}