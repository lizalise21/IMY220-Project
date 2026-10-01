import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { user: me } = useAuth();
  const params = useParams();
  const id = params.id || me._id;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => api(`/users/${id}`).then(setData).catch((e) => setError(e.message));
  useEffect(() => { setData(null); setError(''); load(); }, [id]);

  const act = async (path, method) => {
    try { await api(path, { method }); await load(); } catch (e) { setError(e.message); }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-ink/60">Loading…</p>;

  const { user, posts, albums, relationship } = data;

  return (
    <div className="space-y-8">
      <div className="card flex flex-wrap items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-sand text-3xl font-bold">
          {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-ink/70">{user.bio || 'No bio yet.'}</p>
          <p className="mt-1 text-sm text-ink/50">{user.friendCount} friends · {posts.length} posts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {relationship === 'self' && <Link to="/profile/edit" className="btn">Edit profile</Link>}
          {relationship === 'none' && <button className="btn" onClick={() => act(`/users/${id}/request`, 'POST')}>Add friend</button>}
          {relationship === 'sent' && <button className="btn-ghost" onClick={() => act(`/users/${id}/request`, 'DELETE')}>Cancel request</button>}
          {relationship === 'received' && (
            <>
              <button className="btn" onClick={() => act(`/users/${id}/accept`, 'POST')}>Accept request</button>
              <button className="btn-ghost" onClick={() => act(`/users/${id}/request`, 'DELETE')}>Decline</button>
            </>
          )}
          {relationship === 'friends' && <button className="btn-danger" onClick={() => act(`/users/${id}/friend`, 'DELETE')}>Unfriend</button>}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Albums</h2>
        {albums.length === 0 ? (
          <p className="text-ink/60">No albums yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {albums.map((a) => (
              <Link key={a._id} to={`/albums/${a._id}`} className="card !py-3 font-semibold hover:text-coral">{a.name}</Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold">Posts</h2>
        {posts.length === 0 && <p className="text-ink/60">No posts yet.</p>}
        {posts.map((p) => (
          <PostCard key={p._id} post={p} onDeleted={(pid) => setData({ ...data, posts: posts.filter((x) => x._id !== pid) })} />
        ))}
      </section>
    </div>
  );
}