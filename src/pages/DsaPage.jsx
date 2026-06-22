import { useEffect, useMemo, useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';
import QuestionCard from '../components/QuestionCard';
import apiClient from '../api/client';
import SkeletonCard from '../components/SkeletonCard';
import SleekDropdown from '../components/SleekDropdown';

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
const DIFFS = [
  { label: 'Easy', style: { background: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' } },
  { label: 'Medium', style: { background: '#fef9c3', color: '#ca8a04', borderColor: '#fde68a' } },
  { label: 'Hard', style: { background: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' } },
];

export default function DsaPage() {
  const { debouncedSearch } = useFilters();
  const [week, setWeek] = useState('all');
  const [diff, setDiff] = useState('all');
  const [tag, setTag] = useState('all');

  const [availableTags, setAvailableTags] = useState([]);

  const apiWeek = week === 'all' ? '' : week;
  const apiDiff = diff === 'all' ? '' : diff;
  const apiTag = tag === 'all' ? '' : tag;

  useEffect(() => {
      apiClient.get('/questions?type=DSA&size=1000')
          .then(res => {
              const qs = res.data?.content || res.data || [];
              const tags = [...new Set(qs.flatMap(q => q.tags || []))].filter(Boolean).sort();
              setAvailableTags(tags);
          }).catch(e => console.error("Failed to load tags", e));
  }, []);

  const { questions, loading, hasMore, loadMore, updateFilters } = useQuestions({
      type: 'DSA',
      week: apiWeek,
      difficulty: apiDiff,
      tag: apiTag,
      search: debouncedSearch
  });

  useEffect(() => {
      updateFilters({
          week: apiWeek,
          difficulty: apiDiff,
          tag: apiTag,
          search: debouncedSearch
      });
  }, [apiWeek, apiDiff, apiTag, debouncedSearch, updateFilters]);

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

{/* --- WRAPPING CHIPS & RIGHT DROPDOWN FIX --- */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>

          {/* Left Side: Wrapping Chips (Max 2 rows, then scroll) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1, maxHeight: '82px', overflowY: 'auto', alignContent: 'flex-start', paddingRight: '4px' }}>
            <button className={`filter-chip${week === 'all' ? ' active' : ''}`} onClick={() => setWeek('all')}>All</button>
            {WEEKS.map((w) => (
              <button key={w} className={`filter-chip${week === w ? ' active' : ''}`} onClick={() => setWeek(w)}>{w}</button>
            ))}
            {DIFFS.map((d) => (
             <button key={d.label} className={`filter-chip${diff === d.label ? ' active' : ''}`} style={d.style} onClick={() => setDiff((cur) => (cur === d.label ? 'all' : d.label))}>
                 {d.label}
              </button>
            ))}
          </div>

          {/* Right Side: Tag Dropdown */}
          <div style={{ width: '160px', flexShrink: 0 }}>
            <SleekDropdown
              value={tag === 'all' ? '🏷️ All Tags' : tag}
              options={['🏷️ All Tags', ...availableTags]}
              onChange={(val) => setTag(val === '🏷️ All Tags' ? 'all' : val)}
              placeholder="🏷️ All Tags"
            />
          </div>

        </div>
        {/* --- END FILTERS --- */}

        <div id="dsaContainer">
          {loading && (
            <div className="mt-6 space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          {!loading && questions.length === 0 && <div className="empty-state">No problems match your filters or search.</div>}

          {Object.entries(byWeek).map(([weekName, qs]) => (
              <div className="dsa-section" key={weekName}>
                <div className="dsa-section-title">
                  {weekName} <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>({qs.length} problems)</span>
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