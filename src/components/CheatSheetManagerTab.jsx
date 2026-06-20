import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cheatSheetApi } from '../api/reference';

const emptyItem = (category) => ({
  category: category || '',
  categoryLabel: '',
  categoryIcon: '',
  question: '',
  answer: '',
  displayOrder: 0,
});

export default function CheatSheetManagerTab() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);

  const { data: grouped, isLoading, isError } = useQuery({
    queryKey: ['cheatsheet-grouped'],
    queryFn: cheatSheetApi.listGrouped,
    staleTime: 30_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cheatsheet-grouped'] });
    queryClient.invalidateQueries({ queryKey: ['cheatsheet'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload) => cheatSheetApi.create(payload),
    onSuccess: (created) => {
      invalidate();
      selectItem(created);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => cheatSheetApi.update(selectedId, form),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => cheatSheetApi.remove(id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setForm(null);
    },
  });

  const selectItem = (item) => {
    setSelectedId(item.id);
    setForm({
      category: item.category || '',
      categoryLabel: item.categoryLabel || '',
      categoryIcon: item.categoryIcon || '',
      question: item.question || '',
      answer: item.answer || '',
      displayOrder: item.displayOrder || 0,
    });
  };

  const startNewItem = (categoryHint) => {
    setSelectedId('__new__');
    setForm(emptyItem(categoryHint));
  };

  const isNew = selectedId === '__new__';

  if (isLoading) return <div className="loading-state">Loading cheat sheet items…</div>;
  if (isError) return <div className="error-state">Couldn't load cheat sheet items.</div>;

  // Backend shape (GET /api/cheatsheet): { categoryKey: [item, item, ...] },
  // where each item itself carries categoryLabel/categoryIcon.
  const categories = Object.entries(grouped || {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
      <div>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 10 }}
          onClick={() => startNewItem(categories[0]?.[0])}
        >
          + New Item
        </button>

        {categories.map(([categoryKey, items]) => {
          const label = items[0]?.categoryLabel || categoryKey;
          const icon = items[0]?.categoryIcon || '';
          return (
            <div key={categoryKey} style={{ marginBottom: 14 }}>
              <div className="sidebar-label" style={{ padding: '4px 0' }}>
                {icon} {label}
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectItem(item)}
                  className={`nav-item${selectedId === item.id ? ' active' : ''}`}
                  style={{ color: selectedId === item.id ? '#4338ca' : '#334155', cursor: 'pointer', fontSize: 12 }}
                  title={item.question}
                >
                  {item.question?.slice(0, 40)}{item.question?.length > 40 ? '…' : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div>
        {!form && <div className="empty-state">Select an item to edit, or create a new one.</div>}
        {form && (
          <div className="card">
            {(createMutation.isError || updateMutation.isError || deleteMutation.isError) && (
              <div className="auth-error">
                {(createMutation.error || updateMutation.error || deleteMutation.error)?.response?.data?.message
                  || 'Something went wrong.'}
              </div>
            )}
            {updateMutation.isSuccess && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 12, padding: '6px 10px', borderRadius: 8, marginBottom: 12 }}>
                Saved.
              </div>
            )}
            <div className="form-grid">
              <div className="form-field">
                <label>Category Key</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. coreJava, java8, spring, micro"
                />
              </div>
              <div className="form-field">
                <label>Category Label</label>
                <input
                  value={form.categoryLabel}
                  onChange={(e) => setForm((f) => ({ ...f, categoryLabel: e.target.value }))}
                  placeholder="e.g. Core Java Essentials"
                />
              </div>
            </div>
            <div className="form-grid" style={{ marginTop: 10 }}>
              <div className="form-field">
                <label>Category Icon</label>
                <input
                  value={form.categoryIcon}
                  onChange={(e) => setForm((f) => ({ ...f, categoryIcon: e.target.value }))}
                  placeholder="e.g. ☕"
                />
              </div>
              <div className="form-field">
                <label>Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 10 }}>
              <label>Question</label>
              <input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginTop: 10 }}>
              <label>Answer</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                style={{ minHeight: 100 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {isNew ? (
                <button
                  className="btn btn-primary"
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending || !form.category || !form.question}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create Item'}
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm('Delete this cheat sheet item? This cannot be undone.')) {
                        deleteMutation.mutate(selectedId);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting…' : 'Delete Item'}
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
