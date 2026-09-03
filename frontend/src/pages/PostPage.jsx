import { useState } from "react";
import { useParams } from "react-router-dom";
import Post from "../components/Post";
import Comments from "../components/Comments";
import EditPost from "../components/EditPost";
import { dummyPosts } from "../data/dummyData";

// Dynamic route: /post/:id. Renders the same dummy post regardless of the
// id passed for now, but the id is read and displayed to prove the route works.
export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(dummyPosts[0]);
  const [editing, setEditing] = useState(false);

  function handleSave(updated) {
    setPost(updated);
    setEditing(false);
  }

  return (
    <div className="page">
      {editing ? (
        <EditPost post={post} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <Post post={post} routeId={id} onEditClick={() => setEditing(true)} />
      )}

      <Comments comments={post.comments} />
    </div>
  );
}
