import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout, unread, refreshUnread } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    refreshUnread();
  }, [pathname]);

  const link = ({ isActive }) =>
    `text-sm font-bold transition hover:text-accent ${isActive ? 'text-accent' : 'text-ink/80'}`;

  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3" aria-label="Main">
        <Link to="/home" className="font-display text-2xl font-bold">
          Frame<span className="text-accent">(</span>d<span className="text-accent">)</span>
        </Link>
        <button
          type="button"
          className="btn-ghost !px-3 !py-1.5 md:hidden"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <div id="main-menu" className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-3 md:flex md:w-auto md:flex-row md:items-center md:gap-5`}>
          <NavLink to="/home" className={link}>Home</NavLink>
          <NavLink to="/create" className={link}>New post</NavLink>
          <NavLink to="/albums" className={link}>Albums</NavLink>
          <NavLink to="/friends" className={link}>Friends</NavLink>
          <NavLink to="/profile" end className={link}>Profile</NavLink>
          <NavLink to="/search" className={link}>Search</NavLink>
          <NavLink to="/notifications" className={link}>
            Notifications
            {unread > 0 && (
              <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-xs text-on-accent">{unread}</span>
            )}
          </NavLink>
          {user.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}
          <ThemeToggle />
          <button type="button" className="btn-ghost !px-4 !py-1.5" onClick={logout}>Logout</button>
        </div>
      </nav>
    </header>
  );
}