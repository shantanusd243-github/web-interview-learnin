import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { referenceApi } from '../api/reference';

export default function ReferenceContentManagerTab() {
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState(null);
  const [form, setForm] = useState(null);

  const { data: pages, isLoading, isError } = useQuery({
    queryKey: ['reference-list'],
    queryFn: referenceApi.list,
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: () => referenceApi.update(selectedKey, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reference-list'] });
      queryClient.invalidateQueries({ queryKey: ['reference', selectedKey] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => referenceApi.create(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['reference-list'] });
      selectPage(created);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pageKey) => referenceApi.remove(pageKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reference-list'] });
      setSelectedKey(null);
      setForm(null);
    },
  });

  const startNewPage = () => {
    setSelectedKey('__new__');
    setForm({
      pageKey: '',
      icon: '',
      title: '',
      description: '',
      bodyHtml: '',
      displayOrder: (pages?.length || 0),
    });
  };

  const isNew = selectedKey === '__new__';

  const selectPage = (page) => {
    setSelectedKey(page.pageKey);
    setForm({
      pageKey: page.pageKey,
      icon: page.icon || '',
      title: page.title || '',
      description: page.description || '',
      bodyHtml: page.bodyHtml || '',
      displayOrder: page.displayOrder || 0,
    });
  };

  if (isLoading) return <div className="loading-state">Loading reference pages…</div>;
  if (isError) return <div className="error-state">Couldn't load reference pages.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
      <div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 10 }}
          onClick={startNewPage}
        >
          + New Page
        </button>
        {(pages || []).map((p) => (
          <div
            key={p.pageKey}
            onClick={() => selectPage(p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '4px',
              cursor: 'pointer',
              fontSize: 13,
              background: selectedKey === p.pageKey ? '#e0e7ff' : 'transparent',
              color: selectedKey === p.pageKey ? '#4338ca' : '#334155',
              fontWeight: selectedKey === p.pageKey ? '600' : '400',
              transition: 'all 0.15s'
            }}
          >
            <span className="icon" style={{ fontSize: '16px' }}>{p.icon}</span> {p.title}
          </div>
        ))}
      </div>

      <div>
        {!form && <div className="empty-state">Select a page to edit.</div>}
        {form && (
          <div className="card">
            {(saveMutation.isError || createMutation.isError || deleteMutation.isError) && (
              <div className="auth-error">
                {(saveMutation.error || createMutation.error || deleteMutation.error)?.response?.data?.message
                  || 'Something went wrong.'}
              </div>
            )}
            {saveMutation.isSuccess && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 12, padding: '6px 10px', borderRadius: 8, marginBottom: 12 }}>
                Saved.
              </div>
            )}
            {isNew && (
              <div className="form-field" style={{ marginBottom: 10 }}>
                <label>Page Key (slug, e.g. "core-java")</label>
                <input
                  value={form.pageKey}
                  onChange={(e) => setForm((f) => ({ ...f, pageKey: e.target.value }))}
                  placeholder="unique-page-slug"
                />
              </div>
            )}
            <div className="form-grid">
              <div className="form-field">
                <label>Icon</label>
                <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 10 }}>
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginTop: 10 }}>
              <label>Body HTML</label>
              <textarea
                value={form.bodyHtml}
                onChange={(e) => setForm((f) => ({ ...f, bodyHtml: e.target.value }))}
                style={{ fontFamily: 'monospace', minHeight: 320 }}
              />
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                Raw HTML, rendered as-is on the page — same markup/classes the original static site used.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {isNew ? (
                <button
                  className="btn btn-primary"
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending || !form.pageKey || !form.title}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create Page'}
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm(`Delete page "${form.title}"? This cannot be undone.`)) {
                        deleteMutation.mutate(selectedKey);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting…' : 'Delete Page'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}