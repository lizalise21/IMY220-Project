// Contains basic profile information for display at the top of the
// Profile page. Extracted from ProfilePage so it's its own component,
// per the spec's required component list.
export default function Profile({ user, routeId }) {
  return (
    <div className="profile-header">
      <img className="avatar-lg" src={user.avatar} alt={user.displayName} />
      <div>
        <h1>{user.displayName}</h1>
        <p>@{user.username} · id {routeId}</p>
        <p>{user.bio}</p>
        <div className="profile-stats">
          <span>
            <strong>{user.followers}</strong> followers
          </span>
          <span>
            <strong>{user.following}</strong> following
          </span>
        </div>
      </div>
    </div>
  );
}
