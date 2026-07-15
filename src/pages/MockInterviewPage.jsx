import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mockInterviewApi } from '../api/userActivity';
import { priorityBadgeClass, difficultyBadgeClass } from '../utils/badges';
import { useFilters } from '../context/FilterContext';
import { QuestionBody } from '../components/QuestionCard';


export default function MockInterviewPage() {
  const [history, setHistory] = useState([]);
  const [pos, setPos] = useState(-1);
  const [revealed, setRevealed] = useState(false);
  const [confident, setConfident] = useState(0);
  const [weak, setWeak] = useState(0);
  const [sessionId, setSessionId] = useState(null); // Track the active session

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // <-- ADDED: Consume the global filter state
  const { topic, difficulty, company } = useFilters();

  const markMutation = useMutation({ mutationFn: mockInterviewApi.mark });
  const currentQ = pos >= 0 ? history[pos] : null;

    const startSession = async () => {
        setIsLoading(true);
        try {
          // Pass the global filters to our backend
          const result = await mockInterviewApi.start({
            topicId: topic,
            difficulty: difficulty,
            companyId: company
          });

          if (result && result.questions && result.questions.length > 0) {
            setHistory(result.questions);
            setSessionId(result.id);
            setPos(0);
            setRevealed(false);
            setConfident(0);
            setWeak(0);
          } else {
            // Fallback just in case it returns 200 with an empty array
            alert("No questions found for the selected filters. Please update your filters and try again.");
          }
        } catch (error) {
          console.error("Failed to start mock session:", error);
          const status = error.response?.status;

          // --- THE FIX: Explicitly handle the 404 error here ---
          if (status === 404) {
            alert("No questions found for the selected filters. Please update your filters and try again.");
          } else if (status === 401 || status === 403) {
            alert("Your session has expired or you need to log in. Redirecting to login...");
            navigate('/login');
          } else {
            alert("Failed to load questions. Please check your connection and try again.");
          }

        } finally {
          setIsLoading(false);
        }
  };

  // <-- UPDATED: Array traversal logic
const handleNext = (addedConfident = false, addedWeak = false) => {
    if (pos < history.length - 1) {
      // Just move to the next question
      setPos((p) => p + 1);
      setRevealed(false);
    } else {
      // End of session: Calculate the exact final score so the alert doesn't use stale React state
      const finalConfident = confident + (addedConfident ? 1 : 0);
      const finalWeak = weak + (addedWeak ? 1 : 0);

      alert(`Session Complete! You scored ${finalConfident} Confident and ${finalWeak} Weak. Ready for another round?`);

      // Reset everything for the next session
      setHistory([]);
      setPos(-1);
      setSessionId(null);
      setConfident(0);
      setWeak(0);
    }
  };

  const handleMark = async (status) => {
    if (!currentQ) return;
    try {
      // Send the mark to the backend
      await markMutation.mutateAsync({ questionId: currentQ.id, markedStatus: status });

      const isConf = status === 'confident';
      const isWk = status === 'weak';

      if (isConf) setConfident((c) => c + 1);
      else if (isWk) setWeak((w) => w + 1);

      // Pass the current action explicitly to handleNext
      handleNext(isConf, isWk);
    } catch (error) {
      console.error("Failed to mark question:", error);
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
              <span className="badge badge-topic">{currentQ.topic?.name || currentQ.topic}</span>
              {currentQ.priority && <span className={`badge ${priorityBadgeClass(currentQ.priority)}`}>{currentQ.priority}</span>}
              {currentQ.difficulty && <span className={`badge ${difficultyBadgeClass(currentQ.difficulty)}`}>{currentQ.difficulty}</span>}
            </>
          )}
        </div>

<div className="mock-q">
          {isLoading && !currentQ
            ? 'Generating your session…'
            : currentQ
            ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {currentQ.title}
                  </div>

                  {/* Render the actual prompt for DSA questions */}
                  {currentQ.questionType === 'DSA' && currentQ.intro && (
                    <div style={{ fontSize: '15px', fontWeight: '400', lineHeight: '1.6', color: '#e2e8f0' }}>
                      {currentQ.intro}
                    </div>
                  )}

                  {/* Render the actual prompt for System Design questions */}
                  {currentQ.questionType === 'SYSTEM_DESIGN' && currentQ.problemStatement && (
                    <div style={{ fontSize: '15px', fontWeight: '400', lineHeight: '1.6', color: '#e2e8f0' }}>
                      {currentQ.problemStatement}
                    </div>
                  )}
                </div>
              )
            : (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#f8fafc' }}>
                    Configure Your Mock Session
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                    Use the <strong>dropdown filters in the top menu bar</strong> to target specific topics or difficulty levels before starting.
                  </div>

                  <div style={{
                    display: 'inline-flex', gap: '24px', background: '#1e293b',
                    padding: '16px 32px', borderRadius: '12px', border: '1px solid #334155'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Topic</span>
                      <span style={{ fontWeight: '600', color: '#38bdf8', fontSize: '15px' }}>{topic?.name || topic || 'All Topics'}</span>
                    </div>
                    <div style={{ width: '1px', background: '#334155' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</span>
                      <span style={{ fontWeight: '600', color: '#38bdf8', fontSize: '15px' }}>{difficulty || 'All Levels'}</span>
                    </div>
                  </div>
                </div>
              )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          {!currentQ && (
            <button
              className="mock-answer-btn"
              onClick={startSession} // <-- Hooked up to the new session generator
              disabled={isLoading}
              style={{ width: '100%', maxWidth: 260 }}
            >
              {isLoading ? 'Starting...' : '▶ Start Mock Session'}
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
                {isLoading ? 'Loading...' : (pos === history.length - 1 ? 'Finish Session ✓' : 'Skip →')}
              </button>
            </>
          )}
        </div>

        {currentQ && (
          <div className={`mock-answer-area${revealed ? ' visible' : ''}`}>
             <QuestionBody q={currentQ} />
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

      {/* Footer Tips... */}
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