import { useLocation, useNavigate } from 'react-router-dom';
import { useTopics } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';
import ThemeToggle from './ThemeToggle'; // <-- 1. ADD THIS IMPORT
import SleekDropdown from './SleekDropdown';
const PRIORITY_LABELS = ['All Priority', 'Must Know', 'Important', 'Nice to Know'];

const priorityToApi = {
  'Must Know': 'MUST_KNOW',
  'Important': 'IMPORTANT',
  'Nice to Know': 'NICE_TO_KNOW',
  'All Priority': ''
};

const apiToPriority = {
  'MUST_KNOW': 'Must Know',
  'IMPORTANT': 'Important',
  'NICE_TO_KNOW': 'Nice to Know',
  '': 'All Priority'
};

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

      <div className="topbar-filters" style={{ display: 'flex', gap: '10px' }}>

        {/* Topic Dropdown */}
        <SleekDropdown
          value={currentValue}
          options={['All Topics', 'DSA', 'System Design', ...theoryTopics.map(t => typeof t === 'object' ? (t.name || t.topic) : t)]}
          onChange={(val) => {
            if (val === 'DSA') { setTopic(''); navigate('/dsa'); }
            else if (val === 'System Design') { setTopic(''); navigate('/sysdesign'); }
            else { setTopic(val === 'All Topics' ? '' : val); navigate('/questions'); }
          }}
          placeholder="All Topics"
        />

        {/* Priority Dropdown */}
        <SleekDropdown
          value={apiToPriority[priority] || "All Priority"}
          options={PRIORITY_LABELS}
          onChange={(val) => setPriority(priorityToApi[val])}
        />

        {/* Difficulty Dropdown */}
        <SleekDropdown
          value={difficulty || "All Levels"}
          options={['All Levels', ...DIFFICULTIES]}
          onChange={(val) => setDifficulty(val === 'All Levels' ? '' : val)}
        />
      </div>

      <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center' }}>
        <ThemeToggle />
      </div>
    </div>
  );
}