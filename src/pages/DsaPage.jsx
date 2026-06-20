import { useEffect, useMemo, useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';
import QuestionCard from '../components/QuestionCard';
import apiClient from '../api/client';

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
const DIFFS = [
  { label: 'Easy', style: { background: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' } },
  { label: 'Medium', style: { background: '#fef9c3', color: '#ca8a04', borderColor: '#fde68a' } },
  { label: 'Hard', style: { background: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' } },
];

export default function DsaPage() {
  const { debouncedSearch } = useFilters(); // 1. Bring in the search text
  const [week, setWeek] = useState('all');
  const [diff, setDiff] = useState('all');
  const [tag, setTag] = useState('all'); // 2. New Tag State

  const [availableTags, setAvailableTags] = useState([]); // Dynamic DB tags

  // Convert local state to backend-friendly query parameters
  const apiWeek = week === 'all' ? '' : week;
  const apiDiff = diff === 'all' ? '' : diff;
  const apiTag = tag === 'all' ? '' : tag;

  // 3. Dynamically fetch ALL tags for DSA directly from the DB without hardcoding
  useEffect(() => {
      apiClient.get('/questions?type=DSA&size=1000')
          .then(res => {
              const qs = res.data?.content || res.data || [];
              const tags = [...new Set(qs.flatMap(q => q.tags || []))].filter(Boolean).sort();
              setAvailableTags(tags);
          }).catch(e => console.error("Failed to load tags", e));
  }, []);

  // Initialize the infinite scroll hook with search and tag
  const { questions, loading, hasMore, loadMore, updateFilters } = useQuestions({
      type: 'DSA',
      week: apiWeek,
      difficulty: apiDiff,
      tag: apiTag,
      search: debouncedSearch
  });

  // Refetch when filters or search changes
  useEffect(() => {
      updateFilters({
          week: apiWeek,
          difficulty: apiDiff,
          tag: apiTag,
          search: debouncedSearch
      });
  }, [apiWeek, apiDiff, apiTag, debouncedSearch, updateFilters]);

  // Infinite Scroll Listener
  useEffect(() => {
      const handleScroll = () => {
          const isNearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100;
          if (isNearBottom && !loading && hasMore) loadMore();
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loading, hasMore]);

  const byWeek = useMemo(() => {
    const grouped = {};
    for (const q of questions) {
      const key = q.week || 'Uncategorized';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(q);
    }
    return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)));
  }, [questions]);

  return (
    <div id="page-dsa" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🧮 DSA Problems — Week 1–8</div>
          <div className="section-desc">
            Curated LeetCode problems with Java solutions, complexity analysis, and interview talk tracks.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <button className={`filter-chip${week === 'all' ? ' active' : ''}`} onClick={() => setWeek('all')}>All</button>
        {WEEKS.map((w) => (
          <button key={w} className={`filter-chip${week === w ? ' active' : ''}`} onClick={() => setWeek(w)}>{w}</button>
        ))}
        {DIFFS.map((d) => (
          <button key={d.label} className={`filter-chip${diff === d.label ? ' active' : ''}`} style={d.style} onClick={() => setDiff((cur) => (cur === d.label ? 'all' : d.label))}>
            {d.label}
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

      <div id="dsaContainer">
        {loading && questions.length === 0 && <div className="loading-state">Loading problems…</div>}
        {!loading && questions.length === 0 && <div className="empty-state">No problems match your filters or search.</div>}

        {Object.entries(byWeek).map(([weekName, qs]) => (
            <div className="dsa-section" key={weekName}>
              <div className="dsa-section-title">
                {weekName} <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>({qs.length} problems)</span>
              </div>
              {qs.map((q) => <QuestionCard q={q} key={q.id} />)}
            </div>
        ))}

        {loading && questions.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><div className="loading-state">Loading more...</div></div>}
        {!loading && !hasMore && questions.length > 0 && <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: '14px', borderTop: '1px solid #e5e7eb', marginTop: '16px' }}>You've reached the end of the list.</div>}
      </div>
    </div>
  );
}