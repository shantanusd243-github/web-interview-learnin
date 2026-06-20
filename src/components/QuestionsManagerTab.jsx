import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../api/questions';
import QuestionApprovalForm, { emptyQuestionForm, toQuestionRequestPayload } from './QuestionApprovalForm';

function csvJoin(arr) {
  return (arr || []).join(', ');
}

/** Converts a QuestionResponse (from the list) into the flat form shape
 *  QuestionApprovalForm expects, mirroring buildInitialFromSubmission's shape. */
function buildFormFromQuestion(q) {
  return {
    questionType: q.questionType,
    status: q.status || 'PUBLISHED',
    title: q.title || '',
    topic: q.topic || '',
    category: q.category || '',
    priority: q.priority || '',
    difficulty: q.difficulty || '',
    tags: csvJoin(q.tags),
    companyAskedIn: csvJoin(q.companyAskedIn),
    shortSummary: q.shortSummary || '',
    answer: q.answer || '',
    deep: q.deep || '',
    followup: q.followup || '',
    real: q.real || '',
    week: q.week || '',
    time: q.time || '',
    intro: q.intro || '',
    intuition: q.intuition || '',
    approach: q.approach || '',
    example: q.example || '',
    code: q.code || '',
    timeC: q.timeC || '',
    spaceC: q.spaceC || '',
    edges: csvJoin(q.edges),
    talk: q.talk || '',
    followups: csvJoin(q.followups),
    problem: q.problem || '',
    requirements: q.requirements || '',
    functionalRequirements: q.functionalRequirements || '',
    nonFunctionalRequirements: q.nonFunctionalRequirements || '',
    design: q.design || '',
    api: q.api || '',
    dbDesign: q.dbDesign || '',
    scaling: q.scaling || '',
    cachingStrategy: q.cachingStrategy || '',
    consistencyTradeoffs: q.consistencyTradeoffs || '',
    failureScenarios: q.failureScenarios || '',
    observability: q.observability || '',
    security: q.security || '',
    tradeoffs: q.tradeoffs || '',
    diagramMarkdown: q.diagramMarkdown || '',
  };
}

function QuestionFormModal({ question, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!question;
  const [form, setForm] = useState(() => (question ? buildFormFromQuestion(question) : emptyQuestionForm('THEORY')));

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = toQuestionRequestPayload(form);
      return isEdit ? questionsApi.update(question.id, payload) : questionsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions-list'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      onClose();
    },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{isEdit ? 'Edit Question' : 'Create Question'}</div>
          <button className="btn btn-secondary" onClick={onClose}>✕</button>
        </div>

        {saveMutation.isError && (
          <div className="auth-error">{saveMutation.error?.response?.data?.message || 'Could not save this question.'}</div>
        )}

        <QuestionApprovalForm form={form} setForm={setForm} />

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Question'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionsManagerTab() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = create, question obj = edit
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-questions-list', typeFilter, search],
    queryFn: () => questionsApi.search({ type: typeFilter || undefined, search: search || undefined, page: 0, size: 100 }),
    staleTime: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => questionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions-list'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const handleDelete = (q) => {
    if (window.confirm(`Delete "${q.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(q.id);
    }
  };

  const questions = data?.content || [];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
            <option value="">All types</option>
            <option value="THEORY">Theory</option>
            <option value="DSA">DSA</option>
            <option value="SYSTEM_DESIGN">System Design</option>
          </select>
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ New Question</button>
      </div>

      {isLoading && <div className="loading-state">Loading…</div>}
      {isError && <div className="error-state">Couldn't load questions.</div>}
      {!isLoading && !isError && questions.length === 0 && <div className="empty-state">No questions match.</div>}

      {!isLoading && !isError && questions.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Topic / Category</th>
              <th>Status</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td>{q.title}</td>
                <td>{q.questionType}</td>
                <td>{q.topic || q.category || '—'}</td>
                <td>{q.status}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary" onClick={() => setEditing(q)}>Edit</button>
                    <button className="btn btn-reject" onClick={() => handleDelete(q)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && <QuestionFormModal question={editing} onClose={() => setEditing(null)} />}
      {creating && <QuestionFormModal question={null} onClose={() => setCreating(false)} />}
    </div>
  );
}
