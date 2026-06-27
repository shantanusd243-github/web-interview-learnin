import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';
import { getDashboardSummary } from '../api/userActivity';
import { useTopics } from '../hooks/useQuestions';
import SkeletonDashboard from '../components/SkeletonDashboard';
import JdInputModal from '../components/JdInputModal';
// CLEAN API IMPORTS
import { triggerJdAnalysisAsync, getAiPlan } from '../api/dashboard';
import { Sparkles } from 'lucide-react';

const getIconForTopic = (topic) => {
  const iconMap = {
    'Core Java': '☕', 'Collections': '📦', 'Java 8': '🚀', 'Multithreading': '🔄',
    'Spring Boot': '🍃', 'Microservices': '🔗', 'Security': '🔒', 'JPA': '💾',
    'SQL': '🗄️', 'Kafka': '📨', 'AWS': '☁️', 'Docker': '🐳',
    'Kubernetes': '☸️', 'Exception Handling': '⚠️', 'OOP': '🧬',
    'DevOps': '♾️', 'Caching': '⚡', 'Redis': '🟥', 'Cloud Infrastructure': '☁️',
    'Design Patterns': '🧩'
  };
  return iconMap[topic] || '📘';
};

const getExpectationStyle = (index) => {
  const styles = [
    { bg: '#eff6ff', color: '#1e3a8a', border: '#3b82f6' },
    { bg: '#fef2f2', color: '#7f1d1d', border: '#ef4444' },
    { bg: '#f0fdf4', color: '#14532d', border: '#22c55e' },
    { bg: '#fffbeb', color: '#78350f', border: '#f59e0b' },
    { bg: '#f5f3ff', color: '#4c1d95', border: '#8b5cf6' },
  ];
  return styles[index % styles.length];
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setTopicFilter } = useFilters();
  const { data: dbTopics, isLoading: loadingTopics } = useTopics();

  const [stats, setStats] = useState({ totalQuestions: 0, confidentCount: 0, revisingCount: 0, weakCount: 0, topicCounts: {} });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdPlan, setJdPlan] = useState(null);

  useEffect(() => {
    setLoadingStats(true);
    // LOAD STATS AND PERSISTED AI PLAN SIMULTANEOUSLY
    Promise.all([
      getDashboardSummary().catch(() => ({})),
      getAiPlan().catch(() => ({ data: null }))
    ]).then(([statsData, planData]) => {
      if (statsData) setStats(statsData);
      setJdPlan(planData?.data || null);
    }).finally(() => setLoadingStats(false));
  }, []);

  const handleAnalyzeJd = async (jdText) => {
    setIsAnalyzing(true);
    try {
      // ASYNC TRIGGER USING CLEAN API CALL
      await triggerJdAnalysisAsync(jdText);
      alert("Attack plan generation started! You'll get an email when your dashboard is ready.");
      setIsJdModalOpen(false);
    } catch (error) {
      // THIS PRINTS THE EXACT ERROR TO YOUR BROWSER CONSOLE
      console.error("API Error Details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert("Failed: " + errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const total = stats.totalQuestions;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const goToTopic = (topic, module = 'THEORY') => {
    if (module === 'SYSTEM_DESIGN') {
      // Pass the topic in the state payload so the next page can read it
      navigate('/sysdesign', { state: { preselect: topic } });
    } else if (module === 'DSA') {
      navigate('/dsa', { state: { preselect: topic } });
    } else {
      setTopicFilter(topic);
      navigate('/questions');
    }
  };
  const isPageLoading = loadingStats || loadingTopics;

  const getRadarColor = (level) => {
    if (level === 'Must Know') return { color: '#dc2626', badgeClass: 'badge-must' };
    if (level === 'Important') return { color: '#d97706', badgeClass: 'badge-important' };
    return { color: '#16a34a', badgeClass: 'badge-nice' };
  };

  return (
    <div id="page-dashboard" className="page active">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-title">{jdPlan ? `🎯 Target: ${jdPlan.role}` : '📊 Prep Dashboard'}</div>
          <div className="section-desc">{jdPlan ? `Difficulty Focus: ${jdPlan.difficulty}` : 'Senior Java Developer — Track progress by topic and difficulty.'}</div>
        </div>
        <button onClick={() => setIsJdModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Sparkles size={16} /> {jdPlan ? 'Change Target Role' : 'Target New Role'}
        </button>
      </div>

      {isPageLoading ? <SkeletonDashboard /> : (
        <>
          {jdPlan && (
            <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', padding: '16px', borderRadius: '8px', marginTop: '16px', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>Battle Plan:</strong> {jdPlan.strategyMessage}
            </div>
          )}

          <div className="stats-grid mt-6">
            {[ { num: total, color: '#6366f1', label: 'Total Questions', pctVal: 100 },
               { num: stats.confidentCount, color: '#22c55e', label: 'Confident', pctVal: pct(stats.confidentCount) },
               { num: stats.revisingCount, color: '#f59e0b', label: 'Revising', pctVal: pct(stats.revisingCount) },
               { num: stats.weakCount, color: '#ef4444', label: 'Weak Areas', pctVal: pct(stats.weakCount) },
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24, alignItems: 'start' }}>
            {/* RADAR CARD */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>{jdPlan ? 'Targeted Priority Radar' : 'Essential JD Radar'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' }}>
                {jdPlan ? jdPlan.radarData.map((item) => {
                    const { color, badgeClass } = getRadarColor(item.level);
                    return (
                      <div key={item.topic} style={{ cursor: 'pointer' }} onClick={() => goToTopic(item.topic)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, gap: 8 }}>
                          <span style={{ fontWeight: 600, flex: 1, color: '#0f172a' }}>{item.topic}</span>
                          <span className={`badge ${badgeClass}`}>{item.level}</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ background: color, width: '85%' }} /></div>
                      </div>
                    );
                }) : [
                    ['Java Core + Multithreading',  'badge-must',      'Must Know',      '#dc2626', 95],
                    ['Spring Boot + Microservices', 'badge-must',      'Must Know',      '#dc2626', 95],
                    ['REST APIs + Design',          'badge-must',      'Must Know',      '#dc2626', 90],
                    ['MySQL + Query Optimization',  'badge-must',      'Must Know',      '#dc2626', 85],
                    ['Docker / Kubernetes',         'badge-important', 'Important',      '#d97706', 60],
                    ['AWS / Kafka',                 'badge-nice',      'Nice to Know',   '#16a34a', 40],
                  ].map(([label, badgeClass, badgeLabel, color, width]) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, gap: 8 }}>
                        <span style={{ fontWeight: 600, flex: 1, minWidth: 0, color: '#0f172a' }}>{label}</span>
                        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ background: color, width: `${width}%` }} /></div>
                    </div>
                  ))}
              </div>
            </div>

            {/* EXPECTATIONS CARD */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>{jdPlan ? 'Role Specific Expectations' : 'Senior-Level Expectations'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {jdPlan ? jdPlan.expectations.map((exp, idx) => {
                    const style = getExpectationStyle(idx);
                    return (
                      <div key={idx} style={{ background: style.bg, color: style.color, borderLeft: `4px solid ${style.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>{exp}</div>
                    );
                }) : [
                    ['#fef2f2','#7f1d1d', 'Architecture Ownership', 'Design tradeoff discussions...'],
                    ['#fffbeb','#78350f', 'Production Mindset',     'Talk about monitoring...'],
                    ['#f0fdf4','#14532d', 'Mentoring + Code Review','Have examples of reviewing...'],
                    ['#eff6ff','#1e3a8a', 'Scalability Thinking',   '"What happens at 10x load?"...'],
                  ].map(([bg, color, title, desc]) => (
                    <div key={title} style={{ background: bg, borderRadius: 8, padding: '10px 12px', fontSize: 13, color }}><strong>{title}</strong> — {desc}</div>
                  ))}
              </div>
            </div>
          </div>

          {/* TARGETED FOCUS AREAS */}
          {jdPlan?.focusAreas && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 12px', color: '#0f172a' }}>Targeted Focus Areas</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                {jdPlan.focusAreas.map((area) => (
                   <div key={area.title} className="card" style={{ cursor: 'pointer', padding: '16px' }} onClick={() => goToTopic(area.title)}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                       <span style={{ fontSize: '20px' }}>{getIconForTopic(area.title)}</span>
                       <h4 style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', margin: 0 }}>{area.title}</h4>
                     </div>
                     <p style={{ fontSize: '12px', color: '#475569', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{area.description}</p>
                     <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 600, color: '#4f46e5' }}>Practice Questions →</div>
                   </div>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 12px', color: '#0f172a' }}>Problem Solving &amp; Architecture</div>
          <div className="topic-grid" style={{ marginBottom: 24 }}>
            <div className="topic-tile" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }} onClick={() => navigate('/dsa')}>
              <div className="topic-icon">💻</div><div className="topic-name">Data Structures &amp; Algorithms</div><div className="topic-count" style={{ color: '#2563eb' }}>Enter DSA Module →</div>
            </div>
            <div className="topic-tile" style={{ background: '#f0fdfa', borderColor: '#a7f3d0' }} onClick={() => navigate('/sysdesign')}>
              <div className="topic-icon">🏗️</div><div className="topic-name">System Design</div><div className="topic-count" style={{ color: '#059669' }}>Enter System Design →</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>All Theory Topics</div>
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

      <JdInputModal isOpen={isJdModalOpen} onClose={() => !isAnalyzing && setIsJdModalOpen(false)} onSubmit={handleAnalyzeJd} isLoading={isAnalyzing} />
    </div>
  );
}