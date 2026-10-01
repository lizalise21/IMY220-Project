import { useEffect, useState } from 'react';
import { api } from '../api';
import PostCard from '../components/PostCard';

export default function Feed() {
  const [scope, setScope] = useState('local');
  const [tag, setTag] = useState('');
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPosts(null);
    setError('');
    const q = new URLSearchParams({ scope });
    if (tag.trim()) q.set('tag', tag.trim());
    api(`/posts?${q}`).then(setPosts).catch((e) => setError(e.message));
  }, [scope, tag]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full bg-sand p-1">
          {['local', 'global'].map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${scope === s ? 'bg-coral text-white' : 'text-ink/70'}`}
            >
              {s === 'local' ? 'Friends' : 'Global'}
            </button>
          ))}
        </div>
        <input className="input !w-48" placeholder="Filter by #hashtag" value={tag} onChange={(e) => setTag(e.target.value)} />
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {!posts && !error && <p className="text-ink/60">Loading…</p>}
      {posts && posts.length === 0 && (
        <p className="card text-center text-ink/60">
          {scope === 'local' ? 'Nothing here yet. Add friends or create a post!' : 'No posts found.'}
        </p>
      )}
      {posts?.map((p) => (
        <PostCard key={p._id} post={p} onDeleted={(id) => setPosts(posts.filter((x) => x._id !== id))} />
      ))}
    </div>
  );
}