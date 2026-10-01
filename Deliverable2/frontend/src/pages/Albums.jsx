import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, parseTags } from '../api';
import { useAuth } from '../AuthContext';

export default function Albums() {
  const { user } = useAuth();
  const [view, setView] = useState('mine');
  const [albums, setAlbums] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });
  const [error, setError] = useState('');

  const load = () => {
    setAlbums(null);
    api(view === 'mine' ? `/albums?owner=${user._id}` : '/albums').then(setAlbums).catch((e) => setError(e.message));
  };
  useEffect(load, [view]);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Album name is required');
    try {
      await api('/albums', { method: 'POST', body: { name: form.name, description: form.description, hashtags: parseTags(form.tags) } });
      setForm({ name: '', description: '', tags: '' });
      setView('mine');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={create} className="card space-y-3">
        <h2 className="text-xl font-bold">Create an album</h2>
        <input className="input" placeholder="Album name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="Hashtags, separated by spaces" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn">Create album</button>
      </form>

      <div className="flex rounded-full bg-sand p-1 w-fit">
        {[['mine', 'My albums'], ['all', 'Everyone']].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${view === k ? 'bg-coral text-white' : 'text-ink/70'}`}>
            {label}
          </button>
        ))}
      </div>

      {!albums && <p className="text-ink/60">Loading…</p>}
      {albums && albums.length === 0 && <p className="text-ink/60">No albums found.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {albums?.map((a) => (
          <Link key={a._id} to={`/albums/${a._id}`} className="card transition hover:shadow-md">
            <div className="mb-3 grid h-28 grid-cols-3 gap-1 overflow-hidden rounded-xl bg-sand">
              {a.posts.slice(0, 3).map((p) => <img key={p._id} src={p.image} alt="" className="h-28 w-full object-cover" />)}
            </div>
            <h3 className="text-lg font-bold">{a.name}</h3>
            <p className="text-sm text-ink/60">by {a.owner.username} · {a.posts.length} posts</p>
          </Link>
        ))}
      </div>
    </div>
  );
}