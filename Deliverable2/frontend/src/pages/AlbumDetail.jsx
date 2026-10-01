import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, parseTags } from '../api';
import { useAuth } from '../AuthContext';
import PostCard from '../components/PostCard';

export default function AlbumDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const a = await api(`/albums/${id}`);
      setAlbum(a);
      setForm({ name: a.name, description: a.description, tags: a.hashtags.join(' ') });
      if (a.owner._id === user._id) setMyPosts(await api(`/posts?author=${user._id}`));
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => { load(); }, [id]);

  const run = async (fn) => { try { setError(''); await fn(); await load(); } catch (e) { setError(e.message); } };

  if (error && !album) return <p className="text-red-600">{error}</p>;
  if (!album) return <p className="text-ink/60">Loading…</p>;

  const mine = album.owner._id === user._id;
  const inAlbum = new Set(album.posts.map((p) => p._id));
  const addable = myPosts.filter((p) => !inAlbum.has(p._id));

  const save = () => run(async () => {
    await api(`/albums/${id}`, { method: 'PUT', body: { name: form.name, description: form.description, hashtags: parseTags(form.tags) } });
    setEditing(false);
  });

  const del = async () => {
    if (!confirm('Delete this album? Your posts will not be deleted.')) return;
    try { await api(`/albums/${id}`, { method: 'DELETE' }); navigate('/albums'); } catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        {editing ? (
          <>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="hashtags" />
            <div className="flex gap-2">
              <button className="btn" onClick={save}>Save</button>
              <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{album.name}</h1>
            <p className="text-ink/70">{album.description || 'No description.'}</p>
            <div className="flex flex-wrap gap-2">{album.hashtags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>
            <p className="text-sm text-ink/50">
              by <Link className="font-semibold hover:text-coral" to={mine ? '/profile' : `/profile/${album.owner._id}`}>{album.owner.username}</Link>
            </p>
            {mine && (
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setEditing(true)}>Edit album</button>
                <button className="btn-danger" onClick={del}>Delete album</button>
              </div>
            )}
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {mine && (
        <div className="card">
          <h2 className="mb-2 font-bold">Add one of your posts</h2>
          {addable.length === 0 ? (
            <p className="text-sm text-ink/60">All your posts are already in this album.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {addable.map((p) => (
                <button key={p._id} title="Add to album" onClick={() => run(() => api(`/albums/${id}/posts/${p._id}`, { method: 'POST' }))}>
                  <img src={p.image} alt="" className="h-20 w-20 rounded-xl object-cover ring-2 ring-transparent transition hover:ring-coral" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {album.posts.length === 0 && <p className="text-ink/60">This album has no posts yet.</p>}
      {album.posts.map((p) => (
        <div key={p._id} className="space-y-2">
          <PostCard post={p} onDeleted={load} />
          {mine && (
            <button className="btn-ghost" onClick={() => run(() => api(`/albums/${id}/posts/${p._id}`, { method: 'DELETE' }))}>
              Remove from album
            </button>
          )}
        </div>
      ))}
    </div>
  );
}