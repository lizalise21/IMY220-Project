import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { timeAgo } from '../api';

export default function ItemHeader({ user, date, children }) {
  return (
    <div className="flex items-center gap-3">
      <Link to={`/profile/${user._id}`} aria-label={`${user.username}'s profile`}>
        <Avatar user={user} />
      </Link>
      <p className="text-sm">
        <Link to={`/profile/${user._id}`} className="font-bold hover:text-accent">{user.username}</Link>{' '}
        <span className="text-ink/70">{children}</span>
      </p>
      <span className="ml-auto text-xs text-ink/60">Posted {timeAgo(date)}</span>
    </div>
  );
}