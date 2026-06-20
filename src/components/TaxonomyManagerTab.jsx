import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { topicsApi, tagsApi, companiesApi } from '../api/questions';

const KINDS = {
  topics: { label: 'Topics', api: topicsApi, hasUpdate: true, hasIconDesc: true },
  tags: { label: 'Tags', api: tagsApi, hasUpdate: false, hasIconDesc: false },
  companies: { label: 'Companies', api: companiesApi, hasUpdate: true, hasIconDesc: false },
};

function TaxonomyList({ kindKey }) {
  const kind = KINDS[kindKey];
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: [kindKey],
    queryFn: kind.api.list,
    staleTime: 30_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [kindKey] });
    queryClient.invalidateQueries({ queryKey: ['topics'] }); // topbar dropdown + submit form use this
  };

  const createMutation = useMutation({
    mutationFn: (payload) => kind.api.create(payload),
    onSuccess: () => {
      setName('');
      setIcon('');
      setDescription('');
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => kind.api.update(id, payload),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => kind.api.remove(id),
    onSuccess: invalidate,
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const payload = kind.hasIconDesc ? { name, icon, description } : { name };
    createMutation.mutate(payload);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = (item) => {
    updateMutation.mutate({ id: item.id, payload: { ...item, name: editName } });
  };

  return (
    <div>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-field" style={{ minWidth: 160 }}>
          <label>New {kind.label.slice(0, -1)} name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {kind.hasIconDesc && (
          <>
            <div className="form-field" style={{ width: 80 }}>
              <label>Icon</label>
              <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="☕" />
            </div>
            <div className="form-field" style={{ minWidth: 200 }}>
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </>
        )}
        <button className="btn btn-primary" type="submit" disabled={createMutation.isPending}>
          + Add
        </button>
      </form>

      {createMutation.isError && (
        <div className="auth-error">{createMutation.error?.response?.data?.message || 'Could not create.'}</div>
      )}

      {isLoading && <div className="loading-state">Loading…</div>}
      {isError && <div className="error-state">Couldn't load {kind.label.toLowerCase()}.</div>}
      {!isLoading && !isError && (data || []).length === 0 && <div className="empty-state">None yet.</div>}

      {!isLoading && !isError && (data || []).length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  {editingId === item.id ? (
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    <>{item.icon ? `${item.icon} ` : ''}{item.name}</>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {kind.hasUpdate && editingId === item.id && (
                      <button className="btn btn-approve" onClick={() => saveEdit(item)}>Save</button>
                    )}
                    {kind.hasUpdate && editingId !== item.id && (
                      <button className="btn btn-secondary" onClick={() => startEdit(item)}>Edit</button>
                    )}
                    {kind.hasUpdate && editingId === item.id && (
                      <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                    )}
                    <button className="btn btn-reject" onClick={() => removeMutation.mutate(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function TaxonomyManagerTab() {
  const [kind, setKind] = useState('topics');

  return (
    <div>
      <div className="admin-tabs">
        {Object.entries(KINDS).map(([key, k]) => (
          <button key={key} className={`admin-tab${kind === key ? ' active' : ''}`} onClick={() => setKind(key)}>
            {k.label}
          </button>
        ))}
      </div>
      <TaxonomyList kindKey={kind} />
    </div>
  );
}
