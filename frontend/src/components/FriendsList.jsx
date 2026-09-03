import ProfilePreview from "./ProfilePreview";

// Displays all users the current profile owner is friends with.
export default function FriendsList({ friends }) {
  return (
    <div className="friends-list">
      <h2 className="section-title">Friends</h2>
      {friends.length ? (
        friends.map((friend) => <ProfilePreview key={friend.id} user={friend} />)
      ) : (
        <p className="empty-state">No friends added yet.</p>
      )}
    </div>
  );
}
