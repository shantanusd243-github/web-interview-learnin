import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionRequestsApi } from '../api/questionRequests';
import { useTopics } from '../hooks/useQuestions';

const QUESTION_TYPES = [
  { value: 'THEORY', label: 'Theory / Conceptual' },
  { value: 'DSA', label: 'DSA / Coding' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
];

const STATUS_BADGE = {
  PENDING: { background: '#fffbeb', color: '#d97706', label: '⏳ Pending' },
  APPROVED: { background: '#f0fdf4', color: '#16a34a', label: '✓ Approved' },
  REJECTED: { background: '#fef2f2', color: '#dc2626', label: '✗ Rejected' },
};

const emptyForm = {
  questionType: 'THEORY',
  title: '',
  topic: '',
  category: '',
  suggestedAnswer: '',
  notes: '',
  suggestedTagsText: '',
  suggestedCompaniesText: '',
};

export default function SubmitQuestionPage() {
  const queryClient = useQueryClient();
  const { data: topics } = useTopics();
  const [form, setForm] = useState(emptyForm);
  const [successMsg, setSuccessMsg] = useState('');

  const { data: myRequests, isLoading: loadingMine } = useQuery({
    queryKey: ['my-question-requests'],
    queryFn: () => questionRequestsApi.myRequests({ page: 0, size: 50 }),
    staleTime: 30_000,
  });

  const submitMutation = useMutation({
    mutationFn: questionRequestsApi.submit,
    onSuccess: () => {
      setSuccessMsg('Submitted! An admin will review it soon.');
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ['my-question-requests'] });
    },
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    submitMutation.mutate({
      questionType: form.questionType,
      title: form.title,
      topic: form.topic || null,
      category: form.category || null,
      suggestedAnswer: form.suggestedAnswer || null,
      notes: form.notes || null,
      suggestedTags: form.suggestedTagsText
        ? form.suggestedTagsText.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      suggestedCompanies: form.suggestedCompaniesText
        ? form.suggestedCompaniesText.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    });
  };

  return (
    <div id="page-submit" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">✍️ Submit a Question</div>
          <div className="section-desc">
            Suggest a question you encountered. An admin will review, add a full answer, and publish it.
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640, marginBottom: 28 }}>
        {submitMutation.isError && (
          <div className="auth-error">
            {submitMutation.error?.response?.data?.message || 'Could not submit your question. Please try again.'}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 13, padding: '8px 12px', borderRadius: 8, marginBottom: 14 }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="questionType">Question Type</label>
              <select id="questionType" value={form.questionType} onChange={update('questionType')}>
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="topic">Topic</label>
              <input id="topic" list="topic-options" value={form.topic} onChange={update('topic')} placeholder="e.g. Core Java" />
              <datalist id="topic-options">
                {(topics || []).map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: 12 }}>
            <label htmlFor="title">Question *</label>
            <textarea
              id="title"
              required
              value={form.title}
              onChange={update('title')}
              placeholder="What's the question you want added?"
            />
          </div>

          <div className="form-field" style={{ marginTop: 12 }}>
            <label htmlFor="category">Category (optional)</label>
            <input id="category" value={form.category} onChange={update('category')} placeholder="e.g. Infrastructure, Storage" />
          </div>

          <div className="form-field" style={{ marginTop: 12 }}>
            <label htmlFor="suggestedAnswer">Your suggested answer (optional)</label>
            <textarea
              id="suggestedAnswer"
              value={form.suggestedAnswer}
              onChange={update('suggestedAnswer')}
              placeholder="If you already know a good answer, share it — the admin can refine it."
            />
          </div>

          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="form-field">
              <label htmlFor="tags">Suggested tags (comma-separated)</label>
              <input id="tags" value={form.suggestedTagsText} onChange={update('suggestedTagsText')} placeholder="jvm, gc, multithreading" />
            </div>
            <div className="form-field">
              <label htmlFor="companies">Companies asking this (comma-separated)</label>
              <input id="companies" value={form.suggestedCompaniesText} onChange={update('suggestedCompaniesText')} placeholder="Amazon, Google" />
            </div>
          </div>

          <div className="form-field" style={{ marginTop: 12 }}>
            <label htmlFor="notes">Notes for the admin (optional)</label>
            <textarea id="notes" value={form.notes} onChange={update('notes')} placeholder="Any extra context, where you saw this question, etc." />
          </div>

          <button className="btn btn-primary" style={{ marginTop: 16, padding: '9px 18px' }} type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Submitting…' : 'Submit Question'}
          </button>
        </form>
      </div>

      <div className="section-title" style={{ fontSize: 15, marginBottom: 12 }}>
        Your Submissions
      </div>
      {loadingMine && <div className="loading-state">Loading…</div>}
      {!loadingMine && (myRequests?.content || []).length === 0 && (
        <div className="empty-state">You haven't submitted any questions yet.</div>
      )}
      {!loadingMine && (myRequests?.content || []).length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Type</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.content.map((r) => {
              const badge = STATUS_BADGE[r.status] || STATUS_BADGE.PENDING;
              return (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.questionType}</td>
                  <td>
                    <span className="badge" style={{ background: badge.background, color: badge.color, border: 'none' }}>
                      {badge.label}
                    </span>
                    {r.status === 'REJECTED' && r.reviewNotes && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{r.reviewNotes}</div>
                    )}
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
