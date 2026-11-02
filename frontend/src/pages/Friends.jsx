import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import UserRow from '../components/UserRow';
import { useConfirm } from '../components/ConfirmModal';

export default function Friends() {
  const [social, setSocial] = useState(null);
  const [error, setError] = useState('');
  const [modal, ask] = useConfirm();

  const load = () => api('/users/social').then(setSocial).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const act = async (path, method) => {
    try { setError(''); await api(path, { method }); await load(); } catch (e) { setError(e.message); }
  };

  if (!social) return <p className="text-ink/70">{error || 'Loading…'}</p>;

  return (
    <div className="space-y-8">
      {modal}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Friends</h1>
        <Link to="/search" className="btn">Find people</Link>
      </div>
      {error && <p className="text-danger" role="alert">{error}</p>}

      <section>
        <h2 className="mb-3 text-xl font-bold">Friend requests</h2>
        {social.requests.length === 0 && <p className="text-ink/70">No pending requests.</p>}
        <div className="space-y-2">
          {social.requests.map((u) => (
            <UserRow key={u._id} u={u}>
              <button type="button" className="btn" onClick={() => act(`/users/${u._id}/accept`, 'POST')}>Accept</button>
              <button type="button" className="btn-ghost" onClick={() => act(`/users/${u._id}/request`, 'DELETE')}>Decline</button>
            </UserRow>
          ))}
        </div>
        {social.sent.length > 0 && (
          <>
            <h3 className="mb-2 mt-5 font-bold text-ink/70">Sent requests</h3>
            <div className="space-y-2">
              {social.sent.map((u) => (
                <UserRow key={u._id} u={u}>
                  <button type="button" className="btn-ghost" onClick={() => act(`/users/${u._id}/request`, 'DELETE')}>Cancel</button>
                </UserRow>
              ))}
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Your friends ({social.friends.length})</h2>
        {social.friends.length === 0 && <p className="text-ink/70">You haven&apos;t added any friends yet.</p>}
        <div className="space-y-2">
          {social.friends.map((u) => (
            <UserRow key={u._id} u={u}>
              <button type="button" className="btn-danger" onClick={() => ask({
                title: `Unfriend ${u.username}?`,
                message: 'You will no longer see each other\'s posts in your Following feeds.',
                confirmLabel: 'Unfriend',
                onConfirm: () => act(`/users/${u._id}/friend`, 'DELETE'),
              })}>Unfriend</button>
            </UserRow>
          ))}
        </div>
      </section>
    </div>
  );
}