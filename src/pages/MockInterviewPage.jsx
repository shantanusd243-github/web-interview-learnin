import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { priorityBadgeClass, difficultyBadgeClass } from '../utils/badges';

const mockInterviewApi = {
  next: () => apiClient.get('/mock-interview/next').then((r) => r.data),
  mark: (data) => apiClient.post('/mock-interview/mark', data).then((r) => r.data),
};

export default function MockInterviewPage() {
  const queryClient = useQueryClient();
  const [history, setHistory] = useState([]); // stack of questions seen this session
  const [pos, setPos] = useState(-1); // index into history; -1 = not started
  const [revealed, setRevealed] = useState(false);
  const [confident, setConfident] = useState(0);
  const [weak, setWeak] = useState(0);

  const nextQuery = useQuery({
    queryKey: ['mock-interview-next'],
    queryFn: mockInterviewApi.next,
    enabled: false,
    retry: false,
  });

  const markMutation = useMutation({ mutationFn: mockInterviewApi.mark });

  const currentQ = pos >= 0 ? history[pos] : null;

  const fetchNext = async () => {
    const result = await queryClient.fetchQuery({ queryKey: ['mock-interview-next'], queryFn: mockInterviewApi.next });
    setHistory((h) => [...h.slice(0, pos + 1), result]);
    setPos((p) => p + 1);
    setRevealed(false);
  };

  const handleStart = () => fetchNext();
  const handleNext = () => fetchNext();

  const handlePrev = () => {
    if (pos > 0) {
      setPos((p) => p - 1);
      setRevealed(false);
    }
  };

  const handleMark = async (status) => {
    if (!currentQ) return;
    await markMutation.mutateAsync({ questionId: currentQ.id, markedStatus: status });
    if (status === 'confident') setConfident((c) => c + 1);
    else if (status === 'weak') setWeak((w) => w + 1);
    fetchNext();
  };

  return (
    <div id="page-mock" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🎯 Mock Interview Mode</div>
          <div className="section-desc">One question at a time. Answer mentally, then reveal.</div>
        </div>
      </div>

      <div className="mock-card" id="mockCard">
        <div style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Question <span>{pos + 1 || (currentQ ? 1 : 0)}</span> {history.length > 0 && <>of <span>{history.length}</span></>}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
          {currentQ && (
            <>
              <span className="badge badge-topic">{currentQ.topic}</span>
              {currentQ.priority && <span className={`badge ${priorityBadgeClass(currentQ.priority)}`}>{currentQ.priority}</span>}
              {currentQ.difficulty && (
                <span className={`badge ${difficultyBadgeClass(currentQ.difficulty)}`}>{currentQ.difficulty}</span>
              )}
            </>
          )}
        </div>
        <div className="mock-q">
          {nextQuery.isFetching && !currentQ
            ? 'Loading…'
            : currentQ
            ? currentQ.title
            : 'Press Start to begin your mock interview'}
        </div>

        {!currentQ && (
          <button className="mock-answer-btn" onClick={handleStart}>
            ▶ Start Mock Interview
          </button>
        )}
        {currentQ && (
          <>
            <button className="mock-answer-btn" onClick={() => setRevealed(true)}>
              💡 Reveal Answer
            </button>
            <button className="mock-answer-btn" style={{ background: '#1e293b' }} onClick={handleNext}>
              Next Question →
            </button>
          </>
        )}

        {currentQ && (
          <div className={`mock-answer-area${revealed ? ' visible' : ''}`}>
            <strong>💡 Answer:</strong> {currentQ.answer}
            {currentQ.deep && (
              <>
                <br />
                <br />
                <strong>🔬 Deeper:</strong> {currentQ.deep}
              </>
            )}
            {currentQ.real && (
              <>
                <br />
                <br />
                <strong>🏭 Real-world:</strong> {currentQ.real}
              </>
            )}
          </div>
        )}

        {currentQ && (
          <div className="mock-nav">
            <button
              onClick={handlePrev}
              disabled={pos <= 0}
              style={{
                background: '#1e293b',
                color: '#94a3b8',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: pos <= 0 ? 'default' : 'pointer',
                opacity: pos <= 0 ? 0.5 : 1,
              }}
            >
              ← Prev
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleMark('confident')}
                style={{
                  background: '#064e3b',
                  color: '#34d399',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ✓ Got it
              </button>
              <button
                onClick={() => handleMark('weak')}
                style={{
                  background: '#7f1d1d',
                  color: '#f87171',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ✗ Weak
              </button>
            </div>
            <div className="mock-counter">
              Confident: {confident} | Weak: {weak}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
