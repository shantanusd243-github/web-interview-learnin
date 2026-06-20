import { useLocation, useNavigate } from 'react-router-dom';
import { useTopics } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';

const PRIORITIES = ['Must Know', 'Important', 'Nice to Know'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Senior'];

// Fallback exclusion list in case your backend API returns flat strings instead of objects
const NON_THEORY_TOPICS = [
  'Array', 'String', 'Stack', 'Queue', 'HashMap', 'Tree', 'Graph', 'DP', 'Backtracking', 'Sliding Window', 'Binary Search',
  'Infrastructure', 'Database', 'Caching', 'Messaging', 'Scalability', 'Load Balancing', 'API Design', 'Distributed Systems', 'Rate Limiting', 'Observability',
  'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Storage', 'Real-time', 'Social', 'Commerce', 'AI'
];

const selectStyle = {
  padding: '7px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 13,
  background: 'white',
};

export default function Topbar({ onToggleSidebar }) {
  const { search, setSearch, searchHint, topic, setTopic, priority, setPriority, difficulty, setDifficulty } = useFilters();
  const { data: topics = [] } = useTopics();
  const navigate = useNavigate();
  const location = useLocation();

  let currentValue = topic || 'All Topics';
  if (location.pathname.includes('/dsa')) currentValue = 'DSA';
  if (location.pathname.includes('/sysdesign')) currentValue = 'System Design';

  // THE FIX: Explicitly check for questionType === 'THEORY'
  const theoryTopics = topics.filter(t => {
      if (!t) return false;

      // 1. If your backend returns objects: check questionType explicitly
      if (typeof t === 'object') {
          return t.questionType === 'THEORY' || t.type === 'THEORY';
      }

      // 2. If your backend returns flat strings: filter out the known DSA/SD specific tags
      if (typeof t === 'string') {
          return !NON_THEORY_TOPICS.includes(t);
      }

      return false;
  });

  const handleTopicChange = (e) => {
    const val = e.target.value;

    if (val === 'DSA') {
      setTopic(''); // Clear global topic filter
      navigate('/dsa');
    } else if (val === 'System Design') {
      setTopic(''); // Clear global topic filter
      navigate('/sysdesign');
    } else {
      setTopic(val === 'All Topics' ? '' : val);
      navigate('/questions'); // Route back to the main theory questions tab
    }
  };

  return (
    <div className="topbar" style={{ flexWrap: 'wrap', rowGap: 4 }}>
      <button className="hamburger" onClick={onToggleSidebar}>
        ☰
      </button>

      <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
        <input
          type="text"
          placeholder="Search questions, topics, keywords…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
        {searchHint && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            {searchHint}
          </div>
        )}
      </div>

      <select value={currentValue} onChange={handleTopicChange} style={selectStyle}>
        <option value="All Topics">All Topics</option>

        <optgroup label="Dedicated Modules">
          <option value="DSA">💻 Data Structures & Algorithms</option>
          <option value="System Design">🏗️ System Design</option>
        </optgroup>

        <optgroup label="Theory Topics">
          {theoryTopics.map((t) => {
             // Safely extract the string value whether your DB returns an object or a string
             const label = typeof t === 'object' ? (t.name || t.topic) : t;
             const val = typeof t === 'object' ? (t.name || t.topic) : t;
             return <option key={val} value={val}>{label}</option>;
          })}
        </optgroup>
      </select>

      <select value={priority} onChange={(e) => setPriority(e.target.value)} style={selectStyle}>
        <option value="">All Priority</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={selectStyle}>
        <option value="">All Levels</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
}