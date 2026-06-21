import { useLocation, useNavigate } from 'react-router-dom';
import { useTopics } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';

const PRIORITIES  = ['Must Know', 'Important', 'Nice to Know'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Senior'];

const NON_THEORY_TOPICS = [
  'Array','String','Stack','Queue','HashMap','Tree','Graph','DP','Backtracking','Sliding Window','Binary Search',
  'Infrastructure','Database','Caching','Messaging','Scalability','Load Balancing','API Design','Distributed Systems','Rate Limiting','Observability',
  'Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7','Week 8','Storage','Real-time','Social','Commerce','AI',
];

export default function Topbar({ onToggleSidebar }) {
  const { search, setSearch, searchHint, topic, setTopic, priority, setPriority, difficulty, setDifficulty } = useFilters();
  const { data: topics = [] } = useTopics();
  const navigate  = useNavigate();
  const location  = useLocation();

  let currentValue = topic || 'All Topics';
  if (location.pathname.includes('/dsa'))       currentValue = 'DSA';
  if (location.pathname.includes('/sysdesign')) currentValue = 'System Design';

  const theoryTopics = topics.filter(t => {
    if (!t) return false;
    if (typeof t === 'object') return t.questionType === 'THEORY' || t.type === 'THEORY';
    if (typeof t === 'string') return !NON_THEORY_TOPICS.includes(t);
    return false;
  });

  const handleTopicChange = (e) => {
    const val = e.target.value;
    if      (val === 'DSA')           { setTopic(''); navigate('/dsa'); }
    else if (val === 'System Design') { setTopic(''); navigate('/sysdesign'); }
    else { setTopic(val === 'All Topics' ? '' : val); navigate('/questions'); }
  };

  return (
    <div className="topbar">
      {/* Row 1: hamburger + search */}
      <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
        ☰
      </button>

      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <input
          type="search"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', fontSize: 14 }}
        />
        {searchHint && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4,
            fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            {searchHint}
          </div>
        )}
      </div>

      {/* Row 2 (wraps below on mobile): filter selects */}
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        width: '100%',
        /* On ≥640px, don't force full width — let them sit beside search */
      }}
        className="topbar-filters"
      >
        <select value={currentValue} onChange={handleTopicChange} style={{ flex: '1 1 140px' }}>
          <option value="All Topics">All Topics</option>
          <optgroup label="Dedicated Modules">
            <option value="DSA">💻 DSA</option>
            <option value="System Design">🏗️ System Design</option>
          </optgroup>
          <optgroup label="Theory Topics">
            {theoryTopics.map((t) => {
              const label = typeof t === 'object' ? (t.name || t.topic) : t;
              const val   = typeof t === 'object' ? (t.name || t.topic) : t;
              return <option key={val} value={val}>{label}</option>;
            })}
          </optgroup>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ flex: '1 1 110px' }}>
          <option value="">All Priority</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ flex: '1 1 110px' }}>
          <option value="">All Levels</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  );
}
