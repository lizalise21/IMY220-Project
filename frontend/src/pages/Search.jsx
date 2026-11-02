import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import AlbumCard from '../components/AlbumCard';
import Field from '../components/Field';
import PostCard from '../components/PostCard';
import UserRow from '../components/UserRow';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { setInput(q); }, [q]);

  // Update the URL shortly after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => { if (input !== q) setParams(input ? { q: input } : {}); }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    if (!q.trim()) { setData(null); return; }
    api(`/search?q=${encodeURIComponent(q)}`).then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message));
  }, [q]);

  const empty = data && !data.users.length && !data.posts.length && !data.albums.length && !data.hashtags.length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Search</h1>
      <form onSubmit={(e) => { e.preventDefault(); setParams(input ? { q: input } : {}); }}>
        <Field id="search-q" label="Search people, posts, albums and #hashtags" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try a name, a word or #hiking" />
      </form>

      {error && <p className="text-danger" role="alert">{error}</p>}
      {!q.trim() && <p className="text-ink/70">Type something to start searching.</p>}
      {empty && <p className="text-ink/70">Nothing found for &ldquo;{q}&rdquo;.</p>}

      {data?.hashtags.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold">Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {data.hashtags.map((t) => <Link key={t} to={`/search?q=${encodeURIComponent('#' + t)}`} className="tag">#{t}</Link>)}
          </div>
        </section>
      )}
      {data?.users.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold">People</h2>
          {data.users.map((u) => <UserRow key={u._id} u={u} />)}
        </section>
      )}
      {data?.albums.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Albums</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            {data.albums.map((a) => <AlbumCard key={a._id} album={a} />)}
          </div>
        </section>
      )}
      {data?.posts.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-xl font-bold">Posts</h2>
          {data.posts.map((p) => <PostCard key={p._id} post={p} />)}
        </section>
      )}
    </div>
  );
}