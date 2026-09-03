import { Link } from "react-router-dom";

// Small preview of a profile used in friend lists, search results, etc.
// Not the full profile page - just enough to identify and link to the user.
export default function ProfilePreview({ user }) {
  return (
    <Link to={`/profile/${user.id}`} className="profile-preview-row">
      <img className="avatar" src={user.avatar} alt={user.displayName} />
      <div className="username-line">
        <span className="name">{user.displayName}</span>
        <span className="bio-line">{user.bio}</span>
      </div>
    </Link>
  );
}
