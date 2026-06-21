import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';
import { getDashboardSummary } from '../api/userActivity';
import { useTopics } from '../hooks/useQuestions';
import SkeletonDashboard from '../components/SkeletonDashboard';

const getIconForTopic = (topic) => {
  const iconMap = {
    'Core Java': '☕', 'Collections': '📦', 'Java 8': '🚀', 'Multithreading': '🔄',
    'Spring Boot': '🍃', 'Microservices': '🔗', 'Security': '🔒', 'JPA': '💾',
    'SQL': '🗄️', 'Kafka': '📨', 'AWS': '☁️', 'Docker': '🐳',
    'Kubernetes': '☸️', 'Exception Handling': '⚠️', 'OOP': '🧬',
  };
  return iconMap[topic] || '📘';
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setTopicFilter } = useFilters();
  const { data: dbTopics, isLoading: loadingTopics } = useTopics();

  const [stats, setStats] = useState({
    totalQuestions: 0, confidentCount: 0, revisingCount: 0, weakCount: 0, topicCounts: {},
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setLoadingStats(true);
    getDashboardSummary()
      .then(data => { if (data) setStats(data); })
      .catch(err  => console.error('Failed to load dashboard summary', err))
      .finally(()  => setLoadingStats(false));
  }, []);

  const total = stats.totalQuestions;
  const pct   = (n) => (total ? (n / total) * 100 : 0);
  const goToTopic = (topic) => { setTopicFilter(topic); navigate('/questions'); };
  const isPageLoading = loadingStats || loadingTopics;

  return (
    <div id="page-dashboard" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">📊 Prep Dashboard</div>
          <div className="section-desc">Senior Java Developer — Track progress by topic and difficulty.</div>
        </div>
      </div>

      {isPageLoading ? (
        <SkeletonDashboard />
      ) : (
        <>
          {/* Stats Grid — 2-col mobile, 4-col tablet+ (handled by CSS) */}
          <div className="stats-grid mt-6">
            {[
              { num: total,                color: '#6366f1', label: 'Total Questions', pctVal: 100 },
              { num: stats.confidentCount, color: '#22c55e', label: 'Confident',       pctVal: pct(stats.confidentCount) },
              { num: stats.revisingCount,  color: '#f59e0b', label: 'Revising',        pctVal: pct(stats.revisingCount) },
              { num: stats.weakCount,      color: '#ef4444', label: 'Weak Areas',      pctVal: pct(stats.weakCount) },
            ].map(({ num, color, label, pctVal }) => (
              <div className="stat-card" key={label}>
                <div className="stat-num" style={{ color }}>{num}</div>
                <div className="stat-label">{label}</div>
                <div className="progress-bar" style={{ marginTop: 8 }}>
                  <div className="progress-fill" style={{ background: color, width: `${pctVal}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Two-panel cards — stack on mobile, side-by-side on tablet+ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>🎯 JD Priority Radar</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Java Core + Multithreading',  'badge-must',      'Must Know',      '#dc2626', 95],
                  ['Spring Boot + Microservices', 'badge-must',      'Must Know',      '#dc2626', 95],
                  ['REST APIs + Design',          'badge-must',      'Must Know',      '#dc2626', 90],
                  ['MySQL + Query Optimization',  'badge-must',      'Must Know',      '#dc2626', 85],
                  ['Docker / Kubernetes',         'badge-important', 'Important',      '#d97706', 60],
                  ['AWS / Kafka',                 'badge-nice',      'Nice to Know',   '#16a34a', 40],
                ].map(([label, badgeClass, badgeLabel, color, width]) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, gap: 8 }}>
                      <span style={{ fontWeight: 600, flex: 1, minWidth: 0 }}>{label}</span>
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
                {[
                  ['#fef2f2','#7f1d1d', 'Architecture Ownership', 'Design tradeoff discussions, not just implementation. Say "I chose X over Y because…"'],
                  ['#fffbeb','#78350f', 'Production Mindset',     'Talk about monitoring, logging, performance, outages. "In prod, I faced…"'],
                  ['#f0fdf4','#14532d', 'Mentoring + Code Review','Have examples of reviewing junior code, setting standards, enforcing patterns.'],
                  ['#eff6ff','#1e3a8a', 'Scalability Thinking',   '"What happens at 10x load?" Always think beyond happy-path.'],
                ].map(([bg, color, title, desc]) => (
                  <div key={title} style={{ background: bg, borderRadius: 8, padding: '10px 12px', fontSize: 13, color }}>
                    <strong>{title}</strong> — {desc}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Solving module tiles */}
          <div style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
            Problem Solving &amp; Architecture
          </div>
          <div className="topic-grid" style={{ marginBottom: 24 }}>
            <div className="topic-tile" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }} onClick={() => navigate('/dsa')}>
              <div className="topic-icon">💻</div>
              <div className="topic-name">Data Structures &amp; Algorithms</div>
              <div className="topic-count" style={{ color: '#2563eb' }}>Enter DSA Module →</div>
            </div>
            <div className="topic-tile" style={{ background: '#f0fdfa', borderColor: '#a7f3d0' }} onClick={() => navigate('/sysdesign')}>
              <div className="topic-icon">🏗️</div>
              <div className="topic-name">System Design</div>
              <div className="topic-count" style={{ color: '#059669' }}>Enter System Design →</div>
            </div>
          </div>

          {/* Theory topic tiles */}
          <div style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
            Theory Topics
          </div>
          <div className="topic-grid">
            {(dbTopics || []).map((topic) => (
              <div className="topic-tile" key={topic} onClick={() => goToTopic(topic)}>
                <div className="topic-icon">{getIconForTopic(topic)}</div>
                <div className="topic-name">{topic === 'Exception Handling' ? 'Exceptions' : topic}</div>
                <div className="topic-count">{stats.topicCounts[topic] || 0} questions</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
