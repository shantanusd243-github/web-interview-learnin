import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUpdateProgress, useToggleBookmark } from '../hooks/useUserActivity';
import { priorityBadgeClass, difficultyBadgeClass, STATUS_LABELS, STATUS_CLASSES, nextStatus } from '../utils/badges';
import { getNote, saveNote, deleteNote, saveHighlight, deleteHighlight, getHighlights } from '../api/userActivity';

function nl2br(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));
}

function formatPriorityUI(apiPriority) {
  const map = {
    "MUST_KNOW": "Must Know",
    "IMPORTANT": "Important",
    "NICE_TO_KNOW": "Nice to Know"
  };
  return map[apiPriority] || apiPriority;
}

export function QuestionBody({ q }) {
  if (q.questionType === 'DSA') {
    return (
      <div className="q-answer">
        {q.intro && <div className="sd-box"><strong>Problem:</strong> {q.intro}</div>}
        {q.intuition && <div className="approach-step"><strong>Intuition:</strong> {q.intuition}</div>}
        {q.approach && <div style={{ marginTop: 8 }}><strong>Approach:</strong><br />{nl2br(q.approach)}</div>}
        {q.example && <div style={{ marginTop: 8 }}><strong>Example:</strong><br />{nl2br(q.example)}</div>}
        {q.code && <pre className="code-block">{q.code}</pre>}
        {(q.timeC || q.spaceC) && (
          <div className="complexity-box">
            {q.timeC && <span className="complexity-pill time-pill">⏱️ Time: {q.timeC}</span>}
            {q.spaceC && <span className="complexity-pill space-pill">💾 Space: {q.spaceC}</span>}
          </div>
        )}
        {q.edges && q.edges.length > 0 && <div className="edge-list"><strong>Edge Cases:</strong> {q.edges.join(' | ')}</div>}
        {q.talk && <div className="talk-track"><strong>🗣️ Interview Talk Track:</strong><br />{q.talk}</div>}
        {q.followups && q.followups.length > 0 && (
          <div className="followup">
            <strong>➡️ Follow-ups:</strong>
            <ul style={{ marginLeft: 16, marginTop: 4 }}>
              {q.followups.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (q.questionType === 'SYSTEM_DESIGN') {
    return (
      <div className="q-answer">
        {q.problem && <div className="sd-box"><strong>Problem:</strong> {q.problem}</div>}
        {q.requirements && <div className="approach-step"><strong>Requirements:</strong><br />{nl2br(q.requirements)}</div>}
        {q.design && <div style={{ marginTop: 8 }}><strong>Architecture &amp; Design:</strong><pre className="code-block">{q.design}</pre></div>}
        {q.api && <div style={{ marginTop: 8 }}><strong>API Design:</strong><pre className="code-block">{q.api}</pre></div>}
        {q.scaling && <div className="sd-box"><strong>Scaling Strategy:</strong><br />{nl2br(q.scaling)}</div>}
        {q.tradeoffs && <div className="edge-list"><strong>Tradeoffs:</strong><br />{nl2br(q.tradeoffs)}</div>}
        {q.talk && <div className="talk-track"><strong>🗣️ Interview Talk Track:</strong><br />{q.talk}</div>}
        {q.followups && q.followups.length > 0 && (
          <div className="followup">
            <strong>➡️ Follow-ups:</strong>
            <ul style={{ marginLeft: 16, marginTop: 4 }}>
              {q.followups.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="q-answer">
      <strong>💡 Best Answer:</strong><br />{q.answer}
      {q.deep && <div className="deep-exp"><strong>🔬 Deeper Explanation:</strong><br />{q.deep}</div>}
      {q.followup && <div className="followup"><strong>➡️ Follow-up:</strong> {q.followup}</div>}
      {q.real && <div className="real-world"><strong>🏭 Real-world Usage:</strong><br />{q.real}</div>}
    </div>
  );
}

export default function QuestionCard({ q }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const updateProgress = useUpdateProgress();
  const toggleBookmark = useToggleBookmark();
  const navigate = useNavigate();
  const location = useLocation();
  // --- THE FIX: Local state so the UI updates instantly with Infinite Scroll ---
  const [localStatus, setLocalStatus] = useState(q.userProgressStatus || 'NOT_STARTED');
  const [localBookmarked, setLocalBookmarked] = useState(!!q.bookmarked);

  // Sync state if 'q' ever changes from parent
  useEffect(() => {
    setLocalStatus(q.userProgressStatus || 'NOT_STARTED');
    setLocalBookmarked(!!q.bookmarked);
  }, [q.userProgressStatus, q.bookmarked]);

    // 1. Listen for returning users to execute the pending action
    useEffect(() => {
      // Only run if the user is logged in
      if (user) {
        const pendingActionStr = sessionStorage.getItem('pendingAction');

        if (pendingActionStr) {
          const pendingAction = JSON.parse(pendingActionStr);

          // FIX: Use q.id instead of question.id
          if (pendingAction.questionId === q.id) {
            // Clear it immediately so it doesn't run twice
            sessionStorage.removeItem('pendingAction');

            // Execute the intended action (simulate the event object if needed)
            if (pendingAction.type === 'BOOKMARK') {
              handleBookmarkClick({ stopPropagation: () => {} });
            } else if (pendingAction.type === 'UPDATE_STATUS') {
              handleStatusClick({ stopPropagation: () => {} });
            }
          }
        }
      }
    }, [user, q.id]);

    const onBookmarkClick = (e) => {
      e.stopPropagation();
      if (!user) {
        // FIX: Use q.id instead of question.id
        sessionStorage.setItem('pendingAction', JSON.stringify({ type: 'BOOKMARK', questionId: q.id }));
        sessionStorage.setItem('returnUrl', location.pathname + location.search);
        navigate('/login');
        return;
      }

      handleBookmarkClick(e);
    };

    const onStatusClick = (e) => {
      e.stopPropagation();
      if (!user) {
        // FIX: Use q.id instead of question.id
        sessionStorage.setItem('pendingAction', JSON.stringify({
          type: 'UPDATE_STATUS',
          questionId: q.id
        }));
        sessionStorage.setItem('returnUrl', location.pathname + location.search);
        navigate('/login');
        return;
      }

      handleStatusClick(e);
    };

  const title = q.title || q.q;
  const [note, setNote] = useState('');
  const [originalNote, setOriginalNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [selectionMenu, setSelectionMenu] = useState({ visible: false, x: 0, y: 0, text: '', rangeObj: null });

  // --- RESTORED HANDLERS WITH OPTIMISTIC UI ---
  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (!user) return;

    const next = nextStatus(localStatus);
    setLocalStatus(next); // Instant UI change
    updateProgress.mutate({ questionId: q.id, status: next }); // Fire backend request
  };

const handleBookmarkClick = (e) => {
  e.stopPropagation();
  if (!user) return;

  const next = !localBookmarked;

  // THE FIX: Pass the CURRENT state (localBookmarked) into the mutation.
  // If it's currently false, your hook will correctly fire the POST API.
  toggleBookmark.mutate({ questionId: q.id, bookmarked: next });

  setLocalBookmarked(next); // Instant UI change
};

useEffect(() => {
      let highlightTimer; // <-- 1. Add timer reference here

      if (open && q && q.id) {
          getNote(q.id).then(data => {
                if (data && data.noteText) {
                    setNote(data.noteText);
                    setOriginalNote(data.noteText);
                }
          }).catch(() => {});

          getHighlights(q.id).then(data => {
                if (data && data.length > 0) {
                    // <-- 2. Assign the setTimeout to your variable
                    highlightTimer = setTimeout(() => {
                        const container = document.getElementById(`qbody-${q.id}`);
                        if (container) {
                            data.forEach(hl => highlightTextNode(container, hl.highlightedText, hl.id));
                        }
                    }, 50);
                }
          }).catch(() => {});
      }

      // <-- 3. Add the cleanup function here
      return () => {
          if (highlightTimer) clearTimeout(highlightTimer);
      };
  }, [open, q]);

  const highlightTextNode = (node, text, id) => {
      if (node.nodeType === 3) {
          const index = node.nodeValue.indexOf(text);
          if (index >= 0) {
              const markNode = document.createElement('mark');
              markNode.className = "bg-yellow-300 text-black rounded px-1 cursor-pointer hover:bg-red-300 transition-colors duration-200";
              markNode.dataset.highlightId = id;
              markNode.title = "Click to remove highlight";
              markNode.onclick = handleUnmarkClick;

              const middle = node.splitText(index);
              middle.splitText(text.length);
              markNode.appendChild(middle.cloneNode(true));
              middle.parentNode.replaceChild(markNode, middle);
          }
      } else if (node.nodeType === 1 && node.nodeName !== 'MARK') {
          Array.from(node.childNodes).forEach(child => highlightTextNode(child, text, id));
      }
  };

  const handleAutoSaveNote = async () => {
      if (note === originalNote) return;
      setIsSavingNote(true);
      try {
          if (note.trim() === '') {
              await deleteNote(q.id);
          } else {
              await saveNote(q.id, note);
          }
          setOriginalNote(note.trim());
      } catch (error) {
          console.error("Failed to auto-save note:", error);
      } finally {
          setIsSavingNote(false);
      }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection.isCollapsed && selection.rangeCount > 0) {
        const text = selection.toString().trim();
        if (text.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionMenu({
                visible: true,
                x: Math.max(10, rect.left + (rect.width / 2) - 75),
                y: Math.max(10, rect.top - 50),
                text: text,
                rangeObj: range
            });
            return;
        }
    }
    setSelectionMenu({ visible: false, x: 0, y: 0, text: '', rangeObj: null });
  };
useEffect(() => {
    if (!selectionMenu.visible) return;

    const handleScroll = () => {
      setSelectionMenu({ visible: false, x: 0, y: 0, text: '', rangeObj: null });
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [selectionMenu.visible]);

  const handleAskAI = (e) => {
      e.stopPropagation();
      const prompt = `Give me a brief, clear explanation of this (I'm studying Java & system design for a senior developer interview):\n\n"${selectionMenu.text}"`;
      window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`, '_blank');
      window.getSelection().removeAllRanges();
      setSelectionMenu({ visible: false, x: 0, y: 0, text: '', rangeObj: null });
  };

  const handleUnmarkClick = async function(evt) {
      evt.stopPropagation();
      try {
          if (this.dataset.highlightId) {
              await deleteHighlight(this.dataset.highlightId);
          }
          const parent = this.parentNode;
          while (this.firstChild) {
              parent.insertBefore(this.firstChild, this);
          }
          parent.removeChild(this);
      } catch (err) {
          console.error("Failed to delete highlight", err);
      }
  };

  const handleHighlightClick = async (e) => {
      e.stopPropagation();
      if (!selectionMenu.rangeObj) return;

      try {
          const savedHighlight = await saveHighlight(q.id, selectionMenu.text, q.questionType || "body");
          const markNode = document.createElement("mark");
          markNode.className = "bg-yellow-300 text-black rounded px-1 cursor-pointer hover:bg-red-300 transition-colors duration-200";
          markNode.title = "Click to remove highlight";
          if (savedHighlight && savedHighlight.id) markNode.dataset.highlightId = savedHighlight.id;
          markNode.onclick = handleUnmarkClick;
          selectionMenu.rangeObj.surroundContents(markNode);
      } catch (error) {
          console.warn("Highlight crossed boundaries", error);
          alert("Please highlight text cleanly within a single line or paragraph.");
      }
      window.getSelection().removeAllRanges();
      setSelectionMenu({ visible: false, x: 0, y: 0, text: '', rangeObj: null });
  };

  return (
    <div className="q-card" id={`qcard-${q.id}`}>
      <div className={`q-header${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div className="q-question">{title}</div>
          <div className={q.questionType === 'THEORY' ? 'q-badges-row' : 'concept-tags'}>
            {q.questionType === 'THEORY' && q.topic && <span className="badge badge-topic">{q.topic}</span>}
            {q.questionType !== 'THEORY' && (q.tags || []).map((t) => (
              <span className="concept-tag" key={t}>
                {t}
              </span>
            ))}
            {q.priority && <span className={`badge ${priorityBadgeClass(q.priority)}`}>{formatPriorityUI(q.priority)}</span>}
            {q.difficulty && <span className={`badge ${difficultyBadgeClass(q.difficulty)}`}>{q.difficulty}</span>}
            {q.time && <span style={{ fontSize: 11, color: '#64748b' }}>⏱️ {q.time}</span>}
          </div>
          {q.shortSummary && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{q.shortSummary}</div>}
        </div>

        {/* USING LOCAL STATE HERE SO IT FEELS INSTANT */}
        <button className="status-btn" style={{ borderColor: 'inherit' }} onClick={onBookmarkClick} title="Bookmark">
          {localBookmarked ? '🔖' : '📑'}
        </button>

        <button className={`status-btn ${STATUS_CLASSES[localStatus]}`} onClick={onStatusClick}>
          {STATUS_LABELS[localStatus]}
        </button>
        <span className="chevron">▾</span>
      </div>

      <div
        className={`q-body${open ? ' open' : ''}`}
        id={`qbody-${q.id}`}
        onMouseUp={handleTextSelection}
      >
        <QuestionBody q={q} />

        {selectionMenu.visible && (
            <div
                style={{ top: selectionMenu.y, left: selectionMenu.x, position: 'fixed', zIndex: 9999 }}
                className="bg-gray-800 text-white rounded-md shadow-lg flex items-center p-1 space-x-1"
                onMouseDown={(e) => e.preventDefault()}
                onMouseUp={(e) => e.stopPropagation()}
            >
                <button onClick={handleHighlightClick} className="px-3 py-1 text-xs font-medium hover:bg-gray-700 rounded transition-colors">
                    Highlight
                </button>
                <div className="w-px h-4 bg-gray-600"></div>
                <button onClick={handleAskAI} className="px-3 py-1 text-xs font-medium hover:bg-gray-700 text-blue-300 flex items-center rounded transition-colors">
                    Ask AI
                </button>
            </div>
        )}

        <div className="mt-6 pt-3 border-t border-gray-100 relative group" onMouseUp={(e) => e.stopPropagation()}>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleAutoSaveNote}
                maxLength={2000}
                placeholder="✏️ Add a personal note, mnemonic, or reminder..."
                className="w-full text-sm bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-md p-3 text-gray-700 transition-all resize-none outline-none"
                rows={note ? Math.max(2, note.split('\n').length) : 1}
            />
            <div className="absolute bottom-2 right-4 flex items-center gap-3">
                <span className="text-xs text-gray-400">{note ? note.length : 0}/2000</span>
                {isSavingNote && <span className="text-xs text-indigo-500 font-medium">Saving...</span>}
            </div>
        </div>
      </div>
    </div>
  );
}