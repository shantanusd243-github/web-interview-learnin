import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'; // <-- ADDED: For redirecting
import { mockInterviewApi } from '../api/userActivity';
import { priorityBadgeClass, difficultyBadgeClass } from '../utils/badges';

export default function MockInterviewPage() {
  const [history, setHistory] = useState([]);
  const [pos, setPos] = useState(-1);
  const [revealed, setRevealed] = useState(false);
  const [confident, setConfident] = useState(0);
  const [weak, setWeak] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // <-- ADDED: Instantiate navigate

  const markMutation = useMutation({ mutationFn: mockInterviewApi.mark });
  const currentQ = pos >= 0 ? history[pos] : null;

  const fetchNext = async () => {
    setIsLoading(true);
    try {
      const result = await mockInterviewApi.next();
      if (result) {
        setHistory((h) => [...h.slice(0, pos + 1), result]);
        setPos((p) => p + 1);
        setRevealed(false);
      } else {
        alert("No more questions available for the mock interview.");
      }
    } catch (error) {
      console.error("Failed to fetch next mock question:", error);

      // <-- ADDED: Robust Error Handling & Auth Redirection
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        alert("Your session has expired or you need to log in. Redirecting to login...");
        navigate('/login');
      } else {
        alert("Failed to load the question. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (pos < history.length - 1) {
      setPos((p) => p + 1);
      setRevealed(false);
    } else {
      fetchNext();
    }
  };

  const handleMark = async (status) => {
    if (!currentQ) return;
    try {
      await markMutation.mutateAsync({ questionId: currentQ.id, markedStatus: status });
      if (status === 'confident') setConfident((c) => c + 1);
      else if (status === 'weak') setWeak((w) => w + 1);

      handleNext();
    } catch (error) {
      console.error("Failed to mark question:", error);

      // <-- ADDED: Auth Redirection for marking as well
      const httpStatus = error.response?.status;
      if (httpStatus === 401 || httpStatus === 403) {
        alert("Your session has expired. Please log in again.");
        navigate('/login');
      } else {
        alert("Failed to save your progress. Please try again.");
      }
    }
  };

  return (
    <div id="page-mock" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🎯 Mock Interview</div>
          <div className="section-desc">One question at a time. Answer mentally, then reveal.</div>
        </div>
      </div>

      <div className="mock-card">
        <div style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Question {pos >= 0 ? pos + 1 : 0} {history.length > 0 && <>of {history.length}</>}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
          {currentQ && (
            <>
              <span className="badge badge-topic">{currentQ.topic}</span>
              {currentQ.priority && <span className={`badge ${priorityBadgeClass(currentQ.priority)}`}>{currentQ.priority}</span>}
              {currentQ.difficulty && <span className={`badge ${difficultyBadgeClass(currentQ.difficulty)}`}>{currentQ.difficulty}</span>}
            </>
          )}
        </div>

        <div className="mock-q">
          {isLoading && !currentQ
            ? 'Loading…'
            : currentQ
            ? currentQ.title
            : 'Press Start to begin your mock interview'}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          {!currentQ && (
            <button
              className="mock-answer-btn"
              onClick={fetchNext}
              disabled={isLoading}
              style={{ width: '100%', maxWidth: 260 }}
            >
              {isLoading ? 'Starting...' : '▶ Start Mock Interview'}
            </button>
          )}
          {currentQ && (
            <>
              <button className="mock-answer-btn" onClick={() => setRevealed(true)}>
                💡 Reveal Answer
              </button>
              <button
                className="mock-answer-btn"
                style={{ background: '#1e293b' }}
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Next →'}
              </button>
            </>
          )}
        </div>

        {currentQ && (
          <div className={`mock-answer-area${revealed ? ' visible' : ''}`}>
            <strong>💡 Answer:</strong> {currentQ.answer}
            {currentQ.deep && <><br /><br /><strong>🔬 Deeper:</strong> {currentQ.deep}</>}
            {currentQ.real && <><br /><br /><strong>🏭 Real-world:</strong> {currentQ.real}</>}
          </div>
        )}

        {currentQ && (
          <div className="mock-nav">
            <button
              onClick={() => { if (pos > 0) { setPos((p) => p - 1); setRevealed(false); } }}
              disabled={pos <= 0 || isLoading}
              style={{
                background: '#1e293b', color: '#94a3b8', border: 'none',
                padding: '8px 16px', borderRadius: 6,
                cursor: pos <= 0 || isLoading ? 'default' : 'pointer',
                opacity: pos <= 0 || isLoading ? 0.5 : 1, minHeight: 40,
              }}
            >
              ← Prev
            </button>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => handleMark('confident')}
                disabled={isLoading || markMutation.isPending}
                style={{
                  background: '#064e3b', color: '#34d399', border: 'none', padding: '7px 16px',
                  borderRadius: 6, cursor: (isLoading || markMutation.isPending) ? 'default' : 'pointer',
                  fontSize: 13, minHeight: 40, opacity: (isLoading || markMutation.isPending) ? 0.5 : 1
                }}
              >✓ Got it</button>
              <button
                onClick={() => handleMark('weak')}
                disabled={isLoading || markMutation.isPending}
                style={{
                  background: '#7f1d1d', color: '#f87171', border: 'none', padding: '7px 16px',
                  borderRadius: 6, cursor: (isLoading || markMutation.isPending) ? 'default' : 'pointer',
                  fontSize: 13, minHeight: 40, opacity: (isLoading || markMutation.isPending) ? 0.5 : 1
                }}
              >✗ Weak</button>
            </div>

            <div className="mock-counter">✅ {confident} | ❌ {weak}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📝 Mock Session Tips</div>
          <ul style={{ fontSize: 13, color: '#475569', lineHeight: 2, paddingLeft: 16 }}>
            <li>Say the answer aloud — not just in your head</li>
            <li>Start with 1 clear sentence, then expand</li>
            <li>Mention a real project where possible</li>
            <li>If stuck, explain what you DO know</li>
            <li>Ask clarifying questions — seniors do this</li>
          </ul>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🎭 Senior Framing</div>
          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
            Don't just answer the question — answer it with <strong>context</strong>: "In my project at [X], we chose
            [approach] because [reason]. The tradeoff was [Y], which we handled by [Z]." This shows ownership and
            senior-level thinking.
          </div>
        </div>
      </div>
    </div>
  );
}