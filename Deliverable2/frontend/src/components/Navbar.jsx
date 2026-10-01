import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const link = ({ isActive }) =>
    `text-sm font-medium transition hover:text-coral ${isActive ? 'text-coral' : 'text-ink/70'}`;

  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-2xl font-bold text-coral">Frame(d)</Link>
        {user ? (
          <div className="flex flex-wrap items-center gap-5">
            <NavLink to="/" end className={link}>Feed</NavLink>
            <NavLink to="/create" className={link}>New post</NavLink>
            <NavLink to="/albums" className={link}>Albums</NavLink>
            <NavLink to="/friends" className={link}>Friends</NavLink>
            <NavLink to="/profile" end className={link}>Profile</NavLink>
            <button
              className="btn-ghost !px-4 !py-1.5"
              onClick={async () => { await logout(); navigate('/login'); }}
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <NavLink to="/login" className={link}>Log in</NavLink>
            <Link to="/signup" className="btn">Sign up</Link>
          </div>
        )}
      </nav>
    </header>
  );
}