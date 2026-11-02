import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, timeAgo } from '../api';
import { useAuth } from '../AuthContext';

export default function Notifications() {
  const { refreshUnread } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/notifications')
      .then(setItems)
      .then(() => api('/notifications/read', { method: 'POST' }))
      .then(refreshUnread)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      {error && <p className="text-danger" role="alert">{error}</p>}
      {!items && !error && <p className="text-ink/70">Loading…</p>}
      {items && items.length === 0 && <p className="text-ink/70">You&apos;re all caught up.</p>}
      <ul className="space-y-2">
        {items?.map((n) => {
          const body = (
            <>
              <span className="flex-1">{n.text}</span>
              <span className="text-xs text-ink/60">{timeAgo(n.createdAt)}</span>
            </>
          );
          const cls = `flex items-center gap-3 rounded-2xl p-4 ring-1 ring-ink/10 ${n.read ? 'bg-surface' : 'bg-accent/20'}`;
          return (
            <li key={n._id}>
              {n.link ? <Link to={n.link} className={`${cls} hover:ring-accent`}>{body}</Link> : <div className={cls}>{body}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}