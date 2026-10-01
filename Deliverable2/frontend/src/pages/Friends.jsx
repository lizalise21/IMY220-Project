import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function Row({ u, children }) {
  return (
    <div className="card flex items-center gap-3 !py-3">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-sand font-semibold">
        {u.avatar ? <img src={u.avatar} alt="" className="h-full w-full object-cover" /> : u.username[0].toUpperCase()}
      </div>
      <Link to={`/profile/${u._id}`} className="flex-1 font-semibold hover:text-coral">{u.username}</Link>
      {children}
    </div>
  );
}

export default function Friends() {
  const [social, setSocial] = useState(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const load = () => api('/users/social').then(setSocial).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!q.trim()) return setResults([]);
    const t = setTimeout(() => api(`/users?q=${encodeURIComponent(q)}`).then(setResults).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [q]);

  const act = async (path, method) => {
    try { await api(path, { method }); await load(); } catch (e) { setError(e.message); }
  };

  if (!social) return <p className="text-ink/60">{error || 'Loading…'}</p>;

  return (
    <div className="space-y-8">
      {error && <p className="text-red-600">{error}</p>}

      <section>
        <h2 className="mb-3 text-xl font-bold">Find people</h2>
        <input className="input" placeholder="Search by username…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 space-y-2">
          {results.map((u) => <Row key={u._id} u={u}><Link to={`/profile/${u._id}`} className="btn-ghost">View</Link></Row>)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Friend requests</h2>
        {social.requests.length === 0 && <p className="text-ink/60">No pending requests.</p>}
        <div className="space-y-2">
          {social.requests.map((u) => (
            <Row key={u._id} u={u}>
              <button className="btn" onClick={() => act(`/users/${u._id}/accept`, 'POST')}>Accept</button>
              <button className="btn-ghost" onClick={() => act(`/users/${u._id}/request`, 'DELETE')}>Decline</button>
            </Row>
          ))}
        </div>
        {social.sent.length > 0 && (
          <>
            <h3 className="mb-2 mt-5 font-semibold text-ink/70">Sent requests</h3>
            <div className="space-y-2">
              {social.sent.map((u) => (
                <Row key={u._id} u={u}>
                  <button className="btn-ghost" onClick={() => act(`/users/${u._id}/request`, 'DELETE')}>Cancel</button>
                </Row>
              ))}
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Your friends ({social.friends.length})</h2>
        {social.friends.length === 0 && <p className="text-ink/60">You haven't added any friends yet.</p>}
        <div className="space-y-2">
          {social.friends.map((u) => (
            <Row key={u._id} u={u}>
              <button className="btn-danger" onClick={() => confirm(`Unfriend ${u.username}?`) && act(`/users/${u._id}/friend`, 'DELETE')}>Unfriend</button>
            </Row>
          ))}
        </div>
      </section>
    </div>
  );
}