import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Auth({ mode }) {
  const isSignup = mode === 'signup';
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) await signup(form.username, form.email, form.password);
      else await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-center text-3xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
      <form onSubmit={submit} className="card space-y-4">
        {isSignup && <input className="input" placeholder="Username" value={form.username} onChange={set('username')} required />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="input" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-ink/70">
        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
        <Link className="font-semibold text-coral" to={isSignup ? '/login' : '/signup'}>
          {isSignup ? 'Log in' : 'Sign up'}
        </Link>
      </p>
    </div>
  );
}