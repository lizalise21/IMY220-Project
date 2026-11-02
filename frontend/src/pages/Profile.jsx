import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Avatar from '../components/Avatar';
import AlbumCard from '../components/AlbumCard';
import UserRow from '../components/UserRow';

const STATUS = {
  self: 'This is you',
  friends: 'Friends',
  sent: 'Friend request pending',
  received: 'Wants to be your friend',
  none: 'Not friends',
};

export default function Profile() {
  const { user: me } = useAuth();
  const params = useParams();
  const id = params.id || me._id;
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('posts');
  const [limit, setLimit] = useState(12);
  const [error, setError] = useState('');

  const load = () => api(`/users/${id}`).then(setData).catch((e) => setError(e.message));
  useEffect(() => { setData(null); setError(''); setTab('posts'); setLimit(12); load(); }, [id]);

  const act = async (path, method) => {
    try { setError(''); await api(path, { method }); await load(); } catch (e) { setError(e.message); }
  };

  if (error && !data) return <p className="text-danger" role="alert">{error}</p>;
  if (!data) return <p className="text-ink/70">Loading…</p>;

  const { user, relationship, restricted } = data;
  const tabBtn = (k, label) => (
    <button key={k} type="button" aria-pressed={tab === k} onClick={() => { setTab(k); setLimit(12); }}
      className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${tab === k ? 'bg-accent text-on-accent' : 'text-ink/80'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="card flex flex-wrap items-center gap-5">
        <Avatar user={user} size="h-24 w-24" />
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
          <p className="text-sm text-ink/70">@{user.username}{user.pronouns ? ` · ${user.pronouns}` : ''}</p>
          <p className="inline-block rounded-full bg-sand px-3 py-0.5 text-xs font-bold">{STATUS[relationship]}</p>
          {!restricted && (
            <>
              <p>{user.bio || 'No bio yet.'}</p>
              {user.links.length > 0 && (
                <p className="flex flex-wrap gap-x-4 text-sm">
                  {user.links.map((l) => (
                    <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="link">{l.replace(/^https?:\/\//, '')}</a>
                  ))}
                </p>
              )}
              <p className="text-sm text-ink/70">{data.posts.length} posts · {data.friends.length} friends · {data.albums.length} albums</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {relationship === 'self' && <Link to="/profile/edit" className="btn">Edit profile</Link>}
          {relationship === 'none' && <button type="button" className="btn" onClick={() => act(`/users/${id}/request`, 'POST')}>Add friend</button>}
          {relationship === 'sent' && <button type="button" className="btn-ghost" onClick={() => act(`/users/${id}/request`, 'DELETE')}>Cancel request</button>}
          {relationship === 'received' && (
            <>
              <button type="button" className="btn" onClick={() => act(`/users/${id}/accept`, 'POST')}>Accept request</button>
              <button type="button" className="btn-ghost" onClick={() => act(`/users/${id}/request`, 'DELETE')}>Decline</button>
            </>
          )}
          {relationship === 'friends' && <button type="button" className="btn-danger" onClick={() => act(`/users/${id}/friend`, 'DELETE')}>Unfriend</button>}
        </div>
      </div>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      {restricted ? (
        <p className="card text-center text-ink/70">Become friends with {user.username} to see their posts, albums and friends.</p>
      ) : (
        <section className="space-y-5">
          <div className="flex w-fit rounded-full bg-sand p-1" role="group" aria-label="Profile sections">
            {tabBtn('posts', `Posts (${data.posts.length})`)}
            {tabBtn('albums', `Albums (${data.albums.length})`)}
            {tabBtn('friends', `Friends (${data.friends.length})`)}
          </div>

          {tab === 'posts' && (
            data.posts.length === 0 ? <p className="text-ink/70">No posts yet.</p> : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {data.posts.slice(0, limit).map((p) => (
                  <Link key={p._id} to={`/post/${p._id}`} className="group block overflow-hidden rounded-xl ring-1 ring-ink/10">
                    <img src={p.image} alt={p.description} className="aspect-square w-full object-cover transition group-hover:scale-105" />
                  </Link>
                ))}
              </div>
            )
          )}
          {tab === 'albums' && (
            data.albums.length === 0 ? <p className="text-ink/70">No albums yet.</p> : (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                {data.albums.slice(0, limit).map((a) => <AlbumCard key={a._id} album={a} />)}
              </div>
            )
          )}
          {tab === 'friends' && (
            <div className="space-y-2">
              {data.friends.length === 0 && <p className="text-ink/70">No friends yet.</p>}
              {data.friends.slice(0, limit).map((f) => <UserRow key={f._id} u={f} />)}
            </div>
          )}
          {limit < data[tab].length && (
            <button type="button" className="btn-ghost" onClick={() => setLimit(limit + 12)}>Show more</button>
          )}
        </section>
      )}
    </div>
  );
}