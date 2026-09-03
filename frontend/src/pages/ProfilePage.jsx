import { useState } from "react";
import { useParams } from "react-router-dom";
import Profile from "../components/Profile";
import EditProfile from "../components/EditProfile";
import UserPosts from "../components/UserPosts";
import FriendsList from "../components/FriendsList";
import CreatePost from "../components/CreatePost";
import { currentUser, dummyUsers, dummyPosts } from "../data/dummyData";

// Dynamic route: /profile/:id. Renders the same profile regardless of the
// id passed for now - real per-user data lookup comes in a later deliverable.
export default function ProfilePage() {
  const { id } = useParams();
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(currentUser);
  const [posts, setPosts] = useState(dummyPosts);

  function handleSave(updated) {
    setUser(updated);
    setEditing(false);
  }

  function handleCreate({ caption, imageUrl }) {
    const newPost = {
      id: String(Date.now()),
      author: user,
      image: imageUrl || "https://picsum.photos/600/600",
      caption,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
  }

  return (
    <div className="page">
      <Profile user={user} routeId={id} />

      {editing ? (
        <EditProfile user={user} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <button className="btn secondary" onClick={() => setEditing(true)}>
          Edit profile
        </button>
      )}

      <CreatePost onCreate={handleCreate} />
      <UserPosts posts={posts} />
      <FriendsList friends={dummyUsers} />
    </div>
  );
}
