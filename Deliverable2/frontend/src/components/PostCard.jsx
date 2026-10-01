import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, parseTags } from '../api';
import { useAuth } from '../AuthContext';

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const [p, setP] = useState(post);
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(post.description);
  const [tags, setTags] = useState(post.hashtags.join(' '));
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [reasons, setReasons] = useState(null);
  const [reason, setReason] = useState('');
  const [albums, setAlbums] = useState(null);
  const [msg, setMsg] = useState('');

  const mine = p.author._id === user._id;
  const liked = p.likes.includes(user._id);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const run = async (fn) => { try { await fn(); } catch (e) { flash(e.message); } };

  const save = () => run(async () => {
    const updated = await api(`/posts/${p._id}`, { method: 'PUT', body: { description: desc, hashtags: parseTags(tags) } });
    setP(updated);
    setEditing(false);
  });

  const del = () => run(async () => {
    if (!confirm('Delete this post?')) return;
    await api(`/posts/${p._id}`, { method: 'DELETE' });
    onDeleted?.(p._id);
  });

  const like = () => run(async () => {
    const r = await api(`/posts/${p._id}/like`, { method: 'POST' });
    setP({ ...p, likes: r.likes });
  });

  const toggleComments = () => run(async () => {
    if (comments) return setComments(null);
    setComments(await api(`/posts/${p._id}/comments`));
  });

  const addComment = () => run(async () => {
    const c = await api(`/posts/${p._id}/comments`, { method: 'POST', body: { text } });
    setComments([...(comments || []), c]);
    setText('');
  });

  const deleteComment = (id) => run(async () => {
    await api(`/posts/${p._id}/comments/${id}`, { method: 'DELETE' });
    setComments(comments.filter((c) => c._id !== id));
  });

  const openReport = () => run(async () => {
    if (reasons) return setReasons(null);
    setReasons(await api('/posts/reasons'));
  });

  const sendReport = () => run(async () => {
    await api(`/posts/${p._id}/report`, { method: 'POST', body: { reason } });
    setReasons(null);
    setReason('');
    flash('Report submitted. Thank you.');
  });

  const openAlbums = () => run(async () => {
    if (albums) return setAlbums(null);
    setAlbums(await api(`/albums?owner=${user._id}`));
  });

  const addToAlbum = (albumId) => run(async () => {
    if (!albumId) return;
    await api(`/albums/${albumId}/posts/${p._id}`, { method: 'POST' });
    setAlbums(null);
    flash('Added to album');
  });

  return (
    <article className="card overflow-hidden !p-0">
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-sand font-semibold">
          {p.author.avatar ? <img src={p.author.avatar} alt="" className="h-full w-full object-cover" /> : p.author.username[0].toUpperCase()}
        </div>
        <Link to={mine ? '/profile' : `/profile/${p.author._id}`} className="font-semibold hover:text-coral">
          {p.author.username}
        </Link>
        <span className="ml-auto text-xs text-ink/50">{new Date(p.createdAt).toLocaleDateString()}</span>
      </div>

      <img src={p.image} alt={p.description} className="max-h-[32rem] w-full object-cover" />

      <div className="space-y-3 p-4">
        {editing ? (
          <div className="space-y-2">
            <textarea className="input" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="hashtags, separated by spaces" />
            <div className="flex gap-2">
              <button className="btn" onClick={save}>Save</button>
              <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {p.description && <p>{p.description}</p>}
            <div className="flex flex-wrap gap-2">
              {p.hashtags.map((t) => <span key={t} className="tag">#{t}</span>)}
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
          <button className={liked ? 'btn' : 'btn-ghost'} onClick={like}>♥ {p.likes.length}</button>
          <button className="btn-ghost" onClick={toggleComments}>Comments</button>
          {mine && !editing && (
            <>
              <button className="btn-ghost" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn-ghost" onClick={openAlbums}>Add to album</button>
              <button className="btn-danger" onClick={del}>Delete</button>
            </>
          )}
          {!mine && <button className="btn-ghost" onClick={openReport}>Report</button>}
        </div>

        {msg && <p className="text-sm text-coral">{msg}</p>}

        {albums && (
          <select className="input" defaultValue="" onChange={(e) => addToAlbum(e.target.value)}>
            <option value="" disabled>{albums.length ? 'Choose an album…' : 'You have no albums yet'}</option>
            {albums.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        )}

        {reasons && (
          <div className="flex gap-2">
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select a reason…</option>
              {reasons.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="btn" disabled={!reason} onClick={sendReport}>Submit</button>
          </div>
        )}

        {comments && (
          <div className="space-y-3 border-t border-ink/10 pt-3">
            {comments.length === 0 && <p className="text-sm text-ink/50">No comments yet.</p>}
            {comments.map((c) => (
              <div key={c._id} className="flex items-start gap-2 text-sm">
                <p className="flex-1"><span className="font-semibold">{c.author.username}</span> {c.text}</p>
                {(c.author._id === user._id) && (
                  <button className="text-xs text-red-500" onClick={() => deleteComment(c._id)}>delete</button>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" />
              <button className="btn" disabled={!text.trim()} onClick={addComment}>Post</button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}