import { Link } from 'react-router-dom';
import Avatar from './Avatar';

export default function UserRow({ u, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-ink/10">
      <Avatar user={u} />
      <Link to={`/profile/${u._id}`} className="flex-1 font-bold hover:text-accent">
        {u.username}
        {u.name && <span className="block text-xs font-normal text-ink/60">{u.name}</span>}
      </Link>
      {children}
    </div>
  );
}