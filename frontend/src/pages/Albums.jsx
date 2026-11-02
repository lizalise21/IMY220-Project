import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, parseTags } from '../api';
import { useAuth } from '../AuthContext';
import AlbumCard from '../components/AlbumCard';
import Field from '../components/Field';

export default function Albums() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('mine');
  const [albums, setAlbums] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    setAlbums(null);
    api(view === 'mine' ? `/albums?owner=${user._id}` : '/albums').then(setAlbums).catch((e) => setError(e.message));
  }, [view]);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Album name is required');
    try {
      const a = await api('/albums', { method: 'POST', body: { name: form.name, description: form.description, hashtags: parseTags(form.tags) } });
      navigate(`/albums/${a._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Albums</h1>
      <form onSubmit={create} className="card space-y-3" noValidate>
        <h2 className="text-xl font-bold">Create an album</h2>
        <Field id="album-name" label="Name" value={form.name} onChange={set('name')} />
        <Field id="album-desc" label="Description" as="textarea" rows={2} value={form.description} onChange={set('description')} />
        <Field id="album-tags" label="Hashtags" value={form.tags} onChange={set('tags')} hint="Separate hashtags with spaces." />
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <button type="submit" className="btn">Create album</button>
      </form>

      <div className="flex w-fit rounded-full bg-sand p-1" role="group" aria-label="Which albums">
        {[['mine', 'My albums'], ['all', 'Everyone']].map(([k, label]) => (
          <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)}
            className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${view === k ? 'bg-accent text-on-accent' : 'text-ink/80'}`}>
            {label}
          </button>
        ))}
      </div>

      {!albums && <p className="text-ink/70">Loading…</p>}
      {albums && albums.length === 0 && <p className="text-ink/70">No albums found.</p>}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {albums?.map((a) => <AlbumCard key={a._id} album={a} />)}
      </div>
    </div>
  );
}