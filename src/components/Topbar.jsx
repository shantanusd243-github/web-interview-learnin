import { useTopics } from '../hooks/useQuestions';
import { useFilters } from '../context/FilterContext';

const PRIORITIES = ['Must Know', 'Important', 'Nice to Know'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Senior'];

const selectStyle = {
  padding: '7px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 13,
  background: 'white',
};

export default function Topbar({ onToggleSidebar }) {
  const { search, setSearch, searchHint, topic, setTopic, priority, setPriority, difficulty, setDifficulty } = useFilters();
  const { data: topics } = useTopics();

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
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              fontSize: 11,
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {searchHint}
          </div>
        )}
      </div>
      <select
          value={topic || 'All Topics'}
          onChange={(e) => setTopic(e.target.value)}
          style={selectStyle} // your existing styling
      >
          <option value="All Topics">All Topics</option>
          {topics.map((t) => (
              // Ensure you are printing {t} and not {t.name} or {t.topic}
              <option key={t} value={t}>{t}</option>
          ))}
      </select>
      <select value={priority} onChange={(e) => setPriority(e.target.value)} style={selectStyle}>
        <option value="">All Priority</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={selectStyle}>
        <option value="">All Levels</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
