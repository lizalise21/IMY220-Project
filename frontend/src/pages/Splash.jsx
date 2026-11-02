import { useState } from 'react';
import { useAuth } from '../AuthContext';
import Field from '../components/Field';
import ThemeToggle from '../components/ThemeToggle';

export default function Splash() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const switchMode = (m) => { setMode(m); setErrors({}); setServerError(''); };

  const validate = () => {
    const e = {};
    if (isSignup && form.username.trim().length < 3) e.username = 'Username must be at least 3 characters.';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Enter your password.';
    else if (isSignup && form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (isSignup && form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError('');
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      if (isSignup) await signup(form.username.trim(), form.email, form.password);
      else await login(form.email, form.password);
    } catch (err) {
      setServerError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-5xl justify-end px-4 pt-4"><ThemeToggle /></div>
      <header className="px-4 pb-8 text-center">
        <h1 className="font-display text-5xl font-bold sm:text-6xl">
          Frame<span className="text-accent">(</span>d<span className="text-accent">)</span>
        </h1>
        <p className="font-display text-ink/70">one frame at a time</p>
      </header>

      <main className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 md:grid-cols-2">
        <div className="frame mx-auto w-full max-w-sm">
          <img src="/images/splash.jpg" alt="A stack of instant photographs" className="w-full rounded-sm" />
        </div>

        <section className="space-y-6">
          <p className="text-lg text-ink/90">
            Frame(d) is a home for the photos you care about. Share a moment, collect your best shots in albums,
            follow your friends and see the world through everyone else&apos;s frame.
          </p>
          <div className="flex gap-3">
            <button type="button" className={isSignup ? 'btn' : 'btn-ghost'} onClick={() => switchMode('signup')}>Sign up</button>
            <button type="button" className={isSignup ? 'btn-ghost' : 'btn'} onClick={() => switchMode('login')}>Log in</button>
          </div>

          <form onSubmit={submit} noValidate className="card space-y-4">
            <h2 className="text-2xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            {isSignup && (
              <Field id="splash-username" label="Username" value={form.username} onChange={set('username')} error={errors.username} autoComplete="username" />
            )}
            <Field id="splash-email" label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            <Field id="splash-password" label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete={isSignup ? 'new-password' : 'current-password'} />
            {isSignup && (
              <Field id="splash-confirm" label="Repeat password" type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
            )}
            {serverError && <p className="text-sm text-danger" role="alert">{serverError}</p>}
            <button type="submit" className="btn w-full" disabled={busy}>
              {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}