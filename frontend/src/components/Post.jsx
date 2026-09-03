import { Link } from "react-router-dom";
import PostImage from "./PostImage";

// Contains all required information on a single post: author, image,
// caption, and like/edit actions. Extracted from PostPage so it's its
// own component, per the spec's required component list.
export default function Post({ post, routeId, onEditClick }) {
  return (
    <div className="post-full">
      <div className="post-head">
        <Link to={`/profile/${post.author.id}`}>
          <img className="avatar" src={post.author.avatar} alt={post.author.displayName} />
        </Link>
        <div className="username-line">
          <span className="name">{post.author.displayName}</span>
          <span className="handle">@{post.author.username} · post {routeId}</span>
        </div>
      </div>

      <PostImage src={post.image} alt={post.caption} />

      <p className="caption">{post.caption}</p>
      <div className="actions">
        <span>♥ {post.likes} likes</span>
        <button className="btn secondary" onClick={onEditClick}>
          Edit post
        </button>
      </div>
    </div>
  );
}
