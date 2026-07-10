import { useState } from 'react';

const PRIORITIES = [
  { value: 'MUST_KNOW', label: 'Must Know' },
  { value: 'IMPORTANT', label: 'Important' },
  { value: 'NICE_TO_KNOW', label: 'Nice to Know' }
];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Senior', 'Easy', 'Medium', 'Hard'];

const csv = (arr) => (arr || []).join(', ');
const fromCsv = (str) => (str ? str.split(',').map((s) => s.trim()).filter(Boolean) : []);

/** Builds the initial form state from a pending QuestionSubmissionRequest, mapping
 * its loose suggestion fields onto the full QuestionRequest shape the backend expects. */
export function buildInitialFromSubmission(submission) {
  return {
    questionType: submission.questionType,
    status: 'PUBLISHED',
    title: submission.title || '',
    topic: submission.topic || '',
    category: submission.category || '',
    priority: '',
    difficulty: '',
    tags: csv(submission.suggestedTags),
    companyAskedIn: csv(submission.suggestedCompanies),
    shortSummary: '',
    answer: submission.suggestedAnswer || '',
    deep: '',
    followup: '',
    real: '',
    week: '',
    time: '',
    intro: '',
    intuition: '',
    approach: '',
    example: '',
    code: '',
    timeC: '',
    spaceC: '',
    edges: '',
    talk: '',
    followups: '',
    // Aligned System Design Fields
    problem: submission.suggestedAnswer ? '' : submission.title || '',
    requirements: '',
    design: '',
    api: '',
    scaling: '',
    tradeoffs: '',
  };
}

export function emptyQuestionForm(questionType = 'THEORY') {
  return buildInitialFromSubmission({ questionType, title: '', topic: '', category: '' });
}

/** Converts the flat form state (all strings) into the QuestionRequest JSON shape
 * the backend expects (tags/edges/followups as arrays). */
export function toQuestionRequestPayload(form) {
  return {
    ...form,
    tags: fromCsv(form.tags),
    companyAskedIn: fromCsv(form.companyAskedIn),
    edges: fromCsv(form.edges),
    followups: fromCsv(form.followups),
  };
}

export default function QuestionApprovalForm({ form, setForm }) {
  const [type, setType] = useState(form.questionType);

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const changeType = (e) => {
    setType(e.target.value);
    setForm((f) => ({ ...f, questionType: e.target.value }));
  };

  return (
    <div>
      <div className="form-grid">
        <div className="form-field">
          <label>Question Type</label>
          <select value={type} onChange={changeType}>
            <option value="THEORY">Theory</option>
            <option value="DSA">DSA</option>
            <option value="SYSTEM_DESIGN">System Design</option>
          </select>
        </div>
        <div className="form-field">
          <label>Status</label>
          <select value={form.status} onChange={update('status')}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <div className="form-field" style={{ marginTop: 10 }}>
        <label>Title / Question *</label>
        <textarea value={form.title} onChange={update('title')} required />
      </div>

      <div className="form-grid" style={{ marginTop: 10 }}>
        <div className="form-field">
          <label>Topic</label>
          <input value={form.topic} onChange={update('topic')} />
        </div>
        <div className="form-field">
          <label>Category</label>
          <input value={form.category} onChange={update('category')} />
        </div>
        <div className="form-field">
          <label>Priority</label>
          <select value={form.priority} onChange={update('priority')}>
            <option value="">—</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Difficulty</label>
          <select value={form.difficulty} onChange={update('difficulty')}>
            <option value="">—</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Tags (comma-separated)</label>
          <input value={form.tags} onChange={update('tags')} />
        </div>
        <div className="form-field">
          <label>Companies asked in (comma-separated)</label>
          <input value={form.companyAskedIn} onChange={update('companyAskedIn')} />
        </div>
      </div>

      <div className="form-field" style={{ marginTop: 10 }}>
        <label>Short summary</label>
        <input value={form.shortSummary} onChange={update('shortSummary')} />
      </div>

      {type === 'THEORY' && (
        <>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Answer *</label>
            <textarea value={form.answer} onChange={update('answer')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Deep explanation</label>
            <textarea value={form.deep} onChange={update('deep')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Follow-up</label>
            <textarea value={form.followup} onChange={update('followup')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Real-world usage</label>
            <textarea value={form.real} onChange={update('real')} />
          </div>
        </>
      )}

      {type === 'DSA' && (
        <>
          <div className="form-grid" style={{ marginTop: 10 }}>
            <div className="form-field">
              <label>Week</label>
              <input value={form.week} onChange={update('week')} placeholder="Week 1" />
            </div>
            <div className="form-field">
              <label>Time estimate</label>
              <input value={form.time} onChange={update('time')} placeholder="20 min" />
            </div>
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Intro / problem statement</label>
            <textarea value={form.intro} onChange={update('intro')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Intuition</label>
            <textarea value={form.intuition} onChange={update('intuition')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Approach</label>
            <textarea value={form.approach} onChange={update('approach')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Example</label>
            <textarea value={form.example} onChange={update('example')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Java code</label>
            <textarea value={form.code} onChange={update('code')} style={{ fontFamily: 'monospace' }} />
          </div>
          <div className="form-grid" style={{ marginTop: 10 }}>
            <div className="form-field">
              <label>Time complexity</label>
              <input value={form.timeC} onChange={update('timeC')} placeholder="O(n)" />
            </div>
            <div className="form-field">
              <label>Space complexity</label>
              <input value={form.spaceC} onChange={update('spaceC')} placeholder="O(1)" />
            </div>
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Edge cases (comma-separated)</label>
            <input value={form.edges} onChange={update('edges')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Talk track</label>
            <textarea value={form.talk} onChange={update('talk')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Follow-up questions (comma-separated)</label>
            <input value={form.followups} onChange={update('followups')} />
          </div>
        </>
      )}

      {type === 'SYSTEM_DESIGN' && (
        <>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Problem statement</label>
            <textarea value={form.problem} onChange={update('problem')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Requirements</label>
            <textarea value={form.requirements} onChange={update('requirements')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Architecture &amp; Design</label>
            <textarea value={form.design} onChange={update('design')} style={{ fontFamily: 'monospace' }} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>API Design</label>
            <textarea value={form.api} onChange={update('api')} style={{ fontFamily: 'monospace' }} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Scaling Strategy</label>
            <textarea value={form.scaling} onChange={update('scaling')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Tradeoffs</label>
            <textarea value={form.tradeoffs} onChange={update('tradeoffs')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Talk track</label>
            <textarea value={form.talk} onChange={update('talk')} />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Follow-up questions (comma-separated)</label>
            <input value={form.followups} onChange={update('followups')} />
          </div>
        </>
      )}
    </div>
  );
}