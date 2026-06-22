import { useEffect, useMemo, useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';
import QuestionCard from '../components/QuestionCard';
import apiClient from '../api/client';
import SkeletonCard from '../components/SkeletonCard';
import SleekDropdown from '../components/SleekDropdown';

const CATEGORIES = ['Infrastructure', 'Storage', 'Real-time', 'Social', 'Commerce', 'AI'];

export default function SystemDesignPage() {
  const { debouncedSearch } = useFilters();
  const [cat, setCat] = useState('all');
  const [tag, setTag] = useState('all');

  const [availableTags, setAvailableTags] = useState([]);

  const apiCat = cat === 'all' ? '' : cat;
  const apiTag = tag === 'all' ? '' : tag;

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

  useEffect(() => {
      updateFilters({
          category: apiCat,
          tag: apiTag,
          search: debouncedSearch
      });
  }, [apiCat, apiTag, debouncedSearch, updateFilters]);

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

{/* --- WRAPPING CHIPS & RIGHT DROPDOWN FIX --- */}
         <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>

            {/* Left Side: Wrapping Chips (Max 2 rows, then scroll) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1, maxHeight: '82px', overflowY: 'auto', alignContent: 'flex-start', paddingRight: '4px' }}>
              <button className={`filter-chip${cat === 'all' ? ' active' : ''}`} onClick={() => setCat('all')}>All</button>
              {CATEGORIES.map((c) => (
                <button key={c} className={`filter-chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
                  {c === 'Social' ? 'Social/Media' : c === 'AI' ? 'AI/ML' : c}
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