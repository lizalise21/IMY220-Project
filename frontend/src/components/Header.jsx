import { NavLink } from "react-router-dom";

// Present on every page except the Splash page. Receives the current
// user's id as a prop from App (the highest parent) rather than reaching
// into the dummy data itself.
export default function Header({ currentUserId }) {
  return (
    <header className="site-header">
      <NavLink to="/home" className="brand">
        Frame<span>(</span>d<span>)</span>
      </NavLink>
      <nav>
        <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
          Feed
        </NavLink>
        <NavLink
          to={`/profile/${currentUserId}`}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Profile
        </NavLink>
      </nav>
    </header>
  );
}
