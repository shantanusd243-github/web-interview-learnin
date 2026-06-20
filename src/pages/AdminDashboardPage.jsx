import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminQuestionRequestsApi, adminAnalyticsApi } from '../api/questionRequests';
import QuestionApprovalForm, { buildInitialFromSubmission, toQuestionRequestPayload } from '../components/QuestionApprovalForm';
import TaxonomyManagerTab from '../components/TaxonomyManagerTab';
import ReferenceContentManagerTab from '../components/ReferenceContentManagerTab';
import QuestionsManagerTab from '../components/QuestionsManagerTab';
import CheatSheetManagerTab from '../components/CheatSheetManagerTab';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'PENDING', label: 'Pending Requests' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'taxonomy', label: 'Topics / Tags / Companies' },
  { key: 'reference', label: 'Reference Pages' },
  { key: 'cheatsheet', label: 'Cheat Sheet' },
  { key: 'questions', label: 'Questions' },
];

function OverviewTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminAnalyticsApi.dashboard,
    staleTime: 30_000,
  });

  if (isLoading) return <div className="loading-state">Loading dashboard…</div>;
  if (isError) return <div className="error-state">Couldn't load analytics. Please try again.</div>;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#6366f1' }}>{data.totalQuestions}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#22c55e' }}>{data.publishedQuestions}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#f59e0b' }}>{data.pendingRequests}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#dc2626' }}>{data.rejectedRequests}</div>
          <div className="stat-label">Rejected Requests</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Questions by Type</div>
          {Object.entries(data.questionsByType || {}).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Most Viewed</div>
          {(data.mostViewed || []).slice(0, 5).map((q) => (
            <div key={q.id} style={{ fontSize: 12, padding: '4px 0', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</span>
              <span style={{ color: '#94a3b8', flexShrink: 0 }}>{q.viewCount} views</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ApproveModal({ submission, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => buildInitialFromSubmission(submission));

  const approveMutation = useMutation({
    mutationFn: () => adminQuestionRequestsApi.approve(submission.id, { question: toQuestionRequestPayload(form) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      onClose();
    },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Approve &amp; Publish Question</div>
          <button className="btn btn-secondary" onClick={onClose}>✕</button>
        </div>

        {approveMutation.isError && (
          <div className="auth-error">
            {approveMutation.error?.response?.data?.message || 'Could not approve this request.'}
          </div>
        )}

        <QuestionApprovalForm form={form} setForm={setForm} />

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
            {approveMutation.isPending ? 'Publishing…' : '✓ Approve & Publish'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ request, onConfirm, onClose, isPending, error }) {
  const [reviewNotes, setReviewNotes] = useState('');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Reject Submission</div>
          <button className="btn btn-secondary" onClick={onClose}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
          Rejecting "<strong>{request.title}</strong>". Let the submitter know why so they can
          improve and resubmit if appropriate.
        </div>

        {error && (
          <div className="auth-error">{error?.response?.data?.message || 'Could not reject this request.'}</div>
        )}

        <div className="form-field">
          <label>Reason for rejection</label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="e.g. Duplicate of an existing question, or needs more detail before it can be added."
            style={{ minHeight: 100 }}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-danger"
            disabled={!reviewNotes.trim() || isPending}
            onClick={() => onConfirm(reviewNotes.trim())}
          >
            {isPending ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestsTab({ status }) {
  const queryClient = useQueryClient();
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-question-requests', status],
    queryFn: () => adminQuestionRequestsApi.queue({ status, page: 0, size: 50 }),
    staleTime: 15_000,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reviewNotes }) => adminQuestionRequestsApi.reject(id, { reviewNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setRejectingId(null);
    },
  });

  const requests = data?.content || [];
  const approvingRequest = requests.find((r) => r.id === approvingId);
  const rejectingRequest = requests.find((r) => r.id === rejectingId);

  return (
    <>
      {isLoading && <div className="loading-state">Loading…</div>}
      {isError && <div className="error-state">Couldn't load requests. Please try again.</div>}
      {!isLoading && !isError && requests.length === 0 && <div className="empty-state">Nothing here.</div>}

      {!isLoading && !isError && requests.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Topic</th>
              <th>Submitted</th>
              {status === 'PENDING' && <th>Actions</th>}
              {status === 'REJECTED' && <th>Reason</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.questionType}</td>
                <td>{r.topic || '—'}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                {status === 'PENDING' && (
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-approve" onClick={() => setApprovingId(r.id)}>Approve</button>
                      <button className="btn btn-reject" onClick={() => setRejectingId(r.id)}>Reject</button>
                    </div>
                  </td>
                )}
                {status === 'REJECTED' && <td>{r.reviewNotes}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {approvingRequest && <ApproveModal submission={approvingRequest} onClose={() => setApprovingId(null)} />}
      {rejectingRequest && (
        <RejectModal
          request={rejectingRequest}
          onClose={() => setRejectingId(null)}
          isPending={rejectMutation.isPending}
          error={rejectMutation.error}
          onConfirm={(reviewNotes) => rejectMutation.mutate({ id: rejectingRequest.id, reviewNotes })}
        />
      )}
    </>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('overview');

  return (
    <div id="page-admin" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">🛠️ Admin Dashboard</div>
          <div className="section-desc">Review submissions, manage content, and monitor activity.</div>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`admin-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'taxonomy' && <TaxonomyManagerTab />}
      {tab === 'reference' && <ReferenceContentManagerTab />}
      {tab === 'cheatsheet' && <CheatSheetManagerTab />}
      {tab === 'questions' && <QuestionsManagerTab />}
      {!['overview', 'taxonomy', 'reference', 'cheatsheet', 'questions'].includes(tab) && <RequestsTab status={tab} />}
    </div>
  );
}
