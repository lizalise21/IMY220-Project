import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, parseTags, timeAgo } from '../api';
import { useAuth } from '../AuthContext';
import Field from '../components/Field';
import ItemHeader from '../components/ItemHeader';
import TagList from '../components/TagList';
import { useConfirm } from '../components/ConfirmModal';

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [menu, setMenu] = useState(false);
  const [panel, setPanel] = useState(null); // 'edit' | 'report' | 'album'
  const [form, setForm] = useState({ description: '', tags: '' });
  const [reasons, setReasons] = useState([]);
  const [reason, setReason] = useState('');
  const [albums, setAlbums] = useState([]);
  const [albumId, setAlbumId] = useState('');
  const [text, setText] = useState('');
  const [modal, ask] = useConfirm();

  const load = () =>
    api(`/posts/${id}`)
      .then((p) => {
        setPost(p);
        setForm({ description: p.description, tags: p.hashtags.join(' ') });
      })
      .catch((e) => setError(e.message));

  useEffect(() => { setPost(null); setError(''); setPanel(null); load(); }, [id]);

  const run = async (fn) => {
    try { setError(''); await fn(); } catch (e) { setError(e.message); }
  };

  if (error && !post) return <p className="text-danger" role="alert">{error}</p>;
  if (!post) return <p className="text-ink/70">Loading…</p>;

  const mine = post.author._id === user._id;
  const admin = user.role === 'admin';
  const canManage = mine || admin;

  const openPanel = (name) => run(async () => {
    setMenu(false);
    setMsg('');
    if (name === 'report') setReasons(await api('/posts/reasons'));
    if (name === 'album') setAlbums(await api(`/albums?owner=${user._id}`));
    setPanel(name);
  });

  const save = (e) => { e.preventDefault(); run(async () => {
    await api(`/posts/${id}`, { method: 'PUT', body: { description: form.description, hashtags: parseTags(form.tags) } });
    setPanel(null);
    await load();
  }); };

  const askDelete = () => { setMenu(false); ask({
    title: 'Delete this post?',
    message: 'The post and all its comments will be permanently deleted.',
    confirmLabel: 'Delete post',
    onConfirm: () => run(async () => { await api(`/posts/${id}`, { method: 'DELETE' }); navigate('/home'); }),
  }); };

  const report = (e) => { e.preventDefault(); run(async () => {
    await api(`/posts/${id}/report`, { method: 'POST', body: { reason } });
    setPanel(null);
    setReason('');
    setMsg('Report submitted. Thank you.');
  }); };

  const addToAlbum = (e) => { e.preventDefault(); run(async () => {
    await api(`/albums/${albumId}/posts/${id}`, { method: 'POST' });
    setPanel(null);
    setAlbumId('');
    setMsg('Added to album.');
    await load();
  }); };

  const like = () => run(async () => {
    const r = await api(`/posts/${id}/like`, { method: 'POST' });
    setPost({ ...post, likes: r.likes });
  });

  const addComment = (e) => { e.preventDefault(); run(async () => {
    await api(`/posts/${id}/comments`, { method: 'POST', body: { text } });
    setText('');
    await load();
  }); };

  const deleteComment = (cid) => run(async () => {
    await api(`/posts/${id}/comments/${cid}`, { method: 'DELETE' });
    await load();
  });

  const liked = post.likes.includes(user._id);
  const menuItem = 'block w-full rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-ink/10';

  return (
    <div className="space-y-6">
      {modal}
      <div className="flex items-start gap-2">
        <div className="flex-1"><ItemHeader user={post.author} date={post.createdAt}>shared a photo</ItemHeader></div>
        <div className="relative">
          <button type="button" className="btn-ghost !px-3 !py-1" aria-label="Post options" aria-expanded={menu} onClick={() => setMenu(!menu)}>⋮</button>
          {menu && (
            <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl bg-surface p-1 shadow-lg ring-1 ring-ink/15">
              {canManage && <button type="button" className={menuItem} onClick={() => openPanel('edit')}>Edit post</button>}
              {mine && <button type="button" className={menuItem} onClick={() => openPanel('album')}>Add to album</button>}
              {canManage && <button type="button" className={`${menuItem} text-danger`} onClick={askDelete}>Delete post</button>}
              {!mine && <button type="button" className={menuItem} onClick={() => openPanel('report')}>Report post</button>}
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      {msg && <p className="text-sm font-bold text-accent" role="status">{msg}</p>}
      {post.reportCount > 2 && <p className="rounded-xl border border-ink/20 p-3 text-sm">This post has been reported and is under review.</p>}

      {panel === 'edit' && (
        <form onSubmit={save} className="card space-y-3">
          <Field id="edit-desc" label="Description" as="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Field id="edit-tags" label="Hashtags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} hint="The image cannot be changed." />
          <div className="flex gap-2">
            <button type="submit" className="btn">Save</button>
            <button type="button" className="btn-ghost" onClick={() => setPanel(null)}>Cancel</button>
          </div>
        </form>
      )}
      {panel === 'report' && (
        <form onSubmit={report} className="card space-y-3">
          <Field id="report-reason" label="Why are you reporting this post?" as="select" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select a reason…</option>
            {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </Field>
          <div className="flex gap-2">
            <button type="submit" className="btn" disabled={!reason}>Submit report</button>
            <button type="button" className="btn-ghost" onClick={() => setPanel(null)}>Cancel</button>
          </div>
        </form>
      )}
      {panel === 'album' && (
        <form onSubmit={addToAlbum} className="card space-y-3">
          <Field id="album-pick" label="Add to which album?" as="select" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
            <option value="">{albums.length ? 'Choose an album…' : 'You have no albums yet'}</option>
            {albums.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </Field>
          <div className="flex gap-2">
            <button type="submit" className="btn" disabled={!albumId}>Add</button>
            <button type="button" className="btn-ghost" onClick={() => setPanel(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="frame">
        <img src={post.image} alt={post.description} className="max-h-[36rem] w-full rounded-sm object-cover" />
      </div>
      <p>
        <Link to={`/profile/${post.author._id}`} className="font-bold hover:text-accent">{post.author.username}</Link> {post.description}
      </p>
      <TagList tags={post.hashtags} />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" className={liked ? 'btn' : 'btn-ghost'} onClick={like} aria-pressed={liked}>♥ {post.likes.length} likes</button>
        <span className="text-ink/70">{post.commentCount} comments</span>
      </div>

      {post.albums.length > 0 && (
        <p className="text-sm">
          <span className="text-ink/70">In albums:</span>{' '}
          {post.albums.map((a, i) => (
            <span key={a._id}>{i > 0 && ', '}<Link to={`/albums/${a._id}`} className="link">{a.name}</Link></span>
          ))}
        </p>
      )}

      <section className="space-y-3" aria-label="Comments">
        <h2 className="text-xl font-bold">Comments</h2>
        {post.comments.length === 0 && <p className="text-sm text-ink/60">No comments yet. Be the first!</p>}
        {post.comments.map((c) => (
          <div key={c._id} className="flex items-start gap-2 text-sm">
            <p className="flex-1">
              <Link to={`/profile/${c.author._id}`} className="font-bold hover:text-accent">{c.author.username}</Link> {c.text}
              <span className="ml-2 text-xs text-ink/50">{timeAgo(c.createdAt)}</span>
            </p>
            {(c.author._id === user._id || admin) && (
              <button type="button" className="text-xs font-bold text-danger hover:underline" onClick={() => deleteComment(c._id)} aria-label={`Delete comment by ${c.author.username}`}>Delete</button>
            )}
          </div>
        ))}
        <form onSubmit={addComment} className="flex items-end gap-2">
          <div className="flex-1">
            <Field id="comment" label="Add a comment" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" />
          </div>
          <button type="submit" className="btn" disabled={!text.trim()}>Post</button>
        </form>
      </section>
    </div>
  );
}