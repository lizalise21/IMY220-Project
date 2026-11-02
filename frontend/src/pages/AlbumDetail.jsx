import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, parseTags } from '../api';
import { useAuth } from '../AuthContext';
import Field from '../components/Field';
import TagList from '../components/TagList';
import { useConfirm } from '../components/ConfirmModal';

export default function AlbumDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [ownerPosts, setOwnerPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });
  const [error, setError] = useState('');
  const [modal, ask] = useConfirm();

  const load = async () => {
    try {
      const a = await api(`/albums/${id}`);
      setAlbum(a);
      setForm({ name: a.name, description: a.description, tags: a.hashtags.join(' ') });
      if (a.owner._id === user._id || user.role === 'admin') setOwnerPosts(await api(`/posts?author=${a.owner._id}`));
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => { setAlbum(null); setError(''); setEditing(false); load(); }, [id]);

  const run = async (fn) => {
    try { setError(''); await fn(); await load(); } catch (e) { setError(e.message); }
  };

  if (error && !album) return <p className="text-danger" role="alert">{error}</p>;
  if (!album) return <p className="text-ink/70">Loading…</p>;

  const mine = album.owner._id === user._id;
  const canManage = mine || user.role === 'admin';
  const inAlbum = new Set(album.posts.map((p) => p._id));
  const addable = ownerPosts.filter((p) => !inAlbum.has(p._id));

  const save = (e) => { e.preventDefault(); run(async () => {
    await api(`/albums/${id}`, { method: 'PUT', body: { name: form.name, description: form.description, hashtags: parseTags(form.tags) } });
    setEditing(false);
  }); };

  const askDelete = () => ask({
    title: 'Delete this album?',
    message: 'The album will be deleted. The posts inside it will not be deleted.',
    confirmLabel: 'Delete album',
    onConfirm: async () => {
      try { await api(`/albums/${id}`, { method: 'DELETE' }); navigate('/albums'); } catch (e) { setError(e.message); }
    },
  });

  return (
    <div className="space-y-8">
      {modal}
      <div className="card space-y-3">
        {editing ? (
          <form onSubmit={save} className="space-y-3">
            <Field id="ea-name" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field id="ea-desc" label="Description" as="textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Field id="ea-tags" label="Hashtags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            {album.suggestedTags.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-bold">Recommended from the posts in this album</p>
                <div className="flex flex-wrap gap-2">
                  {album.suggestedTags.map((t) => (
                    <button key={t} type="button" className="tag" onClick={() => setForm({ ...form, tags: `${form.tags} ${t}`.trim() })}>+ #{t}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" className="btn">Save</button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{album.name}</h1>
            <p className="text-ink/80">{album.description || 'No description.'}</p>
            <TagList tags={album.hashtags} />
            <p className="text-sm text-ink/70">
              by <Link className="link" to={`/profile/${album.owner._id}`}>{album.owner.username}</Link>
            </p>
            {canManage && (
              <div className="flex gap-2">
                <button type="button" className="btn-ghost" onClick={() => setEditing(true)}>Edit album</button>
                <button type="button" className="btn-danger" onClick={askDelete}>Delete album</button>
              </div>
            )}
          </>
        )}
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      </div>

      {canManage && (
        <section className="card">
          <h2 className="mb-2 text-lg font-bold">Add a post to this album</h2>
          {addable.length === 0 ? (
            <p className="text-sm text-ink/70">All posts are already in this album.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {addable.map((p) => (
                <button key={p._id} type="button" title="Add to album" aria-label={`Add "${p.description}" to album`}
                  onClick={() => run(() => api(`/albums/${id}/posts/${p._id}`, { method: 'POST' }))}>
                  <img src={p.image} alt="" className="h-20 w-20 rounded-xl object-cover ring-2 ring-transparent transition hover:ring-accent" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">Photos ({album.posts.length})</h2>
        {album.posts.length === 0 && <p className="text-ink/70">This album has no posts yet.</p>}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {album.posts.map((p) => (
            <div key={p._id} className="space-y-2">
              <Link to={`/post/${p._id}`} className="frame block">
                <img src={p.image} alt={p.description} className="aspect-square w-full rounded-sm object-cover" />
              </Link>
              {canManage && (
                <button type="button" className="btn-ghost !w-full !py-1" onClick={() => run(() => api(`/albums/${id}/posts/${p._id}`, { method: 'DELETE' }))}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}