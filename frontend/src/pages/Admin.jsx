import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Field from '../components/Field';
import { useConfirm } from '../components/ConfirmModal';

function ReportsTab() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [modal, ask] = useConfirm();
  const load = () => api('/admin/reports').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const act = async (fn) => {
    try { setError(''); await fn(); await load(); } catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      {modal}
      {error && <p className="text-danger" role="alert">{error}</p>}
      {items && items.length === 0 && <p className="text-ink/70">No reported posts. 🎉</p>}
      {items?.map(({ post, reports }) => (
        <div key={post._id} className="card space-y-3">
          <div className="flex gap-4">
            <Link to={`/post/${post._id}`}><img src={post.image} alt="" className="h-24 w-24 rounded-xl object-cover" /></Link>
            <div className="flex-1">
              <p className="font-bold">{post.author ? post.author.username : 'deleted user'}</p>
              <p className="text-sm">{post.description}</p>
              <p className="text-xs text-ink/60">{reports.length} report{reports.length === 1 ? '' : 's'}{reports.length > 2 ? ' · hidden from feeds' : ''}</p>
            </div>
          </div>
          <ul className="space-y-1 text-sm">
            {reports.map((r) => (
              <li key={r._id}><span className="font-bold">{r.reason}</span> reported by {r.reporter}{r.details ? `: ${r.details}` : ''}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-danger" onClick={() => ask({
              title: 'Delete this post?',
              message: 'The post and its comments will be deleted and the author will be notified.',
              confirmLabel: 'Delete post',
              onConfirm: () => act(() => api(`/posts/${post._id}`, { method: 'DELETE' })),
            })}>Delete post</button>
            <button type="button" className="btn-ghost" onClick={() => act(() => api(`/admin/reports/${post._id}`, { method: 'DELETE' }))}>Remove reports</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserEditRow({ u, onSaved, onError, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: u.username, email: u.email, name: u.name || '', bio: u.bio || '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try { await api(`/admin/users/${u._id}`, { method: 'PUT', body: form }); setEditing(false); onSaved(); } catch (err) { onError(err.message); }
  };

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Link to={`/profile/${u._id}`} className="flex-1 font-bold hover:text-accent">
          {u.username} <span className="text-xs font-normal text-ink/60">{u.email}{u.role === 'admin' ? ' · admin' : ''}</span>
        </Link>
        <button type="button" className="btn-ghost" onClick={() => setEditing(!editing)}>{editing ? 'Close' : 'Edit'}</button>
        {u.role !== 'admin' && <button type="button" className="btn-danger" onClick={() => onDelete(u)}>Delete</button>}
      </div>
      {editing && (
        <form onSubmit={save} className="space-y-3">
          <Field id={`au-username-${u._id}`} label="Username" value={form.username} onChange={set('username')} />
          <Field id={`au-email-${u._id}`} label="Email" value={form.email} onChange={set('email')} />
          <Field id={`au-name-${u._id}`} label="Name" value={form.name} onChange={set('name')} />
          <Field id={`au-bio-${u._id}`} label="Bio" as="textarea" rows={2} value={form.bio} onChange={set('bio')} />
          <button type="submit" className="btn">Save user</button>
        </form>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [modal, ask] = useConfirm();
  const load = () => api('/admin/users').then(setUsers).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const askDelete = (u) => ask({
    title: `Delete ${u.username}?`,
    message: 'Their account, posts, albums and comments will be permanently deleted.',
    confirmLabel: 'Delete user',
    onConfirm: async () => {
      try { setError(''); await api(`/admin/users/${u._id}`, { method: 'DELETE' }); await load(); } catch (e) { setError(e.message); }
    },
  });

  return (
    <div className="space-y-3">
      {modal}
      {error && <p className="text-danger" role="alert">{error}</p>}
      {users?.map((u) => <UserEditRow key={u._id} u={u} onSaved={() => { setError(''); load(); }} onError={setError} onDelete={askDelete} />)}
    </div>
  );
}

function ReasonsTab() {
  const [reasons, setReasons] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => api('/posts/reasons').then(setReasons).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      setError(''); setMsg('');
      await api('/admin/reasons', { method: 'POST', body: { name } });
      setName(''); setMsg('Reason added.'); await load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="card space-y-3">
        <Field id="new-reason" label="New reporting reason" value={name} onChange={(e) => setName(e.target.value)} />
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        {msg && <p className="text-sm font-bold text-accent" role="status">{msg}</p>}
        <button type="submit" className="btn" disabled={!name.trim()}>Add reason</button>
      </form>
      <ul className="flex flex-wrap gap-2">
        {reasons.map((r) => <li key={r} className="rounded-full bg-sand px-3 py-1 text-xs font-bold">{r}</li>)}
      </ul>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('reports');
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="flex w-fit flex-wrap rounded-full bg-sand p-1" role="group" aria-label="Admin sections">
        {[['reports', 'Reported posts'], ['users', 'Users'], ['reasons', 'Report reasons']].map(([k, label]) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}
            className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${tab === k ? 'bg-accent text-on-accent' : 'text-ink/80'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'reports' && <ReportsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'reasons' && <ReasonsTab />}
    </div>
  );
}