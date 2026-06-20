import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';
import { getDashboardSummary } from '../api/userActivity';

const TOPIC_TILES = [
  { topic: 'Core Java', icon: '☕' },
  { topic: 'Java 8', icon: '🚀' },
  { topic: 'Collections', icon: '📦' },
  { topic: 'Multithreading', icon: '🔄' },
  { topic: 'String', icon: '🔤' },
  { topic: 'Spring Boot', icon: '🍃' },
  { topic: 'REST APIs', icon: '🌐' },
  { topic: 'Design Patterns', icon: '🏗️' },
  { topic: 'Microservices', icon: '🔗' },
  { topic: 'Exception Handling', icon: '⚠️', shortLabel: 'Exceptions' },
  { topic: 'OOP', icon: '🧬' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setTopicFilter } = useFilters();

  // Replace the heavy hooks with a single lightweight state
  const [stats, setStats] = useState({
    totalQuestions: 0,
    confidentCount: 0,
    revisingCount: 0,
    weakCount: 0,
    topicCounts: {}
  });

  // Fetch the summary data once on mount
  useEffect(() => {
    getDashboardSummary()
      .then(data => {
        if (data) setStats(data);
      })
      .catch(err => console.error("Failed to load dashboard summary", err));
  }, []);

  const total = stats.totalQuestions;
  const pct = (n) => (total ? (n / total) * 100 : 0);

  const goToTopic = (topic) => {
    setTopicFilter(topic);
    navigate('/questions');
  };

  return (
    <div id="page-dashboard" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">📊 Prep Dashboard</div>
          <div className="section-desc">
            Senior Java Developer — Interview next week. Track progress by topic and difficulty.
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#6366f1' }}>
            {total}
          </div>
          <div className="stat-label">Total Questions</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ background: '#6366f1', width: '100%' }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#22c55e' }}>
            {stats.confidentCount}
          </div>
          <div className="stat-label">Confident</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ background: '#22c55e', width: `${pct(stats.confidentCount)}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#f59e0b' }}>
            {stats.revisingCount}
          </div>
          <div className="stat-label">Revising</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ background: '#f59e0b', width: `${pct(stats.revisingCount)}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#ef4444' }}>
            {stats.weakCount}
          </div>
          <div className="stat-label">Weak Areas</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ background: '#ef4444', width: `${pct(stats.weakCount)}%` }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>🎯 JD Priority Radar</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Java Core + Multithreading', 'badge-must', 'Must Know', '#dc2626', 95],
              ['Spring Boot + Microservices', 'badge-must', 'Must Know', '#dc2626', 95],
              ['REST APIs + Design', 'badge-must', 'Must Know', '#dc2626', 90],
              ['MySQL + Query Optimization', 'badge-must', 'Must Know', '#dc2626', 85],
              ['Docker / Kubernetes', 'badge-important', 'Important', '#d97706', 60],
              ['AWS / Kafka', 'badge-nice', 'Nice to Know', '#16a34a', 40],
            ].map(([label, badgeClass, badgeLabel, color, width]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ background: color, width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>⚠️ Senior-Level Expectations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: '#fef2f2', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#7f1d1d' }}>
              <strong>Architecture Ownership</strong> — Design tradeoff discussions, not just implementation. Be ready to
              say "I chose X over Y because..."
            </div>
            <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#78350f' }}>
              <strong>Production Mindset</strong> — Talk about monitoring, logging, performance, outages. "In prod, I
              faced..."
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#14532d' }}>
              <strong>Mentoring + Code Review</strong> — Have examples of reviewing junior code, setting standards,
              enforcing patterns.
            </div>
            <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#1e3a8a' }}>
              <strong>Scalability Thinking</strong> — "What happens at 10x load?" Always think beyond happy-path.
            </div>
          </div>
        </div>
      </div>

      <div className="topic-grid">
        {TOPIC_TILES.map(({ topic, icon, shortLabel }) => (
          <div className="topic-tile" key={topic} onClick={() => goToTopic(topic)}>
            <div className="topic-icon">{icon}</div>
            <div className="topic-name">{shortLabel || topic}</div>
            {/* Fallback to 0 if the backend map doesn't contain the topic yet */}
            <div className="topic-count">{stats.topicCounts[topic] || 0} questions</div>
          </div>
        ))}
        <div className="topic-tile" onClick={() => navigate('/reference/sql')}>
          <div className="topic-icon">🗄️</div>
          <div className="topic-name">SQL</div>
          <div className="topic-count">{stats.topicCounts['SQL'] || 0} queries</div>
        </div>
      </div>
    </div>
  );
}