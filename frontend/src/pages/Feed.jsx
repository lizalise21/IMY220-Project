import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ActivityItem from '../components/ActivityItem';
import Field from '../components/Field';

const SORTS = [['newest', 'Newest'], ['likes', 'Most liked'], ['comments', 'Most commented']];

export default function Feed() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [scope, setScope] = useState('local');
  const [sort, setSort] = useState('newest');
  const [tag, setTag] = useState('');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = new URLSearchParams({ scope, sort });
    if (tag.trim()) q.set('tag', tag.trim());
    const t = setTimeout(() => {
      api(`/feed?${q}`).then((d) => { setItems(d); setError(''); }).catch((e) => setError(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [scope, sort, tag]);

  const search = (e) => {
    e.preventDefault();
    if (term.trim()) navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div className="space-y-8">
      <h1 className="sr-only">Home feed</h1>

      <form onSubmit={search} className="flex items-end gap-2">
        <div className="flex-1">
          <Field id="home-search" label="Search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="People, posts, albums or #hashtags" />
        </div>
        <button type="submit" className="btn" disabled={!term.trim()}>Search</button>
      </form>

      <div className="space-y-4">
        <div className="flex w-fit rounded-full bg-sand p-1" role="group" aria-label="Feed">
          {[['local', 'Following'], ['global', 'Global']].map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={scope === k}
              onClick={() => setScope(k)}
              className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${scope === k ? 'bg-accent text-on-accent' : 'text-ink/80'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="feed-sort" label="Sort by" as="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </Field>
          <Field id="feed-tag" label="Filter by hashtag" placeholder="e.g. hiking" value={tag} onChange={(e) => setTag(e.target.value)} />
        </div>
        {sort !== 'newest' && <p className="text-xs text-ink/60">Popularity sorting lists posts first, then album activity.</p>}
      </div>

      {error && <p className="text-danger" role="alert">{error}</p>}
      {!items && !error && <p className="text-ink/70">Loading…</p>}
      {items && items.length === 0 && (
        <p className="card text-center text-ink/70">
          {scope === 'local' ? 'Nothing here yet. Add friends or create a post!' : 'No activity found.'}
        </p>
      )}

      <ol className="space-y-10 border-l border-ink/20 pl-5 sm:pl-8">
        {items?.map((item) => (
          <li key={item._id} className="relative">
            <span className="absolute -left-[26px] top-3 h-3 w-3 rounded-full bg-accent ring-4 ring-bg sm:-left-[38px]" aria-hidden="true" />
            <ActivityItem item={item} />
          </li>
        ))}
      </ol>
    </div>
  );
}