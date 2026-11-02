import { Link } from 'react-router-dom';

// Clicking a hashtag behaves like searching for it.
export default function TagList({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Link key={t} to={`/search?q=${encodeURIComponent('#' + t)}`} className="tag">
          #{t}
        </Link>
      ))}
    </div>
  );
}