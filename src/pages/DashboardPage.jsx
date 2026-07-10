import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';
import { getDashboardSummary } from '../api/userActivity';
import { useTopics } from '../hooks/useQuestions';
import SkeletonDashboard from '../components/SkeletonDashboard';
import JdInputModal from '../components/JdInputModal';
import { useAuth } from '../context/AuthContext';
import { triggerJdAnalysisAsync, getAiPlan, getJdHistory, switchActiveJd } from '../api/dashboard';
import { Sparkles, History, ChevronDown, FileText } from 'lucide-react';

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

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Analysed today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setTopicFilter } = useFilters();
  const { data: dbTopics, isLoading: loadingTopics } = useTopics();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalQuestions: 0, confidentCount: 0, revisingCount: 0, weakCount: 0, topicCounts: {} });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdPlan, setJdPlan] = useState(null);

  const [jdHistory, setJdHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef(null);

  const loadDashboardData = () => {
    setLoadingStats(true);
    Promise.all([
      getDashboardSummary().catch(() => ({})),
      getAiPlan().catch(() => ({ data: null })),
      getJdHistory().catch(() => ([]))
    ]).then(([statsData, planData, historyData]) => {
      if (statsData) setStats(statsData);
      setJdPlan(planData?.data || null);
      setJdHistory(historyData || []);
    }).finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('pendingJdModal') === 'true' && user) {
      setIsJdModalOpen(true);
      localStorage.removeItem('pendingJdModal');
    }
  }, [user]);

  const handleAnalyzeJd = async (jdText) => {
    setIsAnalyzing(true);
    try {
      await triggerJdAnalysisAsync(jdText);
      alert("Attack plan generation started! You'll get an email when your dashboard is ready.");
      setIsJdModalOpen(false);
    } catch (error) {
      console.error("API Error Details:", error);
      const errorMsg = (error.response && typeof error.response.data === 'string')
                 ? error.response.data
                 : (error.response?.data?.message || error.message || "An unexpected error occurred.");
      alert("Oops! " + errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSwitchJd = async (planId) => {
    if (isSwitching) return;
    setIsSwitching(true);
    try {
      await switchActiveJd(planId);
      setIsHistoryOpen(false);
      loadDashboardData();
    } catch (error) {
      alert("Failed to switch JD. Please try again.");
    } finally {
      setIsSwitching(false);
    }
  };

  const total = stats.totalQuestions;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const goToTopic = (topic, module = 'THEORY') => {
    if (module === 'SYSTEM_DESIGN') {
      navigate('/sysdesign', { state: { preselect: topic } });
    } else if (module === 'DSA') {
      navigate('/dsa');
    } else {
      setTopicFilter(topic);
      navigate('/questions');
    }
  };
  const isPageLoading = loadingStats || loadingTopics;

  const getRadarColor = (level) => {
    if (level === 'MUST_KNOW' || level === 'Must Know') return { color: '#dc2626', badgeClass: 'badge-must' };
    if (level === 'IMPORTANT' || level === 'Important') return { color: '#d97706', badgeClass: 'badge-important' };
    return { color: '#16a34a', badgeClass: 'badge-nice' };
  };

  const getRadarWidth = (level) => {
    if (level === 'MUST_KNOW' || level === 'Must Know') return { width: '95'};
    if (level === 'IMPORTANT' || level === 'Important') return { width: '70' };
    return { width: '50'};
  };

  return (
    <div id="page-dashboard" className="page active">

      {/* UPDATED HEADER BAR: Using className="card" adapts automatically to Dark Mode */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px', padding: '16px 20px', flexWrap: 'wrap' }}>

        {/* Left: title + subtitle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {jdPlan ? `Target: ${jdPlan.role}` : 'Prep Dashboard'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {jdPlan ? `Difficulty Focus: ${jdPlan.difficulty}` : 'Senior Java Developer — Track progress by topic.'}
          </p>
        </div>

        {/* Right: JD history dropdown + Change Target Role button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

          {/* History Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
         {(!user || user?.roles?.some(role => ['TESTER', 'ADMIN'].includes(role))) && (
          <button
            className="btn btn-secondary"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              borderRadius: '8px', padding: '8px 14px',
              fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <History size={16} />
            <span style={{ opacity: 1 }}>JD History</span>
            {jdHistory.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#4f46e5', color: '#ffffff', /* Using backgroundColor to bypass your CSS hacker */
                fontSize: '11px', fontWeight: 700, borderRadius: '12px',
                padding: '2px 8px', minWidth: '20px', border: 'none'
              }}>
                {jdHistory.length}
              </span>
            )}
            <ChevronDown size={14} />
          </button>
          )}
            {/* Dropdown Panel with Scrollbar */}
            {isHistoryOpen && (
              <div className="card" style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                padding: 0, minWidth: '320px', zIndex: 50,
                maxHeight: '350px', // FIX 1: Max Height for scroll
                overflowY: 'auto',  // FIX 1: Scrollbar enabled
                overflowX: 'hidden',
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recent Analyses</p>
                </div>

                {/* SCROLLABLE LIST AREA - Only this part scrolls now! */}
                <div style={{ maxHeight: '350px', overflowY: 'auto', overflowX: 'hidden' }}>
                  {jdHistory.map((historyItem, index) => {

                    // FIX: Java serializes 'boolean isActive' to 'active' in the JSON response!
                    const isItemActive = historyItem.active || historyItem.isActive;
                    const hasAnyActive = jdHistory.some(item => item.active || item.isActive);

                    // If backend explicitly says it's active, use that. Otherwise fallback to index 0 for legacy data.
                    const isActive = isItemActive || (!hasAnyActive && index === 0);

                    return (
                      <div
                        key={historyItem.id}
                        onClick={() => !isActive && handleSwitchJd(historyItem.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px',
                          padding: '12px 16px',
                          backgroundColor: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                          borderBottom: '1px solid var(--border)',
                          cursor: isActive ? 'default' : 'pointer',
                          opacity: isSwitching && !isActive ? 0.5 : 1,
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--surface-1)')}
                        onMouseOut={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <FileText size={16} color={isActive ? '#4f46e5' : 'var(--text-muted)'} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: isActive ? 600 : 500, color: isActive ? '#4f46e5' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {historyItem.role} {historyItem.company ? `— ${historyItem.company}` : ''}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: isActive ? '#4f46e5' : 'var(--text-muted)', opacity: isActive ? 0.9 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formatRelativeTime(historyItem.createdAt)} · {historyItem.topSkills?.join(', ')}
                          </p>
                        </div>
                        {isActive && (
                          <span style={{
                            fontSize: '10px', fontWeight: 600, backgroundColor: '#4f46e5', color: '#ffffff',
                            borderRadius: '12px', padding: '2px 8px', flexShrink: 0, alignSelf: 'center'
                          }}>Active</span>
                        )}
                      </div>
                    )
                  })}

              {jdHistory.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No history found.
                </div>
              )}
            </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                      <button
                        onClick={() => {
                          setIsHistoryOpen(false);
                          setIsJdModalOpen(true);
                        }}
                        style={{
                          width: '100%', textAlign: 'center', backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          border: 'none', borderRadius: '6px', fontSize: '12px', color: '#4f46e5', fontWeight: 600,
                          cursor: 'pointer', padding: '8px 0', transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)'}
                      >
                        + Analyse a new JD
                      </button>
                    </div>
                  </div>
                )}
          </div>
        {(!user || user?.roles?.some(role => ['TESTER', 'ADMIN'].includes(role))) && (
        <button
            className="btn btn-primary"
            onClick={() => {
              if (user) {
                setIsJdModalOpen(true);
              } else {
                localStorage.setItem('pendingJdModal', 'true');
                navigate('/login');
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={16} />
            {jdPlan ? 'Change target role' : 'Target New Role'}
          </button>
          )}
        </div>
      </div>

      {isPageLoading ? <SkeletonDashboard /> : (
        <>
          {jdPlan && (
            <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>Battle Plan:</strong> {jdPlan.strategyMessage}
            </div>
          )}

          <div className="stats-grid">
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24, alignItems: 'start', marginTop: 24 }}>
            {/* RADAR CARD */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>{jdPlan ? 'Targeted Priority Radar' : 'Essential JD Radar'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' }}>
                {jdPlan ? jdPlan.radarData.map((item) => {
                    const { color, badgeClass } = getRadarColor(item.level);
                    const { width } = getRadarWidth(item.level);
                    return (
                      <div key={item.topic} style={{ cursor: 'pointer' }} onClick={() => goToTopic(item.topic, item.module)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, gap: 8 }}>
                          <span style={{ fontWeight: 600, flex: 1, color: 'var(--text-primary)' }}>{item.topic}</span>
                          <span className={`badge ${badgeClass}`}>{item.level}</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ background: color, width: `${width}%` }} /></div>
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
                        <span style={{ fontWeight: 600, flex: 1, minWidth: 0, color: 'var(--text-primary)' }}>{label}</span>
                        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ background: color, width: `${width}%` }} /></div>
                    </div>
                  ))}
              </div>
            </div>

            {/* EXPECTATIONS CARD */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>{jdPlan ? 'Role Specific Expectations' : 'Senior-Level Expectations'}</div>
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
              <div style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 12px', color: 'var(--text-primary)' }}>Targeted Focus Areas</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                {jdPlan.focusAreas.map((area) => (
                   <div key={area.title} className="card" style={{ cursor: 'pointer', padding: '16px' }} onClick={() => goToTopic(area.title, area.module)}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                       <span style={{ fontSize: '20px' }}>{getIconForTopic(area.title)}</span>
                       <h4 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>{area.title}</h4>
                     </div>
                     <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{area.description}</p>
                     <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 600, color: '#4f46e5' }}>Practice Questions →</div>
                   </div>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 12px', color: 'var(--text-primary)' }}>Problem Solving &amp; Architecture</div>
          <div className="topic-grid" style={{ marginBottom: 24 }}>
            <div className="topic-tile" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }} onClick={() => navigate('/dsa')}>
              <div className="topic-icon">💻</div><div className="topic-name" style={{color: '#0f172a'}}>Data Structures &amp; Algorithms</div><div className="topic-count" style={{ color: '#2563eb' }}>Enter DSA Module →</div>
            </div>
            <div className="topic-tile" style={{ background: '#f0fdfa', borderColor: '#a7f3d0' }} onClick={() => navigate('/sysdesign')}>
              <div className="topic-icon">🏗️</div><div className="topic-name" style={{color: '#0f172a'}}>System Design</div><div className="topic-count" style={{ color: '#059669' }}>Enter System Design →</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>All Theory Topics</div>
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